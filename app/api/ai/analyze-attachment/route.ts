import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { analyzeFileWithVision } from "@/lib/services/ai-analyzer";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 requests per 5 minutes per IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`ai-analyze:${ip}`, 10, 5 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { attachmentId, organizationId, userId } = body;

    console.log("🤖 AI Analysis requested:", { attachmentId, organizationId });

    if (!attachmentId || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI analysis is not configured. Please contact administrator." },
        { status: 503 }
      );
    }

    const supabase = createServiceClient();

    // Get attachment details with report info to verify organization
    const { data: attachment, error: attachmentError } = await supabase
      .from("report_attachments")
      .select(`
        *,
        reports!inner (
          organization_id
        )
      `)
      .eq("id", attachmentId)
      .single();

    if (attachmentError || !attachment) {
      console.error("Attachment not found:", attachmentError);
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    // Verify organization matches
    const reportOrgId = (attachment as any).reports?.organization_id;
    if (reportOrgId !== organizationId) {
      return NextResponse.json(
        { error: "Attachment not found in this organization" },
        { status: 404 }
      );
    }

    console.log("📎 Attachment found:", attachment.file_name, attachment.file_type);

    // Get signed URL for the file
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('report-attachments')
      .createSignedUrl(attachment.file_path, 3600); // 1 hour expiry

    if (urlError || !urlData) {
      console.error("Failed to get signed URL:", urlError);
      return NextResponse.json(
        { error: "Failed to access file" },
        { status: 500 }
      );
    }

    console.log("🔗 Signed URL created");

    // Download file content
    const fileResponse = await fetch(urlData.signedUrl);
    if (!fileResponse.ok) {
      throw new Error("Failed to download file");
    }

    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    console.log(`📥 File downloaded: ${fileBuffer.length} bytes`);

    // Detect MIME type from file extension if not in database
    let mimeType = attachment.file_type;
    const ext = attachment.file_name.toLowerCase().split('.').pop() || '';
    if (!mimeType) {
      const mimeMap: Record<string, string> = {
        'pdf': 'application/pdf',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
      };
      mimeType = mimeMap[ext] || 'application/octet-stream';
      console.log(`🔍 Detected MIME type: ${mimeType} from extension: ${ext}`);
    }

    // Check if file type is supported by Gemini Vision API
    const supportedVisionTypes = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'];
    const isVisionSupported = supportedVisionTypes.includes(ext);

    let analysis;
    const startTime = Date.now();

    if (!isVisionSupported) {
      // For unsupported file types (DOCX, DOC, etc.), return a helpful message
      console.log(`⚠️ File type ${ext} not supported for vision analysis. Providing placeholder.`);
      analysis = {
        summary: `This is a ${ext.toUpperCase()} file (${attachment.file_name}). Document analysis for Word files is currently limited. Please download and review the file manually for complete details.`,
        extractedText: `File type: ${ext.toUpperCase()}\nFilename: ${attachment.file_name}\nSize: ${(fileBuffer.length / 1024).toFixed(2)} KB\n\nNote: Automatic text extraction from Word documents is not yet supported. Please download the file to view its contents.`,
        entities: [],
        suggestedCategory: "other",
        riskLevel: "medium" as const,
        findings: [
          "Manual review required for Word documents",
          "Download the file to view complete contents",
          "Consider converting to PDF for automated analysis"
        ],
        confidenceScore: 0.5,
      };
    } else {
      // Use vision API for supported types (PDF, images)
      analysis = await analyzeFileWithVision(
        fileBuffer,
        attachment.file_name,
        mimeType
      );
    }
    
    const processingTime = Date.now() - startTime;

    console.log(`✅ AI Analysis completed in ${processingTime}ms`);

    // Save analysis to database (upsert to handle re-running analysis)
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("report_attachments_ai_summary")
      .upsert({
        attachment_id: attachmentId,
        organization_id: organizationId,
        summary: analysis.summary,
        extracted_text: analysis.extractedText,
        entities: analysis.entities,
        suggested_category: analysis.suggestedCategory,
        risk_level: analysis.riskLevel,
        findings: analysis.findings,
        model_used: "gemini-2.0-flash",
        confidence_score: analysis.confidenceScore,
        processing_time_ms: processingTime,
        status: "completed",
        analyzed_by: userId || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'attachment_id',  // Specify which column to check for conflicts
      })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save analysis:", saveError);
      return NextResponse.json(
        { error: "Analysis completed but failed to save" },
        { status: 500 }
      );
    }

    // Log audit event
    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: userId,
      action: "ai_analysis_completed",
      resource_type: "attachment",
      resource_id: attachmentId,
      new_values: {
        risk_level: analysis.riskLevel,
        suggested_category: analysis.suggestedCategory,
        processing_time_ms: processingTime,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: savedAnalysis,
      processingTime,
    });
  } catch (error: any) {
    console.error("AI Analysis route error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to analyze attachment",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}


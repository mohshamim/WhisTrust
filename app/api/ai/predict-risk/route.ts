import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { predictCaseRisk } from "@/lib/services/risk-predictor";
import { checkAIUsageLimit, incrementAIUsage } from "@/lib/services/ai-limits";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get request body
    const { reportId, reportIds } = await request.json();
    
    // Handle batch prediction
    if (reportIds && Array.isArray(reportIds)) {
      return await handleBatchPrediction(reportIds, supabase);
    }
    
    // Handle single prediction
    if (!reportId) {
      return NextResponse.json(
        { error: "reportId is required" },
        { status: 400 }
      );
    }
    
    // Fetch case data with attachments count
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select(`
        id,
        description,
        category,
        status,
        created_at,
        organization_id,
        case_number,
        title
      `)
      .eq("id", reportId)
      .single();
    
    if (reportError || !report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Get organization subdomain for usage limit check
    const serviceSupabase = createServiceClient();
    const { data: org } = await serviceSupabase
      .from("organizations")
      .select("subdomain")
      .eq("id", report.organization_id)
      .single();

    const subdomain = org?.subdomain || '';

    // Check AI usage limit BEFORE processing (only for demo)
    if (subdomain) {
      const usageCheck = await checkAIUsageLimit(subdomain, 'risk_predictor');
      
      if (!usageCheck.allowed) {
        return NextResponse.json(
          { 
            success: false,
            error: usageCheck.message || "AI usage limit reached",
            usage: {
              used: usageCheck.used,
              limit: usageCheck.limit,
              remaining: usageCheck.remaining,
              resetAt: usageCheck.resetAt
            }
          },
          { status: 429 }
        );
      }
    }
    
    // Get attachments count
    const { count: attachmentCount } = await supabase
      .from("report_attachments")
      .select("*", { count: "exact", head: true })
      .eq("report_id", reportId);
    
    // Get existing AI analysis if available
    const { data: aiAnalysis } = await supabase
      .from("attachment_ai_analysis")
      .select("risk_level")
      .eq("report_id", reportId)
      .limit(1)
      .single();
    
    // Prepare case data for prediction
    const caseData = {
      id: report.id,
      description: report.description || "",
      category: report.category || "Other",
      status: report.status,
      created_at: report.created_at,
      attachmentCount: attachmentCount || 0,
      aiAnalysisRiskLevel: aiAnalysis?.risk_level,
    };
    
    // Perform risk prediction
    const prediction = await predictCaseRisk(caseData);
    
    // Check if prediction already exists
    const { data: existingPrediction } = await supabase
      .from("case_risk_predictions")
      .select("id")
      .eq("report_id", reportId)
      .single();
    
    if (existingPrediction) {
      // Update existing prediction
      const { data: updatedPrediction, error: updateError } = await supabase
        .from("case_risk_predictions")
        .update({
          overall_score: prediction.overall_score,
          risk_level: prediction.risk_level,
          confidence_score: prediction.confidence_score,
          keyword_score: prediction.keyword_score,
          category_score: prediction.category_score,
          attachment_score: prediction.attachment_score,
          description_score: prediction.description_score,
          ai_analysis_score: prediction.ai_analysis_score,
          ai_sentiment: prediction.ai_sentiment,
          ai_urgency_level: prediction.ai_urgency_level,
          ai_reasoning: prediction.ai_reasoning,
          detected_keywords: prediction.detected_keywords,
          risk_factors: prediction.risk_factors,
          recommended_priority: prediction.recommended_priority,
          recommended_actions: prediction.recommended_actions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingPrediction.id)
        .select()
        .single();
      
      if (updateError) {
        console.error("Error updating risk prediction:", updateError);
        return NextResponse.json(
          { error: "Failed to update risk prediction" },
          { status: 500 }
        );
      }
      
      // Increment usage AFTER successful API call (only for demo)
      if (subdomain) {
        await incrementAIUsage(subdomain, 'risk_predictor');
      }

      return NextResponse.json({
        success: true,
        prediction: updatedPrediction,
        isNew: false,
      });
    } else {
      // Create new prediction
      const { data: newPrediction, error: insertError } = await supabase
        .from("case_risk_predictions")
        .insert({
          report_id: report.id,
          organization_id: report.organization_id,
          overall_score: prediction.overall_score,
          risk_level: prediction.risk_level,
          confidence_score: prediction.confidence_score,
          keyword_score: prediction.keyword_score,
          category_score: prediction.category_score,
          attachment_score: prediction.attachment_score,
          description_score: prediction.description_score,
          ai_analysis_score: prediction.ai_analysis_score,
          ai_sentiment: prediction.ai_sentiment,
          ai_urgency_level: prediction.ai_urgency_level,
          ai_reasoning: prediction.ai_reasoning,
          detected_keywords: prediction.detected_keywords,
          risk_factors: prediction.risk_factors,
          recommended_priority: prediction.recommended_priority,
          recommended_actions: prediction.recommended_actions,
        })
        .select()
        .single();
      
      if (insertError) {
        console.error("Error creating risk prediction:", insertError);
        return NextResponse.json(
          { error: "Failed to create risk prediction" },
          { status: 500 }
        );
      }
      
      // Increment usage AFTER successful API call (only for demo)
      if (subdomain) {
        await incrementAIUsage(subdomain, 'risk_predictor');
      }

      return NextResponse.json({
        success: true,
        prediction: newPrediction,
        isNew: true,
      });
    }
  } catch (error) {
    console.error("Risk prediction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleBatchPrediction(reportIds: string[], supabase: any) {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };
  
  for (const reportId of reportIds) {
    try {
      // Fetch case data
      const { data: report, error: reportError } = await supabase
        .from("reports")
        .select(`
          id,
          description,
          category,
          status,
          created_at,
          organization_id
        `)
        .eq("id", reportId)
        .single();
      
      if (reportError || !report) {
        results.failed++;
        results.errors.push(`Report ${reportId} not found`);
        continue;
      }
      
      // Get attachments count
      const { count: attachmentCount } = await supabase
        .from("report_attachments")
        .select("*", { count: "exact", head: true })
        .eq("report_id", reportId);
      
      // Get existing AI analysis
      const { data: aiAnalysis } = await supabase
        .from("attachment_ai_analysis")
        .select("risk_level")
        .eq("report_id", reportId)
        .limit(1)
        .single();
      
      const caseData = {
        id: report.id,
        description: report.description || "",
        category: report.category || "Other",
        status: report.status,
        created_at: report.created_at,
        attachmentCount: attachmentCount || 0,
        aiAnalysisRiskLevel: aiAnalysis?.risk_level,
      };
      
      const prediction = await predictCaseRisk(caseData);
      
      // Check if prediction exists
      const { data: existingPrediction } = await supabase
        .from("case_risk_predictions")
        .select("id")
        .eq("report_id", reportId)
        .single();
      
      if (existingPrediction) {
        await supabase
          .from("case_risk_predictions")
          .update({
            overall_score: prediction.overall_score,
            risk_level: prediction.risk_level,
            confidence_score: prediction.confidence_score,
            keyword_score: prediction.keyword_score,
            category_score: prediction.category_score,
            attachment_score: prediction.attachment_score,
            description_score: prediction.description_score,
            ai_analysis_score: prediction.ai_analysis_score,
            ai_sentiment: prediction.ai_sentiment,
            ai_urgency_level: prediction.ai_urgency_level,
            ai_reasoning: prediction.ai_reasoning,
            detected_keywords: prediction.detected_keywords,
            risk_factors: prediction.risk_factors,
            recommended_priority: prediction.recommended_priority,
            recommended_actions: prediction.recommended_actions,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingPrediction.id);
      } else {
        await supabase
          .from("case_risk_predictions")
          .insert({
            report_id: report.id,
            organization_id: report.organization_id,
            overall_score: prediction.overall_score,
            risk_level: prediction.risk_level,
            confidence_score: prediction.confidence_score,
            keyword_score: prediction.keyword_score,
            category_score: prediction.category_score,
            attachment_score: prediction.attachment_score,
            description_score: prediction.description_score,
            ai_analysis_score: prediction.ai_analysis_score,
            ai_sentiment: prediction.ai_sentiment,
            ai_urgency_level: prediction.ai_urgency_level,
            ai_reasoning: prediction.ai_reasoning,
            detected_keywords: prediction.detected_keywords,
            risk_factors: prediction.risk_factors,
            recommended_priority: prediction.recommended_priority,
            recommended_actions: prediction.recommended_actions,
          });
      }
      
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Failed to analyze report ${reportId}`);
      console.error(`Error analyzing report ${reportId}:`, error);
    }
  }
  
  return NextResponse.json({
    success: true,
    results,
  });
}

// GET endpoint to retrieve existing predictions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const reportId = searchParams.get("reportId");
    
    if (!reportId) {
      return NextResponse.json(
        { error: "reportId is required" },
        { status: 400 }
      );
    }
    
    const { data: prediction, error } = await supabase
      .from("case_risk_predictions")
      .select("*")
      .eq("report_id", reportId)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      prediction,
    });
  } catch (error) {
    console.error("Error fetching risk prediction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


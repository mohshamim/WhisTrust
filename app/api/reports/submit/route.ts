import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/config/environment";

// Server-side Supabase client with service role (bypasses RLS for anonymous submissions)
function createServiceClient() {
  const config = getSupabaseConfig();
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }
  
  return createClient(config.url, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      subdomain,
      category,
      title,
      description,
      reporterEmail,
    } = body;

    // Validate required fields
    if (!subdomain || !category || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get organization by subdomain
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, subdomain, status")
      .eq("subdomain", subdomain)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (org.status !== "active") {
      return NextResponse.json(
        { error: "Organization is not currently accepting reports" },
        { status: 403 }
      );
    }

    // Generate tracking code
    const trackingCode = generateTrackingCode();

    // Generate case number
    const { data: caseNumberResult } = await supabase
      .rpc('generate_case_number', { org_id: org.id });
    
    const caseNumber = caseNumberResult || `${org.subdomain.substring(0, 3).toUpperCase()}-000001`;

    // Create report
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        organization_id: org.id,
        case_number: caseNumber,
        tracking_code: trackingCode,
        category,
        title,
        description,
        reporter_email: reporterEmail || null,
        status: "submitted",
        priority: "medium",
        is_anonymous: !reporterEmail, // If email provided, not fully anonymous
      })
      .select()
      .single();

    if (reportError) {
      console.error("Failed to create report:", reportError);
      return NextResponse.json(
        { error: "Failed to submit report" },
        { status: 500 }
      );
    }

    // Log audit event
    await supabase.from("audit_logs").insert({
      organization_id: org.id,
      user_email: "anonymous",
      action: "report_submitted",
      resource_type: "report",
      resource_id: report.id,
      new_values: {
        case_number: caseNumber,
        category,
        is_anonymous: !reporterEmail,
      },
    });

    return NextResponse.json({
      success: true,
      trackingCode,
      caseNumber,
      message: "Report submitted successfully",
    });
  } catch (error: any) {
    console.error("Report submission error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Generate random tracking code (8-4-4 format: ABCD1234-EFGH)
function generateTrackingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 7) code += '-'; // Add separator
  }
  
  return code;
}


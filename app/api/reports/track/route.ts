import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/config/environment";

// Server-side Supabase client with service role (for anonymous tracking)
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
    const { subdomain, trackingCode } = body;

    if (!subdomain || !trackingCode) {
      return NextResponse.json(
        { error: "Missing tracking code" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("subdomain", subdomain)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Find report by tracking code
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("case_number, tracking_code, category, title, status, priority, created_at, updated_at")
      .eq("organization_id", org.id)
      .eq("tracking_code", trackingCode.toUpperCase())
      .maybeSingle();

    if (reportError) {
      console.error("Failed to find report:", reportError);
      return NextResponse.json(
        { error: "Failed to search for report" },
        { status: 500 }
      );
    }

    if (!report) {
      return NextResponse.json(
        { error: "Report not found. Please check your tracking code." },
        { status: 404 }
      );
    }

    // Log audit event (anonymous tracking)
    await supabase.from("audit_logs").insert({
      organization_id: org.id,
      user_email: "anonymous",
      action: "report_tracked",
      resource_type: "report",
      resource_id: null,
      new_values: {
        tracking_code: trackingCode,
      },
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("Report tracking error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingCode } = body;

    if (!trackingCode) {
      return NextResponse.json(
        { success: false, error: "Tracking code is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get report by tracking code
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("tracking_code", trackingCode.toUpperCase())
      .single();

    if (reportError) {
      if (reportError.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Report not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching report:", reportError);
      return NextResponse.json(
        { success: false, error: "Error fetching report" },
        { status: 500 }
      );
    }

    // Get messages for this report
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("report_id", report.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      // Don't fail the whole request if messages fail
    }

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        tracking_code: report.tracking_code,
        status: report.status,
        category: report.category,
        created_at: report.created_at,
      },
      messages: messages || [],
    });
  } catch (error: any) {
    console.error("Track API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


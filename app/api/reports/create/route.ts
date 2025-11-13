import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/config/environment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category,
      title,
      description,
      priority = "medium",
      source,
      reporter_email,
      reporter_phone,
      internal_notes,
      is_anonymous = true,
    } = body;

    // Create Supabase server client with cookie access
    const cookieStore = await cookies();
    const config = getSupabaseConfig();
    
    const supabaseAuth = createServerClient(
      config.url,
      config.anonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please log in again" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Use service client for database operations (with elevated permissions)
    const supabase = createServiceClient();

    // Get admin profile to verify organization
    const { data: adminProfile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("organization_id, full_name")
      .eq("id", userId)
      .single();

    if (profileError || !adminProfile) {
      console.error("Profile error:", profileError);
      return NextResponse.json(
        { success: false, error: "Admin profile not found" },
        { status: 403 }
      );
    }

    // Validation
    if (!category || !title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: category, title, description",
        },
        { status: 400 }
      );
    }

    if (!source) {
      return NextResponse.json(
        {
          success: false,
          error: "Source is required (phone, in-person, email, walk-in, written)",
        },
        { status: 400 }
      );
    }

    // Insert the report
    const { data: report, error: insertError } = await supabase
      .from("reports")
      .insert({
        organization_id: adminProfile.organization_id,
        category,
        title,
        description,
        priority,
        status: "submitted",
        source,
        reporter_email: is_anonymous ? null : reporter_email,
        reporter_phone: is_anonymous ? null : reporter_phone,
        is_anonymous,
        submitted_by: userId,
        internal_notes,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating case:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to create case" },
        { status: 500 }
      );
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      organization_id: adminProfile.organization_id,
      user_id: userId,
      action: "create_offline_case",
      resource_type: "report",
      resource_id: report.id,
      details: {
        case_number: report.case_number,
        category: report.category,
        source: report.source,
        created_by: adminProfile.full_name,
      },
    });

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        case_number: report.case_number,
        tracking_code: report.tracking_code,
        status: report.status,
      },
    });
  } catch (error) {
    console.error("Error in create case API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Get the session from cookies
    const cookieStore = await cookies();
    const supabase = createServiceClient();
    
    // Get user from session
    const sessionCookie = cookieStore.get('sb-access-token') || cookieStore.get('sb-refresh-token');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - No session found" },
        { status: 401 }
      );
    }

    // Try to get the user ID from the Authorization header if available
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      if (!tokenError && tokenUser) {
        userId = tokenUser.id;
      }
    }

    // If no user from token, try to extract from session cookie
    if (!userId) {
      // For now, get user ID from request body (temporary workaround)
      const body = await request.json();
      
      // We'll need to pass userId from the frontend
      if (!body.userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized - User ID required" },
          { status: 401 }
        );
      }
      userId = body.userId;
      
      // Re-parse body for other fields
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

      // Get admin profile to verify organization
      const { data: adminProfile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("organization_id, full_name")
        .eq("id", userId)
        .single();

      if (profileError || !adminProfile) {
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
    }
  } catch (error) {
    console.error("Error in create case API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


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

    console.log("=== CREATE CASE DEBUG START ===");
    
    // Create Supabase server client with cookie access
    const cookieStore = await cookies();
    const config = getSupabaseConfig();
    
    console.log("✅ Config loaded:", { url: config.url.substring(0, 30) + "..." });
    
    const supabaseAuth = createServerClient(
      config.url,
      config.anonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Ignore errors in server components
              console.log("Cookie set error (expected):", error);
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Ignore errors in server components
              console.log("Cookie remove error (expected):", error);
            }
          },
        },
      }
    );

    console.log("✅ Supabase auth client created");

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    console.log("Auth result:", { 
      hasUser: !!user, 
      userId: user?.id,
      hasError: !!authError,
      errorMessage: authError?.message 
    });

    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please log in again" },
        { status: 401 }
      );
    }

    const userId = user.id;
    console.log("✅ User authenticated:", userId);

    // Use service client for database operations (with elevated permissions)
    const supabase = createServiceClient();
    console.log("✅ Service client created");

    // Get admin profile to verify organization
    const { data: adminProfile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("organization_id, full_name")
      .eq("id", userId)
      .single();

    console.log("Profile query result:", { 
      hasProfile: !!adminProfile,
      organizationId: adminProfile?.organization_id,
      fullName: adminProfile?.full_name,
      hasError: !!profileError,
      errorDetails: profileError 
    });

    if (profileError || !adminProfile) {
      console.error("❌ Profile error:", profileError);
      return NextResponse.json(
        { success: false, error: "Admin profile not found" },
        { status: 403 }
      );
    }

    console.log("✅ Admin profile found:", adminProfile.full_name);

    // Validation
    console.log("Form data:", { category, title: title?.substring(0, 30), description: description?.substring(0, 50), priority, source });
    
    if (!category || !title || !description) {
      console.error("❌ Validation failed: Missing required fields");
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: category, title, description",
        },
        { status: 400 }
      );
    }

    if (!source) {
      console.error("❌ Validation failed: Missing source");
      return NextResponse.json(
        {
          success: false,
          error: "Source is required (phone, in-person, email, walk-in, written)",
        },
        { status: 400 }
      );
    }

    console.log("✅ Validation passed");

    // Insert the report
    console.log("Attempting to insert report...");
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
      console.error("❌ Insert error:", insertError);
      console.error("Insert error details:", JSON.stringify(insertError, null, 2));
      return NextResponse.json(
        { success: false, error: "Failed to create case: " + insertError.message },
        { status: 500 }
      );
    }

    console.log("✅ Report created:", report.id, report.case_number);

    // Create audit log
    console.log("Creating audit log...");
    const { error: auditError } = await supabase.from("audit_logs").insert({
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

    if (auditError) {
      console.error("⚠️ Audit log error (non-critical):", auditError);
    } else {
      console.log("✅ Audit log created");
    }

    console.log("=== CREATE CASE DEBUG END - SUCCESS ===");

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
    console.error("❌❌❌ CRITICAL ERROR IN CREATE CASE API ❌❌❌");
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    console.error("Full error:", JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error: " + (error instanceof Error ? error.message : "Unknown error") 
      },
      { status: 500 }
    );
  }
}


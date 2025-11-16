import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/config/environment";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await context.params;
    const body = await request.json();
    const { full_name, role, department, is_active } = body;

    // Create Supabase server client for auth
    const cookieStore = await cookies();
    const config = getSupabaseConfig();

    const supabaseAuth = createServerClient(config.url, config.anonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignore
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Ignore
          }
        },
      },
    });

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Use service client for elevated permissions
    const supabase = createServiceClient();

    // Verify requesting user is an admin
    const { data: requestingUser } = await supabase
      .from("admin_profiles")
      .select("role, organization_id, full_name")
      .eq("id", user.id)
      .single();

    if (!requestingUser || requestingUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only admins can update users" },
        { status: 403 }
      );
    }

    // Get target user to verify same organization
    const { data: targetUser } = await supabase
      .from("admin_profiles")
      .select("organization_id, email, role")
      .eq("id", userId)
      .single();

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (targetUser.organization_id !== requestingUser.organization_id) {
      return NextResponse.json(
        { success: false, error: "Cannot update users from other organizations" },
        { status: 403 }
      );
    }

    // Prevent user from changing their own role
    const previousRole = (targetUser as any).role as string | undefined;
    if (userId === user.id && role && previousRole && role !== previousRole) {
      return NextResponse.json(
        { success: false, error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from("admin_profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update user" },
        { status: 500 }
      );
    }

    // Create audit log
    const auditDetails: any = {
      email: targetUser.email,
      updated_by: requestingUser.full_name || user.email,
    };

    if (full_name) auditDetails.new_name = full_name;
    if (role) {
      auditDetails.old_role = previousRole;
      auditDetails.new_role = role;
    }
    if (department !== undefined) auditDetails.new_department = department;
    if (is_active !== undefined) auditDetails.new_status = is_active ? "active" : "inactive";

    await supabase.from("audit_logs").insert({
      organization_id: requestingUser.organization_id,
      user_id: user.id,
      action: "update_user",
      resource_type: "user",
      resource_id: userId,
      details: auditDetails,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in update user API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


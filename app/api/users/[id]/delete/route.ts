import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/config/environment";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "true";

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
        { success: false, error: "Only admins can delete users" },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Get target user
    const { data: targetUser } = await supabase
      .from("admin_profiles")
      .select("organization_id, email, full_name")
      .eq("id", userId)
      .single();

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (targetUser.organization_id !== requestingUser.organization_id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete users from other organizations" },
        { status: 403 }
      );
    }

    // Check for active case assignments
    const { count: activeCases } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", userId)
      .in("status", ["submitted", "under_review", "investigating"]);

    if (activeCases && activeCases > 0 && hardDelete) {
      return NextResponse.json(
        {
          success: false,
          error: `User has ${activeCases} active case(s) assigned. Reassign cases before deleting.`,
        },
        { status: 400 }
      );
    }

    if (hardDelete) {
      // Hard delete: Remove from database and auth
      // First, delete admin profile
      const { error: deleteProfileError } = await supabase
        .from("admin_profiles")
        .delete()
        .eq("id", userId);

      if (deleteProfileError) {
        console.error("Error deleting profile:", deleteProfileError);
        return NextResponse.json(
          { success: false, error: "Failed to delete user profile" },
          { status: 500 }
        );
      }

      // Then delete from auth
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteAuthError) {
        console.error("Error deleting auth user:", deleteAuthError);
      }

      // Create audit log
      await supabase.from("audit_logs").insert({
        organization_id: requestingUser.organization_id,
        user_id: user.id,
        action: "delete_user",
        resource_type: "user",
        resource_id: userId,
        details: {
          email: targetUser.email,
          full_name: targetUser.full_name,
          deleted_by: requestingUser.full_name || user.email,
          hard_delete: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "User permanently deleted",
      });
    } else {
      // Soft delete: Mark as inactive
      const { error: deactivateError } = await supabase
        .from("admin_profiles")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (deactivateError) {
        console.error("Error deactivating user:", deactivateError);
        return NextResponse.json(
          { success: false, error: "Failed to deactivate user" },
          { status: 500 }
        );
      }

      // Create audit log
      await supabase.from("audit_logs").insert({
        organization_id: requestingUser.organization_id,
        user_id: user.id,
        action: "update_user",
        resource_type: "user",
        resource_id: userId,
        details: {
          email: targetUser.email,
          full_name: targetUser.full_name,
          deactivated_by: requestingUser.full_name || user.email,
          new_status: "inactive",
        },
      });

      return NextResponse.json({
        success: true,
        message: "User deactivated",
      });
    }
  } catch (error) {
    console.error("Error in delete user API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


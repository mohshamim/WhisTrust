import { createClient } from "@/lib/supabase/client";
import type { AdminUser } from "@/lib/types/database";
import { logAuditEvent } from "@/lib/services/audit";

export async function listAdminUsers(): Promise<{ success: boolean; users?: AdminUser[]; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("admin_profiles").select("*").order("full_name", { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, users: (data as unknown as AdminUser[]) || [] };
  } catch (e) {
    return { success: false, error: "Failed to load users" };
  }
}

export async function updateAdminRole(userId: string, newRole: AdminUser["role"], oldRole?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    // Check permission via RPC
    const { data: canManage } = await supabase.rpc("has_permission", { p_permission: "manage_users" });
    if (!canManage) return { success: false, error: "Permission denied" };

    // 🛡️ SECURITY: Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // 🛡️ SECURITY: Prevent self-demotion from admin
    if (userId === user.id && oldRole === 'admin' && newRole !== 'admin') {
      return { 
        success: false, 
        error: "Cannot demote yourself from admin role. Ask another admin to change your role." 
      };
    }

    // 🛡️ SECURITY: Prevent removing the last admin
    if (oldRole === 'admin' && newRole !== 'admin') {
      const { count } = await supabase
        .from('admin_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('is_active', true);
      
      if ((count || 0) <= 1) {
        return { 
          success: false, 
          error: "Cannot remove the last admin. Promote another user to admin first." 
        };
      }
    }

    const { error } = await supabase.from("admin_profiles").update({ role: newRole }).eq("id", userId);
    if (error) return { success: false, error: error.message };

    // Log audit event
    await logAuditEvent({
      action: "user_role_updated",
      resourceType: "admin_profiles",
      resourceId: userId,
      details: {
        old_role: oldRole || null,
        new_role: newRole,
        target_user_id: userId,
        changed_by: user.id,
      },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to update role" };
  }
}

export async function updateAdminActive(userId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { data: canManage } = await supabase.rpc("has_permission", { p_permission: "manage_users" });
    if (!canManage) return { success: false, error: "Permission denied" };

    // 🛡️ SECURITY: Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Get user info for audit log
    const { data: userData } = await supabase
      .from("admin_profiles")
      .select("full_name, email, role")
      .eq("id", userId)
      .single();

    // 🛡️ SECURITY: Prevent self-deactivation
    if (userId === user.id && !isActive) {
      return { 
        success: false, 
        error: "Cannot deactivate yourself. Ask another admin to deactivate your account." 
      };
    }

    // 🛡️ SECURITY: Prevent deactivating the last admin
    if (userData?.role === 'admin' && !isActive) {
      const { count } = await supabase
        .from('admin_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('is_active', true);
      
      if ((count || 0) <= 1) {
        return { 
          success: false, 
          error: "Cannot deactivate the last admin. Promote another user to admin first." 
        };
      }
    }

    const { error } = await supabase.from("admin_profiles").update({ is_active: isActive }).eq("id", userId);
    if (error) return { success: false, error: error.message };

    // Log audit event
    await logAuditEvent({
      action: isActive ? "user_activated" : "user_deactivated",
      resourceType: "admin_profiles",
      resourceId: userId,
      details: {
        user_email: userData?.email || null,
        user_name: userData?.full_name || null,
        user_role: userData?.role || null,
        is_active: isActive,
        changed_by: user.id,
      },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to update activation" };
  }
}



/**
 * Super Admin Authentication - Client Side Only
 * 
 * Client-safe auth functions that don't import server-side dependencies
 */

import { createMultiTenantClient } from "@/lib/supabase/multi-tenant-client";

export interface SuperAdmin {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  created_at: string;
  last_login_at: string | null;
}

/**
 * Get current super admin (client-side)
 */
export async function getCurrentSuperAdmin(): Promise<SuperAdmin | null> {
  try {
    const supabase = createMultiTenantClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("*")
      .eq("id", user.id)
      .eq("is_super_admin", true)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return profile as SuperAdmin;
  } catch (error) {
    console.error("Get current super admin error:", error);
    return null;
  }
}

/**
 * Check if current user is super admin (client-side)
 */
export async function isSuperAdmin(): Promise<boolean> {
  const superAdmin = await getCurrentSuperAdmin();
  return superAdmin !== null && superAdmin.is_super_admin === true;
}

/**
 * Sign out super admin
 */
export async function signOutSuperAdmin() {
  try {
    const supabase = createMultiTenantClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Log audit event before signing out
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        user_email: user.email,
        action: "super_admin_logout",
        resource_type: "authentication",
        resource_id: user.id,
      });
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Super admin sign out error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}


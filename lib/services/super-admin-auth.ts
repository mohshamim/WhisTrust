/**
 * Super Admin Authentication Service
 * 
 * Handles authentication specifically for platform super administrators
 * Separate from regular organization admin authentication
 */

import { createMultiTenantServerClient } from "@/lib/supabase/multi-tenant-server";
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
 * Sign in as super admin
 * Server-side only
 */
export async function signInSuperAdmin(email: string, password: string) {
  try {
    const supabase = await createMultiTenantServerClient();
    
    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Authentication failed",
      };
    }

    // Verify user is a super admin
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("*")
      .eq("id", authData.user.id)
      .eq("is_super_admin", true)
      .single();

    if (profileError || !profile) {
      // Not a super admin - sign them out
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Access denied. Super admin privileges required.",
      };
    }

    // Update last login
    await supabase
      .from("admin_profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", authData.user.id);

    // Log audit event
    await supabase.from("audit_logs").insert({
      user_id: authData.user.id,
      user_email: email,
      action: "super_admin_login",
      resource_type: "authentication",
      resource_id: authData.user.id,
    });

    return {
      success: true,
      user: profile as SuperAdmin,
    };
  } catch (error: any) {
    console.error("Super admin sign in error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Get current super admin user
 * Server-side only
 */
export async function getCurrentSuperAdmin(): Promise<SuperAdmin | null> {
  try {
    const supabase = await createMultiTenantServerClient();
    
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
 * Check if current user is super admin
 * Server-side only
 */
export async function isSuperAdmin(): Promise<boolean> {
  const superAdmin = await getCurrentSuperAdmin();
  return superAdmin !== null && superAdmin.is_super_admin === true;
}

/**
 * Sign out super admin
 * Client-side compatible
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

/**
 * Verify super admin session (middleware helper)
 */
export async function verifySuperAdminSession(): Promise<{
  valid: boolean;
  user?: SuperAdmin;
  error?: string;
}> {
  try {
    const supabase = await createMultiTenantServerClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        valid: false,
        error: "No active session",
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("*")
      .eq("id", session.user.id)
      .eq("is_super_admin", true)
      .eq("is_active", true)
      .single();

    if (profileError || !profile) {
      return {
        valid: false,
        error: "Super admin access required",
      };
    }

    return {
      valid: true,
      user: profile as SuperAdmin,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || "Session verification failed",
    };
  }
}

/**
 * Request password reset for super admin
 */
export async function requestSuperAdminPasswordReset(email: string) {
  try {
    const supabase = createMultiTenantClient();

    // Verify email belongs to a super admin
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("id, is_super_admin")
      .eq("email", email)
      .eq("is_super_admin", true)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: "Email not found or not a super admin account",
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/superadmin/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: "Password reset email sent. Please check your inbox.",
    };
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}


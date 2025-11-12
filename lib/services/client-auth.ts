/**
 * Client Admin Authentication Service
 * 
 * Handles authentication for organization admins (NOT super admins)
 * Users authenticate within the context of their organization
 */

import { createMultiTenantClient } from "@/lib/supabase/multi-tenant-client";

export interface ClientAdmin {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  department: string | null;
  organization_id: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface ClientOrganization {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  status: string;
  features: Record<string, boolean>;
  branding: Record<string, any>;
  max_admin_users: number;
  max_reports_per_month: number;
  current_admin_users: number;
  current_reports_count: number;
}

/**
 * Sign in as client admin for a specific organization
 */
export async function signInClient(email: string, password: string, organizationSubdomain: string) {
  try {
    const supabase = createMultiTenantClient();
    
    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || "Authentication failed",
      };
    }

    console.log("✅ Authentication successful for:", authData.user.email);

    // Get user's profile and verify they belong to this organization
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select(`
        *,
        organization:organizations!inner(*)
      `)
      .eq("id", authData.user.id)
      .eq("is_active", true)
      .maybeSingle();

    console.log("Profile query result:", { profile, profileError });

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "User profile not found or inactive",
      };
    }

    // Verify user belongs to the correct organization
    const organization = profile.organization as any;
    if (!organization || organization.subdomain !== organizationSubdomain) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Access denied. You do not belong to this organization.",
      };
    }

    // Check organization status
    if (organization.status === 'suspended' || organization.status === 'cancelled') {
      await supabase.auth.signOut();
      return {
        success: false,
        error: `This organization is currently ${organization.status}. Please contact support.`,
      };
    }

    // Update last login
    await supabase
      .from("admin_profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", authData.user.id);

    // Log audit event
    await supabase.from("audit_logs").insert({
      organization_id: profile.organization_id,
      user_id: authData.user.id,
      user_email: email,
      action: "client_admin_login",
      resource_type: "authentication",
      resource_id: authData.user.id,
    });

    return {
      success: true,
      user: profile as ClientAdmin,
      organization: organization as ClientOrganization,
    };
  } catch (error: any) {
    console.error("Client sign in error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Get current client admin user
 */
export async function getCurrentClientAdmin(): Promise<{
  user: ClientAdmin | null;
  organization: ClientOrganization | null;
}> {
  try {
    const supabase = createMultiTenantClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { user: null, organization: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select(`
        *,
        organization:organizations!inner(*)
      `)
      .eq("id", session.user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (profileError || !profile) {
      return { user: null, organization: null };
    }

    return {
      user: profile as ClientAdmin,
      organization: (profile.organization as any) as ClientOrganization,
    };
  } catch (error) {
    console.error("Get current client admin error:", error);
    return { user: null, organization: null };
  }
}

/**
 * Get organization by subdomain
 */
export async function getOrganizationBySubdomain(subdomain: string): Promise<{
  success: boolean;
  organization?: ClientOrganization;
  error?: string;
}> {
  try {
    const supabase = createMultiTenantClient();
    
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("subdomain", subdomain)
      .maybeSingle();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    return {
      success: true,
      organization: data as ClientOrganization,
    };
  } catch (error: any) {
    console.error("Get organization by subdomain error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch organization",
    };
  }
}

/**
 * Sign out client admin
 */
export async function signOutClient() {
  try {
    const supabase = createMultiTenantClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get organization ID for audit log
      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      // Log audit event before signing out
      if (profile) {
        await supabase.from("audit_logs").insert({
          organization_id: profile.organization_id,
          user_id: user.id,
          user_email: user.email,
          action: "client_admin_logout",
          resource_type: "authentication",
          resource_id: user.id,
        });
      }
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
    console.error("Client sign out error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Check if user has permission for an action
 */
export function hasPermission(role: string, permission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    admin: ['manage_users', 'manage_reports', 'view_reports', 'create_reports', 'manage_settings', 'view_analytics', 'view_audit_logs'],
    manager: ['manage_users', 'manage_reports', 'view_reports', 'create_reports', 'view_analytics'],
    investigator: ['manage_reports', 'view_reports', 'create_reports'],
    hr: ['view_reports', 'create_reports'],
    viewer: ['view_reports'],
  };
  
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
}


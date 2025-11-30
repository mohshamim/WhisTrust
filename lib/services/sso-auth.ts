/**
 * SSO (Single Sign-On) Authentication Service
 * 
 * Handles OAuth/OIDC authentication for client organizations
 * Supports: Azure AD, Google Workspace, Generic OIDC
 */

import { createMultiTenantClient } from "@/lib/supabase/multi-tenant-client";
import { createServiceClient } from "@/lib/supabase/service-client";
import type { ClientOrganization } from "./client-auth";

export type SSOProvider = "azure" | "google" | "oidc";

export interface SSOConfig {
  sso_enabled: boolean;
  sso_provider: SSOProvider | null;
  sso_client_id: string | null;
  sso_client_secret: string | null;
  sso_issuer_url: string | null;
  sso_redirect_url: string | null;
  sso_domain_restriction: string | null;
}

/**
 * Get SSO configuration for an organization
 */
export async function getSSOConfig(organizationSubdomain: string): Promise<{
  success: boolean;
  config?: SSOConfig;
  organization?: ClientOrganization;
  error?: string;
}> {
  try {
    const supabase = createMultiTenantClient();
    
    const { data, error } = await supabase
      .from("organizations")
      .select(`
        id,
        name,
        subdomain,
        plan,
        status,
        sso_enabled,
        sso_provider,
        sso_client_id,
        sso_issuer_url,
        sso_redirect_url,
        sso_domain_restriction
      `)
      .eq("subdomain", organizationSubdomain)
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

    // Check organization status
    if (data.status === 'suspended' || data.status === 'cancelled') {
      return {
        success: false,
        error: `This organization is currently ${data.status}. Please contact support.`,
      };
    }

    return {
      success: true,
      config: {
        sso_enabled: data.sso_enabled || false,
        sso_provider: data.sso_provider as SSOProvider | null,
        sso_client_id: data.sso_client_id || null,
        sso_client_secret: null, // Never return secret to client
        sso_issuer_url: data.sso_issuer_url || null,
        sso_redirect_url: data.sso_redirect_url || null,
        sso_domain_restriction: data.sso_domain_restriction || null,
      },
      organization: data as any,
    };
  } catch (error: any) {
    console.error("Get SSO config error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch SSO configuration",
    };
  }
}

/**
 * Initiate SSO login flow
 */
export async function initiateSSOLogin(
  organizationSubdomain: string,
  provider: SSOProvider
): Promise<{
  success: boolean;
  redirectUrl?: string;
  error?: string;
}> {
  try {
    // Get SSO configuration
    const configResult = await getSSOConfig(organizationSubdomain);
    
    if (!configResult.success || !configResult.config) {
      return {
        success: false,
        error: configResult.error || "SSO not configured",
      };
    }

    const config = configResult.config;

    if (!config.sso_enabled) {
      return {
        success: false,
        error: "SSO is not enabled for this organization",
      };
    }

    // Allow both Google and Azure if SSO is enabled, even if only one is configured in org settings
    // The configured provider in org settings is just a preference/default
    // Note: Both providers must be enabled in Supabase dashboard for this to work
    // We don't enforce provider mismatch - let Supabase handle it

    const supabase = createMultiTenantClient();
    
    // Build redirect URL - this is where Supabase will redirect AFTER handling OAuth
    // Must be our app's callback URL, not Supabase's callback URL
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const redirectUrl = config.sso_redirect_url || 
      `${baseUrl}/org/${organizationSubdomain}/sso/callback`;

    // Map provider to Supabase provider name
    let supabaseProvider: string;
    switch (provider) {
      case "azure":
        supabaseProvider = "azure";
        break;
      case "google":
        supabaseProvider = "google";
        break;
      case "oidc":
        supabaseProvider = "oidc";
        break;
      default:
        return {
          success: false,
          error: "Unsupported SSO provider",
        };
    }

    // Configure OAuth options
    const options: any = {
      redirectTo: redirectUrl,
      queryParams: {
        organization_subdomain: organizationSubdomain,
      },
    };

    // For OIDC, add issuer URL and scopes
    if (provider === "oidc" && config.sso_issuer_url) {
      options.queryParams = {
        ...options.queryParams,
        provider: "oidc",
      };
      // Note: Supabase OIDC provider must be configured in dashboard with issuer URL
      // The issuer URL is configured at the Supabase project level, not per-organization
      // For true multi-tenant OIDC, you'd need custom implementation
    }

    // Initiate OAuth flow
    // Note: Supabase uses project-level OAuth configuration
    // Organization-specific client IDs are stored for reference but Supabase uses its own config
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider as any,
      options,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      redirectUrl: data.url,
    };
  } catch (error: any) {
    console.error("Initiate SSO login error:", error);
    return {
      success: false,
      error: error.message || "Failed to initiate SSO login",
    };
  }
}

/**
 * Handle SSO callback and create/update user profile
 */
export async function handleSSOCallback(
  organizationSubdomain: string,
  userEmail: string,
  userId: string,
  userMetadata: Record<string, any>
): Promise<{
  success: boolean;
  user?: any;
  organization?: ClientOrganization;
  error?: string;
}> {
  try {
    const supabase = createServiceClient(); // Use service client to bypass RLS

    // Get organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("subdomain", organizationSubdomain)
      .single();

    if (orgError || !org) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    // Check organization status
    if (org.status === 'suspended' || org.status === 'cancelled') {
      return {
        success: false,
        error: `This organization is currently ${org.status}. Please contact support.`,
      };
    }

    // Check domain restriction if configured
    if (org.sso_domain_restriction) {
      const emailDomain = userEmail.split("@")[1]?.toLowerCase();
      const allowedDomain = org.sso_domain_restriction.toLowerCase();
      
      if (emailDomain !== allowedDomain) {
        return {
          success: false,
          error: `Email domain ${emailDomain} is not allowed. Only ${allowedDomain} emails can access this organization.`,
        };
      }
    }

    // Check if user profile exists by ID (SSO user)
    let { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
      console.error("Profile query error:", profileError);
      return {
        success: false,
        error: "Failed to check user profile",
      };
    }

    // If profile doesn't exist by ID, check if user exists by email in this organization
    if (!profile) {
      const { data: existingByEmail, error: emailError } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("email", userEmail.toLowerCase())
        .eq("organization_id", org.id)
        .maybeSingle();

      if (emailError && emailError.code !== 'PGRST116') {
        console.error("Email lookup error:", emailError);
        return {
          success: false,
          error: "Failed to check user profile",
        };
      }

      // If found by email but different ID, user needs to link accounts
      // For now, we'll create a new profile for SSO user
      // (In future, we could implement account linking)
      if (existingByEmail) {
        console.log("User exists with email but different auth ID. Creating SSO profile.");
        // Note: This creates a duplicate profile entry, which may need to be handled
        // For production, consider implementing account linking instead
      }

      // Check if we should auto-create
      // For SSO, we can auto-create if email domain matches restriction OR if user exists by email
      const emailDomain = userEmail.split("@")[1]?.toLowerCase();
      const shouldAutoCreate = 
        (org.sso_domain_restriction && emailDomain === org.sso_domain_restriction.toLowerCase()) ||
        !!existingByEmail; // Auto-create if user exists by email (they're already in the org)

      if (!shouldAutoCreate) {
        return {
          success: false,
          error: "User not found. Please contact your administrator to be added to this organization.",
        };
      }

      // Auto-create profile with default role (or use existing role if found by email)
      const { data: newProfile, error: createError } = await supabase
        .from("admin_profiles")
        .insert({
          id: userId,
          email: userEmail,
          full_name: userMetadata.full_name || userMetadata.name || existingByEmail?.full_name || null,
          avatar_url: userMetadata.avatar_url || userMetadata.picture || existingByEmail?.avatar_url || null,
          organization_id: org.id,
          role: existingByEmail?.role || "viewer", // Use existing role or default to viewer
          department: existingByEmail?.department || null,
          is_active: true,
        })
        .select()
        .single();

      if (createError || !newProfile) {
        console.error("Auto-create profile error:", createError);
        // If it's a duplicate key error, try to fetch the existing profile
        if (createError?.code === '23505') { // Unique violation
          const { data: existingProfile } = await supabase
            .from("admin_profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();
          if (existingProfile) {
            profile = existingProfile;
          } else {
            return {
              success: false,
              error: "Failed to create user profile. Please contact support.",
            };
          }
        } else {
          return {
            success: false,
            error: "Failed to create user profile",
          };
        }
      } else {
        profile = newProfile;
      }
    } else {
      // Profile exists - verify it belongs to this organization
      if (profile.organization_id !== org.id) {
        return {
          success: false,
          error: "Access denied. You do not belong to this organization.",
        };
      }

      // Check if user is active
      if (!profile.is_active) {
        return {
          success: false,
          error: "Your account is inactive. Please contact your administrator.",
        };
      }

      // Update profile with latest metadata
      const { error: updateError } = await supabase
        .from("admin_profiles")
        .update({
          email: userEmail,
          full_name: userMetadata.full_name || userMetadata.name || profile.full_name,
          avatar_url: userMetadata.avatar_url || userMetadata.picture || profile.avatar_url,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Update profile error:", updateError);
        // Don't fail the login if update fails
      }
    }

    // Log successful SSO login
    await supabase.from("audit_logs").insert({
      organization_id: org.id,
      user_id: userId,
      user_email: userEmail,
      action: "sso_login_success",
      resource_type: "authentication",
      resource_id: userId,
    });

    return {
      success: true,
      user: profile,
      organization: org as any,
    };
  } catch (error: any) {
    console.error("Handle SSO callback error:", error);
    return {
      success: false,
      error: error.message || "Failed to process SSO callback",
    };
  }
}

/**
 * Log failed SSO attempt
 */
export async function logFailedSSOAttempt(
  organizationSubdomain: string,
  userEmail: string | null,
  reason: string,
  ipAddress?: string
): Promise<void> {
  try {
    const supabase = createServiceClient();

    // Get organization ID
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("subdomain", organizationSubdomain)
      .single();

    if (org) {
      await supabase.from("audit_logs").insert({
        organization_id: org.id,
        user_email: userEmail,
        action: "sso_login_failed",
        resource_type: "authentication",
        old_values: { reason },
        ip_address: ipAddress,
      });
    }
  } catch (error) {
    console.error("Log failed SSO attempt error:", error);
    // Don't throw - logging failures shouldn't break the flow
  }
}


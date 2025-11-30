import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/config/environment";

type SSOPayload = {
  sso_enabled?: boolean;
  sso_provider?: "azure" | "google" | "oidc" | null;
  sso_client_id?: string | null;
  sso_client_secret?: string | null;
  sso_issuer_url?: string | null;
  sso_redirect_url?: string | null;
  sso_domain_restriction?: string | null;
};

export async function GET(request: NextRequest) {
  try {
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
          } catch {}
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {}
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Verify requester and get organization_id
    const { data: adminProfile } = await supabase
      .from("admin_profiles")
      .select("id, role, organization_id")
      .eq("id", user.id)
      .single();

    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    // Get SSO configuration
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("sso_enabled, sso_provider, sso_client_id, sso_issuer_url, sso_redirect_url, sso_domain_restriction")
      .eq("id", adminProfile.organization_id)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      config: {
        sso_enabled: org.sso_enabled || false,
        sso_provider: org.sso_provider,
        sso_client_id: org.sso_client_id,
        sso_issuer_url: org.sso_issuer_url,
        sso_redirect_url: org.sso_redirect_url,
        sso_domain_restriction: org.sso_domain_restriction,
        // Never return client secret
      },
    });
  } catch (error: any) {
    console.error("Get SSO config API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as SSOPayload;

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
          } catch {}
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {}
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Verify requester and get organization_id
    const { data: adminProfile } = await supabase
      .from("admin_profiles")
      .select("id, role, organization_id, full_name, email")
      .eq("id", user.id)
      .single();

    if (!adminProfile) {
      return NextResponse.json({ success: false, error: "Admin profile not found" }, { status: 403 });
    }
    if (adminProfile.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    // Load existing organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, subdomain, sso_enabled, sso_provider, sso_client_id, sso_client_secret, sso_issuer_url, sso_redirect_url, sso_domain_restriction")
      .eq("id", adminProfile.organization_id)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Update SSO fields
    if (body.sso_enabled !== undefined) {
      updateData.sso_enabled = body.sso_enabled;
    }
    if (body.sso_provider !== undefined) {
      updateData.sso_provider = body.sso_provider;
    }
    if (body.sso_client_id !== undefined) {
      updateData.sso_client_id = body.sso_client_id;
    }
    if (body.sso_client_secret !== undefined) {
      // Only update if a new value is provided (not empty string)
      if (body.sso_client_secret && body.sso_client_secret.trim() !== "") {
        updateData.sso_client_secret = body.sso_client_secret;
      }
      // If empty string, don't update (keep existing secret)
    }
    if (body.sso_issuer_url !== undefined) {
      updateData.sso_issuer_url = body.sso_issuer_url;
    }
    if (body.sso_redirect_url !== undefined) {
      updateData.sso_redirect_url = body.sso_redirect_url;
    }
    if (body.sso_domain_restriction !== undefined) {
      updateData.sso_domain_restriction = body.sso_domain_restriction;
    }

    // Auto-generate redirect URL if not provided
    if (updateData.sso_enabled && !updateData.sso_redirect_url && !org.sso_redirect_url) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
        (typeof window !== 'undefined' ? window.location.origin : '');
      updateData.sso_redirect_url = `${baseUrl}/org/${org.subdomain}/sso/callback`;
    }

    const { data: updatedOrg, error: updateError } = await supabase
      .from("organizations")
      .update(updateData)
      .eq("id", adminProfile.organization_id)
      .select("id, name, subdomain, sso_enabled, sso_provider")
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message || "Failed to update SSO configuration" },
        { status: 500 }
      );
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      organization_id: adminProfile.organization_id,
      user_id: user.id,
      user_email: adminProfile.email,
      action: "update_sso_config",
      resource_type: "organization",
      resource_id: adminProfile.organization_id,
      new_values: {
        sso_enabled: updateData.sso_enabled,
        sso_provider: updateData.sso_provider,
      },
    });

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
    });
  } catch (error: any) {
    console.error("Update SSO config API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}


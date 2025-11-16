import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/config/environment";

type BrandingPayload = {
  logo_url?: string | null;
  email_logo_url?: string | null;
  support_email?: string | null;
  support_phone?: string | null;
  primary_color?: string | null;
  theme_mode?: "light" | "dark" | "system" | null;
};

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as BrandingPayload;

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
    if (adminProfile.role !== "admin" && adminProfile.role !== "manager") {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
    }

    // Load existing branding to merge
    const { data: org } = await supabase
      .from("organizations")
      .select("id, branding, logo_url")
      .eq("id", adminProfile.organization_id)
      .single();

    if (!org) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    const nextBranding = {
      ...(org.branding || {}),
      ...(body.support_email !== undefined ? { support_email: body.support_email } : {}),
      ...(body.support_phone !== undefined ? { support_phone: body.support_phone } : {}),
      ...(body.primary_color !== undefined ? { primary_color: body.primary_color } : {}),
      ...(body.theme_mode !== undefined ? { theme_mode: body.theme_mode } : {}),
      ...(body.email_logo_url !== undefined ? { email_logo_url: body.email_logo_url } : {}),
    };

    const updateData: any = {
      branding: nextBranding,
      updated_at: new Date().toISOString(),
    };
    if (body.logo_url !== undefined) {
      updateData.logo_url = body.logo_url;
    }

    const { data: updatedOrg, error: updateError } = await supabase
      .from("organizations")
      .update(updateData)
      .eq("id", adminProfile.organization_id)
      .select("id, name, subdomain, logo_url, branding")
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message || "Failed to update branding" },
        { status: 500 }
      );
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      organization_id: adminProfile.organization_id,
      user_id: user.id,
      action: "update_branding",
      resource_type: "organization",
      resource_id: adminProfile.organization_id,
      details: {
        updated_by: adminProfile.full_name || adminProfile.email,
        fields: Object.keys(body || {}),
      },
    });

    return NextResponse.json({ success: true, organization: updatedOrg });
  } catch (error) {
    console.error("Branding update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}



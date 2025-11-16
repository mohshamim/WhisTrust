import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { verifySuperAdminSession } from "@/lib/services/super-admin-auth";
import { sendEmail } from "@/lib/email/mailer";
import { renderBrandedEmailHTML } from "@/lib/email/templates/base";

export async function POST(request: NextRequest) {
  try {
    const session = await verifySuperAdminSession();
    if (!session.valid) {
      return NextResponse.json({ success: false, error: session.error || "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, email, full_name, password, role = "admin", department } = body as {
      organizationId: string;
      email: string;
      full_name: string;
      password: string;
      role?: "admin" | "manager" | "investigator";
      department?: string;
    };

    if (!organizationId || !email || !full_name || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Verify org
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, branding, current_admin_users, max_admin_users")
      .eq("id", organizationId)
      .single();
    if (orgError || !org) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }
    if (org.max_admin_users && org.current_admin_users >= org.max_admin_users) {
      return NextResponse.json({ success: false, error: "User limit reached for this plan" }, { status: 429 });
    }

    // Avoid duplicates
    const { data: existing } = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("email", email)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already exists in this organization" }, { status: 409 });
    }

    // Create auth user
    const { data: authUser, error: createAuthError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createAuthError || !authUser.user) {
      return NextResponse.json({ success: false, error: "Failed to create user account" }, { status: 500 });
    }

    // Create admin profile
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .insert({
        id: authUser.user.id,
        organization_id: organizationId,
        email,
        full_name,
        role,
        department: department || null,
        is_active: true,
      })
      .select()
      .single();
    if (profileError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ success: false, error: "Failed to create user profile" }, { status: 500 });
    }

    // Bump admin count
    await supabase
      .from("organizations")
      .update({ current_admin_users: (org.current_admin_users || 0) + 1 })
      .eq("id", organizationId);

    // Email the new admin (best-effort)
    try {
      const html = renderBrandedEmailHTML({
        subject: "Your admin access to WhisTrust",
        organization: { name: org.name, branding: org.branding } as any,
        bodyHtml: `
          <h2 style="margin:0 0 12px 0;font-size:18px;">Welcome, ${full_name}</h2>
          <p style="margin:0 0 12px 0;">Your admin account has been created for <strong>${org.name}</strong>.</p>
          <ul style="margin:0 0 12px 20px;">
            <li><strong>Email:</strong> ${email}</li>
          </ul>
          <p>Please sign in to the portal to begin.</p>
        `,
      });
      await sendEmail({ to: email, subject: "Your admin access to WhisTrust", html });
    } catch {}

    // Audit
    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: session.user?.id,
      action: "bootstrap_admin",
      resource_type: "user",
      resource_id: profile.id,
      details: {
        created_by: session.user?.email,
        email,
        role,
      },
    });

    return NextResponse.json({ success: true, user: profile });
  } catch (e: any) {
    console.error("Bootstrap admin error:", e);
    return NextResponse.json({ success: false, error: e.message || "Server error" }, { status: 500 });
  }
}



import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/config/environment";
import { checkRateLimit, getClientIp, recordAttempt } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Throttle user create endpoint: 30/min per IP, lockout after 15 attempts in 10min
    const ip = getClientIp(request);
    const rl = checkRateLimit(`users-create:${ip}`, 30, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }
    const attempt = recordAttempt(`users-create-attempt:${ip}`, 10 * 60 * 1000, 15);
    if (attempt.locked) {
      return NextResponse.json({ success: false, error: "Temporarily locked due to repeated attempts" }, { status: 429 });
    }
    const body = await request.json();
    const { email, full_name, password, role, department, organizationId } = body;

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

    // Get the authenticated user (must be admin)
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
        { success: false, error: "Only admins can create users" },
        { status: 403 }
      );
    }

    // Validation
    if (!email || !full_name || !password || !role || !organizationId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["admin", "manager", "investigator"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
    }

    // Enforce usage limits
    const { assertCanCreateAdmin, bumpAdminCount } = await import("@/lib/services/limits");
    const limit = await assertCanCreateAdmin(organizationId);
    if (!limit.allowed) {
      return NextResponse.json({ success: false, error: limit.message }, { status: limit.status });
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already exists in this organization" },
        { status: 409 }
      );
    }

    // Create auth user
    const { data: authUser, error: createAuthError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (createAuthError || !authUser.user) {
      console.error("Error creating auth user:", createAuthError);
      return NextResponse.json(
        { success: false, error: "Failed to create user account" },
        { status: 500 }
      );
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
      console.error("Error creating profile:", profileError);
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json(
        { success: false, error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: user.id,
      action: "create_user",
      resource_type: "user",
      resource_id: profile.id,
      details: {
        email,
        full_name,
        role,
        department,
        created_by: requestingUser.full_name || user.email,
      },
    });

    // Bump counters
    await bumpAdminCount(organizationId);

    // Emails disabled by requirement - skip welcome email

    return NextResponse.json({
      success: true,
      user: profile,
    });
  } catch (error) {
    console.error("Error in create user API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


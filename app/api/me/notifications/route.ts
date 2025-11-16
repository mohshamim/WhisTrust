import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/config/environment";
import { createServiceClient } from "@/lib/supabase/service-client";

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const config = getSupabaseConfig();
    const supabaseAuth = createServerClient(config.url, config.anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (_) {
            // ignore
          }
        },
      },
    });
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { key, enabled } = await request.json();
    if (!key) return NextResponse.json({ success: false, error: "Missing key" }, { status: 400 });

    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("notification_prefs")
      .eq("id", user.id)
      .single();

    const prefs = { ...(profile?.notification_prefs || {}) };
    prefs[key] = !!enabled;

    const { error } = await supabase
      .from("admin_profiles")
      .update({ notification_prefs: prefs, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 });
    return NextResponse.json({ success: true, prefs });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || "Server error" }, { status: 500 });
  }
}



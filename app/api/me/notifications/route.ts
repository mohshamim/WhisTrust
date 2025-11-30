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

    const body = await request.json();
    
    // Support both single key update and bulk update
    const { key, enabled, preferences } = body;
    
    const supabase = createServiceClient();
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("notification_prefs")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
    }

    // Initialize prefs with defaults if not present
    const existingPrefs = profile?.notification_prefs || {};
    const prefs: Record<string, boolean> = {
      new_report: existingPrefs.new_report !== false,
      reporter_message: existingPrefs.reporter_message !== false,
      assignment_change: existingPrefs.assignment_change !== false,
      status_change: existingPrefs.status_change !== false,
      ...existingPrefs, // Preserve any other existing prefs
    };
    
    // If preferences object is provided, update all at once (bulk update)
    if (preferences && typeof preferences === 'object') {
      if (preferences.new_report !== undefined) prefs.new_report = !!preferences.new_report;
      if (preferences.reporter_message !== undefined) prefs.reporter_message = !!preferences.reporter_message;
      if (preferences.assignment_change !== undefined) prefs.assignment_change = !!preferences.assignment_change;
      if (preferences.status_change !== undefined) prefs.status_change = !!preferences.status_change;
    } 
    // Otherwise, update single key (backward compatibility)
    else if (key) {
      prefs[key] = !!enabled;
    } else {
      return NextResponse.json({ success: false, error: "Missing key or preferences" }, { status: 400 });
    }

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



import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/config/environment";

const BUCKET = "branding-assets";
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
  "image/x-icon",
  "image/vnd.microsoft.icon",
];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
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

    const form = await request.formData();
    const file = form.get("file") as File | null;
    const kind = (form.get("kind") as string) || "logo"; // "logo" | "email_logo" | "favicon" | "logo_light" | "logo_dark"

    if (!file) {
      return NextResponse.json({ success: false, error: "File is required" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "File exceeds 2MB limit" }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Unsupported file type" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Verify admin profile and org
    const { data: adminProfile } = await supabase
      .from("admin_profiles")
      .select("id, role, organization_id")
      .eq("id", user.id)
      .single();
    if (!adminProfile) {
      return NextResponse.json({ success: false, error: "Admin profile not found" }, { status: 403 });
    }
    if (adminProfile.role !== "admin" && adminProfile.role !== "manager") {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
    }

    // Ensure bucket exists (public)
    const { data: bucketInfo } = await (supabase.storage as any).getBucket(BUCKET);
    if (!bucketInfo) {
      await (supabase.storage as any).createBucket(BUCKET, { public: true });
    }

    // Build storage path
    const orgId = adminProfile.organization_id;
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const fileName = `${kind}-${Date.now()}.${ext}`;
    const filePath = `${orgId}/${fileName}`;

    // Upload
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        upsert: true,
      });
    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message || "Upload failed" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    // Return URL and path
    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      kind,
    });
  } catch (error) {
    console.error("Branding upload error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}



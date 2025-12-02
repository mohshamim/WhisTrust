/**
 * Avatar Management Service
 * Handles avatar uploads and retrieval for admin users
 */

import { createMultiTenantClient } from "@/lib/supabase/multi-tenant-client";

export interface AvatarUploadResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

// Available avatar styles from Dicebear - Professional & Beautiful options
export const AVATAR_STYLES = [
  { id: 'notionists', name: 'Professional', description: 'Clean business style' },
  { id: 'avataaars', name: 'Modern', description: 'Contemporary look' },
  { id: 'lorelei', name: 'Elegant', description: 'Sophisticated design' },
  { id: 'big-smile', name: 'Friendly', description: 'Warm & approachable' },
  { id: 'personas', name: 'Creative', description: 'Artistic style' },
  { id: 'adventurer', name: 'Bold', description: 'Confident appearance' },
  { id: 'initials', name: 'Minimal', description: 'Simple & clean' },
  { id: 'shapes', name: 'Abstract', description: 'Geometric design' },
] as const;

export type AvatarStyle = typeof AVATAR_STYLES[number]['id'];

// Default avatar style - Professional by default
export const DEFAULT_AVATAR_STYLE: AvatarStyle = 'notionists';

/**
 * Upload user avatar to Supabase Storage
 */
export async function uploadAvatar(file: File, userId: string): Promise<AvatarUploadResult> {
  try {
    const supabase = createMultiTenantClient();

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: "File size must be less than 5MB" };
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Only image files (JPEG, PNG, WebP, GIF) are allowed" };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Delete old avatar if exists
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (profile?.avatar_url) {
      // Extract old filename from URL
      const oldPath = profile.avatar_url.split("/").pop();
      if (oldPath && oldPath.startsWith(userId)) {
        await supabase.storage
          .from("user-avatars")
          .remove([`avatars/${oldPath}`]);
      }
    }

    // Upload new avatar
    const { data, error: uploadError } = await supabase.storage
      .from("user-avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("user-avatars")
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Update admin_profiles with new avatar URL
    const { error: updateError } = await supabase
      .from("admin_profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return { success: false, error: "Failed to update profile" };
    }

    return { success: true, avatarUrl };
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return { success: false, error: error.message || "Failed to upload avatar" };
  }
}

/**
 * Delete user avatar
 */
export async function deleteAvatar(userId: string): Promise<AvatarUploadResult> {
  try {
    const supabase = createMultiTenantClient();

    // Get current avatar URL
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (!profile?.avatar_url) {
      return { success: true }; // Nothing to delete
    }

    // Extract filename from URL
    const oldPath = profile.avatar_url.split("/").pop();
    if (oldPath && oldPath.startsWith(userId)) {
      await supabase.storage
        .from("user-avatars")
        .remove([`avatars/${oldPath}`]);
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from("admin_profiles")
      .update({ avatar_url: null })
      .eq("id", userId);

    if (updateError) {
      return { success: false, error: "Failed to update profile" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete avatar" };
  }
}

/**
 * Get avatar URL for a user (with fallback to Dicebear)
 */
export function getAvatarUrl(
  user: { avatar_url?: string | null; email: string; avatar_style?: string | null },
  style?: AvatarStyle
): string {
  // If user has uploaded a custom avatar, use it
  if (user.avatar_url && !user.avatar_url.includes('dicebear.com')) {
    return user.avatar_url;
  }
  
  // Use specified style, user's preferred style, or default
  const avatarStyle = style || user.avatar_style || DEFAULT_AVATAR_STYLE;
  
  // Generate Dicebear avatar
  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(user.email)}`;
}

/**
 * Set user's preferred avatar style
 */
export async function setAvatarStyle(userId: string, style: AvatarStyle): Promise<AvatarUploadResult> {
  try {
    const supabase = createMultiTenantClient();

    // Generate the Dicebear URL with the new style
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (!profile) {
      return { success: false, error: "User not found" };
    }

    const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(profile.email)}`;

    // Update profile with new avatar style and URL
    const { error: updateError } = await supabase
      .from("admin_profiles")
      .update({ 
        avatar_url: avatarUrl,
        avatar_style: style 
      })
      .eq("id", userId);

    if (updateError) {
      return { success: false, error: "Failed to update avatar style" };
    }

    return { success: true, avatarUrl };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to set avatar style" };
  }
}


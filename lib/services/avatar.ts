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

// Available avatar styles - Professional & Beautiful options from local images
export const AVATAR_STYLES = [
  { id: 'profile', name: 'Professional Man', description: 'Business professional', image: '/avatar/profile.png' },
  { id: 'man', name: 'Business Man', description: 'Corporate style', image: '/avatar/man.png' },
  { id: 'man-1', name: 'Executive', description: 'Leadership style', image: '/avatar/man (1).png' },
  { id: 'man-2', name: 'Manager', description: 'Management style', image: '/avatar/man (2).png' },
  { id: 'man-3', name: 'Analyst', description: 'Technical style', image: '/avatar/man (3).png' },
  { id: 'boy', name: 'Young Professional', description: 'Modern professional', image: '/avatar/boy.png' },
  { id: 'arab-man', name: 'Arab Professional', description: 'Middle Eastern professional', image: '/avatar/arab-man.png' },
  { id: 'arab-man-1', name: 'Arab Executive', description: 'Traditional Arab style', image: '/avatar/arab-man (1).png' },
  { id: 'woman', name: 'Professional Woman', description: 'Business professional', image: '/avatar/woman.png' },
  { id: 'woman-1', name: 'Executive Woman', description: 'Leadership style', image: '/avatar/woman (1).png' },
  { id: 'moslem-woman', name: 'Modest Professional', description: 'Professional with headscarf', image: '/avatar/moslem-woman.png' },
  { id: 'arab', name: 'Traditional Professional', description: 'Traditional business style', image: '/avatar/arab.png' },
] as const;

export type AvatarStyle = typeof AVATAR_STYLES[number]['id'];

// Default avatar style - Professional by default
export const DEFAULT_AVATAR_STYLE: AvatarStyle = 'profile';

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
 * Get avatar URL for a user (with fallback to local default avatars)
 */
export function getAvatarUrl(
  user: { avatar_url?: string | null; email: string; avatar_style?: string | null },
  style?: AvatarStyle
): string {
  // If user has uploaded a custom avatar, use it
  if (user.avatar_url && !user.avatar_url.includes('avatar/')) {
    return user.avatar_url;
  }
  
  // Use specified style, user's preferred style, or default
  const avatarStyle = style || user.avatar_style || DEFAULT_AVATAR_STYLE;
  
  // Find the avatar style configuration
  const styleConfig = AVATAR_STYLES.find(s => s.id === avatarStyle);
  
  // Return the local image path
  return styleConfig?.image || AVATAR_STYLES[0].image;
}

/**
 * Set user's preferred avatar style
 */
export async function setAvatarStyle(userId: string, style: AvatarStyle): Promise<AvatarUploadResult> {
  try {
    const supabase = createMultiTenantClient();

    // Find the avatar style configuration
    const styleConfig = AVATAR_STYLES.find(s => s.id === style);
    
    if (!styleConfig) {
      return { success: false, error: "Invalid avatar style" };
    }

    const avatarUrl = styleConfig.image;

    // Update profile with new avatar style (clear avatar_url since we're using default)
    const { error: updateError } = await supabase
      .from("admin_profiles")
      .update({ 
        avatar_url: null, // Clear custom upload
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


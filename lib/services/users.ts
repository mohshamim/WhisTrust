/**
 * Users Management Service
 * Handles CRUD operations for admin profiles
 */

import { createServiceClient } from "@/lib/supabase/service-client";

export interface AdminUser {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "investigator";
  department: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  full_name: string;
  password: string;
  role: "admin" | "manager" | "investigator";
  department?: string;
}

export interface UpdateUserData {
  full_name?: string;
  role?: "admin" | "manager" | "investigator";
  department?: string;
  is_active?: boolean;
}

/**
 * Get all users for an organization
 */
export async function getOrganizationUsers(
  organizationId: string
): Promise<{ success: boolean; data?: AdminUser[]; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("admin_profiles")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(
  userId: string
): Promise<{ success: boolean; data?: AdminUser; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("admin_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch user",
    };
  }
}

/**
 * Check if email is already used in organization
 */
export async function checkEmailExists(
  organizationId: string,
  email: string
): Promise<boolean> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("email", email)
      .maybeSingle();

    return !!data;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
}

/**
 * Get user's assigned cases count
 */
export async function getUserCasesCount(userId: string): Promise<number> {
  try {
    const supabase = createServiceClient();

    const { count, error } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", userId)
      .in("status", ["submitted", "under_review", "investigating"]);

    return count || 0;
  } catch (error) {
    console.error("Error fetching user cases count:", error);
    return 0;
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const supabase = createServiceClient();

    await supabase
      .from("admin_profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", userId);
  } catch (error) {
    console.error("Error updating last login:", error);
  }
}

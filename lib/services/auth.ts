/**
 * Authentication Service
 * 
 * Handles admin authentication using Supabase Auth
 */

import { createClient } from "@/lib/supabase/client";

export interface AdminSignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: any;
}

/**
 * Sign in admin user
 */
export async function signInAdmin(
  credentials: AdminSignInData
): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error in signInAdmin:", error);
    return { success: false, error: "Authentication failed" };
  }
}

/**
 * Sign out admin user
 */
export async function signOutAdmin(): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in signOutAdmin:", error);
    return { success: false, error: "Failed to sign out" };
  }
}

/**
 * Get current admin user session
 */
export async function getCurrentAdmin() {
  try {
    const supabase = createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error in getCurrentAdmin:", error);
    return { success: false, error: "Failed to get current user" };
  }
}

/**
 * Supabase Client Configuration
 * 
 * This file centralizes Supabase client initialization.
 * To migrate to a different backend:
 * 1. Change imports in this file
 * 2. Ensure the interface matches your new provider
 * 3. Update environment variables accordingly
 */

import { createBrowserClient } from "@supabase/ssr";

// Environment variables - TODO: migrate these to different backend if needed
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please check your .env.local file.");
}

/**
 * Browser client for client-side operations
 * Safe to use in React components and browser-only code
 */
export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// For compatibility with existing code
export const supabase = createClient();

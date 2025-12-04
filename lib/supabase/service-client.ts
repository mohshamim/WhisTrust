/**
 * Supabase Service Role Client
 * Used for server-side operations that bypass RLS
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/config/environment";

/**
 * Create a Supabase client with service role key
 * This bypasses Row Level Security and should only be used server-side
 */
export function createServiceClient() {
  const config = getSupabaseConfig();
  
  // Use production service role key if available, otherwise use default
  const supabaseServiceKey = process.env.PROD_SUPABASE_SERVICE_ROLE_KEY 
                           || process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or PROD_SUPABASE_SERVICE_ROLE_KEY environment variable");
  }
  
  return createClient(config.url, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}


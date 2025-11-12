/**
 * Multi-Tenant Supabase Client
 * 
 * This client automatically switches between Demo and Production Supabase
 * based on the current environment.
 * 
 * Use this for NEW multi-tenant features.
 * Existing /demo code continues to use lib/supabase/client.ts
 */

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig, getEnvironment, type Environment } from "@/lib/config/environment";

/**
 * Create a Supabase browser client for the current environment
 */
export function createMultiTenantClient() {
  const config = getSupabaseConfig();
  
  return createBrowserClient(config.url, config.anonKey);
}

/**
 * Create a Supabase client for a specific environment
 * Useful for testing or admin operations
 */
export function createClientForEnvironment(environment: Environment) {
  const config = getSupabaseConfig(environment);
  
  return createBrowserClient(config.url, config.anonKey);
}

/**
 * Get current environment info
 */
export function getCurrentEnvironmentInfo() {
  const env = getEnvironment();
  const config = getSupabaseConfig(env);
  
  return {
    environment: env,
    supabaseUrl: config.url,
    // Don't expose the full key, just a hint
    anonKeyPreview: `${config.anonKey.substring(0, 20)}...`,
  };
}

// Default export for convenience
export const multiTenantSupabase = createMultiTenantClient();


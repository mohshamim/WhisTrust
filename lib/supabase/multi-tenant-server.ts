/**
 * Multi-Tenant Server-Side Supabase Client
 * 
 * For use in Next.js Server Components, API Routes, and Server Actions
 * Automatically switches between Demo and Production Supabase
 */

import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { getSupabaseConfig, type Environment } from "@/lib/config/environment";

/**
 * Create a server-side Supabase client for the current environment
 * Automatically detects environment based on hostname
 */
export async function createMultiTenantServerClient() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const pathname = headersList.get('x-pathname') || '';
  
  // Determine environment from request
  const config = getSupabaseConfig();
  
  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Create a server-side client for a specific environment
 */
export async function createServerClientForEnvironment(environment: Environment) {
  const cookieStore = await cookies();
  const config = getSupabaseConfig(environment);
  
  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Ignore errors in Server Components
        }
      },
    },
  });
}


/**
 * Environment Configuration
 * 
 * Simplified configuration - all paths now use the production (multi-tenant) Supabase.
 * The /demo page is just a landing page that redirects to /org/demo.
 */

export type Environment = 'production';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  environment: Environment;
}

/**
 * Get environment - always returns 'production' now
 * Kept for backward compatibility
 */
export function getEnvironment(hostname?: string, pathname?: string): Environment {
  return 'production';
}

/**
 * Get Supabase credentials - now simplified to single environment
 */
export function getSupabaseConfig(environment?: Environment): SupabaseConfig {
  // Production Supabase (multi-tenant)
  // Try PROD-specific vars first, fall back to generic vars
  const url = process.env.NEXT_PUBLIC_PROD_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_PROD_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('❌ Missing Supabase credentials!');
    console.error('NEXT_PUBLIC_PROD_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_PROD_SUPABASE_URL);
    console.error('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    throw new Error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  return {
    url,
    anonKey: key,
    environment: 'production'
  };
}

/**
 * Check if we're in production mode - always true now
 */
export function isProductionEnvironment(): boolean {
  return true;
}

/**
 * Get environment display name
 */
export function getEnvironmentDisplayName(env?: Environment): string {
  return '🚀 Production Environment';
}


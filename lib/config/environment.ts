/**
 * Multi-Environment Configuration
 * 
 * This file handles switching between Demo and Production Supabase instances
 * based on the current hostname/subdomain.
 * 
 * DEMO: demo.whistrust.com or localhost:3000/demo
 * PRODUCTION: *.whistrust.app (multi-tenant)
 */

export type Environment = 'demo' | 'production';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  environment: Environment;
}

/**
 * Determine which environment we're in based on hostname or path
 * This runs on both client and server
 */
export function getEnvironment(hostname?: string, pathname?: string): Environment {
  // Server-side: Use hostname from request headers
  // Client-side: Use window.location
  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : '');
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
  
  // PATH-BASED DETECTION (highest priority)
  // IMPORTANT: /org/demo/* uses PRODUCTION Supabase (multi-tenant)
  // Only the landing page /demo uses old Demo Supabase (if you still have it)
  
  // /superadmin, /test, or /org/* always use Production Supabase
  if (path.startsWith('/superadmin') || path.startsWith('/test/connection') || path.startsWith('/org/')) {
    return 'production';
  }
  
  // /demo landing page uses Demo Supabase (legacy single-tenant)
  // BUT since we're now using /org/demo, this might not be needed
  if (path.startsWith('/demo')) {
    return 'production'; // Changed: now /demo also uses production for consistency
  }
  
  // HOSTNAME-BASED DETECTION
  // demo.whistrust.com always uses Demo Supabase
  if (host === 'demo.whistrust.com') {
    return 'demo';
  }
  
  // For localhost, default to Production (safer for multi-tenant development)
  // Demo is explicitly accessed via /demo path
  // Everything else is production (multi-tenant)
  return 'production';
}

/**
 * Get Supabase credentials for the current environment
 */
export function getSupabaseConfig(environment?: Environment): SupabaseConfig {
  const env = environment || getEnvironment();
  
  if (env === 'demo') {
    // Demo Supabase (existing/current Supabase project)
    // Falls back to main Supabase if DEMO variables not set
    const url = process.env.NEXT_PUBLIC_DEMO_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_DEMO_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error('❌ Missing Demo Supabase credentials!');
      console.error('NEXT_PUBLIC_DEMO_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_DEMO_SUPABASE_URL);
      console.error('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      throw new Error('Missing Demo Supabase credentials. Please set NEXT_PUBLIC_DEMO_SUPABASE_URL and NEXT_PUBLIC_DEMO_SUPABASE_ANON_KEY, or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    
    return {
      url,
      anonKey: key,
      environment: 'demo'
    };
  } else {
    // Production Supabase (new multi-tenant Supabase project)
    // Falls back to main Supabase if PROD variables not set
    const url = process.env.NEXT_PUBLIC_PROD_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_PROD_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error('❌ Missing Supabase credentials!');
      console.error('NEXT_PUBLIC_PROD_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_PROD_SUPABASE_URL);
      console.error('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      throw new Error('Missing Production Supabase credentials. Please set NEXT_PUBLIC_PROD_SUPABASE_URL and NEXT_PUBLIC_PROD_SUPABASE_ANON_KEY, or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    
    return {
      url,
      anonKey: key,
      environment: 'production'
    };
  }
}

/**
 * Check if we're in demo mode
 */
export function isDemoEnvironment(): boolean {
  return getEnvironment() === 'demo';
}

/**
 * Check if we're in production mode
 */
export function isProductionEnvironment(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Get environment display name
 */
export function getEnvironmentDisplayName(env?: Environment): string {
  const environment = env || getEnvironment();
  return environment === 'demo' ? '🎪 Demo Environment' : '🚀 Production Environment';
}


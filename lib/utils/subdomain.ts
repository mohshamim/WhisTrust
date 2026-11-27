/**
 * Subdomain Detection Utilities
 * 
 * Handles subdomain extraction and validation for multi-tenant routing
 * Examples:
 *   acme.whistrust.app → 'acme'
 *   healthtech.whistrust.app → 'healthtech'
 *   www.whistrust.com → null (main site)
 *   demo.whistrust.com → 'demo' (demo environment)
 */

export interface SubdomainInfo {
  subdomain: string | null;
  isMainSite: boolean;
  isDemo: boolean;
  isSuperAdmin: boolean;
  isClientTenant: boolean;
}

const ROOT_DOMAINS = ['whistrust.com', 'whistrust.app'];

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
}

function findRootDomain(hostname: string): string | undefined {
  return ROOT_DOMAINS.find(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

/**
 * Extract subdomain from hostname
 */
export function extractSubdomain(hostname: string): string | null {
  const host = normalizeHostname(hostname);
  const domain = findRootDomain(host);
  if (!domain || host === domain) return null;

  const subdomain = host.slice(0, -(domain.length + 1));
  return subdomain !== 'www' && isValidSubdomain(subdomain) ? subdomain : null;
}

/**
 * Get comprehensive subdomain information
 */
export function getSubdomainInfo(hostname: string): SubdomainInfo {
  const subdomain = extractSubdomain(hostname);
  
  return {
    subdomain,
    isMainSite: subdomain === null,
    isDemo: subdomain === 'demo',
    isSuperAdmin: subdomain === 'superadmin',
    isClientTenant: subdomain !== null && subdomain !== 'demo' && subdomain !== 'superadmin',
  };
}

export function getSubdomainRewrite(url: URL, hostname: string): URL | null {
  const { pathname } = url;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/org' ||
    pathname.startsWith('/org/')
  ) {
    return null;
  }

  const { subdomain, isDemo, isSuperAdmin } = getSubdomainInfo(hostname);
  if (!subdomain) return null;

  const prefix = isDemo || isSuperAdmin ? `/${subdomain}` : `/org/${subdomain}`;
  if (
    (isDemo || isSuperAdmin) &&
    (pathname === prefix || pathname.startsWith(`${prefix}/`))
  ) {
    return null;
  }

  const destination = new URL(url);
  destination.pathname = pathname === '/' ? prefix : `${prefix}${pathname}`;
  return destination;
}

/**
 * Validate subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
  // Subdomain must be:
  // - 1-63 characters
  // - Only lowercase letters, numbers, and hyphens
  // - Cannot start or end with hyphen
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  return subdomainRegex.test(subdomain);
}

/**
 * Get the root domain based on environment
 */
export function getRootDomain(): string {
  if (typeof window !== 'undefined') {
    const domain = findRootDomain(normalizeHostname(window.location.hostname));
    if (domain) return domain;
  }
  
  // Default for localhost/development
  return 'localhost:3000';
}

/**
 * Build full URL for a subdomain
 */
export function buildSubdomainUrl(subdomain: string, path: string = '/'): string {
  const rootDomain = getRootDomain();
  const protocol = rootDomain === 'localhost:3000' ? 'http' : 'https';
  
  if (rootDomain === 'localhost:3000') {
    // For localhost, we'll use path-based routing: /org/[subdomain]
    return `${protocol}://${rootDomain}/org/${subdomain}${path}`;
  }
  
  return `${protocol}://${subdomain}.${rootDomain}${path}`;
}

/**
 * Check if current request is from a client tenant subdomain
 */
export function isClientTenantRequest(hostname: string): boolean {
  const info = getSubdomainInfo(hostname);
  return info.isClientTenant;
}

/**
 * Get organization subdomain from URL
 * Works for both subdomain-based and path-based routing
 */
export function getOrganizationFromRequest(
  hostname: string,
  pathname: string
): string | null {
  // Check subdomain first (production)
  const info = getSubdomainInfo(hostname);
  if (info.isClientTenant && info.subdomain) {
    return info.subdomain;
  }
  
  // Check path-based routing (localhost development)
  // /org/acme/dashboard → 'acme'
  const pathMatch = pathname.match(/^\/org\/([a-z0-9-]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }
  
  return null;
}


/**
 * Test Helpers - Credential Management and Test Data Utilities
 */

export interface TestCredentials {
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'investigator' | 'hr';
  organization: string;
  subdomain: string;
}

/**
 * Predefined test credentials for different organizations and roles
 */
export const TEST_CREDENTIALS: Record<string, TestCredentials> = {
  // CodeSquare Organization
  'codesquare_admin': {
    email: 'admin@codesquare.com',
    password: 'CodeSquare@2024',
    role: 'admin',
    organization: 'CodeSquare',
    subdomain: 'codesquare',
  },
  'codesquare_investigator': {
    email: 'investigator@codesquare.com',
    password: 'Investigator@2024',
    role: 'investigator',
    organization: 'CodeSquare',
    subdomain: 'codesquare',
  },
  
  // Al-Bawani Organization
  'albawani_admin': {
    email: 'admin@al-bawani.com',
    password: 'AlBawani@2024',
    role: 'admin',
    organization: 'Al-Bawani',
    subdomain: 'al-bawani',
  },
  'albawani_manager': {
    email: 'manager@al-bawani.com',
    password: 'Manager@2024',
    role: 'manager',
    organization: 'Al-Bawani',
    subdomain: 'al-bawani',
  },
  'albawani_hr': {
    email: 'hr@al-bawani.com',
    password: 'HR@2024',
    role: 'hr',
    organization: 'Al-Bawani',
    subdomain: 'al-bawani',
  },
};

/**
 * Get credentials by key
 */
export function getCredentials(key: string): TestCredentials | undefined {
  return TEST_CREDENTIALS[key];
}

/**
 * Get all credentials for a specific organization
 */
export function getCredentialsByOrganization(subdomain: string): TestCredentials[] {
  return Object.values(TEST_CREDENTIALS).filter(cred => cred.subdomain === subdomain);
}

/**
 * Get all credentials for a specific role
 */
export function getCredentialsByRole(role: 'admin' | 'manager' | 'investigator' | 'hr'): TestCredentials[] {
  return Object.values(TEST_CREDENTIALS).filter(cred => cred.role === role);
}

/**
 * Test data for report submission
 */
export const TEST_REPORT_DATA = {
  categories: ['Fraud', 'Harassment', 'Safety', 'Discrimination', 'Retaliation', 'Other'],
  sampleDescriptions: {
    fraud: 'This is a test report for fraud category. It contains enough characters to pass validation requirements.',
    harassment: 'This is a test report for harassment category. It contains enough characters to pass validation requirements.',
    safety: 'This is a test report for safety category. It contains enough characters to pass validation requirements.',
    discrimination: 'This is a test report for discrimination category. It contains enough characters to pass validation requirements.',
    retaliation: 'This is a test report for retaliation category. It contains enough characters to pass validation requirements.',
    other: 'This is a test report for other category. It contains enough characters to pass validation requirements.',
  },
  testEmail: 'test.reporter@example.com',
  testTitle: 'Test Report - Automated Testing',
};

/**
 * Generate a test report description
 */
export function generateTestDescription(category: string): string {
  const key = category.toLowerCase() as keyof typeof TEST_REPORT_DATA.sampleDescriptions;
  return TEST_REPORT_DATA.sampleDescriptions[key] || TEST_REPORT_DATA.sampleDescriptions.other;
}

/**
 * Test organization subdomains
 */
export const TEST_ORGANIZATIONS = {
  codesquare: {
    subdomain: 'codesquare',
    name: 'CodeSquare',
    baseUrl: (port: number) => `http://localhost:${port}/org/codesquare`,
  },
  albawani: {
    subdomain: 'al-bawani',
    name: 'Al-Bawani',
    baseUrl: (port: number) => `http://localhost:${port}/org/al-bawani`,
  },
};

/**
 * Get organization config by subdomain
 */
export function getOrganizationConfig(subdomain: string) {
  return Object.values(TEST_ORGANIZATIONS).find(org => org.subdomain === subdomain);
}


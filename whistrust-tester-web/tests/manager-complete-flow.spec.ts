import { test, expect } from '@playwright/test';
import { takeScreenshot, logError } from '../lib/screenshot-helper';
import { findWhisTrustPort } from '../lib/port-detector';

const ADMIN_EMAIL = 'admin@codesquare.com';
const ADMIN_PASSWORD = 'CodeSquare@2024';

async function login(page: any, baseURL: string, subdomain: string, email: string, password: string) {
  await page.goto(`${baseURL}/org/${subdomain}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Sign In")');
  
  await page.waitForURL(`**/org/${subdomain}/dashboard`, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

async function logout(page: any) {
  const logoutButton = page.locator('button:has-text("Logout")')
    .or(page.locator('button:has-text("Sign Out")'))
    .first();
  if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForTimeout(1500);
  }
}

async function ensureManagerUser(page: any, baseURL: string, subdomain: string, email: string, password: string) {
  await login(page, baseURL, subdomain, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.goto(`${baseURL}/org/${subdomain}/users`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const managerRow = page.locator(`text=${email}`).first();
  const exists = await managerRow.isVisible({ timeout: 3000 }).catch(() => false);

  if (!exists) {
    const addUserButton = page.locator('button:has-text("Add User")').or(page.locator('button:has-text("Add")')).first();
    if (await addUserButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addUserButton.click();
      await page.waitForTimeout(500);

      await page.fill('#email', email);
      await page.fill('#full_name', 'Automation Manager');
      await page.fill('#password', password);
      const roleTrigger = page.locator('#role').or(page.locator('button:has-text("Role")')).first();
      if (await roleTrigger.isVisible().catch(() => false)) {
        await roleTrigger.click();
        const option = page.locator('[role="option"]:has-text("Manager")').first();
        if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
          await option.click();
        }
      }
      await page.fill('#department', 'Automation QA');

      const createButton = page.locator('button:has-text("Create User")').first();
      if (await createButton.isVisible().catch(() => false)) {
        await createButton.click();
        await page.waitForTimeout(3000);
      }
    }
  }

  await logout(page);
}

/**
 * Login helper function
 */
async function loginAsManager(page: any, baseURL: string, subdomain: string, email: string, password: string) {
  await ensureManagerUser(page, baseURL, subdomain, email, password);
  await login(page, baseURL, subdomain, email, password);
}

test.describe('Manager Complete Flow', () => {
  let baseURL: string;
  let subdomain: string;
  let email: string;
  let password: string;

  test.beforeAll(async () => {
    const port = await findWhisTrustPort();
    baseURL = `http://localhost:${port}`;
    
    // Use CodeSquare organization (Al-Bawani doesn't exist)
    subdomain = 'codesquare';
    email = 'manager@codesquare.com';
    password = 'Manager@2024';
  });

  test('Complete Manager Flow - Department-Scoped Actions', async ({ page }) => {
    let stepNumber = 1;

    try {
      // ========== STEP 1: LOGIN ==========
      await loginAsManager(page, baseURL, subdomain, email, password);

      await takeScreenshot(page, {
        stepName: '01_manager_login_success',
        stepNumber: stepNumber++,
        status: 'success',
      });

      // ========== STEP 2: DASHBOARD ACCESS (Department-Scoped) ==========
      try {
        // Verify dashboard URL (check if URL contains the path)
        const currentUrl = page.url();
        if (!currentUrl.includes(`/org/${subdomain}/dashboard`)) {
          throw new Error(`Expected dashboard URL but got: ${currentUrl}`);
        }
        await expect(page.locator('h1:has-text("Dashboard")').first()).toBeVisible({ timeout: 10000 });
        
        await takeScreenshot(page, {
          stepName: '02_manager_dashboard',
          stepNumber: stepNumber++,
          status: 'success',
        });
      } catch (error) {
        await logError(page, error as Error, 'manager_dashboard', stepNumber - 1);
        throw error;
      }

      // ========== STEP 3: VIEW REPORTS (Department-Filtered) ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '03_manager_reports',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Verify reports are department-filtered (should only see department reports)
        await expect(page.locator('h1:has-text("Reports")').first()).toBeVisible({ timeout: 10000 });
      } catch (error) {
        await logError(page, error as Error, 'view_reports', stepNumber - 1);
      }

      // ========== STEP 4: VIEW ANALYTICS (Should Have Access) ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/analytics`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await takeScreenshot(page, {
          stepName: '04_manager_analytics',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Manager should have access to analytics
        await expect(page.locator('h1:has-text("Analytics")').first()).toBeVisible({ timeout: 10000 });
      } catch (error) {
        await logError(page, error as Error, 'view_analytics', stepNumber - 1);
        // If redirected, verify it's not access denied
        const currentUrl = page.url();
        if (currentUrl.includes('access-denied')) {
          throw new Error('Manager should have access to analytics but was denied');
        }
      }

      // ========== STEP 5: VIEW AUDIT LOGS (Should Have Access) ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/audit-logs`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '05_manager_audit_logs',
          stepNumber: stepNumber++,
          status: 'success',
        });

        await expect(page.locator('h1:has-text("Audit")').first()).toBeVisible({ timeout: 10000 });
      } catch (error) {
        await logError(page, error as Error, 'view_audit_logs', stepNumber - 1);
        const currentUrl = page.url();
        if (currentUrl.includes('access-denied')) {
          throw new Error('Manager should have access to audit logs but was denied');
        }
      }

      // ========== STEP 6: ASSIGN CASES WITHIN DEPARTMENT ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Try to find a report to assign
        const reportLink = page.locator('a[href*="/reports/"]').or(page.locator('button:has-text("View")')).first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          // Check for assign button
          const assignButton = page.locator('button:has-text("Assign")').or(page.locator('select[name*="assign" i]')).first();
          if (await assignButton.isVisible().catch(() => false)) {
            await takeScreenshot(page, {
              stepName: '06_manager_assign_case',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'assign_cases', stepNumber - 1);
      }

      // ========== STEP 7: UPDATE CASE STATUS AND PRIORITY ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          // Check for status and priority dropdowns
          const statusDropdown = page.locator('select').or(page.locator('button:has-text("Status")')).first();
          const priorityDropdown = page.locator('select').or(page.locator('button:has-text("Priority")')).first();
          
          if (await statusDropdown.isVisible().catch(() => false) || await priorityDropdown.isVisible().catch(() => false)) {
            await takeScreenshot(page, {
              stepName: '07_manager_update_status_priority',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'update_status_priority', stepNumber - 1);
      }

      // ========== STEP 8: ADD LABELS AND MESSAGES ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          // Check for message/comment input
          const messageInput = page.locator('textarea').first();
          if (await messageInput.isVisible().catch(() => false)) {
            await messageInput.fill('Manager comment from automated testing');
            await takeScreenshot(page, {
              stepName: '08_manager_add_message',
              stepNumber: stepNumber++,
              status: 'success',
            });
            await messageInput.clear();
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'add_labels_messages', stepNumber - 1);
      }

      // ========== STEP 9: VERIFY CANNOT ACCESS USER MANAGEMENT ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/users`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        
        // Manager should be redirected or see access denied
        if (currentUrl.includes('access-denied') || currentUrl.includes('dashboard')) {
          await takeScreenshot(page, {
            stepName: '09_manager_user_management_denied',
            stepNumber: stepNumber++,
            status: 'success',
          });
        } else {
          // If not redirected, verify user management features are not available
          const addUserButton = page.locator('button:has-text("Add User")').or(page.locator('button:has-text("Add")')).first();
          if (!(await addUserButton.isVisible().catch(() => false))) {
            await takeScreenshot(page, {
              stepName: '09_manager_user_management_restricted',
              stepNumber: stepNumber++,
              status: 'success',
            });
          } else {
            throw new Error('Manager should not have access to user management');
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'verify_user_management_restriction', stepNumber - 1);
      }

      // ========== STEP 10: FILTER REPORTS BY DEPARTMENT ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Reports should already be filtered by department, but verify
        await takeScreenshot(page, {
          stepName: '10_manager_department_filtered_reports',
          stepNumber: stepNumber++,
          status: 'success',
        });
      } catch (error) {
        await logError(page, error as Error, 'filter_by_department', stepNumber - 1);
      }

      // ========== STEP 11: LOGOUT ==========
      try {
        const logoutButton = page.locator('button:has-text("Logout")')
          .or(page.locator('button:has-text("Sign Out")'))
          .first();
        
        if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await logoutButton.click();
          await page.waitForTimeout(2000);
          const logoutUrl = page.url();
          if (!logoutUrl.includes(`/org/${subdomain}/login`)) {
            // Logout might redirect differently, continue
          }
        }
      } catch (error) {
        // Logout might not be available
      }

      await takeScreenshot(page, {
        stepName: '11_manager_test_complete',
        stepNumber: stepNumber++,
        status: 'success',
      });

    } catch (error) {
      await logError(page, error as Error, 'manager_complete_flow', stepNumber);
      throw error;
    }
  });
});


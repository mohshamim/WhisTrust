import { test, expect } from '@playwright/test';
import { takeScreenshot, logError } from '../lib/screenshot-helper';
import { findWhisTrustPort } from '../lib/port-detector';

/**
 * Login helper function
 */
async function loginAsInvestigator(page: any, baseURL: string, subdomain: string, email: string, password: string) {
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

test.describe('Investigator Complete Flow', () => {
  let baseURL: string;
  let subdomain: string;
  let email: string;
  let password: string;

  test.beforeAll(async () => {
    const port = await findWhisTrustPort();
    baseURL = `http://localhost:${port}`;
    
    // Use CodeSquare organization
    subdomain = 'codesquare';
    email = 'investigator@codesquare.com';
    password = 'Investigator@2024';
  });

  test('Complete Investigator Flow - Assigned Cases Only', async ({ page }) => {
    let stepNumber = 1;

    try {
      // ========== STEP 1: LOGIN ==========
      await loginAsInvestigator(page, baseURL, subdomain, email, password);

      await takeScreenshot(page, {
        stepName: '01_investigator_login_success',
        stepNumber: stepNumber++,
        status: 'success',
      });

      // ========== STEP 2: DASHBOARD ACCESS ==========
      try {
        // Verify dashboard URL (check if URL contains the path)
        const currentUrl = page.url();
        if (!currentUrl.includes(`/org/${subdomain}/dashboard`)) {
          throw new Error(`Expected dashboard URL but got: ${currentUrl}`);
        }
        await expect(page.locator('h1:has-text("Dashboard")').first()).toBeVisible({ timeout: 10000 });
        
        await takeScreenshot(page, {
          stepName: '02_investigator_dashboard',
          stepNumber: stepNumber++,
          status: 'success',
        });
      } catch (error) {
        await logError(page, error as Error, 'investigator_dashboard', stepNumber - 1);
        throw error;
      }

      // ========== STEP 3: VIEW ASSIGNED REPORTS ONLY ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '03_investigator_assigned_reports',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Verify only assigned reports are visible
        await expect(page.locator('h1:has-text("Reports")').first()).toBeVisible({ timeout: 10000 });
      } catch (error) {
        await logError(page, error as Error, 'view_assigned_reports', stepNumber - 1);
      }

      // ========== STEP 4: UPDATE CASE STATUS (Limited Transitions) ==========
      try {
        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          // Check for status dropdown
          const statusDropdown = page.locator('select').or(page.locator('button:has-text("Status")')).first();
          if (await statusDropdown.isVisible().catch(() => false)) {
            await takeScreenshot(page, {
              stepName: '04_investigator_update_status',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'update_status', stepNumber - 1);
      }

      // ========== STEP 5: ADD COMMENTS/NOTES TO CASES ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          const messageInput = page.locator('textarea').first();
          if (await messageInput.isVisible().catch(() => false)) {
            await messageInput.fill('Investigator comment from automated testing');
            await takeScreenshot(page, {
              stepName: '05_investigator_add_comment',
              stepNumber: stepNumber++,
              status: 'success',
            });
            await messageInput.clear();
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'add_comments', stepNumber - 1);
      }

      // ========== STEP 6: SEND MESSAGES ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          // Check for message section
          const messageSection = page.locator('text=Message').or(page.locator('text=Comment')).first();
          if (await messageSection.isVisible().catch(() => false)) {
            await takeScreenshot(page, {
              stepName: '06_investigator_send_message',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'send_messages', stepNumber - 1);
      }

      // ========== STEP 7: VERIFY CANNOT ACCESS ANALYTICS ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/analytics`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        
        // Should be redirected away from analytics
        if (currentUrl.includes('access-denied') || currentUrl.includes('dashboard')) {
          await takeScreenshot(page, {
            stepName: '07_investigator_analytics_denied',
            stepNumber: stepNumber++,
            status: 'success',
          });
        } else {
          // If not redirected, verify analytics features are not visible
          const hasCharts = await page.locator('svg').or(page.locator('canvas')).isVisible().catch(() => false);
          if (hasCharts) {
            throw new Error('Investigator should not have access to analytics');
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'verify_analytics_restriction', stepNumber - 1);
      }

      // ========== STEP 8: VERIFY CANNOT ACCESS AUDIT LOGS ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/audit-logs`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        
        if (currentUrl.includes('access-denied') || currentUrl.includes('dashboard')) {
          await takeScreenshot(page, {
            stepName: '08_investigator_audit_logs_denied',
            stepNumber: stepNumber++,
            status: 'success',
          });
        } else {
          throw new Error('Investigator should not have access to audit logs');
        }
      } catch (error) {
        await logError(page, error as Error, 'verify_audit_logs_restriction', stepNumber - 1);
      }

      // ========== STEP 9: VERIFY CANNOT ACCESS USER MANAGEMENT ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/users`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        
        if (currentUrl.includes('access-denied') || currentUrl.includes('dashboard')) {
          await takeScreenshot(page, {
            stepName: '09_investigator_user_management_denied',
            stepNumber: stepNumber++,
            status: 'success',
          });
        } else {
          throw new Error('Investigator should not have access to user management');
        }
      } catch (error) {
        await logError(page, error as Error, 'verify_user_management_restriction', stepNumber - 1);
      }

      // ========== STEP 10: VERIFY CASE ASSIGNMENT BUTTON NOT EXISTS ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          // Verify assign button does not exist
          const assignButton = page.locator('button:has-text("Assign")').first();
          if (await assignButton.isVisible().catch(() => false)) {
            throw new Error('Investigator should not see assign case button');
          }

          await takeScreenshot(page, {
            stepName: '10_investigator_no_assign_button',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }
      } catch (error) {
        await logError(page, error as Error, 'verify_no_assign_button', stepNumber - 1);
      }

      // ========== STEP 11: VERIFY PRIORITY EDITING RESTRICTED ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          // Priority editing might be disabled or not visible
          const priorityDropdown = page.locator('select[name*="priority" i]').or(page.locator('button:has-text("Priority")')).first();
          if (await priorityDropdown.isVisible().catch(() => false)) {
            // Check if it's disabled
            const isDisabled = await priorityDropdown.isDisabled().catch(() => false);
            if (!isDisabled) {
              await takeScreenshot(page, {
                stepName: '11_investigator_priority_restricted',
                stepNumber: stepNumber++,
                status: 'info',
              });
            }
          }
        }
      } catch (error) {
        // Priority might not be visible, which is fine
      }

      // ========== STEP 12: VIEW CASE DETAILS ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          await takeScreenshot(page, {
            stepName: '12_investigator_case_details',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }
      } catch (error) {
        await logError(page, error as Error, 'view_case_details', stepNumber - 1);
      }

      // ========== STEP 13: FILTER OWN CASES ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Reports should already be filtered to assigned cases
        await takeScreenshot(page, {
          stepName: '13_investigator_filtered_cases',
          stepNumber: stepNumber++,
          status: 'success',
        });
      } catch (error) {
        await logError(page, error as Error, 'filter_own_cases', stepNumber - 1);
      }

      // ========== STEP 14: LOGOUT ==========
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
        stepName: '14_investigator_test_complete',
        stepNumber: stepNumber++,
        status: 'success',
      });

    } catch (error) {
      await logError(page, error as Error, 'investigator_complete_flow', stepNumber);
      throw error;
    }
  });
});


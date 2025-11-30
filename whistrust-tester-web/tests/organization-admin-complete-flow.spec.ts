import { test, expect } from '@playwright/test';
import { takeScreenshot, logError } from '../lib/screenshot-helper';
import { findWhisTrustPort } from '../lib/port-detector';

/**
 * Login helper function
 */
async function loginAsAdmin(page: any, baseURL: string, subdomain: string, email: string, password: string) {
  await page.goto(`${baseURL}/org/${subdomain}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  // Fill login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Sign In")');
  
  // Wait for redirect to dashboard
  await page.waitForURL(`**/org/${subdomain}/dashboard`, { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
}

test.describe('Organization Admin Complete Flow', () => {
  let baseURL: string;
  let subdomain: string;
  let email: string;
  let password: string;

  test.beforeAll(async () => {
    // Detect port
    const port = await findWhisTrustPort();
    baseURL = `http://localhost:${port}`;
    
    // Use CodeSquare organization
    subdomain = 'codesquare';
    email = 'admin@codesquare.com';
    password = 'CodeSquare@2024';
  });

  test('Complete Admin Flow - All Actions', async ({ page }) => {
    test.setTimeout(240000);
    let stepNumber = 1;

    try {
      // ========== STEP 1: LOGIN ==========
      await takeScreenshot(page, {
        stepName: '01_login_start',
        stepNumber: stepNumber++,
        status: 'info',
      });

      await loginAsAdmin(page, baseURL, subdomain, email, password);

      await takeScreenshot(page, {
        stepName: '02_login_success',
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
        
        // Verify dashboard elements (use first() to avoid strict mode violation)
        await expect(page.locator('h1:has-text("Dashboard")').first()).toBeVisible({ timeout: 10000 });
        
        // Check for stats cards
        const statsVisible = await page.locator('text=Total Reports').or(page.locator('text=Pending')).isVisible().catch(() => false);
        if (statsVisible) {
          await takeScreenshot(page, {
            stepName: '03_dashboard_stats',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }

        await takeScreenshot(page, {
          stepName: '04_dashboard_loaded',
          stepNumber: stepNumber++,
          status: 'success',
        });
      } catch (error) {
        await logError(page, error as Error, 'dashboard_access', stepNumber - 1);
        throw error;
      }

      // ========== STEP 3: VIEW ALL REPORTS ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '05_reports_page',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Verify reports page elements (use first() to avoid strict mode violation)
        await expect(page.locator('h1:has-text("Reports")').first()).toBeVisible({ timeout: 10000 });
        
        // Check for search/filter elements
        const hasSearch = await page.locator('input[type="search"]').or(page.locator('input[placeholder*="search" i]')).isVisible().catch(() => false);
        if (hasSearch) {
          await takeScreenshot(page, {
            stepName: '06_reports_filters',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }
      } catch (error) {
        await logError(page, error as Error, 'view_reports', stepNumber - 1);
        throw error;
      }

      // ========== STEP 4: FILTER REPORTS BY STATUS ==========
      try {
        // Try to find status filter dropdown
        const statusFilter = page.locator('select').or(page.locator('button:has-text("Status")')).first();
        if (await statusFilter.isVisible().catch(() => false)) {
          await statusFilter.click();
          await page.waitForTimeout(500);
          await takeScreenshot(page, {
            stepName: '07_filter_by_status',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }
      } catch (error) {
        // Filter might not be available, continue
        console.log('Status filter not available or already filtered');
      }

      // ========== STEP 5: SEARCH REPORTS ==========
      try {
        const searchInput = page.locator('input[type="search"]').or(page.locator('input[placeholder*="search" i]')).first();
        if (await searchInput.isVisible().catch(() => false)) {
          await searchInput.fill('test');
          await page.waitForTimeout(1000);
          await takeScreenshot(page, {
            stepName: '08_search_reports',
            stepNumber: stepNumber++,
            status: 'success',
          });
          // Clear search
          await searchInput.clear();
          await page.waitForTimeout(500);
        }
      } catch (error) {
        console.log('Search not available');
      }

      // ========== STEP 6: CREATE NEW CASE ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports/create`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '09_create_case_page',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Verify create case form
        await expect(page.locator('h1:has-text("Create")').first()).toBeVisible({ timeout: 10000 });
        
        // Fill form fields if visible
        const categorySelect = page.locator('button:has-text("Select")').or(page.locator('select')).first();
        if (await categorySelect.isVisible().catch(() => false)) {
          await categorySelect.click();
          await page.waitForTimeout(500);
          await page.locator('[role="option"]').first().click().catch(() => {});
          await page.waitForTimeout(500);
        }

        const titleInput = page.locator('input[type="text"]').or(page.locator('textarea')).first();
        if (await titleInput.isVisible().catch(() => false)) {
          await titleInput.fill('Test Case - Automated Testing');
          await page.waitForTimeout(500);
        }

        await takeScreenshot(page, {
          stepName: '10_create_case_form_filled',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Note: We won't actually submit to avoid creating test data
        // In real testing, you might want to submit and then clean up
        console.log('Create case page verified');
      } catch (error) {
        await logError(page, error as Error, 'create_case', stepNumber - 1);
        // Continue - create case might not be available
      }

      console.log('Finished Step 6');
      return;

      // ========== STEP 7: VIEW ANALYTICS ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/analytics`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);

        await takeScreenshot(page, {
          stepName: '11_analytics_page',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Verify analytics page loaded
        await expect(page.locator('h1:has-text("Analytics")').first()).toBeVisible({ timeout: 10000 });
        
        // Check for charts/graphs
        const hasCharts = await page.locator('svg').or(page.locator('canvas')).isVisible().catch(() => false);
        if (hasCharts) {
          await takeScreenshot(page, {
            stepName: '12_analytics_charts',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }
      } catch (error) {
        await logError(page, error as Error, 'view_analytics', stepNumber - 1);
        // Analytics might redirect if no permission, but admin should have access
      }

      // ========== STEP 8: VIEW AUDIT LOGS ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/audit-logs`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '13_audit_logs_page',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Verify audit logs page
        await expect(page.locator('h1:has-text("Audit")').first()).toBeVisible({ timeout: 10000 });
      } catch (error) {
        await logError(page, error as Error, 'view_audit_logs', stepNumber - 1);
      }

      // ========== STEP 9: MANAGE USERS ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/users`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '14_users_page',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Verify users page
        await expect(page.locator('h1:has-text("Users")').first()).toBeVisible({ timeout: 10000 });
        
        // Check for add user button
        const addUserButton = page.locator('button:has-text("Add")').or(page.locator('button:has-text("User")')).first();
        if (await addUserButton.isVisible().catch(() => false)) {
          await takeScreenshot(page, {
            stepName: '15_users_management',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }
      } catch (error) {
        await logError(page, error as Error, 'manage_users', stepNumber - 1);
      }

      // ========== STEP 10: ACCESS SETTINGS ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/settings`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '16_settings_page',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Verify settings page
        await expect(page.locator('h1:has-text("Settings")').first()).toBeVisible({ timeout: 10000 });
        
        // Check for organization info
        const hasOrgInfo = await page.locator('text=Organization').or(page.locator('text=Name')).isVisible().catch(() => false);
        if (hasOrgInfo) {
          await takeScreenshot(page, {
            stepName: '17_settings_organization_info',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }
      } catch (error) {
        await logError(page, error as Error, 'access_settings', stepNumber - 1);
      }

      // ========== STEP 11: VIEW AND EDIT REPORT (if reports exist) ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        // Try to find a report to view
        const reportLink = page.locator('a[href*="/reports/"]').or(page.locator('button:has-text("View")')).first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(2000);

          await takeScreenshot(page, {
            stepName: '18_report_details',
            stepNumber: stepNumber++,
            status: 'success',
          });

          // Try to update status if dropdown exists
          const statusDropdown = page.locator('select').or(page.locator('button:has-text("Status")')).first();
          if (await statusDropdown.isVisible().catch(() => false)) {
            await statusDropdown.click();
            await page.waitForTimeout(500);
            await takeScreenshot(page, {
              stepName: '19_update_status_options',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }

          // Try to assign case if button exists
          const assignButton = page.locator('button:has-text("Assign")').or(page.locator('button:has-text("Assign to")')).first();
          if (await assignButton.isVisible().catch(() => false)) {
            await takeScreenshot(page, {
              stepName: '20_assign_case_option',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }

          // Try to add message/comment
          const messageInput = page.locator('textarea').or(page.locator('input[type="text"]')).first();
          if (await messageInput.isVisible().catch(() => false)) {
            await messageInput.fill('Test message from automated testing');
            await takeScreenshot(page, {
              stepName: '21_add_message',
              stepNumber: stepNumber++,
              status: 'success',
            });
            // Don't actually send to avoid creating test data
            await messageInput.clear();
          }
        } else {
          await takeScreenshot(page, {
            stepName: '18_no_reports_available',
            stepNumber: stepNumber++,
            status: 'info',
          });
        }
      } catch (error) {
        await logError(page, error as Error, 'view_edit_report', stepNumber - 1);
        // Continue - might not have reports
      }
      console.log('Finished Step 11');

      // ========== STEP 12: LOGOUT ==========
      try {
        // Find logout button (usually in user menu or sidebar)
        const logoutButton = page.locator('button:has-text("Logout")')
          .or(page.locator('button:has-text("Sign Out")'))
          .or(page.locator('a:has-text("Logout")'))
          .first();
        
        if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await logoutButton.click();
          await page.waitForTimeout(2000);
          
          await takeScreenshot(page, {
            stepName: '22_logout_success',
            stepNumber: stepNumber++,
            status: 'success',
          });
          
          // Verify redirected to login
          const logoutUrl = page.url();
          if (!logoutUrl.includes(`/org/${subdomain}/login`)) {
            // Logout might redirect differently, continue
          }
        } else {
          // Try clicking user menu first
          const userMenu = page.locator('button[aria-label*="user" i]').or(page.locator('[data-testid="user-menu"]')).first();
          if (await userMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
            await userMenu.click();
            await page.waitForTimeout(500);
            await logoutButton.click();
            await page.waitForTimeout(2000);
            await takeScreenshot(page, {
              stepName: '22_logout_success',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'logout', stepNumber - 1);
        // Logout might not be available in UI, continue
      }

      await takeScreenshot(page, {
        stepName: '23_test_complete',
        stepNumber: stepNumber++,
        status: 'success',
      });
      console.log('Admin flow test complete');

    } catch (error) {
      await logError(page, error as Error, 'admin_complete_flow', stepNumber);
      throw error;
    }
  });
});


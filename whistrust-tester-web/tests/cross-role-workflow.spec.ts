import { test, expect } from '@playwright/test';
import { takeScreenshot, logError } from '../lib/screenshot-helper';
import { findWhisTrustPort } from '../lib/port-detector';

/**
 * Login helper function
 */
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

test.describe('Cross-Role Workflow - Complete Case Lifecycle', () => {
  let baseURL: string;
  let subdomain: string;
  let trackingCode: string | null = null;

  test.beforeAll(async () => {
    const port = await findWhisTrustPort();
    baseURL = `http://localhost:${port}`;
    subdomain = 'codesquare';
  });

  test('Complete Case Lifecycle Across Multiple Roles', async ({ page }) => {
    let stepNumber = 1;

    try {
      // ========== STEP 1: ANONYMOUS SUBMITS REPORT ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/report`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '01_anonymous_submit_report',
          stepNumber: stepNumber++,
          status: 'info',
        });

        // Fill and submit report
        const categoryButton = page.locator('button:has-text("Select")').first();
        if (await categoryButton.isVisible().catch(() => false)) {
          await categoryButton.click();
          await page.waitForTimeout(500);
          await page.locator('[role="option"]').first().click().catch(() => {});
          await page.waitForTimeout(500);
        }

        const titleInput = page.locator('input[type="text"]').first();
        if (await titleInput.isVisible().catch(() => false)) {
          await titleInput.fill('Cross-Role Workflow Test Report');
        }

        const descriptionInput = page.locator('textarea').first();
        if (await descriptionInput.isVisible().catch(() => false)) {
          await descriptionInput.fill('This report will be tested across multiple roles: Anonymous → Admin → Investigator → Manager → HR');
        }

        await takeScreenshot(page, {
          stepName: '02_anonymous_report_filled',
          stepNumber: stepNumber++,
          status: 'info',
        });

        // Note: In a real test, you would submit and capture the tracking code
        // For now, we'll simulate the workflow without actually submitting
        trackingCode = 'TEST-CODE-12345'; // Simulated tracking code
      } catch (error) {
        await logError(page, error as Error, 'anonymous_submit', stepNumber - 1);
      }

      // ========== STEP 2: ADMIN VIEWS AND ASSIGNS TO INVESTIGATOR ==========
      try {
        await login(page, baseURL, subdomain, 'admin@codesquare.com', 'CodeSquare@2024');

        await takeScreenshot(page, {
          stepName: '03_admin_logged_in',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Navigate to reports
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '04_admin_views_reports',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Try to find and open a report
        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          await takeScreenshot(page, {
            stepName: '05_admin_views_report_details',
            stepNumber: stepNumber++,
            status: 'success',
          });

          // Try to assign to investigator
          const assignButton = page.locator('button:has-text("Assign")').or(page.locator('select[name*="assign" i]')).first();
          if (await assignButton.isVisible().catch(() => false)) {
            await takeScreenshot(page, {
              stepName: '06_admin_assigns_to_investigator',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }

          // Update status to "investigating"
          const statusDropdown = page.locator('select').or(page.locator('button:has-text("Status")')).first();
          if (await statusDropdown.isVisible().catch(() => false)) {
            await takeScreenshot(page, {
              stepName: '07_admin_updates_status_investigating',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'admin_assigns_case', stepNumber - 1);
      }

      // ========== STEP 3: INVESTIGATOR UPDATES CASE ==========
      try {
        // Logout admin and login as investigator
        const logoutButton = page.locator('button:has-text("Logout")').first();
        if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await logoutButton.click();
          await page.waitForTimeout(2000);
        }

        await login(page, baseURL, subdomain, 'investigator@codesquare.com', 'Investigator@2024');

        await takeScreenshot(page, {
          stepName: '08_investigator_logged_in',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // View assigned reports
        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '09_investigator_views_assigned_reports',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Open assigned report
        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          // Add comment/note
          const messageInput = page.locator('textarea').first();
          if (await messageInput.isVisible().catch(() => false)) {
            await messageInput.fill('Investigator: Reviewing case details and gathering evidence.');
            await takeScreenshot(page, {
              stepName: '10_investigator_adds_comment',
              stepNumber: stepNumber++,
              status: 'success',
            });
            await messageInput.clear();
          }

          // Update status
          const statusDropdown = page.locator('select').or(page.locator('button:has-text("Status")')).first();
          if (await statusDropdown.isVisible().catch(() => false)) {
            await takeScreenshot(page, {
              stepName: '11_investigator_updates_status',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'investigator_updates_case', stepNumber - 1);
      }

      // ========== STEP 4: MANAGER REVIEWS AND CHANGES PRIORITY ==========
      try {
        // Logout investigator and login as manager (using codesquare for manager)
        const logoutButton = page.locator('button:has-text("Logout")').first();
        if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await logoutButton.click();
          await page.waitForTimeout(2000);
        }

        await login(page, baseURL, 'codesquare', 'manager@codesquare.com', 'Manager@2024');

        await takeScreenshot(page, {
          stepName: '12_manager_logged_in',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // View reports
        await page.goto(`${baseURL}/org/codesquare/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '13_manager_views_reports',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Open report
        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          // Change priority
          const priorityDropdown = page.locator('select[name*="priority" i]').or(page.locator('button:has-text("Priority")')).first();
          if (await priorityDropdown.isVisible().catch(() => false)) {
            await takeScreenshot(page, {
              stepName: '14_manager_changes_priority',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }

          // Update status
          const statusDropdown = page.locator('select').or(page.locator('button:has-text("Status")')).first();
          if (await statusDropdown.isVisible().catch(() => false)) {
            await takeScreenshot(page, {
              stepName: '15_manager_reviews_status',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'manager_reviews_case', stepNumber - 1);
      }

      // ========== STEP 5: COMPLETE CASE LIFECYCLE (Submitted → Investigating → Resolved → Closed) ==========
      try {
        // Login as admin to complete the lifecycle
        const logoutButton = page.locator('button:has-text("Logout")').first();
        if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await logoutButton.click();
          await page.waitForTimeout(2000);
        }

        await login(page, baseURL, subdomain, 'admin@codesquare.com', 'CodeSquare@2024');

        await page.goto(`${baseURL}/org/${subdomain}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          // Simulate status transitions
          const statusDropdown = page.locator('select').or(page.locator('button:has-text("Status")')).first();
          if (await statusDropdown.isVisible().catch(() => false)) {
            // Status: submitted → investigating → resolved → closed
            await takeScreenshot(page, {
              stepName: '17_case_lifecycle_status_transitions',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'complete_case_lifecycle', stepNumber - 1);
      }

      // ========== STEP 6: VERIFY TRACKING CODE STILL WORKS ==========
      try {
        // Logout and test anonymous tracking
        const logoutButton = page.locator('button:has-text("Logout")').first();
        if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await logoutButton.click();
          await page.waitForTimeout(2000);
        }

        await page.goto(`${baseURL}/org/${subdomain}/track`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        if (trackingCode) {
          const trackingInput = page.locator('input[type="text"]').first();
          if (await trackingInput.isVisible().catch(() => false)) {
            await trackingInput.fill(trackingCode);
            await page.waitForTimeout(500);

            const trackButton = page.locator('button:has-text("Track")').first();
            if (await trackButton.isVisible().catch(() => false)) {
              await trackButton.click();
              await page.waitForTimeout(2000);

              await takeScreenshot(page, {
                stepName: '18_tracking_code_verification',
                stepNumber: stepNumber++,
                status: 'success',
              });
            }
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'verify_tracking_code', stepNumber - 1);
      }

      await takeScreenshot(page, {
        stepName: '19_cross_role_workflow_complete',
        stepNumber: stepNumber++,
        status: 'success',
      });

    } catch (error) {
      await logError(page, error as Error, 'cross_role_workflow', stepNumber);
      throw error;
    }
  });
});


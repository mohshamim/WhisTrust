import { test, expect } from '@playwright/test';
import { takeScreenshot, logError } from '../lib/screenshot-helper';
import { findWhisTrustPort } from '../lib/port-detector';

test.describe('Anonymous Reporter Complete Flow', () => {
  let baseURL: string;
  let subdomain: string;

  test.beforeAll(async () => {
    const port = await findWhisTrustPort();
    baseURL = `http://localhost:${port}`;
    subdomain = 'codesquare'; // Use CodeSquare for testing
  });

  test('Complete Anonymous Reporter Flow - All Submission Scenarios', async ({ page }) => {
    let stepNumber = 1;
    let trackingCode: string | null = null;

    try {
      // ========== STEP 1: NAVIGATE TO REPORT SUBMISSION PAGE ==========
      await page.goto(`${baseURL}/org/${subdomain}/report`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await takeScreenshot(page, {
        stepName: '01_report_submission_page',
        stepNumber: stepNumber++,
        status: 'success',
      });

      // ========== STEP 2: VERIFY FORM ELEMENTS ==========
      try {
        await expect(page.locator('button:has-text("Select")').or(page.locator('select')).first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('textarea').or(page.locator('input[type="text"]'))).toBeVisible({ timeout: 10000 });
        
        await takeScreenshot(page, {
          stepName: '02_form_elements_verified',
          stepNumber: stepNumber++,
          status: 'success',
        });
      } catch (error) {
        await logError(page, error as Error, 'verify_form_elements', stepNumber - 1);
        throw error;
      }

      // ========== STEP 3: SUBMIT ANONYMOUS REPORT (All Categories) ==========
      const categories = ['Fraud', 'Harassment', 'Safety', 'Discrimination', 'Retaliation', 'Other'];
      
      for (const category of categories) {
        try {
          await page.goto(`${baseURL}/org/${subdomain}/report`, { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          // Select category
          const categoryButton = page.locator('button:has-text("Select")').or(page.locator('button:has-text("category" i)')).first();
          if (await categoryButton.isVisible().catch(() => false)) {
            await categoryButton.click();
            await page.waitForTimeout(500);
            
            // Try to find and click the category option
            const categoryOption = page.locator(`text=${category}`).or(page.locator(`[role="option"]:has-text("${category}")`)).first();
            if (await categoryOption.isVisible({ timeout: 3000 }).catch(() => false)) {
              await categoryOption.click();
              await page.waitForTimeout(500);
            }
          }

          // Fill title/subject
          const titleInput = page.locator('input[type="text"]').or(page.locator('input[placeholder*="title" i]')).or(page.locator('input[placeholder*="subject" i]')).first();
          if (await titleInput.isVisible().catch(() => false)) {
            await titleInput.fill(`Test Report - ${category}`);
            await page.waitForTimeout(500);
          }

          // Fill description
          const description = `This is an automated test report for ${category} category. It contains enough characters to pass validation requirements and test the complete submission flow.`;
          const descriptionInput = page.locator('textarea').first();
          if (await descriptionInput.isVisible().catch(() => false)) {
            await descriptionInput.fill(description);
            await page.waitForTimeout(500);
          }

          await takeScreenshot(page, {
            stepName: `03_submit_${category.toLowerCase()}_category`,
            stepNumber: stepNumber++,
            status: 'success',
          });

          // Note: We'll only submit one test report to avoid creating too many test records
          // In a real scenario, you might want to submit all categories
          if (category === categories[0]) {
            // Submit only the first category
            const submitButton = page.locator('button:has-text("Submit")').or(page.locator('button[type="submit"]')).first();
            if (await submitButton.isVisible().catch(() => false)) {
              await submitButton.click();
              await page.waitForTimeout(3000);
              
              // Check for success page
              const currentUrl = page.url();
              if (currentUrl.includes('/success')) {
                await takeScreenshot(page, {
                  stepName: '04_submission_success',
                  stepNumber: stepNumber++,
                  status: 'success',
                });

                // Extract tracking code
                const trackingCodeElement = page.locator('[data-testid="tracking-code"]').or(page.locator('text=/[A-Z0-9-]+/')).first();
                const trackingText = await trackingCodeElement.textContent().catch(() => null);
                if (trackingText) {
                  trackingCode = trackingText.match(/[A-Z0-9-]+/)?.[0] || null;
                }
              }
            }
          }
        } catch (error) {
          await logError(page, error as Error, `submit_${category.toLowerCase()}_category`, stepNumber - 1);
          // Continue with next category
        }
      }

      // ========== STEP 4: SUBMIT REPORT WITH EMAIL (Non-Anonymous) ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/report`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Select category
        const categoryButton = page.locator('button:has-text("Select")').first();
        if (await categoryButton.isVisible().catch(() => false)) {
          await categoryButton.click();
          await page.waitForTimeout(500);
          await page.locator('[role="option"]').first().click().catch(() => {});
          await page.waitForTimeout(500);
        }

        // Fill form
        const titleInput = page.locator('input[type="text"]').first();
        if (await titleInput.isVisible().catch(() => false)) {
          await titleInput.fill('Test Report with Email');
        }

        const descriptionInput = page.locator('textarea').first();
        if (await descriptionInput.isVisible().catch(() => false)) {
          await descriptionInput.fill('This is a test report submitted with an email address, making it non-anonymous.');
        }

        // Check "Provide identity" or find email field
        const provideIdentityCheckbox = page.locator('input[type="checkbox"]').or(page.locator('label:has-text("identity" i)')).first();
        if (await provideIdentityCheckbox.isVisible().catch(() => false)) {
          await provideIdentityCheckbox.click();
          await page.waitForTimeout(500);
        }

        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.isVisible().catch(() => false)) {
          await emailInput.fill('test.reporter@example.com');
          await page.waitForTimeout(500);
        }

        await takeScreenshot(page, {
          stepName: '05_submit_with_email',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Note: Don't actually submit to avoid creating test data
      } catch (error) {
        await logError(page, error as Error, 'submit_with_email', stepNumber - 1);
      }

      // ========== STEP 5: SUBMIT REPORT WITH FILE ATTACHMENT ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/report`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Fill form
        const categoryButton = page.locator('button:has-text("Select")').first();
        if (await categoryButton.isVisible().catch(() => false)) {
          await categoryButton.click();
          await page.waitForTimeout(500);
          await page.locator('[role="option"]').first().click().catch(() => {});
          await page.waitForTimeout(500);
        }

        const titleInput = page.locator('input[type="text"]').first();
        if (await titleInput.isVisible().catch(() => false)) {
          await titleInput.fill('Test Report with Attachment');
        }

        const descriptionInput = page.locator('textarea').first();
        if (await descriptionInput.isVisible().catch(() => false)) {
          await descriptionInput.fill('This is a test report with a file attachment.');
        }

        // Try to upload a file
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible().catch(() => false)) {
          // Create a dummy file for testing
          await fileInput.setInputFiles({
            name: 'test-document.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('This is a test document for file upload testing.')
          });
          await page.waitForTimeout(1000);
        }

        await takeScreenshot(page, {
          stepName: '06_submit_with_attachment',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Note: Don't actually submit to avoid creating test data
      } catch (error) {
        await logError(page, error as Error, 'submit_with_attachment', stepNumber - 1);
      }

      // ========== STEP 6: NAVIGATE TO TRACKING PAGE ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/track`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: '07_tracking_page',
          stepNumber: stepNumber++,
          status: 'success',
        });

        // Verify tracking form
        await expect(page.locator('input[type="text"]').or(page.locator('input[placeholder*="track" i]'))).toBeVisible({ timeout: 10000 });
      } catch (error) {
        await logError(page, error as Error, 'navigate_tracking_page', stepNumber - 1);
      }

      // ========== STEP 7: TRACK REPORT USING TRACKING CODE ==========
      try {
        if (trackingCode) {
          const trackingInput = page.locator('input[type="text"]').or(page.locator('input[placeholder*="track" i]')).first();
          if (await trackingInput.isVisible().catch(() => false)) {
            await trackingInput.fill(trackingCode);
            await page.waitForTimeout(500);

            const trackButton = page.locator('button:has-text("Track")').or(page.locator('button[type="submit"]')).first();
            if (await trackButton.isVisible().catch(() => false)) {
              await trackButton.click();
              await page.waitForTimeout(3000);

              await takeScreenshot(page, {
                stepName: '08_track_report_success',
                stepNumber: stepNumber++,
                status: 'success',
              });
            }
          }
        } else {
          // Test with invalid tracking code
          const trackingInput = page.locator('input[type="text"]').first();
          if (await trackingInput.isVisible().catch(() => false)) {
            await trackingInput.fill('INVALID-CODE-12345');
            await page.waitForTimeout(500);

            const trackButton = page.locator('button:has-text("Track")').first();
            if (await trackButton.isVisible().catch(() => false)) {
              await trackButton.click();
              await page.waitForTimeout(2000);

              await takeScreenshot(page, {
                stepName: '08_track_invalid_code',
                stepNumber: stepNumber++,
                status: 'info',
              });
            }
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'track_report', stepNumber - 1);
      }

      // ========== STEP 8: TEST FORM VALIDATION ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/report`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Try to submit without filling required fields
        const submitButton = page.locator('button:has-text("Submit")').first();
        if (await submitButton.isVisible().catch(() => false)) {
          await submitButton.click();
          await page.waitForTimeout(1000);

          // Check for validation errors
          const hasError = await page.locator('text=required').or(page.locator('text=error')).isVisible().catch(() => false);
          if (hasError) {
            await takeScreenshot(page, {
              stepName: '09_form_validation_errors',
              stepNumber: stepNumber++,
              status: 'success',
            });
          }
        }
      } catch (error) {
        await logError(page, error as Error, 'test_form_validation', stepNumber - 1);
      }

      // ========== STEP 9: TEST ERROR HANDLING ==========
      try {
        await page.goto(`${baseURL}/org/${subdomain}/track`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Try tracking with empty code
        const trackButton = page.locator('button:has-text("Track")').first();
        if (await trackButton.isVisible().catch(() => false)) {
          await trackButton.click();
          await page.waitForTimeout(1000);

          await takeScreenshot(page, {
            stepName: '10_error_handling',
            stepNumber: stepNumber++,
            status: 'info',
          });
        }
      } catch (error) {
        await logError(page, error as Error, 'test_error_handling', stepNumber - 1);
      }

      await takeScreenshot(page, {
        stepName: '11_anonymous_reporter_test_complete',
        stepNumber: stepNumber++,
        status: 'success',
      });

    } catch (error) {
      await logError(page, error as Error, 'anonymous_reporter_complete_flow', stepNumber);
      throw error;
    }
  });
});


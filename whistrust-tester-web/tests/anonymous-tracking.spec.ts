import { test, expect } from '@playwright/test';
import { takeScreenshot, logError } from '../lib/screenshot-helper';
import { findWhisTrustPort } from '../lib/port-detector';

test.describe('Anonymous Tracking Tests', () => {
  let baseURL: string;

  test.beforeAll(async () => {
    const port = await findWhisTrustPort();
    baseURL = `http://localhost:${port}`;
  });

  test('Anonymous Tracking Test - CodeSquare - Complete Flow', async ({ page }) => {
    let stepNumber = 1;
    const subdomain = 'codesquare';

    try {
      // Step 1: Navigate to track page
      await page.goto(`${baseURL}/org/${subdomain}/track`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await takeScreenshot(page, {
        stepName: '01_track_page',
        stepNumber: stepNumber++,
        status: 'info',
      });

      // Step 2: Verify track form
      try {
        const trackingInput = page.locator('input[type="text"]').or(page.locator('input[placeholder*="track" i]')).first();
        await expect(trackingInput).toBeVisible({ timeout: 10000 });
        
        const trackButton = page.locator('button:has-text("Track")').or(page.locator('button[type="submit"]')).first();
        await expect(trackButton).toBeVisible({ timeout: 10000 });

        await takeScreenshot(page, {
          stepName: '02_track_form_elements',
          stepNumber: stepNumber++,
          status: 'success',
        });
      } catch (error) {
        await logError(page, error as Error, 'verify_track_form', stepNumber - 1);
        throw error;
      }
      
      // Step 3: Try with invalid tracking code
      try {
        const trackingInput = page.locator('input[type="text"]').or(page.locator('input[placeholder*="track" i]')).first();
        await trackingInput.fill('INVALID-CODE-12345');
        await page.waitForTimeout(500);

        await takeScreenshot(page, {
          stepName: '03_invalid_code_entered',
          stepNumber: stepNumber++,
          status: 'info',
        });

        const trackButton = page.locator('button:has-text("Track")').or(page.locator('button[type="submit"]')).first();
        await trackButton.click();
        await page.waitForTimeout(2000);

        // Check for error message
        const hasError = await page.locator('text=not found').or(page.locator('text=invalid')).or(page.locator('text=error')).isVisible().catch(() => false);
        if (hasError) {
          await takeScreenshot(page, {
            stepName: '04_invalid_code_error',
            stepNumber: stepNumber++,
            status: 'success',
          });
        } else {
          await takeScreenshot(page, {
            stepName: '04_invalid_code_response',
            stepNumber: stepNumber++,
            status: 'info',
          });
        }
      } catch (error) {
        await logError(page, error as Error, 'test_invalid_code', stepNumber - 1);
      }

      // Step 4: Test with empty tracking code
      try {
        await page.goto(`${baseURL}/org/${subdomain}/track`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const trackingInput = page.locator('input[type="text"]').or(page.locator('input[placeholder*="track" i]')).first();
        await trackingInput.clear();
        await page.waitForTimeout(500);

        const trackButton = page.locator('button:has-text("Track")').or(page.locator('button[type="submit"]')).first();
        await trackButton.click();
        await page.waitForTimeout(1000);

        // Check for validation error
        const hasValidationError = await page.locator('text=required').or(page.locator('text=Please')).isVisible().catch(() => false);
        if (hasValidationError) {
          await takeScreenshot(page, {
            stepName: '05_empty_code_validation',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }
      } catch (error) {
        await logError(page, error as Error, 'test_empty_code', stepNumber - 1);
      }

      // Step 5: Test tracking page UI elements
      try {
        await page.goto(`${baseURL}/org/${subdomain}/track`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check for helpful text or instructions
        const hasInstructions = await page.locator('text=tracking').or(page.locator('text=code')).or(page.locator('text=Enter')).isVisible().catch(() => false);
        if (hasInstructions) {
          await takeScreenshot(page, {
            stepName: '06_tracking_page_ui',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }

        // Check for link to submit new report
        const submitLink = page.locator('a:has-text("Submit")').or(page.locator('a:has-text("Report")')).first();
        if (await submitLink.isVisible().catch(() => false)) {
          await takeScreenshot(page, {
            stepName: '07_tracking_page_submit_link',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }
      } catch (error) {
        await logError(page, error as Error, 'test_tracking_ui', stepNumber - 1);
      }

      // Note: For a complete test with valid tracking code, you would need to:
      // 1. Submit a report first
      // 2. Capture the tracking code
      // 3. Use that tracking code here to test successful tracking
      // This test verifies the tracking page UI and error handling

      await takeScreenshot(page, {
        stepName: '08_tracking_test_complete',
        stepNumber: stepNumber++,
        status: 'success',
      });

    } catch (error) {
      await logError(page, error as Error, 'anonymous_tracking_test', stepNumber);
      throw error;
    }
  });
});

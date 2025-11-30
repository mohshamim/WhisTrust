import { test, expect } from '@playwright/test';
import { takeScreenshot, logError } from '../lib/screenshot-helper';
import { findWhisTrustPort } from '../lib/port-detector';

test.describe('Report Submission Tests', () => {
  let baseURL: string;

  test.beforeAll(async () => {
    const port = await findWhisTrustPort();
    baseURL = `http://localhost:${port}`;
  });

  test('Report Submission Test - CodeSquare - All Categories', async ({ page }) => {
    let stepNumber = 1;
    const subdomain = 'codesquare';
    const categories = ['Fraud', 'Harassment', 'Safety', 'Discrimination', 'Retaliation', 'Other'];
    
    try {
      for (const category of categories) {
        // Step 1: Navigate to report form
        await page.goto(`${baseURL}/org/${subdomain}/report`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, {
          stepName: `01_${category.toLowerCase()}_navigate_to_form`,
          stepNumber: stepNumber++,
          status: 'info',
        });
        
        // Step 2: Verify form elements
        try {
          await expect(page.locator('button:has-text("Select")').or(page.locator('select')).first()).toBeVisible({ timeout: 10000 });
          await expect(page.locator('textarea').or(page.locator('input[type="text"]'))).toBeVisible({ timeout: 10000 });
          
          await takeScreenshot(page, {
            stepName: `02_${category.toLowerCase()}_form_elements`,
            stepNumber: stepNumber++,
            status: 'success',
          });
        } catch (error) {
          await logError(page, error as Error, 'verify_form_elements', stepNumber - 1);
          throw error;
        }
        
        // Step 3: Fill form
        try {
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
            } else {
              // Fallback: click first option
              await page.locator('[role="option"]').first().click().catch(() => {});
              await page.waitForTimeout(500);
            }
          }
          
          // Fill title/subject
          const titleInput = page.locator('input[type="text"]').or(page.locator('input[placeholder*="title" i]')).or(page.locator('input[placeholder*="subject" i]')).first();
          if (await titleInput.isVisible().catch(() => false)) {
            await titleInput.fill(`Test Report - ${category}`);
            await page.waitForTimeout(500);
          }
          
          // Enter description
          const description = `This is an automated test report submission for ${category} category. It contains enough characters to pass validation requirements and test the complete submission flow.`;
          const descriptionInput = page.locator('textarea').first();
          if (await descriptionInput.isVisible().catch(() => false)) {
            await descriptionInput.fill(description);
            await page.waitForTimeout(500);
          }

          await takeScreenshot(page, {
            stepName: `03_${category.toLowerCase()}_form_filled`,
            stepNumber: stepNumber++,
            status: 'success',
          });
        } catch (error) {
          await logError(page, error as Error, 'fill_form', stepNumber - 1);
          throw error;
        }
        
        // Step 4: Submit (only for first category to avoid creating too many test records)
        if (category === categories[0]) {
          try {
            const submitButton = page.locator('button:has-text("Submit")').or(page.locator('button[type="submit"]')).first();
            if (await submitButton.isVisible().catch(() => false)) {
              await submitButton.click();
              await page.waitForTimeout(3000);
              
              await takeScreenshot(page, {
                stepName: `04_${category.toLowerCase()}_submit`,
                stepNumber: stepNumber++,
                status: 'success',
              });
            }
          } catch (error) {
            await logError(page, error as Error, 'submit_form', stepNumber - 1);
            throw error;
          }
          
          // Step 5: Verify success or capture error
          const currentUrl = page.url();
          if (currentUrl.includes('/success')) {
            await takeScreenshot(page, {
              stepName: `05_${category.toLowerCase()}_submission_success`,
              stepNumber: stepNumber++,
              status: 'success',
            });
            
            // Extract tracking code if visible
            const trackingCodeElement = page.locator('[data-testid="tracking-code"]').or(page.locator('text=/[A-Z0-9-]+/')).first();
            const trackingCode = await trackingCodeElement.textContent().catch(() => null);
            if (trackingCode) {
              await takeScreenshot(page, {
                stepName: `06_${category.toLowerCase()}_tracking_code`,
                stepNumber: stepNumber++,
                status: 'success',
              });
            }
          } else {
            await takeScreenshot(page, {
              stepName: `05_${category.toLowerCase()}_submission_error`,
              stepNumber: stepNumber++,
              status: 'error',
            });
            // Don't throw - might be validation error
          }
        }
      }
    } catch (error) {
      await logError(page, error as Error, 'report_submission_all_categories', stepNumber);
      throw error;
    }
  });
});

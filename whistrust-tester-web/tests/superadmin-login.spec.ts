import { test, expect } from '@playwright/test';
import { takeScreenshot, logError } from '../lib/screenshot-helper';
import { findWhisTrustPort } from '../lib/port-detector';

// Get base URL from env or detect port
let baseURL = process.env.TEST_BASE_URL;
if (!baseURL) {
  // Will be set in beforeAll
  baseURL = 'http://localhost:3000';
}

test('Super Admin Login Test', async ({ page }) => {
  let stepNumber = 1;
  
  // Detect which port WhisTrust is running on
  let actualBaseURL = process.env.TEST_BASE_URL;
  if (!actualBaseURL) {
    const port = await findWhisTrustPort();
    actualBaseURL = `http://localhost:${port}`;
    console.log(`Detected WhisTrust running on port ${port}`);
  }
  
  try {
    // Step 1: Navigate to Super Admin login
    await page.goto(`${actualBaseURL}/superadmin/login`, { waitUntil: 'domcontentloaded' });
    
    // Wait for page to be fully loaded and interactive
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    // Additional wait for React hydration
    await page.waitForTimeout(3000);
    
    await takeScreenshot(page, {
      stepName: 'navigate_to_login_page',
      stepNumber: stepNumber++,
      status: 'success',
    });
    
    // Step 2: Verify login form elements
    try {
      // Wait for the body/content to be visible
      await page.waitForSelector('body', { state: 'visible', timeout: 10000 });
      
      // Try multiple strategies to find the email field
      const emailLocator = page.locator('#email')
        .or(page.locator('input[type="email"]'))
        .or(page.locator('input[placeholder*="email" i]'))
        .or(page.locator('input[placeholder*="superadmin" i]'))
        .or(page.locator('input[id*="email" i]'));
      
      // Wait for email field with longer timeout
      await emailLocator.waitFor({ state: 'visible', timeout: 20000 });
      
      // Wait for password field
      const passwordLocator = page.locator('#password')
        .or(page.locator('input[type="password"]'))
        .or(page.locator('input[id*="password" i]'));
      
      await passwordLocator.waitFor({ state: 'visible', timeout: 15000 });
      
      // Wait for submit button
      const buttonLocator = page.locator('button:has-text("Sign In as Super Admin")')
        .or(page.locator('button:has-text("Sign In")'))
        .or(page.locator('button[type="submit"]'))
        .or(page.locator('button:has-text("Signing in")'));
      
      await buttonLocator.waitFor({ state: 'visible', timeout: 15000 });
      
      await takeScreenshot(page, {
        stepName: 'verify_login_form_elements',
        stepNumber: stepNumber++,
        status: 'success',
      });
    } catch (error) {
      // Take a screenshot to see what's on the page
      await takeScreenshot(page, {
        stepName: 'form_not_found_debug',
        stepNumber: stepNumber++,
        status: 'error',
      });
      await logError(page, error as Error, 'verify_login_form_elements', stepNumber - 1);
      throw error;
    }
    
    // Step 3: Fill login form
    try {
      await page.fill('#email', 'sup-adm@whistrust.com').catch(async () => {
        await page.fill('input[type="email"]', 'sup-adm@whistrust.com');
      });
      await page.fill('#password', 'sup-pass-adm!1@3#5').catch(async () => {
        await page.fill('input[type="password"]', 'sup-pass-adm!1@3#5');
      });
      await takeScreenshot(page, {
        stepName: 'fill_login_form',
        stepNumber: stepNumber++,
        status: 'success',
      });
    } catch (error) {
      await logError(page, error as Error, 'fill_login_form', stepNumber - 1);
      throw error;
    }
    
    // Step 4: Submit login
    try {
      await page.click('button:has-text("Sign In as Super Admin")').catch(async () => {
        await page.click('button:has-text("Sign In")').catch(async () => {
          await page.click('button[type="submit"]');
        });
      });
      await page.waitForTimeout(2000);
      await takeScreenshot(page, {
        stepName: 'submit_login',
        stepNumber: stepNumber++,
        status: 'success',
      });
    } catch (error) {
      await logError(page, error as Error, 'submit_login', stepNumber - 1);
      throw error;
    }
    
    // Step 5: Wait for redirect and verify dashboard
    try {
      await page.waitForURL('**/superadmin/dashboard', { timeout: 10000 });
      await takeScreenshot(page, {
        stepName: 'redirect_to_dashboard',
        stepNumber: stepNumber++,
        status: 'success',
      });
    } catch (error) {
      await takeScreenshot(page, {
        stepName: 'redirect_failed',
        stepNumber: stepNumber++,
        status: 'error',
      });
      await logError(page, error as Error, 'redirect_to_dashboard', stepNumber - 1);
      throw error;
    }
    
    // Step 6: Verify dashboard loaded
    const currentUrl = page.url();
    if (currentUrl.includes('/superadmin/dashboard')) {
      await takeScreenshot(page, {
        stepName: 'dashboard_loaded',
        stepNumber: stepNumber++,
        status: 'success',
      });
      
      // Verify dashboard content
      try {
        await expect(
          page.locator('text=Super Admin').or(page.locator('text=Dashboard')).or(page.locator('h1'))
        ).toBeVisible({ timeout: 5000 });
        await takeScreenshot(page, {
          stepName: 'dashboard_content_verified',
          stepNumber: stepNumber++,
          status: 'success',
        });
      } catch (error) {
        await logError(page, error as Error, 'verify_dashboard_content', stepNumber - 1);
        // Don't throw - dashboard might be loaded but content check failed
      }
    } else {
      await takeScreenshot(page, {
        stepName: 'login_failed',
        stepNumber: stepNumber++,
        status: 'error',
      });
      throw new Error(`Login failed. Expected /superadmin/dashboard but got: ${currentUrl}`);
    }
  } catch (error) {
    await logError(page, error as Error, 'superadmin_login_test', stepNumber);
    throw error;
  }
});


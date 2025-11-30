import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const resultsDir = process.env.TEST_RESULTS_DIR || './results';
const screenshotsDir = path.join(resultsDir, 'screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

test('Sample Test - Homepage Loads', async ({ page }) => {
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';
  
  // Step 1: Navigate to homepage
  await page.goto(baseURL);
  await page.screenshot({ 
    path: path.join(screenshotsDir, 'step-01_homepage_load.png'),
    fullPage: true 
  });
  
  // Step 2: Verify page loaded
  await expect(page).toHaveTitle(/WhisTrust|whistle/i);
  await page.screenshot({ 
    path: path.join(screenshotsDir, 'step-02_homepage_verified.png')
  });
  
  // Step 3: Check for key elements
  const hasContent = await page.locator('body').count() > 0;
  expect(hasContent).toBe(true);
  
  await page.screenshot({ 
    path: path.join(screenshotsDir, 'step-03_test_complete.png'),
    fullPage: true 
  });
});


import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const resultsDir = process.env.TEST_RESULTS_DIR || './results';
const screenshotsDir = path.join(resultsDir, 'screenshots', 'visual-regression');

test.beforeAll(() => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

test('Visual Regression - Homepage', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ 
    path: path.join(screenshotsDir, 'homepage.png'), 
    fullPage: true 
  });
});

test('Visual Regression - Report Form', async ({ page }) => {
  await page.goto('/org/aisar/report');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ 
    path: path.join(screenshotsDir, 'report-form.png'), 
    fullPage: true 
  });
});

test('Visual Regression - Login Page', async ({ page }) => {
  await page.goto('/org/aisar/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ 
    path: path.join(screenshotsDir, 'login-page.png'), 
    fullPage: true 
  });
});


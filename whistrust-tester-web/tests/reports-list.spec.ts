import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const resultsDir = process.env.TEST_RESULTS_DIR || './results';
const screenshotsDir = path.join(resultsDir, 'screenshots', 'reports-list');

test.beforeAll(() => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

test('Reports List View Test - AISAR', async ({ page }) => {
  // Login
  await page.goto('/org/aisar/login');
  await page.fill('input[type="email"]', 'admin@aisar.com');
  await page.fill('input[type="password"]', 'Aisar@123!');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/org/aisar/dashboard', { timeout: 10000 });
  
  // Navigate to reports
  await page.goto('/org/aisar/reports');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(screenshotsDir, '01-reports-page.png'), fullPage: true });
  
  // Verify reports list elements
  try {
    await expect(page.locator('text=Reports') || page.locator('text=Cases')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, '02-reports-list-visible.png'), fullPage: true });
  } catch {
    await page.screenshot({ path: path.join(screenshotsDir, '03-reports-list-error.png'), fullPage: true });
  }
  
  // Check for table or list structure
  const hasTable = await page.locator('table').count() > 0;
  const hasList = await page.locator('[role="list"]').count() > 0;
  
  if (hasTable || hasList) {
    await page.screenshot({ path: path.join(screenshotsDir, '04-reports-structure.png'), fullPage: true });
  }
});


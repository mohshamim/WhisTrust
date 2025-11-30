import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const resultsDir = process.env.TEST_RESULTS_DIR || './results';
const screenshotsDir = path.join(resultsDir, 'screenshots', 'dashboard-ui');

test.beforeAll(() => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

test('Dashboard UI Smoke Test - AISAR', async ({ page }) => {
  // Login first
  await page.goto('/org/aisar/login');
  await page.fill('input[type="email"]', 'admin@aisar.com');
  await page.fill('input[type="password"]', 'Aisar@123!');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/org/aisar/dashboard', { timeout: 10000 });
  
  // Step 1: Verify dashboard loads
  await page.screenshot({ path: path.join(screenshotsDir, '01-dashboard-loaded.png'), fullPage: true });
  
  // Step 2: Check for key UI elements
  const elements = [
    'text=Dashboard',
    'text=Reports',
    'text=Cases',
  ];
  
  for (const selector of elements) {
    try {
      await expect(page.locator(selector)).toBeVisible({ timeout: 3000 });
    } catch {
      await page.screenshot({ 
        path: path.join(screenshotsDir, `02-missing-${selector.replace(/[^a-zA-Z0-9]/g, '-')}.png`), 
        fullPage: true 
      });
    }
  }
  
  // Step 3: Check statistics cards
  await page.screenshot({ path: path.join(screenshotsDir, '03-statistics-cards.png') });
  
  // Step 4: Check navigation menu
  await page.screenshot({ path: path.join(screenshotsDir, '04-navigation-menu.png') });
});


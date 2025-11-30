import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';

const resultsDir = process.env.TEST_RESULTS_DIR || './results';

export interface ScreenshotOptions {
  stepName: string;
  stepNumber?: number;
  status?: 'success' | 'failure' | 'error' | 'info';
  fullPage?: boolean;
}

/**
 * Take a screenshot with proper naming and organization
 */
export async function takeScreenshot(
  page: Page,
  options: ScreenshotOptions
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const stepNum = options.stepNumber ? String(options.stepNumber).padStart(2, '0') : '';
  const status = options.status || 'info';
  
  // Create filename: step-01_login_success_2024-12-15_14-30-45.png
  const filename = [
    stepNum ? `step-${stepNum}` : 'step',
    options.stepName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    status,
    timestamp
  ].filter(Boolean).join('_') + '.png';
  
  // Determine directory based on status
  let screenshotDir: string;
  if (status === 'failure' || status === 'error') {
    screenshotDir = path.join(resultsDir, 'screenshots', 'failures');
  } else {
    screenshotDir = path.join(resultsDir, 'screenshots');
  }
  
  // Ensure directory exists
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  const filePath = path.join(screenshotDir, filename);

  if (page.isClosed()) {
    console.warn(`[screenshot-helper] Page already closed, skipping screenshot for ${options.stepName}`);
    return '';
  }
  
  try {
    await page.screenshot({
      path: filePath,
      fullPage: options.fullPage ?? true,
    });
    return filePath;
  } catch (screenshotError) {
    console.error('[screenshot-helper] Failed to capture screenshot:', screenshotError);
    return '';
  }
}

/**
 * Log error with screenshot
 */
export async function logError(
  page: Page,
  error: Error,
  stepName: string,
  stepNumber?: number
): Promise<void> {
  const errorsDir = path.join(resultsDir, 'errors');
  if (!fs.existsSync(errorsDir)) {
    fs.mkdirSync(errorsDir, { recursive: true });
  }
  
  // Take error screenshot
  const screenshotPath = await takeScreenshot(page, {
    stepName,
    stepNumber,
    status: 'error',
  });
  
  // Create error log JSON
  const timestamp = new Date().toISOString();
  const currentUrl = page.isClosed() ? 'page-closed' : page.url();

  const errorLog = {
    timestamp,
    projectId: process.env.TEST_PROJECT_ID || 'whistrust',
    testType: process.env.TEST_TYPE || 'all',
    environment: process.env.TEST_ENVIRONMENT || 'local',
    datetime: process.env.TEST_DATETIME || timestamp,
    stepName,
    stepNumber,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    screenshot: screenshotPath || 'unavailable',
    url: currentUrl,
  };
  
  const errorLogPath = path.join(
    errorsDir,
    `error-log_${timestamp.replace(/[:.]/g, '-').slice(0, -5)}.json`
  );
  
  fs.writeFileSync(errorLogPath, JSON.stringify(errorLog, null, 2));
}

/**
 * Get results directory structure
 */
export function getResultsStructure() {
  return {
    base: resultsDir,
    screenshots: path.join(resultsDir, 'screenshots'),
    failures: path.join(resultsDir, 'screenshots', 'failures'),
    errors: path.join(resultsDir, 'errors'),
    htmlReport: path.join(resultsDir, 'html-report'),
    jsonReport: path.join(resultsDir, 'report.json'),
  };
}


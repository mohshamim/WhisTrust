import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const resultsDir = process.env.TEST_RESULTS_DIR || './results';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  
  reporter: [
    ['html', { 
      outputFolder: path.join(resultsDir, 'html-report'),
      open: 'never'
    }],
    ['json', { 
      outputFile: path.join(resultsDir, 'report.json')
    }],
    ['list'],
  ],
  
  use: {
    baseURL: baseURL,
    screenshot: 'on',
    video: 'on', // Always record videos
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});


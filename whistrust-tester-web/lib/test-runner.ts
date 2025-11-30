import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { moveVideosToResults, convertVideoToMP4 } from './video-recorder';
// Simple date formatting without date-fns dependency
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

const execAsync = promisify(exec);

export interface TestConfig {
  projectId: string;
  testType: string;
  environment: string;
  selectedTests: string[];
  baseUrl: string;
}

export interface TestResult {
  success: boolean;
  output: string;
  resultsDir: string;
  error?: string;
}

/**
 * Run Playwright tests with organized folder structure
 */
export async function runTests(config: TestConfig): Promise<TestResult> {
  const now = new Date();
  const datetimeStr = formatDate(now);
  
  // Create organized folder structure: results/{project}/{test-type}/{env}/{datetime}/
  const resultsBase = path.join(
    process.cwd(),
    'results',
    config.projectId,
    config.testType,
    config.environment,
    datetimeStr
  );
  
  const screenshotsDir = path.join(resultsBase, 'screenshots');
  const failuresDir = path.join(screenshotsDir, 'failures');
  const errorsDir = path.join(resultsBase, 'errors');
  
  // Create directories
  [resultsBase, screenshotsDir, failuresDir, errorsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Set environment variables
  process.env.TEST_BASE_URL = config.baseUrl;
  process.env.TEST_RESULTS_DIR = resultsBase;
  process.env.TEST_PROJECT_ID = config.projectId;
  process.env.TEST_TYPE = config.testType;
  process.env.TEST_ENVIRONMENT = config.environment;
  process.env.TEST_DATETIME = datetimeStr;
  
  // Build Playwright command
  const testFiles = config.selectedTests.length > 0
    ? config.selectedTests.map(test => `tests/${test}`).join(' ')
    : 'tests';
  
  // Build command with parallel workers support
  const workers = process.env.TEST_WORKERS || '1';
  const command = `npx playwright test ${testFiles} --reporter=html,json,list --workers=${workers}`;
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        TEST_BASE_URL: config.baseUrl,
        TEST_RESULTS_DIR: resultsBase,
        TEST_PROJECT_ID: config.projectId,
        TEST_TYPE: config.testType,
        TEST_ENVIRONMENT: config.environment,
        TEST_DATETIME: datetimeStr,
      },
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    
    const output = stdout + stderr;
    
    // Move HTML report to results directory
    const htmlReportSource = path.join(process.cwd(), 'playwright-report');
    const htmlReportDest = path.join(resultsBase, 'html-report');
    
    if (fs.existsSync(htmlReportSource)) {
      if (fs.existsSync(htmlReportDest)) {
        fs.rmSync(htmlReportDest, { recursive: true });
      }
      fs.renameSync(htmlReportSource, htmlReportDest);
    }
    
    // Move JSON report
    const jsonReportSource = path.join(process.cwd(), 'test-results');
    if (fs.existsSync(jsonReportSource)) {
      const jsonFiles = fs.readdirSync(jsonReportSource);
      jsonFiles.forEach(file => {
        if (file.endsWith('.json')) {
          fs.copyFileSync(
            path.join(jsonReportSource, file),
            path.join(resultsBase, file)
          );
        }
      });
      
      // Move videos to results directory
      try {
        const videoFiles = await moveVideosToResults(jsonReportSource, resultsBase);
        // Try to convert webm to mp4
        for (const videoFile of videoFiles) {
          if (videoFile.endsWith('.webm')) {
            await convertVideoToMP4(videoFile);
          }
        }
      } catch (error) {
        console.warn('Video processing error:', error);
      }
    }
    
    return {
      success: true,
      output,
      resultsDir: resultsBase,
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || error.stderr || error.message,
      resultsDir: resultsBase,
      error: error.message,
    };
  }
}

/**
 * Get list of test files
 */
export function getTestFiles(): string[] {
  const testsDir = path.join(process.cwd(), 'tests');
  
  if (!fs.existsSync(testsDir)) {
    return [];
  }
  
  return fs.readdirSync(testsDir)
    .filter(file => file.endsWith('.spec.ts'))
    .sort();
}


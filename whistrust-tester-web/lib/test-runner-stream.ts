import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { moveVideosToResults, convertVideoToMP4 } from './video-recorder';

const execAsync = promisify(exec);

export interface TestConfig {
  projectId: string;
  testType: string;
  environment: string;
  selectedTests: string[];
  baseUrl: string;
}

export interface TestEvent {
  type: 'step' | 'screenshot' | 'log' | 'error' | 'complete' | 'start';
  data: any;
  timestamp: string;
}

export interface StreamingTestRunner extends EventEmitter {
  runTests(config: TestConfig): Promise<void>;
  stop(): void;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

export class StreamingTestRunner extends EventEmitter {
  private process: any = null;
  private isRunning = false;
  private resultsDir = '';

  async runTests(config: TestConfig): Promise<void> {
    if (this.isRunning) {
      throw new Error('Test execution already in progress');
    }

    this.isRunning = true;
    const now = new Date();
    const datetimeStr = formatDate(now);
    
    // Create organized folder structure
    this.resultsDir = path.join(
      process.cwd(),
      'results',
      config.projectId,
      config.testType,
      config.environment,
      datetimeStr
    );
    
    const screenshotsDir = path.join(this.resultsDir, 'screenshots');
    const failuresDir = path.join(screenshotsDir, 'failures');
    const errorsDir = path.join(this.resultsDir, 'errors');
    
    // Create directories
    [this.resultsDir, screenshotsDir, failuresDir, errorsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Set environment variables
    process.env.TEST_BASE_URL = config.baseUrl;
    process.env.TEST_RESULTS_DIR = this.resultsDir;
    process.env.TEST_PROJECT_ID = config.projectId;
    process.env.TEST_TYPE = config.testType;
    process.env.TEST_ENVIRONMENT = config.environment;
    process.env.TEST_DATETIME = datetimeStr;
    
    // Emit start event
    this.emit('event', {
      type: 'start',
      data: { config, resultsDir: this.resultsDir },
      timestamp: new Date().toISOString(),
    } as TestEvent);
    
    // Build Playwright command
    const testFiles = config.selectedTests.length > 0
      ? config.selectedTests.map(test => `tests/${test}`).join(' ')
      : 'tests';
    
    const command = `npx playwright test ${testFiles} --reporter=html,json,list --headed`;
    
    try {
      // Use spawn for streaming output
      this.process = spawn('npx', ['playwright', 'test', ...testFiles.split(' '), '--reporter=html,json,list', '--headed'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          TEST_BASE_URL: config.baseUrl,
          TEST_RESULTS_DIR: this.resultsDir,
          TEST_PROJECT_ID: config.projectId,
          TEST_TYPE: config.testType,
          TEST_ENVIRONMENT: config.environment,
          TEST_DATETIME: datetimeStr,
        },
        shell: true,
      });
      
      // Stream stdout
      this.process.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        this.emit('event', {
          type: 'log',
          data: { message: output },
          timestamp: new Date().toISOString(),
        } as TestEvent);
      });
      
      // Stream stderr
      this.process.stderr.on('data', (data: Buffer) => {
        const output = data.toString();
        this.emit('event', {
          type: 'error',
          data: { message: output },
          timestamp: new Date().toISOString(),
        } as TestEvent);
      });
      
      // Watch for screenshots
      this.watchScreenshots(screenshotsDir);
      
      // Wait for process to complete
      await new Promise<void>((resolve, reject) => {
        this.process.on('close', (code: number) => {
          this.isRunning = false;
          
          // Move HTML report
          const htmlReportSource = path.join(process.cwd(), 'playwright-report');
          const htmlReportDest = path.join(this.resultsDir, 'html-report');
          
          if (fs.existsSync(htmlReportSource)) {
            if (fs.existsSync(htmlReportDest)) {
              fs.rmSync(htmlReportDest, { recursive: true });
            }
            fs.renameSync(htmlReportSource, htmlReportDest);
          }

          // Move any recorded videos from Playwright's default output into this run's results directory
          const jsonReportSource = path.join(process.cwd(), 'test-results');
          if (fs.existsSync(jsonReportSource)) {
            moveVideosToResults(jsonReportSource, this.resultsDir)
              .then(async (videoFiles) => {
                // Try to convert WEBM videos to MP4 for easier playback
                for (const videoFile of videoFiles) {
                  if (videoFile.toLowerCase().endsWith('.webm')) {
                    await convertVideoToMP4(videoFile);
                  }
                }
              })
              .catch((error) => {
                console.warn('Video processing error:', error);
              });
          }
          
          this.emit('event', {
            type: 'complete',
            data: { 
              success: code === 0,
              exitCode: code,
              resultsDir: this.resultsDir,
            },
            timestamp: new Date().toISOString(),
          } as TestEvent);
          
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Test execution failed with exit code ${code}`));
          }
        });
        
        this.process.on('error', (error: Error) => {
          this.isRunning = false;
          reject(error);
        });
      });
    } catch (error: any) {
      this.isRunning = false;
      this.emit('event', {
        type: 'error',
        data: { message: error.message },
        timestamp: new Date().toISOString(),
      } as TestEvent);
      throw error;
    }
  }
  
  private watchScreenshots(screenshotsDir: string) {
    // Watch for new screenshot files
    if (fs.existsSync(screenshotsDir)) {
      const watcher = fs.watch(screenshotsDir, { recursive: true }, (eventType, filename) => {
        if (eventType === 'rename' && filename && filename.endsWith('.png')) {
          const screenshotPath = path.join(screenshotsDir, filename);
          if (fs.existsSync(screenshotPath)) {
            // Read screenshot and emit
            try {
              const screenshotBuffer = fs.readFileSync(screenshotPath);
              const base64 = screenshotBuffer.toString('base64');
              
              this.emit('event', {
                type: 'screenshot',
                data: {
                  path: screenshotPath,
                  filename,
                  base64: `data:image/png;base64,${base64}`,
                },
                timestamp: new Date().toISOString(),
              } as TestEvent);
            } catch (error) {
              // Ignore read errors
            }
          }
        }
      });
      
      // Clean up watcher when process ends
      this.process.on('close', () => {
        watcher.close();
      });
    }
  }
  
  stop() {
    if (this.process && this.isRunning) {
      this.process.kill();
      this.isRunning = false;
      this.emit('event', {
        type: 'complete',
        data: { success: false, stopped: true },
        timestamp: new Date().toISOString(),
      } as TestEvent);
    }
  }
}


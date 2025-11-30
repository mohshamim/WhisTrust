import * as fs from 'fs';
import * as path from 'path';
import { TestRun } from './test-history';

export interface ReportOptions {
  format: 'html' | 'json' | 'pdf';
  includeScreenshots: boolean;
  includeVideos: boolean;
  includeMetrics: boolean;
}

/**
 * Generate custom HTML report
 */
export function generateHTMLReport(run: TestRun, options: ReportOptions): string {
  const screenshotsDir = path.join(run.resultsDir, 'screenshots');
  const videosDir = path.join(run.resultsDir, 'videos');
  const errorsDir = path.join(run.resultsDir, 'errors');
  
  let screenshots: string[] = [];
  let videos: string[] = [];
  let errors: any[] = [];
  
  if (options.includeScreenshots && fs.existsSync(screenshotsDir)) {
    screenshots = fs.readdirSync(screenshotsDir, { recursive: true })
      .filter((f: string) => f.endsWith('.png'))
      .map((f: string) => path.join(screenshotsDir, f));
  }
  
  if (options.includeVideos && fs.existsSync(videosDir)) {
    videos = fs.readdirSync(videosDir)
      .filter(f => f.endsWith('.mp4') || f.endsWith('.webm'))
      .map(f => path.join(videosDir, f));
  }
  
  if (fs.existsSync(errorsDir)) {
    const errorFiles = fs.readdirSync(errorsDir).filter(f => f.endsWith('.json'));
    errors = errorFiles.map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(errorsDir, f), 'utf-8'));
      } catch {
        return null;
      }
    }).filter(Boolean);
  }
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report - ${run.id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .card { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50; }
    .card h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
    .card .value { font-size: 32px; font-weight: bold; color: #333; }
    .status-${run.success ? 'success' : 'failed'} { color: ${run.success ? '#4CAF50' : '#f44336'}; }
    .screenshots { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
    .screenshot { border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
    .screenshot img { width: 100%; height: auto; display: block; }
    .screenshot .caption { padding: 10px; background: #f9f9f9; font-size: 12px; color: #666; }
    .errors { margin: 30px 0; }
    .error { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .error pre { background: #fff; padding: 10px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Test Execution Report</h1>
    
    <div class="summary">
      <div class="card">
        <h3>Status</h3>
        <div class="value status-${run.success ? 'success' : 'failed'}">
          ${run.success ? '✓ Passed' : '✗ Failed'}
        </div>
      </div>
      <div class="card">
        <h3>Project</h3>
        <div class="value">${run.projectId}</div>
      </div>
      <div class="card">
        <h3>Environment</h3>
        <div class="value">${run.environment}</div>
      </div>
      <div class="card">
        <h3>Duration</h3>
        <div class="value">${run.duration ? (run.duration / 1000).toFixed(2) + 's' : 'N/A'}</div>
      </div>
      <div class="card">
        <h3>Tests</h3>
        <div class="value">${run.testCount || 0}</div>
      </div>
      <div class="card">
        <h3>Passed</h3>
        <div class="value">${run.passedCount || 0}</div>
      </div>
    </div>
    
    ${errors.length > 0 ? `
    <div class="errors">
      <h2>Errors</h2>
      ${errors.map((error, i) => `
        <div class="error">
          <strong>Error ${i + 1}</strong>
          <p>${error.error?.message || 'Unknown error'}</p>
          <pre>${JSON.stringify(error, null, 2)}</pre>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${screenshots.length > 0 && options.includeScreenshots ? `
    <div class="screenshots">
      <h2>Screenshots (${screenshots.length})</h2>
      ${screenshots.map((screenshot, i) => {
        const filename = path.basename(screenshot);
        const base64 = fs.readFileSync(screenshot).toString('base64');
        return `
          <div class="screenshot">
            <img src="data:image/png;base64,${base64}" alt="${filename}" />
            <div class="caption">${filename}</div>
          </div>
        `;
      }).join('')}
    </div>
    ` : ''}
    
    ${videos.length > 0 && options.includeVideos ? `
    <div>
      <h2>Videos (${videos.length})</h2>
      ${videos.map((video, i) => {
        const filename = path.basename(video);
        return `
          <div style="margin: 20px 0;">
            <video controls width="800" style="max-width: 100%;">
              <source src="/api/view-video?path=${encodeURIComponent(video)}" type="video/mp4">
            </video>
            <p style="margin-top: 10px; color: #666;">${filename}</p>
          </div>
        `;
      }).join('')}
    </div>
    ` : ''}
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
      Generated on ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>`;
  
  return html;
}

/**
 * Save HTML report to file
 */
export function saveHTMLReport(run: TestRun, options: ReportOptions): string {
  const html = generateHTMLReport(run, options);
  const reportPath = path.join(run.resultsDir, 'custom-report.html');
  fs.writeFileSync(reportPath, html);
  return reportPath;
}

/**
 * Generate JSON report
 */
export function generateJSONReport(run: TestRun, options: ReportOptions): any {
  return {
    id: run.id,
    projectId: run.projectId,
    testType: run.testType,
    environment: run.environment,
    datetime: run.datetime,
    timestamp: run.timestamp,
    success: run.success,
    duration: run.duration,
    testCount: run.testCount,
    passedCount: run.passedCount,
    failedCount: run.failedCount,
    resultsDir: run.resultsDir,
    ...(options.includeMetrics && {
      metrics: {
        averageDuration: run.duration,
        successRate: run.testCount ? (run.passedCount || 0) / run.testCount * 100 : 0,
      },
    }),
  };
}


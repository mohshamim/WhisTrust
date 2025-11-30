import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface VisualDiff {
  screenshotPath: string;
  baselinePath: string;
  diffPath: string;
  similarity: number; // 0-100
  differences: number;
  threshold: number;
  passed: boolean;
}

export interface VisualComparisonResult {
  total: number;
  passed: number;
  failed: number;
  diffs: VisualDiff[];
}

/**
 * Compare two images and generate diff
 */
export async function compareScreenshots(
  currentPath: string,
  baselinePath: string,
  diffPath: string,
  threshold: number = 0.1
): Promise<VisualDiff> {
  // Ensure baseline exists
  if (!fs.existsSync(baselinePath)) {
    // Create baseline from current
    const baselineDir = path.dirname(baselinePath);
    if (!fs.existsSync(baselineDir)) {
      fs.mkdirSync(baselineDir, { recursive: true });
    }
    fs.copyFileSync(currentPath, baselinePath);
    
    return {
      screenshotPath: currentPath,
      baselinePath,
      diffPath,
      similarity: 100,
      differences: 0,
      threshold,
      passed: true,
    };
  }
  
  // Use pixelmatch or similar library for comparison
  // For now, we'll use a simple file size and basic comparison
  // In production, use a proper image comparison library like pixelmatch
  
  try {
    // Check if images are identical (simple check)
    const currentSize = fs.statSync(currentPath).size;
    const baselineSize = fs.statSync(baselinePath).size;
    
    // Simple comparison - in production, use proper image diffing
    const sizeDiff = Math.abs(currentSize - baselineSize) / baselineSize;
    const similarity = Math.max(0, 100 - (sizeDiff * 100));
    const passed = similarity >= (100 - threshold * 100);
    
    // Create diff image (placeholder - would use actual image diffing)
    if (!passed && !fs.existsSync(diffPath)) {
      const diffDir = path.dirname(diffPath);
      if (!fs.existsSync(diffDir)) {
        fs.mkdirSync(diffDir, { recursive: true });
      }
      // Copy current as diff (in production, generate actual diff image)
      fs.copyFileSync(currentPath, diffPath);
    }
    
    return {
      screenshotPath: currentPath,
      baselinePath,
      diffPath: passed ? '' : diffPath,
      similarity,
      differences: passed ? 0 : Math.round((1 - similarity / 100) * 1000),
      threshold,
      passed,
    };
  } catch (error: any) {
    throw new Error(`Visual comparison failed: ${error.message}`);
  }
}

/**
 * Compare all screenshots in a test run with baselines
 */
export async function compareTestRun(
  resultsDir: string,
  threshold: number = 0.1
): Promise<VisualComparisonResult> {
  const screenshotsDir = path.join(resultsDir, 'screenshots');
  const baselinesDir = path.join(process.cwd(), 'baselines');
  const diffsDir = path.join(resultsDir, 'visual-diffs');
  
  if (!fs.existsSync(screenshotsDir)) {
    return { total: 0, passed: 0, failed: 0, diffs: [] };
  }
  
  // Ensure directories exist
  if (!fs.existsSync(baselinesDir)) {
    fs.mkdirSync(baselinesDir, { recursive: true });
  }
  if (!fs.existsSync(diffsDir)) {
    fs.mkdirSync(diffsDir, { recursive: true });
  }
  
  const screenshotFiles = getAllScreenshotFiles(screenshotsDir);
  const diffs: VisualDiff[] = [];
  
  for (const screenshotFile of screenshotFiles) {
    const relativePath = path.relative(screenshotsDir, screenshotFile);
    const baselinePath = path.join(baselinesDir, relativePath);
    const diffPath = path.join(diffsDir, relativePath);
    
    try {
      const diff = await compareScreenshots(screenshotFile, baselinePath, diffPath, threshold);
      diffs.push(diff);
    } catch (error: any) {
      console.error(`Error comparing ${screenshotFile}:`, error);
    }
  }
  
  const passed = diffs.filter(d => d.passed).length;
  const failed = diffs.filter(d => !d.passed).length;
  
  return {
    total: diffs.length,
    passed,
    failed,
    diffs,
  };
}

/**
 * Get all screenshot files recursively
 */
function getAllScreenshotFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...getAllScreenshotFiles(fullPath));
    } else if (entry.name.endsWith('.png')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Update baseline from current screenshot
 */
export function updateBaseline(screenshotPath: string, baselinePath: string): void {
  const baselineDir = path.dirname(baselinePath);
  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir, { recursive: true });
  }
  
  fs.copyFileSync(screenshotPath, baselinePath);
}

/**
 * Get visual regression report
 */
export function generateVisualRegressionReport(
  comparisonResult: VisualComparisonResult,
  resultsDir: string
): string {
  const reportPath = path.join(resultsDir, 'visual-regression-report.html');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Regression Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
    .card { background: #f9f9f9; padding: 20px; border-radius: 8px; }
    .card h3 { margin: 0 0 10px 0; color: #666; }
    .card .value { font-size: 32px; font-weight: bold; }
    .passed { color: #4CAF50; }
    .failed { color: #f44336; }
    .comparison { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .comparison-item { border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
    .comparison-item img { width: 100%; height: auto; display: block; }
    .comparison-item .label { padding: 10px; background: #f9f9f9; font-size: 12px; }
    .diff-failed { border-color: #f44336; border-width: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Visual Regression Report</h1>
    
    <div class="summary">
      <div class="card">
        <h3>Total Comparisons</h3>
        <div class="value">${comparisonResult.total}</div>
      </div>
      <div class="card">
        <h3>Passed</h3>
        <div class="value passed">${comparisonResult.passed}</div>
      </div>
      <div class="card">
        <h3>Failed</h3>
        <div class="value failed">${comparisonResult.failed}</div>
      </div>
    </div>
    
    <h2>Comparisons</h2>
    ${comparisonResult.diffs.map((diff, i) => {
      const screenshotBase64 = fs.readFileSync(diff.screenshotPath).toString('base64');
      const baselineBase64 = fs.existsSync(diff.baselinePath) 
        ? fs.readFileSync(diff.baselinePath).toString('base64')
        : '';
      const diffBase64 = diff.diffPath && fs.existsSync(diff.diffPath)
        ? fs.readFileSync(diff.diffPath).toString('base64')
        : '';
      
      return `
        <div class="comparison ${!diff.passed ? 'diff-failed' : ''}" style="margin: 30px 0;">
          <h3>${path.basename(diff.screenshotPath)} - ${diff.passed ? '✓ Passed' : '✗ Failed'} (${diff.similarity.toFixed(2)}% similar)</h3>
          <div class="comparison">
            <div class="comparison-item">
              <div class="label">Current</div>
              <img src="data:image/png;base64,${screenshotBase64}" />
            </div>
            <div class="comparison-item">
              <div class="label">Baseline</div>
              ${baselineBase64 ? `<img src="data:image/png;base64,${baselineBase64}" />` : '<p>No baseline</p>'}
            </div>
            <div class="comparison-item">
              <div class="label">Diff</div>
              ${diffBase64 ? `<img src="data:image/png;base64,${diffBase64}" />` : '<p>No differences</p>'}
            </div>
          </div>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>`;
  
  fs.writeFileSync(reportPath, html);
  return reportPath;
}


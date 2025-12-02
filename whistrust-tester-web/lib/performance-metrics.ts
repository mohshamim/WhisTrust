import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  networkRequests: number;
  totalTransferSize: number;
  apiResponseTimes: { url: string; duration: number }[];
}

/**
 * Collect performance metrics from a page
 */
export async function collectPerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
  // Get performance timing
  const performanceTiming = await page.evaluate(() => {
    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    // Get First Contentful Paint from paint timing entries
    const paintEntries = performance.getEntriesByType('paint') as PerformancePaintTiming[];
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    const firstContentfulPaint = fcp ? fcp.startTime : 0;
    
    return {
      pageLoadTime: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstContentfulPaint: firstContentfulPaint,
      largestContentfulPaint: 0, // Would need to use PerformanceObserver
      timeToInteractive: timing.domInteractive - timing.navigationStart,
      totalBlockingTime: 0, // Would need to calculate from long tasks
      cumulativeLayoutShift: 0, // Would need to use PerformanceObserver
    };
  });
  
  // Get network metrics
  const networkMetrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    
    return {
      networkRequests: resources.length,
      totalTransferSize: totalSize,
    };
  });
  
  // Get API response times
  const apiResponseTimes: { url: string; duration: number }[] = [];
  const requests = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources
      .filter(r => r.initiatorType === 'xmlhttprequest' || r.initiatorType === 'fetch')
      .map(r => ({
        url: r.name,
        duration: r.responseEnd - r.requestStart,
      }));
  });
  
  apiResponseTimes.push(...requests);
  
  return {
    ...performanceTiming,
    ...networkMetrics,
    apiResponseTimes,
  };
}

/**
 * Save performance metrics to file
 */
export function savePerformanceMetrics(
  metrics: PerformanceMetrics,
  resultsDir: string,
  testName: string
): string {
  const metricsDir = path.join(resultsDir, 'performance');
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }
  
  const metricsPath = path.join(metricsDir, `${testName}-metrics.json`);
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  return metricsPath;
}

/**
 * Compare performance metrics
 */
export function comparePerformanceMetrics(
  current: PerformanceMetrics,
  baseline: PerformanceMetrics
): {
  pageLoadTime: { current: number; baseline: number; diff: number; percentChange: number };
  domContentLoaded: { current: number; baseline: number; diff: number; percentChange: number };
  firstContentfulPaint: { current: number; baseline: number; diff: number; percentChange: number };
} {
  return {
    pageLoadTime: {
      current: current.pageLoadTime,
      baseline: baseline.pageLoadTime,
      diff: current.pageLoadTime - baseline.pageLoadTime,
      percentChange: ((current.pageLoadTime - baseline.pageLoadTime) / baseline.pageLoadTime) * 100,
    },
    domContentLoaded: {
      current: current.domContentLoaded,
      baseline: baseline.domContentLoaded,
      diff: current.domContentLoaded - baseline.domContentLoaded,
      percentChange: ((current.domContentLoaded - baseline.domContentLoaded) / baseline.domContentLoaded) * 100,
    },
    firstContentfulPaint: {
      current: current.firstContentfulPaint,
      baseline: baseline.firstContentfulPaint,
      diff: current.firstContentfulPaint - baseline.firstContentfulPaint,
      percentChange: ((current.firstContentfulPaint - baseline.firstContentfulPaint) / baseline.firstContentfulPaint) * 100,
    },
  };
}


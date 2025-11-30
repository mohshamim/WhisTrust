import { test as baseTest, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface APITestConfig {
  baseUrl: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  expectedStatus: number;
  expectedResponse?: any;
  validateSchema?: boolean;
}

export interface APITestResult {
  success: boolean;
  statusCode: number;
  responseTime: number;
  responseBody: any;
  error?: string;
  timestamp: Date;
}

/**
 * Run API test
 */
export async function runAPITest(config: APITestConfig): Promise<APITestResult> {
  const startTime = Date.now();
  
  try {
    const url = `${config.baseUrl}${config.endpoint}`;
    const options: RequestInit = {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    };
    
    if (config.body && (config.method === 'POST' || config.method === 'PUT' || config.method === 'PATCH')) {
      options.body = JSON.stringify(config.body);
    }
    
    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;
    const responseBody = await response.json().catch(() => response.text());
    
    const success = response.status === config.expectedStatus;
    
    return {
      success,
      statusCode: response.status,
      responseTime,
      responseBody,
      timestamp: new Date(),
      ...(success ? {} : { error: `Expected status ${config.expectedStatus}, got ${response.status}` }),
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 0,
      responseTime: Date.now() - startTime,
      responseBody: null,
      error: error.message,
      timestamp: new Date(),
    };
  }
}

/**
 * Save API test results
 */
export function saveAPITestResults(
  results: APITestResult[],
  resultsDir: string,
  testName: string
): string {
  const apiDir = path.join(resultsDir, 'api-tests');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  const resultsPath = path.join(apiDir, `${testName}-results.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  return resultsPath;
}

/**
 * Generate API test report
 */
export function generateAPITestReport(results: APITestResult[]): string {
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  
  return `API Test Report
================
Total Tests: ${results.length}
Passed: ${passed}
Failed: ${failed}
Average Response Time: ${avgResponseTime.toFixed(2)}ms

Results:
${results.map((r, i) => `
Test ${i + 1}:
  Status: ${r.success ? 'PASS' : 'FAIL'}
  Status Code: ${r.statusCode}
  Response Time: ${r.responseTime}ms
  ${r.error ? `Error: ${r.error}` : ''}
`).join('')}`;
}


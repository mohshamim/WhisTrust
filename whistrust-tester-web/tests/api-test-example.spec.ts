import { test, expect } from '@playwright/test';
import { runAPITest, saveAPITestResults, APITestConfig } from '../lib/api-test-runner';

const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3001';

test('API Health Check', async () => {
  const config: APITestConfig = {
    baseUrl: baseURL,
    endpoint: '/api/health',
    method: 'GET',
    expectedStatus: 200,
  };
  
  const result = await runAPITest(config);
  
  expect(result.success).toBe(true);
  expect(result.statusCode).toBe(200);
  expect(result.responseTime).toBeLessThan(1000); // Should respond in less than 1 second
});

test('API Authentication Test', async () => {
  const config: APITestConfig = {
    baseUrl: baseURL,
    endpoint: '/api/auth/login',
    method: 'POST',
    body: {
      email: 'test@example.com',
      password: 'password123',
    },
    expectedStatus: 200,
  };
  
  const result = await runAPITest(config);
  
  // Save results
  const resultsDir = process.env.TEST_RESULTS_DIR || './results';
  if (resultsDir) {
    saveAPITestResults([result], resultsDir, 'api-auth-test');
  }
  
  expect(result.success).toBe(true);
});


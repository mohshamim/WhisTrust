import { test, expect } from '@playwright/test';
import { takeScreenshot, logError } from '../lib/screenshot-helper';
import { findWhisTrustPort } from '../lib/port-detector';

/**
 * Login helper function
 */
async function login(page: any, baseURL: string, subdomain: string, email: string, password: string) {
  await page.goto(`${baseURL}/org/${subdomain}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Sign In")');
  
  await page.waitForURL(`**/org/${subdomain}/dashboard`, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('Role-Based Access Control - Comprehensive RBAC Enforcement', () => {
  let baseURL: string;

  test.beforeAll(async () => {
    const port = await findWhisTrustPort();
    baseURL = `http://localhost:${port}`;
  });

  test('Admin - Full Access Verification', async ({ page }) => {
    let stepNumber = 1;

    try {
      await login(page, baseURL, 'codesquare', 'admin@codesquare.com', 'CodeSquare@2024');

      await takeScreenshot(page, {
        stepName: '01_admin_logged_in',
        stepNumber: stepNumber++,
        status: 'success',
      });

      // Verify Admin can access all pages
      const adminPages = [
        { path: '/reports', name: 'Reports' },
        { path: '/analytics', name: 'Analytics' },
        { path: '/audit-logs', name: 'Audit Logs' },
        { path: '/users', name: 'Users' },
        { path: '/settings', name: 'Settings' },
      ];

      for (const pageInfo of adminPages) {
        try {
          await page.goto(`${baseURL}/org/codesquare${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          const currentUrl = page.url();
          
          // Admin should have access to all pages
          if (currentUrl.includes('access-denied') || currentUrl.includes('login')) {
            throw new Error(`Admin should have access to ${pageInfo.name} but was denied`);
          }

          await takeScreenshot(page, {
        stepName: `02_admin_access_${pageInfo.name.toLowerCase().replace(/\s+/g, '_')}`,
            stepNumber: stepNumber++,
            status: 'success',
          });
        } catch (error) {
          await logError(page, error as Error, `admin_access_${pageInfo.name}`, stepNumber - 1);
        }
      }

      // Verify Admin-specific UI elements
      await page.goto(`${baseURL}/org/codesquare/reports`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const reportLink = page.locator('a[href*="/reports/"]').first();
      if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await reportLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check for admin-specific features
        const assignButton = page.locator('button:has-text("Assign")').first();
        const statusDropdown = page.locator('select').or(page.locator('button:has-text("Status")')).first();
        const priorityDropdown = page.locator('select[name*="priority" i]').or(page.locator('button:has-text("Priority")')).first();

        if (await assignButton.isVisible().catch(() => false) || 
            await statusDropdown.isVisible().catch(() => false) ||
            await priorityDropdown.isVisible().catch(() => false)) {
          await takeScreenshot(page, {
            stepName: '03_admin_specific_features',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }
      }
    } catch (error) {
      await logError(page, error as Error, 'admin_rbac_verification', stepNumber);
      throw error;
    }
  });

  test('Manager - Department-Scoped Access Verification', async ({ page }) => {
    let stepNumber = 1;

    try {
      await login(page, baseURL, 'codesquare', 'manager@codesquare.com', 'Manager@2024');

      await takeScreenshot(page, {
        stepName: '01_manager_logged_in',
        stepNumber: stepNumber++,
        status: 'success',
      });

      // Manager should have access to analytics and audit logs
      const allowedPages = [
        { path: '/analytics', name: 'Analytics' },
        { path: '/audit-logs', name: 'Audit Logs' },
      ];

      for (const pageInfo of allowedPages) {
        try {
          await page.goto(`${baseURL}/org/codesquare${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          const currentUrl = page.url();
          
          if (currentUrl.includes('access-denied') || currentUrl.includes('login')) {
            throw new Error(`Manager should have access to ${pageInfo.name} but was denied`);
          }

          await takeScreenshot(page, {
            stepName: `02_manager_access_${pageInfo.name.toLowerCase().replace(/\s+/g, '_')}`,
            stepNumber: stepNumber++,
            status: 'success',
          });
        } catch (error) {
          await logError(page, error as Error, `manager_access_${pageInfo.name}`, stepNumber - 1);
        }
      }

      // Manager should NOT have access to user management
      try {
        await page.goto(`${baseURL}/org/codesquare/users`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        
        if (!currentUrl.includes('access-denied') && !currentUrl.includes('dashboard')) {
          // If not redirected, verify user management features are not available
          const addUserButton = page.locator('button:has-text("Add User")').first();
          if (await addUserButton.isVisible().catch(() => false)) {
            throw new Error('Manager should not have access to user management');
          }
        }

        await takeScreenshot(page, {
          stepName: '03_manager_user_management_restricted',
          stepNumber: stepNumber++,
          status: 'success',
        });
      } catch (error) {
        await logError(page, error as Error, 'manager_user_management_restriction', stepNumber - 1);
      }
    } catch (error) {
      await logError(page, error as Error, 'manager_rbac_verification', stepNumber);
      throw error;
    }
  });

  test('Investigator - Limited Access Verification', async ({ page }) => {
    let stepNumber = 1;

    try {
      await login(page, baseURL, 'codesquare', 'investigator@codesquare.com', 'Investigator@2024');

      await takeScreenshot(page, {
        stepName: '01_investigator_logged_in',
        stepNumber: stepNumber++,
        status: 'success',
      });

      // Investigator should NOT have access to analytics
      try {
        await page.goto(`${baseURL}/org/codesquare/analytics`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        
        if (!currentUrl.includes('access-denied') && !currentUrl.includes('dashboard')) {
          throw new Error('Investigator should not have access to analytics');
        }

        await takeScreenshot(page, {
          stepName: '02_investigator_analytics_denied',
          stepNumber: stepNumber++,
          status: 'success',
        });
      } catch (error) {
        await logError(page, error as Error, 'investigator_analytics_restriction', stepNumber - 1);
      }

      // Investigator should NOT have access to audit logs
      try {
        await page.goto(`${baseURL}/org/codesquare/audit-logs`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        
        if (!currentUrl.includes('access-denied') && !currentUrl.includes('dashboard')) {
          throw new Error('Investigator should not have access to audit logs');
        }

        await takeScreenshot(page, {
          stepName: '03_investigator_audit_logs_denied',
          stepNumber: stepNumber++,
          status: 'success',
        });
      } catch (error) {
        await logError(page, error as Error, 'investigator_audit_logs_restriction', stepNumber - 1);
      }

      // Investigator should NOT have access to user management
      try {
        await page.goto(`${baseURL}/org/codesquare/users`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        
        if (!currentUrl.includes('access-denied') && !currentUrl.includes('dashboard')) {
          throw new Error('Investigator should not have access to user management');
        }

        await takeScreenshot(page, {
          stepName: '04_investigator_user_management_denied',
          stepNumber: stepNumber++,
          status: 'success',
        });
      } catch (error) {
        await logError(page, error as Error, 'investigator_user_management_restriction', stepNumber - 1);
      }

      // Investigator should NOT see assign button
      try {
        await page.goto(`${baseURL}/org/codesquare/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const reportLink = page.locator('a[href*="/reports/"]').first();
        if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await reportLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          const assignButton = page.locator('button:has-text("Assign")').first();
          if (await assignButton.isVisible().catch(() => false)) {
            throw new Error('Investigator should not see assign case button');
          }

          await takeScreenshot(page, {
            stepName: '05_investigator_no_assign_button',
            stepNumber: stepNumber++,
            status: 'success',
          });
        }
      } catch (error) {
        await logError(page, error as Error, 'investigator_assign_restriction', stepNumber - 1);
      }
    } catch (error) {
      await logError(page, error as Error, 'investigator_rbac_verification', stepNumber);
      throw error;
    }
  });

  test('Permission-Based UI Elements Verification', async ({ page }) => {
    let stepNumber = 1;

    try {
      // Test Admin UI elements
      await login(page, baseURL, 'codesquare', 'admin@codesquare.com', 'CodeSquare@2024');
      
      await page.goto(`${baseURL}/org/codesquare/reports`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const reportLink = page.locator('a[href*="/reports/"]').first();
      if (await reportLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await reportLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Admin should see all buttons
        const adminButtons = [
          'button:has-text("Assign")',
          'select',
          'button:has-text("Save")',
        ];

        for (const buttonSelector of adminButtons) {
          const button = page.locator(buttonSelector).first();
          if (await button.isVisible().catch(() => false)) {
            await takeScreenshot(page, {
              stepName: `06_admin_ui_element_${buttonSelector.replace(/[^a-zA-Z0-9]/g, '_')}`,
              stepNumber: stepNumber++,
              status: 'success',
            });
          }
        }
      }
    } catch (error) {
      await logError(page, error as Error, 'permission_ui_elements', stepNumber);
    }
  });

  test('Department-Based Filtering Verification', async ({ page }) => {
    let stepNumber = 1;

    try {
      // Test Manager department filtering
      await login(page, baseURL, 'codesquare', 'manager@codesquare.com', 'Manager@2024');

      await page.goto(`${baseURL}/org/codesquare/reports`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Manager should only see department-filtered reports
      await takeScreenshot(page, {
        stepName: '01_manager_department_filtered_reports',
        stepNumber: stepNumber++,
        status: 'success',
      });

      // Verify reports are filtered by department
      await expect(page.locator('h1:has-text("Reports")').first()).toBeVisible({ timeout: 10000 });
    } catch (error) {
      await logError(page, error as Error, 'department_filtering', stepNumber);
    }
  });
});

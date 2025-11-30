# Comprehensive Role-Based Testing Guide

This guide will help you test all user roles and functionalities in the WhisTrust application.

## Prerequisites

1. **WhisTrust Application Running**
   - The main WhisTrust app should be running on port 3000, 3001, 3002, 3003, or 3004
   - Default: `http://localhost:3000`

2. **Tester Web Application Running**
   - The tester should be running on port 3005
   - Default: `http://localhost:3005`

## Step-by-Step Testing Instructions

### Step 1: Start the WhisTrust Application

```bash
# Navigate to the main WhisTrust project directory
cd D:\Personal\Learnings\whistle-blwoing

# Start the application (adjust command based on your setup)
npm run dev
# OR
yarn dev
# OR
pnpm dev
```

**Verify it's running:**
- Open browser: `http://localhost:3000`
- You should see the WhisTrust homepage

### Step 2: Start the Tester Web Application

Open a **new terminal window** and run:

```bash
# Navigate to tester directory
cd D:\Personal\Learnings\whistle-blwoing\whistrust-tester-web

# Install dependencies (if not already installed)
npm install

# Start the tester
npm run dev
```

**Verify it's running:**
- Open browser: `http://localhost:3005`
- You should see the "WhisTrust Automation Tester" interface

### Step 3: Access the Tester Interface

1. Open your browser and go to: `http://localhost:3005`
2. You'll see the main tester interface with:
   - Project selection dropdown
   - Test type selection
   - Environment selection
   - Test file checkboxes

### Step 4: Run Tests by Role

#### Option A: Run Individual Role Tests

**Test Organization Admin:**
1. Select **Project**: `WhisTrust`
2. Select **Test Type**: `End-to-End Tests` (or `All Tests`)
3. Select **Environment**: `Local`
4. Check the box for: `organization-admin-complete-flow.spec.ts`
5. Click **"Start Testing"** or **"🎥 Start with Live View"**

**Test Manager:**
1. Select **Project**: `WhisTrust`
2. Select **Test Type**: `End-to-End Tests`
3. Select **Environment**: `Local`
4. Check the box for: `manager-complete-flow.spec.ts`
5. Click **"Start Testing"**

**Test Investigator:**
1. Select **Project**: `WhisTrust`
2. Select **Test Type**: `End-to-End Tests`
3. Select **Environment**: `Local`
4. Check the box for: `investigator-complete-flow.spec.ts`
5. Click **"Start Testing"**

**Test HR:**
1. Select **Project**: `WhisTrust`
2. Select **Test Type**: `End-to-End Tests`
3. Select **Environment**: `Local`
4. Check the box for: `hr-complete-flow.spec.ts`
5. Click **"Start Testing"**

**Test Anonymous Reporter:**
1. Select **Project**: `WhisTrust`
2. Select **Test Type**: `End-to-End Tests`
3. Select **Environment**: `Local`
4. Check the box for: `anonymous-reporter-complete-flow.spec.ts`
5. Click **"Start Testing"**

#### Option B: Run All Tests at Once

1. Select **Project**: `WhisTrust`
2. Select **Test Type**: `All Tests`
3. Select **Environment**: `Local`
4. Click **"Start Testing"** (this will run all test files)

#### Option C: Run Cross-Role Workflow Test

1. Select **Project**: `WhisTrust`
2. Select **Test Type**: `End-to-End Tests`
3. Select **Environment**: `Local`
4. Check the box for: `cross-role-workflow.spec.ts`
5. Click **"Start Testing"**

### Step 5: Monitor Test Execution

**With Live View:**
- Click **"🎥 Start with Live View"** to see real-time test execution
- Watch as the browser performs actions
- See logs appear in real-time

**Without Live View:**
- Click **"Start Testing"** for standard execution
- View logs in the "Test Logs" panel
- Wait for completion

### Step 6: View Test Results

After tests complete:

1. **View Results Summary:**
   - Check the "Results Summary" panel on the tester page
   - See success/failure status
   - Note the results directory path

2. **View Test History:**
   - Click **"📊 View History"** link at the top
   - See all previous test runs
   - Filter by project, test type, environment, or status
   - Click on **"Report"** or **"🎥 Video"** links to view detailed results

3. **View Screenshots:**
   - Navigate to the results directory shown in the summary
   - Path format: `results/whistrust/{test-type}/{environment}/{datetime}/screenshots/`
   - Each step has a screenshot with naming: `step-XX_action_status_timestamp.png`

4. **View Error Logs (if any):**
   - Check `results/whistrust/{test-type}/{environment}/{datetime}/errors/`
   - JSON files contain error details with stack traces and screenshot links

5. **View HTML Report:**
   - In the history page, click **"Report"** link
   - Opens Playwright's HTML report with detailed test results

6. **View Video Recording:**
   - In the history page, click **"🎥 Video"** link
   - Watch the complete test execution video

### Step 7: Verify Test Coverage

Check that all roles were tested:

✅ **Organization Admin** - Full access verified
✅ **Manager** - Department-scoped access verified
✅ **Investigator** - Limited access verified
✅ **HR** - Limited access verified
✅ **Anonymous Reporter** - Submission and tracking verified
✅ **Cross-Role Workflow** - Complete lifecycle verified
✅ **RBAC Enforcement** - All permissions verified

## Test Credentials Reference

### CodeSquare Organization
- **Admin**: `admin@codesquare.com` / `CodeSquare@2024`
- **Investigator**: `investigator@codesquare.com` / `Investigator@2024`

### Al-Bawani Organization
- **Admin**: `admin@al-bawani.com` / `AlBawani@2024`
- **Manager**: `manager@al-bawani.com` / `Manager@2024`
- **HR**: `hr@al-bawani.com` / `HR@2024`

## Troubleshooting

### Issue: "No test files found"
**Solution:**
- Ensure you're in the `whistrust-tester-web` directory
- Check that test files exist in `whistrust-tester-web/tests/`
- Refresh the tester page

### Issue: "Connection refused" or "Port not found"
**Solution:**
- Verify WhisTrust app is running on one of ports 3000-3004
- Check the tester's port detection in logs
- Manually set `TEST_BASE_URL` if needed

### Issue: "Login failed"
**Solution:**
- Verify credentials are correct (see Test Credentials Reference above)
- Ensure users exist in your Supabase database
- Check that organizations (codesquare, al-bawani) exist

### Issue: "Page not found" or "404 errors"
**Solution:**
- Verify the WhisTrust app routes are correct
- Check that the subdomain matches your database
- Ensure middleware is not blocking requests

### Issue: Tests timeout
**Solution:**
- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Verify the WhisTrust app is responsive

## Quick Test Commands

### Run specific test via command line:

```bash
cd whistrust-tester-web

# Run admin test only
npx playwright test tests/organization-admin-complete-flow.spec.ts

# Run manager test only
npx playwright test tests/manager-complete-flow.spec.ts

# Run all role tests
npx playwright test tests/*-complete-flow.spec.ts

# Run with UI (headed mode)
npx playwright test tests/organization-admin-complete-flow.spec.ts --headed

# Run with video
npx playwright test tests/organization-admin-complete-flow.spec.ts --video=on
```

## Expected Test Duration

- **Single Role Test**: 2-5 minutes
- **All Role Tests**: 15-30 minutes
- **Cross-Role Workflow**: 5-10 minutes
- **RBAC Tests**: 10-15 minutes

## Next Steps After Testing

1. **Review Screenshots**: Check all screenshots for visual verification
2. **Check Error Logs**: Review any failures and fix issues
3. **Update Tests**: Modify tests based on findings
4. **Schedule Tests**: Use the Schedule page to set up automated testing
5. **Generate Reports**: Export test results for documentation

## Support

If you encounter issues:
1. Check the test logs in the tester interface
2. Review error logs in the results directory
3. Check browser console for JavaScript errors
4. Verify database connectivity and user permissions

---

**Happy Testing! 🚀**


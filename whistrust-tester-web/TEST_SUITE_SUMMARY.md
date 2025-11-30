# WhisTrust Test Suite Summary

## Overview

Comprehensive automated testing suite for WhisTrust multi-tenant anonymous reporting platform.

## Test Roles

The test suite focuses on **three main user roles**:

1. **Admin** - Full system access
2. **Manager** - Department-level access with analytics
3. **Investigator** - Limited access to assigned cases only

## Test Files

### Core Login Tests
- `superadmin-login.spec.ts` - Super Admin authentication
- `organization-login.spec.ts` - Organization portal login (CodeSquare)

### Role-Based Complete Flows
- `organization-admin-complete-flow.spec.ts` - Full Admin workflow
- `manager-complete-flow.spec.ts` - Manager workflow
- `investigator-complete-flow.spec.ts` - Investigator workflow

### Feature Tests
- `report-submission.spec.ts` - Anonymous report submission
- `anonymous-tracking.spec.ts` - Report tracking functionality
- `anonymous-reporter-complete-flow.spec.ts` - Complete anonymous reporter flow

### Access Control Tests
- `role-based-access.spec.ts` - RBAC enforcement verification
- `cross-role-workflow.spec.ts` - Multi-role workflow testing

## Test Credentials

All tests use the **CodeSquare** organization:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@codesquare.com` | `CodeSquare@2024` |
| Manager | `manager@codesquare.com` | `Manager@2024` |
| Investigator | `investigator@codesquare.com` | `Investigator@2024` |

## Running Tests

### Run All Tests
```bash
cd whistrust-tester-web
npx playwright test
```

### Run Specific Test Suite
```bash
# Admin tests
npx playwright test tests/organization-admin-complete-flow.spec.ts

# Manager tests
npx playwright test tests/manager-complete-flow.spec.ts

# Investigator tests
npx playwright test tests/investigator-complete-flow.spec.ts

# RBAC tests
npx playwright test tests/role-based-access.spec.ts
```

### Run with UI
```bash
npx playwright test --ui
```

## Test Features

- ✅ Automatic port detection (finds WhisTrust app on ports 3000-3004)
- ✅ Comprehensive screenshot capture on every step
- ✅ Detailed error logging with stack traces
- ✅ Video recording of all test runs
- ✅ HTML and JSON reports
- ✅ Organized results in timestamped folders

## Test Results

Results are stored in: `whistrust-tester-web/results/{project}/{test-type}/{environment}/{datetime}/`

Each test run includes:
- Screenshots for every step
- Video recording
- HTML report
- JSON report
- Error logs (if any)

## Setup

See `SETUP_TEST_USERS.md` for instructions on creating test users.


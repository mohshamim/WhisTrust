# WhisTrust Complete Happy Path Test Plan
## CodeSquare Organization End-to-End Flow

This document guides you through testing the complete application flow manually, step-by-step.

---

## Prerequisites

- ✅ App running on `http://localhost:3000` (run `npm run dev`)
- ✅ CodeSquare organization exists in database
- ✅ Test users created (see below)

---

## Test Users for CodeSquare

| Role | Email | Password | Status |
|------|-------|----------|--------|
| **Admin** | `admin@codesquare.com` | `CodeSquare@2024` | ✅ Exists |
| **Manager** | `manager@codesquare.com` | `Manager@2024` | ⚠️ Needs creation |
| **Investigator** | `investigator@codesquare.com` | `Investigator@2024` | ✅ Exists |

---

## Phase 1: Super Admin Verification

### Test 1.1: Super Admin Login
1. Navigate to: `http://localhost:3000/superadmin/login`
2. Login with:
   - Email: `sup-adm@whistrust.com`
   - Password: `sup-pass-adm!1@3#5`
3. **Expected:** Redirect to `/superadmin/dashboard`
4. **Verify:** Dashboard shows organizations, metrics

### Test 1.2: Verify CodeSquare Organization
1. Click **Organizations** in sidebar
2. **Verify:** CodeSquare organization appears in list
3. Click on CodeSquare
4. **Expected:** Organization details load (name, subdomain, status: active)

---

## Phase 2: Organization Admin Setup

### Test 2.1: Admin Login
1. Navigate to: `http://localhost:3000/org/codesquare/login`
2. Login with:
   - Email: `admin@codesquare.com`
   - Password: `CodeSquare@2024`
3. **Expected:** Redirect to `/org/codesquare/dashboard`
4. **Verify:** 
   - Dashboard shows metrics (reports count, users)
   - Sidebar shows all menu items (Dashboard, Reports, Analytics, Audit Logs, Users, Settings)

### Test 2.2: Create Manager User (IF MISSING)
1. Click **Users** in sidebar
2. Click **Add User** button
3. Fill form:
   - Email: `manager@codesquare.com`
   - Full Name: `CodeSquare Manager`
   - Password: `Manager@2024`
   - Role: **Manager**
   - Department: `Operations`
4. Click **Create User**
5. **Expected:** Success message, user appears in table
6. **Verify:** Manager listed with "Manager" badge

### Test 2.3: Verify Investigator User
1. On Users page, search for `investigator@codesquare.com`
2. **Expected:** Investigator user exists
3. **If missing:** Create with:
   - Email: `investigator@codesquare.com`
   - Full Name: `CodeSquare Investigator`
   - Password: `Investigator@2024`
   - Role: **Investigator**
   - Department: `Compliance`

### Test 2.4: Review Settings
1. Click **Settings** in sidebar
2. **Verify:**
   - Organization name: CodeSquare
   - Anonymous reporting: Enabled
   - Monthly limits displayed

---

## Phase 3: Anonymous Report Submission

### Test 3.1: Submit Anonymous Report
1. **Open in incognito/private window:** `http://localhost:3000/org/codesquare/report`
2. Fill form with sample data:
   - **Category:** Fraud & Financial Misconduct
   - **Title:** `Supplier invoicing irregularities detected`
   - **Description:**
     ```
     During routine invoice review, I noticed repeated instances of duplicate invoices from ABC Supplies Ltd. 
     The same invoice numbers appear multiple times with slight variations in amounts. This has been happening 
     for the past 3 months and may represent fraudulent billing practices worth investigating.
     ```
   - **Attachment:** (optional) Upload a test PDF or image
3. Click **Submit Report**
4. **Expected:** Success page appears
5. **Record the tracking code** (e.g., `ZDMZTR7L-85CV`)
6. **Verify:** Success page shows:
   - Green checkmark
   - Tracking code displayed prominently
   - "Track My Case" button
   - "Submit Another Report" button

### Test 3.2: Verify Tracking Code Works Immediately
1. Click **Track My Case** button
2. **Expected:** Redirect to `/track?code=ZDMZTR7L-85CV`
3. **Verify:**
   - Case details load
   - Status shows "submitted"
   - Category shows "fraud"
   - No messages yet

---

## Phase 4: Admin Intake & Assignment

### Test 4.1: Admin Reviews New Report
1. **Switch back to admin session** (or login again as `admin@codesquare.com`)
2. Navigate to: **Reports → All Reports**
3. **Expected:** New report appears at top of list
4. **Verify:**
   - Status badge shows "Submitted"
   - Category shows "Fraud"
   - Submitted date is today

### Test 4.2: Admin Views Report Details
1. Click on the new report
2. **Expected:** Report details page loads
3. **Verify:**
   - Title, description, category visible
   - Tracking code visible
   - Status dropdown present
   - Priority dropdown present
   - "Assign To" dropdown present

### Test 4.3: Admin Updates Status
1. Click **Status** dropdown
2. Select **Under Review**
3. Click **Save** or wait for auto-save
4. **Expected:** Success message or status updates visually
5. **Verify:** Status badge changes to "Under Review"

### Test 4.4: Admin Assigns to Investigator
1. Click **Assign To** dropdown
2. Select `investigator@codesquare.com` (or investigator name)
3. Click **Assign** or **Save**
4. **Expected:** Success message
5. **Verify:** "Assigned to: [Investigator Name]" appears on report

### Test 4.5: Admin Sets Priority
1. Click **Priority** dropdown
2. Select **High**
3. **Expected:** Priority updates to "High"
4. **Verify:** Priority badge or label shows "High"

### Test 4.6: Admin Adds Internal Note
1. Find the "Internal Notes" or "Add Note" section
2. Type: `Initial triage complete. Assigned to investigator for transaction review.`
3. Click **Add Note** or **Save**
4. **Expected:** Note appears in timeline/history
5. **Verify:** Note marked as "Internal" or "Admin"

---

## Phase 5: Investigator Processes Case

### Test 5.1: Investigator Login
1. **Open new incognito window** or logout admin
2. Navigate to: `http://localhost:3000/org/codesquare/login`
3. Login with:
   - Email: `investigator@codesquare.com`
   - Password: `Investigator@2024`
4. **Expected:** Redirect to dashboard
5. **Verify:**
   - Dashboard shows "Assigned to Me" count (should be ≥ 1)
   - Sidebar shows limited menu (no Users, no Settings, no Analytics, no Audit Logs)

### Test 5.2: View Assigned Cases Only
1. Click **Reports** in sidebar
2. **Expected:** Only assigned cases visible
3. **Verify:**
   - New report appears in list
   - Other unassigned reports DON'T appear

### Test 5.3: Investigator Updates Case
1. Click on the assigned report
2. **Verify:** Can view full details
3. Update status to **Investigating**
4. **Expected:** Status updates successfully
5. Add a comment: `Reviewed invoices. Requesting vendor records from procurement.`
6. **Expected:** Comment appears in timeline

### Test 5.4: Investigator Adds Evidence/Updates
1. (Optional) Upload an attachment
2. Add another update: `Confirmed duplicate billing. Preparing findings report.`
3. Change status to **Resolved**
4. **Expected:** All updates save successfully

### Test 5.5: Verify Access Restrictions
1. Try navigating to: `http://localhost:3000/org/codesquare/analytics`
2. **Expected:** Redirect to dashboard or "Access Denied" page
3. Try navigating to: `http://localhost:3000/org/codesquare/users`
4. **Expected:** Redirect to dashboard or "Access Denied"
5. **Verify:** Investigator cannot access restricted pages

---

## Phase 6: Manager Oversight

### Test 6.1: Manager Login
1. **Logout investigator**
2. Login as: `manager@codesquare.com` / `Manager@2024`
3. **Expected:** Dashboard loads with department metrics
4. **Verify:** Sidebar includes Analytics and Audit Logs (manager has access)

### Test 6.2: Manager Reviews Case
1. Navigate to **Reports**
2. **Expected:** Department-filtered reports visible
3. Click on the case
4. **Verify:**
   - Can see investigator updates
   - Can view status history

### Test 6.3: Manager Adjusts Priority/Adds Comment
1. Change priority if needed (e.g., High → Medium)
2. Add comment: `Reviewed investigator findings. Approved for closure.`
3. **Expected:** Updates save successfully
4. **Verify:** Timeline shows manager's comment

### Test 6.4: Manager Accesses Analytics
1. Click **Analytics** in sidebar
2. **Expected:** Analytics page loads
3. **Verify:**
   - Charts/graphs render
   - Data includes department metrics

### Test 6.5: Verify Manager Restrictions
1. Try navigating to: `http://localhost:3000/org/codesquare/users`
2. **Expected:** Redirect or Access Denied
3. **Verify:** Manager cannot manage users

---

## Phase 7: Admin Final Closure

### Test 7.1: Admin Closes Case
1. **Switch back to admin** (logout manager, login as admin)
2. Navigate to **Reports → All Reports**
3. Open the test case
4. **Verify:** See full history (admin notes, investigator updates, manager comments)
5. Change status to **Closed**
6. Add final note: `Case closed. Vendor contract terminated. Policy updated.`
7. **Expected:** Case marked as Closed

### Test 7.2: Verify Analytics Updated
1. Navigate to **Analytics**
2. **Expected:** Metrics reflect the closed case
3. **Verify:**
   - Total reports count increased
   - Fraud category count increased
   - Resolution time calculated

### Test 7.3: Check Audit Logs
1. Navigate to **Audit Logs**
2. **Expected:** All actions logged
3. **Verify entries for:**
   - Report submitted
   - Status changed (Submitted → Under Review → Investigating → Resolved → Closed)
   - Case assigned to investigator
   - Priority set to High
   - Notes added by admin, investigator, manager

---

## Phase 8: Reporter Tracks Final Status

### Test 8.1: Track Case with Code
1. **In incognito window**, navigate to: `http://localhost:3000/track`
2. Enter tracking code: `ZDMZTR7L-85CV` (use your actual code from Phase 3)
3. Click **View Case**
4. **Expected:** Case details load
5. **Verify:**
   - Status shows "Closed"
   - Timeline shows status progression
   - Public messages visible (if any were sent to reporter)

### Test 8.2: Reporter Sends Message
1. In message box, type: `Thank you for investigating this matter.`
2. Click **Send**
3. **Expected:** Message appears immediately
4. **Verify:** Message marked as "You" (reporter)

### Test 8.3: Admin Responds to Reporter
1. **Switch to admin session**
2. Open the same report
3. Find messages section
4. Send message: `Thank you for reporting. Corrective actions have been taken.`
5. **Expected:** Message sent successfully

### Test 8.4: Reporter Sees Response
1. **Switch to tracking page** (incognito window)
2. **If realtime is working:** Message appears automatically
3. **If not realtime:** Refresh page, then click "View Case" again
4. **Expected:** Admin's message appears
5. **Verify:** Message marked as "Compliance Team"

---

## Phase 9: Cross-Browser & Edge Cases

### Test 9.1: Submit Report Without Attachment
1. Submit another report without file upload
2. **Expected:** Submission succeeds (file is optional)
3. **Verify:** No file upload errors

### Test 9.2: Track Non-Existent Code
1. Navigate to `/track`
2. Enter invalid code: `INVALID123`
3. Click **View Case**
4. **Expected:** Error message "Report not found"

### Test 9.3: Submit Report with Contact Info
1. Go to `/org/codesquare/report`
2. Fill form
3. Check ☑️ "I would like to provide my contact information"
4. Enter:
   - Name: `Jane Doe`
   - Email: `jane.doe@example.com`
5. Submit
6. **Expected:** Report submitted with optional contact info
7. **Verify:** Admin can see reporter email in report details

---

## Known Issues to Watch For

1. **File Upload Errors:**
   - ✅ FIXED: Service role key error (now uses server-side API)
   - Watch for: File size > 10MB rejection

2. **Tracking Page Errors:**
   - ✅ FIXED: "Error fetching report" (now uses server-side API)
   - Watch for: Invalid tracking codes

3. **Manager Tests:**
   - ⚠️ REQUIRES: Manager user creation first
   - Watch for: Login redirect failures

---

## Success Criteria

### Must Pass:
- [ ] Report submission works (with and without attachments)
- [ ] Tracking code generated and functional
- [ ] Admin can view, assign, and update reports
- [ ] Investigator sees only assigned cases
- [ ] Manager has department-scoped access
- [ ] Status workflow: Submitted → Under Review → Investigating → Resolved → Closed
- [ ] Messages work bidirectionally (reporter ↔ admin)
- [ ] Analytics reflect case data
- [ ] Audit logs capture all actions

### Should Pass:
- [ ] Realtime messages work
- [ ] File uploads/downloads work
- [ ] Search and filters work
- [ ] Export functionality works (if implemented)
- [ ] Email notifications sent (if configured)

---

## Automated Test Validation

After manual testing, run Playwright suites to confirm:

```bash
cd whistrust-tester-web

# Basic logins
npx playwright test tests/superadmin-login.spec.ts
npx playwright test tests/organization-login.spec.ts

# Anonymous flows
npx playwright test tests/anonymous-reporter-complete-flow.spec.ts
npx playwright test tests/anonymous-tracking.spec.ts

# Role flows (after manager created)
npx playwright test tests/organization-admin-complete-flow.spec.ts
npx playwright test tests/investigator-complete-flow.spec.ts
npx playwright test tests/manager-complete-flow.spec.ts

# Comprehensive
npx playwright test tests/cross-role-workflow.spec.ts
npx playwright test tests/role-based-access.spec.ts
```

---

## Reporting Issues

For each issue found:
1. Note the exact step where it occurred
2. Capture screenshot if possible
3. Check browser console for errors
4. Note the user role when error happened
5. Report to developer with:
   - Page URL
   - User role
   - Expected vs actual behavior
   - Console errors (if any)

---

## Tracking Code from This Test

**Tracking Code:** `ZDMZTR7L-85CV` (use this for tracking tests)

**Associated Report:**
- Category: Fraud
- Status: Will progress through workflow
- Use this code for all Phase 8 tests

---

## Next Steps After Testing

1. ✅ Fix any bugs found
2. ✅ Verify all fixes with re-test
3. ✅ Update test suite with new scenarios
4. ✅ Document any missing features or limitations
5. ✅ Prepare for production deployment


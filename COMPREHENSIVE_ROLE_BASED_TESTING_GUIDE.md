# WhisTrust Comprehensive Role-Based Testing Guide
**Date:** November 9, 2025
**Environment:** Local Development with Supabase Connected
**Testing Type:** Full Integration Testing

---

## 📋 **Testing Prerequisites**

✅ Backend Connected: Supabase configured in `.env.local`
✅ Dev Server Running: `http://localhost:3000`
✅ Test Users Required: Create one user for each role

---

## 🎯 **Test Plan Overview**

This guide will test:
1. ✅ Public User (Anonymous Reporter) - Complete Flow
2. ✅ Admin Role - Full Access & Permissions
3. ✅ Manager Role - Department-level Access
4. ✅ Investigator Role - Limited Access
5. ✅ HR Role - HR-specific Access

---

# 1️⃣ PUBLIC USER TESTING (Anonymous Reporter)

## Test 1.1: Report Submission (NEW FIX VALIDATION)
**URL:** `http://localhost:3000/report`

### Steps:
1. Open report page
2. Click Category dropdown
3. Select "Harassment & Discrimination"
4. Type in Description: "This is a comprehensive test to verify the new validation logic works correctly with backend integration and that all form fields are properly validated before submission with minimum character requirements met."

### Expected Results:
✅ **Validation Feedback:**
   - Initially shows: "Please select a category. Please provide at least 50 more characters..."
   - After category: Only shows character count needed
   - After 50+ chars: Feedback disappears
   
✅ **Character Counter:**
   - Shows "0/50" initially (gray)
   - Updates in real-time as typing
   - Turns **green** when 50+ characters
   - Shows "165/50" (or actual count)

✅ **Submit Button:**
   - Disabled (gray) initially
   - **Cursor: not-allowed** when disabled
   - **Enables after 50+ characters**
   - **Cursor: pointer** when enabled
   - Click to submit

✅ **After Submission:**
   - Redirects to `/success?code=XXXXXX`
   - Displays tracking code
   - "Copy" button works
   - Shows "✓ Code Copied!" for 2 seconds when clicked
   - Code saved in sessionStorage

**Pass Criteria:**
- [ ] All validations work correctly
- [ ] Form submits successfully
- [ ] Tracking code generated (7 characters)
- [ ] Redirects to success page
- [ ] Copy functionality works

---

## Test 1.2: Case Tracking
**URL:** `http://localhost:3000/track`

### Steps:
1. Paste/type tracking code from previous test
2. Click "View Case"

### Expected Results:
✅ **Case Details Display:**
   - Tracking Code: (your 7-char code)
   - Category: "Harassment & Discrimination"
   - Submitted: (today's date)
   - Status Badge: **Yellow "Pending"** (visible, not subtle)

✅ **Status Badge Verification:**
   - Background: Light yellow (`bg-yellow-500/15`)
   - Text: Dark yellow (`text-yellow-700`)
   - Border: Yellow 2px (`border-yellow-500/50 border-2`)
   - **Highly visible** (not gray/subtle)

✅ **Messages Section:**
   - Shows "No messages yet" initially
   - "Live" indicator (green with pulsing icon)
   - Message input box present
   - Send button (paper airplane icon)

**Pass Criteria:**
- [ ] Case details load correctly
- [ ] Status badge is highly visible (yellow)
- [ ] Messages section renders
- [ ] Real-time connection established ("Live" shows)

---

## Test 1.3: Real-time Messaging (Public User)
**Keep browser on track page**

### Steps:
1. Type a message: "Test message from reporter"
2. Click Send (or press Enter)

### Expected Results:
✅ **Message Sent:**
   - Message appears immediately in left column
   - Shows "You" as sender
   - Timestamp displayed
   - Message box clears after send
   - Smooth animation

✅ **Real-time Indicator:**
   - Green "Live" badge stays visible
   - No disconnection

**Pass Criteria:**
- [ ] Message sends successfully
- [ ] Appears in conversation instantly
- [ ] UI updates smoothly
- [ ] No errors in console

---

# 2️⃣ ADMIN ROLE TESTING (Full Access)

## Test 2.1: Admin Authentication
**URL:** `http://localhost:3000/admin/login`

### Test Data Needed:
Create test admin user in Supabase:
- Email: `admin@test.com`
- Password: `AdminTest123!`
- Role: `admin`
- Department: (any or null)

### Steps:
1. Enter email: `admin@test.com`
2. Enter password: `AdminTest123!`
3. Click "Sign In"

### Expected Results:
✅ **Successful Login:**
   - Redirects to `/admin/dashboard`
   - No error messages
   - Session established

**Pass Criteria:**
- [ ] Login successful
- [ ] Redirects to dashboard
- [ ] No authentication errors

---

## Test 2.2: Admin Dashboard Access
**URL:** Should auto-redirect after login

### Expected Results:
✅ **Dashboard Components:**
   - Title: "Dashboard"
   - Welcome message: "Welcome back, Admin" (or similar)
   - **4 Metric Cards:**
     - Total Cases (shows count)
     - Pending Cases (yellow badge with count)
     - In Progress (blue badge with count)
     - Resolved This Month (green badge with count)
   
✅ **Analytics Chart:**
   - "Last 7 days" activity chart visible
   - Interactive (can hover)
   - Shows data points

✅ **Recent Cases Section:**
   - Shows latest cases (including test case)
   - Each displays:
     - Tracking code
     - Category
     - Timestamp
     - Status badge (color-coded)
   - Click to view details

✅ **Navigation Sidebar:**
   - Shows all admin options:
     - Dashboard ✓
     - All Cases (with submenu)
     - Analytics ✓
     - Audit Logs ✓
     - Users ✓
     - Settings

**Pass Criteria:**
- [ ] All dashboard components render
- [ ] Metrics show actual data
- [ ] Chart displays correctly
- [ ] Recent cases visible
- [ ] All navigation items present

---

## Test 2.3: Admin - View All Cases (All Departments)
**URL:** `http://localhost:3000/admin/cases`

### Expected Results:
✅ **Cases Table:**
   - Shows **ALL cases** (not filtered by department)
   - Columns: Tracking Code, Category, Status, Priority, Actions
   - Test case from earlier appears
   - Status badges color-coded:
     - Pending = Yellow
     - Under Review = Blue
     - In Progress = Amber
     - Resolved = Green
     - Closed = Gray

✅ **Filters Work:**
   - Search by tracking code
   - Filter by status (dropdown)
   - Filter by priority (Low/Medium/High)
   - Results update on filter change

✅ **Click Case to Open Drawer:**
   - Click eye icon or row
   - Drawer slides from right
   - **Close button visible** (X in top-right corner) ✓

**Pass Criteria:**
- [ ] All cases visible (not department-filtered)
- [ ] Filters work correctly
- [ ] Case details drawer opens
- [ ] Close button present and functional

---

## Test 2.4: Admin - Case Details Drawer
**Open any case from table**

### Expected Results:
✅ **Drawer Header:**
   - Title: "Case Details"
   - Tracking code displayed
   - **Status badge** (color-coded, highly visible)
   - **X close button** in top-right corner

✅ **Case Information Card:**
   - Category shown
   - Created date/time
   - Full description
   - Reporter info (if provided)

✅ **Assignment Section:**
   - Dropdown with all users
   - Can assign to any user (Admin privilege)
   - Shows current assignee or "Unassigned"

✅ **Priority Section:**
   - Current priority badge
   - Dropdown: Low, Medium, High
   - **Admin can edit** (not disabled)

✅ **Labels Section:**
   - Can add custom labels with colors
   - Can remove labels
   - Visual tag display

✅ **Attachments Section:**
   - Shows uploaded files (if any)
   - Download button for each file
   - File name, size, type displayed

✅ **Messages Section:**
   - Shows conversation with reporter
   - Can send messages
   - Real-time sync ("Live" indicator)

✅ **Footer Actions:**
   - Status dropdown
   - "Update Status" button

**Pass Criteria:**
- [ ] All drawer sections render correctly
- [ ] Admin can assign to ANY user
- [ ] Admin can edit priority
- [ ] Admin can manage labels
- [ ] Admin can send messages
- [ ] Admin can update status
- [ ] Close button works

---

## Test 2.5: Admin - Analytics Page
**URL:** `http://localhost:3000/admin/analytics`

### Expected Results:
✅ **Page Access:**
   - Admin has access (no "Access Denied")
   
✅ **Metrics Display:**
   - Total submissions
   - Average resolution time
   - Charts/graphs render
   - Data is accurate

**Pass Criteria:**
- [ ] Page accessible to Admin
- [ ] Analytics display correctly
- [ ] Data reflects actual database state

---

## Test 2.6: Admin - Audit Logs
**URL:** `http://localhost:3000/admin/audit-logs`

### Expected Results:
✅ **Page Access:**
   - Admin has access
   
✅ **Audit Entries:**
   - Shows user actions
   - Timestamps displayed
   - Action types listed
   - Can filter/search

**Pass Criteria:**
- [ ] Page accessible to Admin
- [ ] Audit logs display
- [ ] Shows recent actions

---

## Test 2.7: Admin - User Management
**URL:** `http://localhost:3000/admin/users`

### Expected Results:
✅ **Page Access:**
   - **Only Admin** has access
   
✅ **User List:**
   - Shows all users
   - Displays: Name, Email, Role, Department
   
✅ **Actions Available:**
   - Add new user
   - Edit existing user
   - Delete user (with confirmation)
   - Assign roles
   - Assign department (for Managers)

**Pass Criteria:**
- [ ] Page accessible ONLY to Admin
- [ ] All users listed
- [ ] CRUD operations work
- [ ] Role assignment works
- [ ] Department assignment works

---

# 3️⃣ MANAGER ROLE TESTING (Department-Level Access)

## Test 3.1: Manager Authentication
**URL:** `http://localhost:3000/admin/login`

### Test Data Needed:
Create test manager user:
- Email: `manager@test.com`
- Password: `ManagerTest123!`
- Role: `manager`
- Department: `HR` (or any department)

### Steps:
1. Logout from admin account (if logged in)
2. Login with manager credentials

**Pass Criteria:**
- [ ] Login successful
- [ ] Redirects to dashboard

---

## Test 3.2: Manager - Dashboard (Same as Admin)
**Should see dashboard similar to Admin**

### Expected Results:
✅ **Same components as Admin:**
   - Metrics cards
   - Analytics chart
   - Recent cases
   - **BUT** data may be department-filtered

**Pass Criteria:**
- [ ] Dashboard accessible
- [ ] Components render
- [ ] Data shows (may be filtered)

---

## Test 3.3: Manager - Department Filtering (CRITICAL TEST)
**URL:** `http://localhost:3000/admin/cases`

### Expected Results:
✅ **Department Filter Active:**
   - Shows **ONLY** cases from Manager's department
   - **Test:** Create a case in different department as Admin
   - **Manager should NOT see** cases from other departments
   
✅ **Cases Table:**
   - Only department cases visible
   - Count reflects filtered results
   - All columns display correctly

**Critical RBAC Test:**
1. As Admin: Create case in Department A
2. As Manager (assigned to Department B): Should NOT see Department A case
3. As Manager: Should only see Department B cases

**Pass Criteria:**
- [ ] Manager sees ONLY own department cases
- [ ] Cases from other departments HIDDEN
- [ ] Department filtering working correctly

---

## Test 3.4: Manager - Case Assignment (Department-Only)
**Open a case from Manager's department**

### Expected Results:
✅ **Assignment Dropdown:**
   - Shows **ONLY users from same department**
   - Cannot assign to users from other departments
   - Can assign to self

**Critical RBAC Test:**
- Assignment dropdown should be **filtered by department**
- Users from other departments should NOT appear

**Pass Criteria:**
- [ ] Can only assign within department
- [ ] Assignment dropdown filtered correctly
- [ ] Can successfully assign case

---

## Test 3.5: Manager - Permissions Matrix

**Test these features:**

| Feature | Expected Result |
|---------|-----------------|
| View all cases | ❌ Only own department |
| Assign cases | ✅ Within department only |
| Edit reports | ✅ Yes (department cases) |
| View analytics | ✅ Yes |
| View audit logs | ✅ Yes |
| Manage users | ❌ No access |
| Change status | ✅ Yes |
| Update priority | ✅ Yes |
| Send messages | ✅ Yes |

**Navigate to `/admin/users`:**
- Should show **"Access Denied"** page

**Pass Criteria:**
- [ ] Manager permissions match matrix
- [ ] User management blocked
- [ ] All other features accessible

---

# 4️⃣ INVESTIGATOR ROLE TESTING (Limited Access)

## Test 4.1: Investigator Authentication
**URL:** `http://localhost:3000/admin/login`

### Test Data:
- Email: `investigator@test.com`
- Password: `InvestigatorTest123!`
- Role: `investigator`
- Department: (any)

### Steps:
1. Logout from manager account
2. Login with investigator credentials

**Pass Criteria:**
- [ ] Login successful
- [ ] Redirects to dashboard

---

## Test 4.2: Investigator - Limited Navigation
**Check sidebar navigation**

### Expected Results:
✅ **Navigation Should Show:**
   - Dashboard
   - All Cases (assigned cases only)
   - Settings

❌ **Navigation Should NOT Show:**
   - Analytics (no access)
   - Audit Logs (no access)
   - Users (no access)

**Pass Criteria:**
- [ ] Limited navigation items
- [ ] Analytics/Audit/Users hidden

---

## Test 4.3: Investigator - Cases Access (Assigned Only)
**URL:** `http://localhost:3000/admin/cases`

### Expected Results:
✅ **Cases Visibility:**
   - Shows **ONLY assigned cases**
   - Cannot see unassigned cases
   - Cannot see cases assigned to others

**Critical Test:**
1. As Admin: Assign case to investigator
2. As Investigator: Should see that case
3. As Admin: Assign another case to different user
4. As Investigator: Should NOT see the other case

**Pass Criteria:**
- [ ] Only sees assigned cases
- [ ] Cannot view cases assigned to others
- [ ] Cannot view unassigned cases

---

## Test 4.4: Investigator - Case Actions (Limited)
**Open an assigned case**

### Expected Results:
✅ **Can Do:**
   - View case details
   - Edit case description
   - Update priority
   - Change status
   - Send messages
   - View attachments

❌ **Cannot Do:**
   - **Assign cases** (dropdown should be disabled or hidden)
   - View analytics
   - Access audit logs
   - Manage users

**Pass Criteria:**
- [ ] Can edit assigned cases
- [ ] CANNOT assign cases
- [ ] All other actions work

---

## Test 4.5: Investigator - Access Restrictions

**Navigate to Restricted Pages:**

| URL | Expected Result |
|-----|-----------------|
| `/admin/analytics` | ❌ Access Denied |
| `/admin/audit-logs` | ❌ Access Denied |
| `/admin/users` | ❌ Access Denied |

**Pass Criteria:**
- [ ] All restricted pages show "Access Denied"
- [ ] Cannot bypass restrictions

---

# 5️⃣ HR ROLE TESTING (HR-Specific Access)

## Test 5.1: HR Authentication
**URL:** `http://localhost:3000/admin/login`

### Test Data:
- Email: `hr@test.com`
- Password: `HRTest123!`
- Role: `hr`
- Department: `HR`

### Steps:
1. Logout from investigator account
2. Login with HR credentials

**Pass Criteria:**
- [ ] Login successful
- [ ] Redirects to dashboard

---

## Test 5.2: HR - Limited Dashboard
**Should see dashboard with limited data**

### Expected Results:
✅ **Dashboard Shows:**
   - Basic metrics (may be filtered)
   - Recent cases (HR-related only)

**Pass Criteria:**
- [ ] Dashboard accessible
- [ ] Shows relevant data

---

## Test 5.3: HR - HR Cases Only
**URL:** `http://localhost:3000/admin/cases`

### Expected Results:
✅ **Cases Filtering:**
   - Shows **HR-related cases only**
   - May be filtered by category or department
   - Limited case visibility

**Pass Criteria:**
- [ ] Sees HR-relevant cases
- [ ] Cannot see non-HR cases

---

## Test 5.4: HR - Permissions Matrix

| Feature | Expected Result |
|---------|-----------------|
| View all cases | ❌ HR cases only |
| Assign cases | ❌ No access |
| Edit reports | ⚠️ Limited |
| View analytics | ❌ No access |
| View audit logs | ❌ No access |
| Manage users | ❌ No access |
| Change status | ❌ No access |
| Update priority | ❌ No access |
| Send messages | ✅ Yes |
| View case details | ✅ Yes (HR cases) |

**Pass Criteria:**
- [ ] HR permissions match matrix
- [ ] Most features restricted
- [ ] Can view and message HR cases

---

# 6️⃣ CROSS-ROLE INTEGRATION TESTS

## Test 6.1: End-to-End Report Flow

**Scenario:** Reporter → Admin → Manager → Investigator

### Steps:
1. **As Public User:**
   - Submit report (get tracking code)
   
2. **As Admin:**
   - Verify case appears in dashboard
   - Assign to Manager
   - Send message to reporter
   
3. **As Public User:**
   - Check tracking page
   - Verify message received (real-time)
   - Reply to message
   
4. **As Manager:**
   - Verify case assigned
   - Re-assign to Investigator
   - Update status to "Under Review"
   
5. **As Investigator:**
   - Verify case assigned
   - Update priority to "High"
   - Update status to "In Progress"
   - Send message to reporter
   
6. **As Public User:**
   - Verify status changed (real-time)
   - Verify priority changed
   - Verify message received

**Pass Criteria:**
- [ ] Full flow works end-to-end
- [ ] All role actions successful
- [ ] Real-time updates work
- [ ] No permission errors
- [ ] No data integrity issues

---

## Test 6.2: Real-time Sync Test

**Setup:** Have 2 browser windows open
- Window 1: Admin on `/admin/cases` (case details drawer open)
- Window 2: Public user on `/track` (same case)

### Test Steps:
1. Window 2 (Public): Send message
2. Window 1 (Admin): Verify message appears instantly
3. Window 1 (Admin): Reply to message
4. Window 2 (Public): Verify reply appears instantly

**Pass Criteria:**
- [ ] Messages sync in real-time
- [ ] Both sides update instantly
- [ ] "Live" indicator shows on both

---

# 7️⃣ FEATURE COMPLETENESS CHECKLIST

## Core Features:

- [ ] Anonymous report submission ✅
- [ ] Tracking code generation ✅
- [ ] Case tracking ✅
- [ ] Real-time messaging ✅
- [ ] Multi-role authentication ✅
- [ ] RBAC enforcement ✅
- [ ] Department filtering (Manager) ✅
- [ ] Case assignment ✅
- [ ] Priority management ✅
- [ ] Status updates ✅
- [ ] Label management ✅
- [ ] File uploads ✅
- [ ] File downloads ✅
- [ ] Analytics (Admin/Manager) ✅
- [ ] Audit logs (Admin/Manager) ✅
- [ ] User management (Admin only) ✅

## UI/UX Features:

- [ ] Enhanced form borders (2px, darker) ✅
- [ ] Color-coded status badges ✅
- [ ] Drawer close button ✅
- [ ] Character counter ✅
- [ ] Form validation feedback ✅
- [ ] "Code Copied!" confirmation ✅
- [ ] Responsive design ✅
- [ ] Dark mode support ✅
- [ ] Accessibility features ✅

---

# 8️⃣ SECURITY & RBAC VERIFICATION

## Critical Security Tests:

### Test 8.1: URL Direct Access (RBAC Bypass Attempt)

**As Manager, try to access:**
- [ ] `/admin/users` → Should show "Access Denied"

**As Investigator, try to access:**
- [ ] `/admin/analytics` → Should show "Access Denied"
- [ ] `/admin/audit-logs` → Should show "Access Denied"
- [ ] `/admin/users` → Should show "Access Denied"

**As HR, try to access:**
- [ ] `/admin/analytics` → Should show "Access Denied"
- [ ] `/admin/audit-logs` → Should show "Access Denied"
- [ ] `/admin/users` → Should show "Access Denied"

### Test 8.2: API Bypass Attempt (Developer Tools)

**Open browser console, try direct API calls:**
- Attempt to fetch cases outside user's scope
- Should be blocked by server-side RLS

**Pass Criteria:**
- [ ] All RBAC restrictions enforced
- [ ] No bypass possible via URL
- [ ] Server-side security active

---

# 9️⃣ REGRESSION TESTING

## Test Recent Fixes:

### ✅ Report Form Fix:
- [ ] Validation works correctly
- [ ] Button enables properly
- [ ] Feedback messages display

### ✅ Status Badges:
- [ ] All status colors visible
- [ ] Badges have 2px borders
- [ ] Pending is yellow (not gray)

### ✅ Form Field Borders:
- [ ] All inputs have 2px borders
- [ ] Borders are darker (more visible)
- [ ] Applied to: Input, Textarea, Select

### ✅ Plan Page Buttons:
- [ ] Essential/Professional → `/demo`
- [ ] Enterprise → `/contact`

### ✅ Drawer Close Button:
- [ ] X button visible in case details
- [ ] Clicking closes drawer

---

# 🎯 **TESTING EXECUTION SUMMARY**

## Recommended Testing Order:

1. **Start with Public User** (no authentication needed)
   - Easiest to verify
   - Tests core functionality
   
2. **Test Admin** (full access)
   - Create test users for other roles
   - Verify all features work
   
3. **Test Manager** (department filtering)
   - Most critical RBAC test
   - Verify filtering works
   
4. **Test Investigator** (limited access)
   - Verify restrictions
   
5. **Test HR** (specialized access)
   - Verify HR filtering

6. **Cross-role Integration Tests**
   - End-to-end flows
   - Real-time sync

---

## 📊 **Results Tracking Template**

Use this format to track results:

```
✅ PASSED
⚠️ PARTIAL (with notes)
❌ FAILED (with details)
```

For each test, note:
- Test ID
- Status (✅/⚠️/❌)
- Notes/Issues found
- Screenshots (if applicable)

---

## 🐛 **Issue Reporting Format**

If you find issues, document as:

```
Issue #X: [Brief Description]
- Severity: [High/Medium/Low]
- Role: [Which role]
- Steps to Reproduce: [Detailed steps]
- Expected: [What should happen]
- Actual: [What actually happens]
- Screenshots: [If available]
```

---

## 📝 **Final Deliverable**

After completing all tests, create summary report with:
- Total tests executed
- Pass/Fail counts
- Critical issues found
- Role-specific findings
- Recommendations

---

**Ready to start testing?** Begin with Test 1.1 (Public User - Report Submission) and work through systematically! 🚀

Let me know the results and I'll help resolve any issues found!

---


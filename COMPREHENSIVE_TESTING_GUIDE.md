# WhisTrust Comprehensive Testing Guide

**Version:** 1.0  
**Date:** January 2025  
**Purpose:** Complete end-to-end testing guide for all flows, features, and user roles

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment URLs](#environment-urls)
3. [User Roles & Credentials](#user-roles--credentials)
4. [Sample Test Content](#sample-test-content)
5. [Testing Flows by Role](#testing-flows-by-role)
6. [Feature-by-Feature Testing](#feature-by-feature-testing)
7. [End-to-End Scenarios](#end-to-end-scenarios)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Production Testing Requirements

- Access to production URLs (see below)
- Valid credentials for each role
- Browser with developer tools enabled
- Internet connection

---

## Environment URLs

### Production URLs

| Portal | URL |
|--------|-----|
| Homepage | `https://www.whistrust.com` |
| **Multi-Tenant AISAR** | |
| AISAR Report | `https://www.whistrust.com/org/aisar/report` |
| AISAR Track | `https://www.whistrust.com/org/aisar/track` |
| AISAR Admin Login | `https://www.whistrust.com/org/aisar/login` |
| AISAR Admin Dashboard | `https://www.whistrust.com/org/aisar/dashboard` |
| AISAR Admin Cases | `https://www.whistrust.com/org/aisar/reports` |
| **Multi-Tenant CodeSquare** | |
| CodeSquare Report | `https://www.whistrust.com/org/codesquare/report` |
| CodeSquare Track | `https://www.whistrust.com/org/codesquare/track` |
| CodeSquare Admin Login | `https://www.whistrust.com/org/codesquare/login` |
| CodeSquare Admin Dashboard | `https://www.whistrust.com/org/codesquare/dashboard` |
| CodeSquare Admin Cases | `https://www.whistrust.com/org/codesquare/reports` |
| **Super Admin** | |
| Super Admin Login | `https://www.whistrust.com/superadmin/login` |
| Super Admin Dashboard | `https://www.whistrust.com/superadmin/dashboard` |
| Super Admin Organizations | `https://www.whistrust.com/superadmin/organizations` |
| **Test & Diagnostics** | |
| Connection Test | `https://www.whistrust.com/test/connection` |

---

## User Roles & Credentials

### 1. Super Admin (Platform-wide)

**Purpose:** Manage all organizations and platform settings

| Field | Value |
|-------|-------|
| **Portal** | Super Admin |
| **URL** | `/superadmin/login` |
| **Email** | `sup-adm@whistrust.com` |
| **Password** | `sup-pass-adm!1@3#5` |
| **Role** | Super Admin |
| **Organization** | Platform (no tenant) |
| **Permissions** | Full platform access, create/manage organizations |

---

### 2. AISAR Admin (Multi-Tenant)

**Purpose:** Test multi-tenant organization features

| Field | Value |
|-------|-------|
| **Portal** | AISAR Tenant Admin |
| **URL** | `/org/aisar/login` |
| **Email** | `admin@aisar.com` |
| **Password** | `Aisar@123!` |
| **Role** | Admin |
| **Organization** | `aisar` |
| **Subdomain** | `aisar` |
| **Permissions** | Full access to AISAR portal |

**Note:** Additional AISAR users (Manager, HR) can be created through the admin portal.

---

### 3. CodeSquare Admin (Multi-Tenant)

**Purpose:** Test multi-tenant organization features

| Field | Value |
|-------|-------|
| **Portal** | CodeSquare Tenant Admin |
| **URL** | `/org/codesquare/login` |
| **Email** | `admin@codesquare.com` |
| **Password** | Set during user creation |
| **Role** | Admin |
| **Organization** | `codesquare` |
| **Subdomain** | `codesquare` |
| **Permissions** | Full access to CodeSquare portal |

---

### 4. Anonymous Reporter (No Login Required)

**Purpose:** Submit reports anonymously

| Field | Value |
|-------|-------|
| **Portal** | Public Report Form |
| **URL** | `/org/{subdomain}/report` (multi-tenant) |
| **Authentication** | None (anonymous) |
| **Access Method** | Tracking code only |
| **Permissions** | Submit reports, track cases, send messages |

---

## Sample Test Content

### Report Categories

1. **Fraud & Financial Misconduct**
2. **Harassment & Discrimination**
3. **Safety Violations**
4. **Ethics Violations**
5. **Data Privacy Breaches**
6. **Retaliation**
7. **Other**

### Sample Report Descriptions

#### Sample 1: Fraud Report (50+ characters)
```
I have discovered evidence of financial fraud in the accounting department. 
Multiple invoices have been falsified over the past 6 months, totaling 
approximately $250,000. The invoices appear to be for services that were 
never rendered. I have attached supporting documents showing the discrepancies.
```

#### Sample 2: Harassment Report (50+ characters)
```
I have been experiencing ongoing harassment from my supervisor for the past 
3 months. The behavior includes inappropriate comments, unwanted physical 
contact, and threats of retaliation if I report the incidents. I have 
witnesses who can corroborate these events.
```

#### Sample 3: Safety Violation (50+ characters)
```
There are serious safety violations in the manufacturing facility. 
Emergency exits are blocked, fire extinguishers are expired, and workers 
are not provided with required protective equipment. This poses immediate 
danger to all employees.
```

#### Sample 4: Ethics Violation (50+ characters)
```
A senior executive has been accepting gifts from vendors in exchange for 
contracts. This violates our company's ethics policy and creates a conflict 
of interest. I have email evidence of these transactions.
```

### Sample File Attachments

- **Document types:** PDF, DOC, DOCX, TXT, JPG, PNG
- **Size limit:** 10 MB per file
- **Sample files to use:**
  - `test-document.pdf` (any PDF file)
  - `evidence-screenshot.png` (any image file)
  - `email-export.txt` (text file with email content)

### Sample Messages

#### From Reporter:
```
Thank you for acknowledging my report. I have additional information 
that may be relevant. Can I provide more details?
```

#### From Admin:
```
Thank you for your report. We take these matters seriously and have 
assigned an investigator to review your case. We will keep you updated 
through this secure messaging system.
```

---

## Testing Flows by Role

### Flow 1: Anonymous Reporter (End-to-End)

#### 1.1 Submit Report (Multi-Tenant - AISAR)

**Steps:**
1. Navigate to: `https://www.whistrust.com/org/aisar/report`
2. **Select Category:** Choose "Fraud & Financial Misconduct"
3. **Enter Description:** Use Sample Report 1 (Fraud) - ensure 50+ characters
4. **Optional Fields:**
   - Name: `John Doe` (optional)
   - Email: `john.doe@example.com` (optional)
5. **File Attachment (Optional):**
   - Click "Choose File" or drag & drop
   - Select a test PDF or image file
   - Verify upload progress indicator appears
6. **Submit:**
   - Click "Submit Report" button
   - Verify button is enabled (green) when description has 50+ characters
   - Verify button is disabled (gray) if description is too short

**Expected Results:**
- ✅ Form validation works (category required, 50+ characters)
- ✅ Character counter shows "X/50" and turns green at 50+
- ✅ File upload shows progress
- ✅ Success page displays with tracking code
- ✅ Tracking code is copyable
- ✅ Redirect to success page after submission
- ✅ Report submitted to AISAR organization
- ✅ URL shows `/org/aisar/report`
- ✅ Organization branding (if configured)
- ✅ Report is associated with AISAR organization

**Success Page Verification:**
- ✅ Tracking code displayed prominently
- ✅ "Copy Code" button works
- ✅ "Track Your Case" link navigates to track page
- ✅ Instructions displayed clearly

---

#### 1.2 Track Case (Multi-Tenant - AISAR)

**Steps:**
1. Copy tracking code from success page (or use a known tracking code)
2. Navigate to: `https://www.whistrust.com/org/aisar/track`
3. **Enter Tracking Code:**
   - Paste or type tracking code
   - Click "Track Case" or press Enter
4. **Verify Case Details:**
   - Case status displayed (e.g., "Pending", "Under Review")
   - Category shown
   - Description displayed
   - Submitted date/time shown
   - Case number displayed (if assigned)
5. **Test Messaging:**
   - Scroll to messaging section
   - Type a message: "Thank you for acknowledging my report..."
   - Click "Send Message"
   - Verify message appears in thread
   - Verify real-time updates (if admin responds)

**Expected Results:**
- ✅ Tracking code input accepts valid codes
- ✅ Invalid tracking code shows error message
- ✅ Case details load correctly
- ✅ Status badge displays with correct color
- ✅ Message thread displays chronologically
- ✅ New messages appear in real-time
- ✅ Connection status indicator shows online/offline
- ✅ Tracking code works on `/org/aisar/track`
- ✅ Admin can see report in AISAR admin portal
- ✅ Data isolation: report not visible in other organizations

---

#### 1.3 Submit Report (Multi-Tenant - CodeSquare)

**Steps:**
1. Navigate to: `https://www.whistrust.com/org/codesquare/report`
2. Follow same steps as 1.1, but verify:
   - URL shows `/org/codesquare/report`
   - Organization branding (if configured)
   - Report is associated with CodeSquare organization
3. Submit report and save tracking code

**Expected Results:**
- ✅ Report submitted to CodeSquare organization
- ✅ Tracking code works on `/org/codesquare/track`
- ✅ Admin can see report in CodeSquare admin portal
- ✅ Data isolation: report not visible in other organizations

---

### Flow 2: AISAR Admin (Multi-Tenant)

#### 2.1 Login

**Steps:**
1. Navigate to: `https://www.whistrust.com/org/aisar/login`
2. **Enter Credentials:**
   - Email: `admin@aisar.com`
   - Password: `Aisar@123!`
3. Click "Sign In"
4. Verify redirect to AISAR dashboard

**Expected Results:**
- ✅ Login form validates email format
- ✅ Password field is secure (masked)
- ✅ Invalid credentials show error message
- ✅ Successful login redirects to AISAR dashboard
- ✅ Session persists across page refreshes
- ✅ Login works for tenant-specific URL
- ✅ Redirects to `/org/aisar/dashboard`
- ✅ Session scoped to AISAR organization
- ✅ Cannot access other organizations' data

---

#### 2.2 Dashboard Overview

**Steps:**
1. After login, verify AISAR dashboard loads
2. **Verify Organization Context:**
   - Dashboard shows AISAR-specific data
   - Statistics for AISAR reports only
   - Recent reports from AISAR only
3. **Check Statistics:**
   - Total reports count (AISAR only)
   - Pending reports count
   - In-progress reports count
   - Resolved reports count
4. **Check Recent Reports:**
   - List of recent reports (AISAR only)
   - Status badges
   - Priority indicators
5. **Check Navigation:**
   - Sidebar menu items
   - User profile dropdown
   - Logout button

**Expected Results:**
- ✅ Dashboard loads AISAR-specific data
- ✅ Data isolation maintained
- ✅ Statistics cards display correct numbers (AISAR only)
- ✅ Recent reports list loads (AISAR only)
- ✅ Status badges show correct colors
- ✅ Navigation menu works
- ✅ User profile shows correct email/name
- ✅ Reports from other organizations not visible
- ✅ Statistics only reflect AISAR data

---

#### 2.3 View Cases

**Steps:**
1. Navigate to: `https://www.whistrust.com/org/aisar/reports`
2. **Verify Case List:**
   - All reports displayed in table/list
   - Sorting by date (newest first)
   - Status filters (if available)
   - Search functionality (if available)
3. **Open Case Details:**
   - Click on a case to open drawer/sidebar
   - Verify all case information displayed:
     - Tracking code
     - Case number
     - Category
     - Description
     - Status
     - Priority
     - Submitted date
     - Attachments (if any)
     - Message thread

**Expected Results:**
- ✅ Case list loads all reports
- ✅ Case details drawer opens correctly
- ✅ All case information visible
- ✅ Attachments downloadable
- ✅ Message thread displays correctly

---

#### 2.4 Update Case Status

**Steps:**
1. Open a case from the cases list
2. **Change Status:**
   - Find status dropdown/selector
   - Change from "Pending" to "Under Review"
   - Click "Update Status" or "Save"
3. **Verify Update:**
   - Status badge updates in case details
   - Status updates in case list
   - Audit log entry created (if visible)

**Expected Results:**
- ✅ Status dropdown shows all available statuses
- ✅ Status update saves successfully
- ✅ UI updates immediately
- ✅ Toast notification confirms update
- ✅ Status persists after page refresh

**Available Statuses:**
- Pending
- Under Review
- In Progress
- Resolved
- Closed

---

#### 2.5 Update Case Priority

**Steps:**
1. Open a case from the cases list
2. **Change Priority:**
   - Find priority dropdown/selector
   - Change priority (e.g., Low → High)
   - Click "Update" or "Save"
3. **Verify Update:**
   - Priority badge updates
   - Priority updates in case list

**Expected Results:**
- ✅ Priority dropdown shows all options (Low, Medium, High, Critical)
- ✅ Priority update saves successfully
- ✅ UI updates immediately
- ✅ Toast notification confirms update

---

#### 2.6 Assign Case

**Steps:**
1. Open a case from the cases list
2. **Assign to User:**
   - Find assignment dropdown/selector
   - Select a user (e.g., Investigator)
   - Click "Assign" or "Save"
3. **Verify Assignment:**
   - Assigned user name displays in case details
   - Assignment visible in case list
   - Audit log entry created

**Expected Results:**
- ✅ Assignment dropdown shows available users
- ✅ Assignment saves successfully
- ✅ Assigned user name displays correctly
- ✅ Toast notification confirms assignment

---

#### 2.7 Add Internal Notes

**Steps:**
1. Open a case from the cases list
2. **Add Note:**
   - Find "Internal Notes" section
   - Type note: "Initial review completed. Evidence collected."
   - Click "Add Note" or "Save"
3. **Verify Note:**
   - Note appears in notes list
   - Author and timestamp displayed

**Expected Results:**
- ✅ Notes section visible (admin-only)
- ✅ Note saves successfully
- ✅ Notes list displays chronologically
- ✅ Notes not visible to reporter

---

#### 2.8 Add/Remove Labels

**Steps:**
1. Open a case from the cases list
2. **Add Label:**
   - Find "Labels" section
   - Type label: "Urgent" or "Legal Review"
   - Press Enter or click "Add"
3. **Remove Label:**
   - Click X on a label to remove
4. **Verify Labels:**
   - Labels display as badges
   - Labels persist after page refresh

**Expected Results:**
- ✅ Labels can be added
- ✅ Labels can be removed
- ✅ Labels display as colored badges
- ✅ Labels persist in database

---

#### 2.9 Send Message to Reporter

**Steps:**
1. Open a case from the cases list
2. **Send Message:**
   - Scroll to message thread
   - Type message: "Thank you for your report. We have assigned an investigator..."
   - Click "Send Message"
3. **Verify Message:**
   - Message appears in thread
   - Message marked as "Admin" or "You"
   - Timestamp displayed
   - Reporter can see message on track page

**Expected Results:**
- ✅ Message sends successfully
- ✅ Message appears in thread immediately
- ✅ Real-time updates work
- ✅ Message visible to reporter on track page
- ✅ Connection status indicator works

---

#### 2.10 Download Attachments

**Steps:**
1. Open a case with attachments
2. **Download File:**
   - Find "Attachments" section
   - Click on file name or download icon
   - Verify file downloads
3. **Verify File:**
   - File opens correctly
   - File name matches original

**Expected Results:**
- ✅ Attachments list displays
- ✅ Download link works
- ✅ File downloads successfully
- ✅ File integrity maintained

---

#### 2.4 User Management (If Available)

**Steps:**
1. Navigate to user management page (if available)
2. **Create User:**
   - Click "Add User" or "Create User"
   - Fill in:
     - Email: `manager@aisar.com`
     - Full Name: `Manager User`
     - Role: `Manager`
     - Department: `Compliance`
   - Set password or send invitation
   - Click "Create"
3. **Verify User:**
   - User appears in user list
   - User can login with new credentials
   - User has correct role permissions

**Expected Results:**
- ✅ User creation works
- ✅ User receives credentials/invitation
- ✅ User can login
- ✅ Role permissions enforced

---

### Flow 3: CodeSquare Admin (Multi-Tenant)

#### 3.1 Login

**Steps:**
1. Navigate to: `https://www.whistrust.com/org/codesquare/login`
2. **Enter Credentials:**
   - Email: `admin@codesquare.com`
   - Password: (Set during user creation)
3. Click "Sign In"
4. Verify redirect to CodeSquare dashboard

**Expected Results:**
- ✅ Login works for tenant-specific URL
- ✅ Redirects to `/org/codesquare/dashboard`
- ✅ Session scoped to CodeSquare organization
- ✅ Cannot access other organizations' data

---

#### 3.2 Dashboard & Case Management

**Steps:**
1. After login, verify CodeSquare dashboard loads
2. **Verify Organization Context:**
   - Dashboard shows CodeSquare-specific data
   - Statistics for CodeSquare reports only
   - Recent reports from CodeSquare only
3. **Test Case Management:**
   - Navigate to reports page
   - Follow same case management steps as AISAR Admin (2.3-2.10)
   - Verify all features work in CodeSquare context

**Expected Results:**
- ✅ Dashboard loads CodeSquare-specific data
- ✅ Only CodeSquare reports visible
- ✅ All case management features work
- ✅ Data isolation maintained
- ✅ Updates scoped to CodeSquare organization

---

### Flow 4: Super Admin

#### 4.1 Login

**Steps:**
1. Navigate to: `https://www.whistrust.com/superadmin/login`
2. **Enter Credentials:**
   - Email: `sup-adm@whistrust.com`
   - Password: `sup-pass-adm!1@3#5`
3. Click "Sign In"
4. Verify redirect to super admin dashboard

**Expected Results:**
- ✅ Login works
- ✅ Redirects to `/superadmin/dashboard`
- ✅ Platform-wide access granted

---

#### 4.2 Dashboard Overview

**Steps:**
1. After login, verify super admin dashboard loads
2. **Check Platform Statistics:**
   - Total organizations count
   - Total reports across all organizations
   - Active organizations
   - System-wide metrics
3. **Check Navigation:**
   - Organizations menu item
   - Settings menu item
   - Logout button

**Expected Results:**
- ✅ Platform statistics display
- ✅ Navigation menu works
- ✅ User profile shows super admin email

---

#### 4.3 View Organizations

**Steps:**
1. Navigate to: `https://www.whistrust.com/superadmin/organizations`
2. **Verify Organization List:**
   - All organizations displayed
   - Organization details:
     - Name
     - Subdomain
     - Status (Active/Suspended)
     - Plan
     - Created date
     - Report counts
3. **Test Filters/Search:**
   - Filter by status
   - Search by name/subdomain
   - Sort by various columns

**Expected Results:**
- ✅ Organization list loads
- ✅ All organizations visible
- ✅ Filters/search work
- ✅ Sorting works

---

#### 4.4 Create Organization

**Steps:**
1. Navigate to organizations page
2. **Click "Create Organization" or "Add Organization"**
3. **Fill Form:**
   - Name: `Test Organization`
   - Subdomain: `testorg`
   - Plan: `Professional` (or available plan)
   - Status: `Active`
   - Features: Enable/disable features
   - Limits: Set report/user limits
4. **Submit:**
   - Click "Create" or "Save"
   - Verify organization appears in list
5. **Verify Organization:**
   - Organization accessible at `/org/testorg/login`
   - Can create admin user for organization
   - Organization data isolated

**Expected Results:**
- ✅ Organization created successfully
   - ✅ Subdomain validation works
   - ✅ Organization accessible via URL
   - ✅ Data isolation maintained
   - ✅ Toast notification confirms creation

---

#### 4.5 Edit Organization

**Steps:**
1. Click on an organization in the list
2. **Edit Details:**
   - Change status (Active → Suspended)
   - Update plan
   - Modify features
   - Update limits
3. **Save Changes:**
   - Click "Save" or "Update"
   - Verify changes persist

**Expected Results:**
- ✅ Organization details editable
- ✅ Changes save successfully
- ✅ Status changes affect organization access
- ✅ Toast notification confirms update

---

#### 4.6 Suspend Organization

**Steps:**
1. Edit an organization
2. **Change Status to "Suspended"**
3. **Save Changes**
4. **Test Impact:**
   - Try to submit report via `/org/{subdomain}/report`
   - Verify error message: "Organization is not active"
   - Try admin login via `/org/{subdomain}/login`
   - Verify access blocked or limited

**Expected Results:**
- ✅ Status change saves
- ✅ Report submission blocked for suspended org
- ✅ Admin access limited/blocked
- ✅ Toast notification confirms suspension

---

### Flow 5: Role-Based Permissions Testing

#### 5.1 Manager Role

**Login:**
- Create Manager user in AISAR or CodeSquare organization through admin portal
- Use credentials set during user creation

**Test Permissions:**
1. ✅ Can view all reports
2. ✅ Can edit report status
3. ✅ Can edit priority
4. ✅ Can assign cases
5. ✅ Can view audit logs
6. ✅ Can view analytics
7. ✅ Can send messages
8. ✅ Can add labels
9. ❌ Cannot delete reports
10. ❌ Cannot manage users
11. ❌ Cannot manage settings

**Steps:**
1. Login as Manager
2. Navigate to cases/reports page
3. Open a case
4. **Verify UI Elements:**
   - Status dropdown: ✅ Visible and editable
   - Priority dropdown: ✅ Visible and editable
   - Assignment dropdown: ✅ Visible and editable
   - Delete button: ❌ Not visible
   - User management menu: ❌ Not visible
   - Settings menu: ❌ Not visible
5. **Test Actions:**
   - Update status: ✅ Should work
   - Update priority: ✅ Should work
   - Assign case: ✅ Should work
   - Try to access `/admin/users`: ❌ Should be blocked or not visible

**Expected Results:**
- ✅ UI shows/hides elements based on permissions
- ✅ Allowed actions work
- ✅ Restricted actions blocked or hidden

---

#### 5.2 Investigator Role

**Login:**
- Create Investigator user in AISAR or CodeSquare organization through admin portal
- Use credentials set during user creation

**Test Permissions:**
1. ✅ Can view all reports
2. ✅ Can edit report status
3. ✅ Can send messages
4. ✅ Can add labels
5. ❌ Cannot edit priority
6. ❌ Cannot assign cases
7. ❌ Cannot view audit logs
8. ❌ Cannot view analytics
9. ❌ Cannot delete reports
10. ❌ Cannot manage users

**Steps:**
1. Login as Investigator
2. Navigate to cases/reports page
3. Open a case
4. **Verify UI Elements:**
   - Status dropdown: ✅ Visible and editable
   - Priority dropdown: ❌ Not visible or read-only
   - Assignment dropdown: ❌ Not visible or read-only
   - Analytics menu: ❌ Not visible
   - Audit logs menu: ❌ Not visible
5. **Test Actions:**
   - Update status: ✅ Should work
   - Update priority: ❌ Should be blocked
   - Assign case: ❌ Should be blocked
   - Try to access `/admin/analytics`: ❌ Should be blocked

**Expected Results:**
- ✅ UI shows/hides elements based on permissions
- ✅ Allowed actions work
- ✅ Restricted actions blocked or hidden

---

#### 5.3 HR Role

**Login:**
- Create HR user in AISAR or CodeSquare organization through admin portal
- Use credentials set during user creation

**Test Permissions:**
1. ✅ Can view all reports
2. ✅ Can edit report status
3. ✅ Can send messages
4. ✅ Can add labels
5. ❌ Cannot edit priority
6. ❌ Cannot assign cases
7. ❌ Cannot view audit logs
8. ❌ Cannot view analytics
9. ❌ Cannot delete reports
10. ❌ Cannot manage users

**Steps:**
1. Login as HR
2. Follow same steps as Investigator (5.2)
3. Verify same permission restrictions

**Expected Results:**
- ✅ Same as Investigator permissions
- ✅ UI reflects HR role limitations

---

## Feature-by-Feature Testing

### Feature 1: Report Submission

**Test Cases:**

1. **Valid Submission**
   - Category selected
   - Description 50+ characters
   - Optional fields filled
   - File attached (optional)
   - ✅ Should submit successfully

2. **Invalid Submission - Missing Category**
   - Category not selected
   - Description provided
   - ❌ Should show validation error

3. **Invalid Submission - Short Description**
   - Category selected
   - Description < 50 characters
   - ❌ Should show character count error
   - ❌ Submit button disabled

4. **File Upload - Valid File**
   - PDF file < 10 MB
   - ✅ Should upload successfully
   - ✅ Progress indicator shows

5. **File Upload - Invalid Type**
   - Executable file (.exe)
   - ❌ Should reject with error message

6. **File Upload - Too Large**
   - File > 10 MB
   - ❌ Should reject with size limit error

7. **Multi-Tenant Submission**
   - Submit via `/org/aisar/report`
   - ✅ Should associate with AISAR organization
   - ✅ Tracking code works on `/org/aisar/track`

---

### Feature 2: Case Tracking

**Test Cases:**

1. **Valid Tracking Code**
   - Enter valid tracking code
   - ✅ Should load case details
   - ✅ All information displayed

2. **Invalid Tracking Code**
   - Enter random string
   - ❌ Should show "Case not found" error

3. **Empty Tracking Code**
   - Submit without entering code
   - ❌ Should show validation error

4. **Case Status Display**
   - Verify status badge shows correct color
   - ✅ Pending = yellow/orange
   - ✅ Under Review = blue
   - ✅ Resolved = green
   - ✅ Closed = gray

5. **Message Thread**
   - Verify messages display chronologically
   - ✅ Newest messages at bottom
   - ✅ Timestamps displayed
   - ✅ Sender labels (Reporter/Admin) clear

---

### Feature 3: Real-Time Messaging

**Test Cases:**

1. **Send Message from Reporter**
   - Type message and send
   - ✅ Message appears immediately
   - ✅ Admin sees message in real-time

2. **Send Message from Admin**
   - Admin sends message
   - ✅ Message appears in admin view
   - ✅ Reporter sees message on track page in real-time

3. **Connection Status**
   - Verify connection indicator
   - ✅ Shows "Online" when connected
   - ✅ Shows "Offline" when disconnected
   - ✅ Reconnects automatically

4. **Message Persistence**
   - Refresh page
   - ✅ Messages still visible
   - ✅ Message history maintained

---

### Feature 4: Case Management

**Test Cases:**

1. **Status Update**
   - Change status
   - ✅ Saves successfully
   - ✅ UI updates immediately
   - ✅ Audit log entry created

2. **Priority Update**
   - Change priority
   - ✅ Saves successfully
   - ✅ Priority badge updates

3. **Case Assignment**
   - Assign to user
   - ✅ Assignment saves
   - ✅ Assigned user name displays
   - ✅ Audit log entry created

4. **Label Management**
   - Add label
   - ✅ Label appears as badge
   - Remove label
   - ✅ Label removed
   - ✅ Changes persist

5. **Internal Notes**
   - Add note
   - ✅ Note saved
   - ✅ Note visible to admins only
   - ✅ Reporter cannot see notes

---

### Feature 5: File Attachments

**Test Cases:**

1. **Upload Attachment**
   - Upload file during report submission
   - ✅ File uploads successfully
   - ✅ File appears in case details

2. **Download Attachment**
   - Click download link
   - ✅ File downloads
   - ✅ File integrity maintained

3. **Multiple Attachments**
   - Upload multiple files
   - ✅ All files listed
   - ✅ All files downloadable

4. **Attachment Security**
   - Verify attachments not publicly accessible
   - ✅ URLs require authentication
   - ✅ RLS policies enforced

---

### Feature 6: Analytics & Reporting

**Test Cases:**

1. **Dashboard Statistics**
   - Verify counts are accurate
   - ✅ Total reports = sum of all statuses
   - ✅ Statistics update in real-time

2. **Category Statistics**
   - View reports by category
   - ✅ Category breakdown accurate
   - ✅ Charts/graphs display (if available)

3. **Status Distribution**
   - View reports by status
   - ✅ Status counts accurate
   - ✅ Visual representation (if available)

4. **Time-based Analytics**
   - View reports over time
   - ✅ Date ranges work
   - ✅ Trends visible (if available)

---

### Feature 7: User Management

**Test Cases:**

1. **Create User (Admin Only)**
   - Fill user creation form
   - ✅ User created successfully
   - ✅ User receives credentials/invitation

2. **Edit User**
   - Update user details
   - ✅ Changes save
   - ✅ User profile updates

3. **Deactivate User**
   - Deactivate user account
   - ✅ User cannot login
   - ✅ User hidden from lists

4. **Role Assignment**
   - Assign role to user
   - ✅ Role permissions enforced
   - ✅ UI reflects role permissions

---

### Feature 8: Audit Logging

**Test Cases:**

1. **Status Change Logging**
   - Change case status
   - ✅ Audit log entry created
   - ✅ Entry shows: user, action, timestamp, details

2. **Assignment Logging**
   - Assign case
   - ✅ Audit log entry created
   - ✅ Entry shows assignment details

3. **View Audit Logs**
   - Navigate to audit logs page
   - ✅ Logs display chronologically
   - ✅ Filters work (if available)

4. **Audit Log Security**
   - Verify only authorized roles can view
   - ✅ Admin/Manager can view
   - ✅ Investigator/HR cannot view

---

## End-to-End Scenarios

### Scenario 1: Complete Report Lifecycle

**Objective:** Test full cycle from submission to resolution

**Steps:**
1. **Submit Report (Reporter)**
   - Go to `https://www.whistrust.com/org/aisar/report`
   - Submit report with sample content
   - Save tracking code

2. **Track Case (Reporter)**
   - Go to `https://www.whistrust.com/org/aisar/track`
   - Enter tracking code
   - Verify case status is "Pending"
   - Send initial message: "Thank you for acknowledging..."

3. **Admin Review (Admin)**
   - Login as `admin@aisar.com`
   - Navigate to cases/reports
   - Find the submitted report
   - Open case details

4. **Admin Actions (Admin)**
   - Update status to "Under Review"
   - Assign to Investigator
   - Add label: "Urgent"
   - Add internal note: "Initial review completed"
   - Send message to reporter: "We have received your report..."

5. **Reporter Response (Reporter)**
   - Return to track page
   - Verify status updated to "Under Review"
   - See admin message
   - Send reply: "I have additional information..."

6. **Investigation (Investigator)**
   - Login as Investigator
   - View assigned case
   - Update status to "In Progress"
   - Send message: "We are investigating your concerns..."

7. **Resolution (Admin)**
   - Admin updates status to "Resolved"
   - Sends final message: "Your case has been resolved..."
   - Adds internal note: "Investigation complete. Action taken."

8. **Reporter Verification (Reporter)**
   - Reporter checks track page
   - Sees status "Resolved"
   - Reads final message
   - Case complete

**Expected Results:**
- ✅ All steps complete successfully
- ✅ Status updates visible to reporter
- ✅ Messages exchanged in real-time
- ✅ Audit trail complete
- ✅ Data persisted correctly

---

### Scenario 2: Multi-Tenant Data Isolation

**Objective:** Verify organizations cannot access each other's data

**Steps:**
1. **Submit Report to AISAR**
   - Go to `https://www.whistrust.com/org/aisar/report`
   - Submit report
   - Save tracking code

2. **Submit Report to CodeSquare**
   - Go to `https://www.whistrust.com/org/codesquare/report`
   - Submit report
   - Save tracking code

3. **Login as AISAR Admin**
   - Login at `https://www.whistrust.com/org/aisar/login`
   - View reports
   - ✅ Should only see AISAR reports
   - ❌ Should NOT see CodeSquare reports

4. **Login as CodeSquare Admin**
   - Login at `https://www.whistrust.com/org/codesquare/login`
   - View reports
   - ✅ Should only see CodeSquare reports
   - ❌ Should NOT see AISAR reports

5. **Test Tracking Codes**
   - AISAR tracking code on `https://www.whistrust.com/org/aisar/track`: ✅ Works
   - AISAR tracking code on `https://www.whistrust.com/org/codesquare/track`: ❌ Should fail
   - CodeSquare tracking code on `https://www.whistrust.com/org/codesquare/track`: ✅ Works
   - CodeSquare tracking code on `https://www.whistrust.com/org/aisar/track`: ❌ Should fail

**Expected Results:**
- ✅ Complete data isolation
- ✅ Reports only visible to correct organization
- ✅ Tracking codes scoped to organization
- ✅ Admin portals show only their organization's data

---

### Scenario 3: Role Permission Enforcement

**Objective:** Verify RBAC works correctly across all roles

**Steps:**
1. **Create Test Case**
   - Submit a report
   - Admin assigns to Investigator

2. **Test as Admin**
   - Login as Admin
   - ✅ Can view all reports
   - ✅ Can edit status, priority
   - ✅ Can assign cases
   - ✅ Can manage users
   - ✅ Can view analytics
   - ✅ Can view audit logs

3. **Test as Manager**
   - Login as Manager
   - ✅ Can view all reports
   - ✅ Can edit status, priority
   - ✅ Can assign cases
   - ✅ Can view analytics
   - ✅ Can view audit logs
   - ❌ Cannot manage users
   - ❌ Cannot delete reports

4. **Test as Investigator**
   - Login as Investigator
   - ✅ Can view assigned case
   - ✅ Can edit status
   - ✅ Can send messages
   - ❌ Cannot edit priority
   - ❌ Cannot assign cases
   - ❌ Cannot view analytics
   - ❌ Cannot view audit logs

5. **Test as HR**
   - Login as HR
   - ✅ Can view all reports
   - ✅ Can edit status
   - ✅ Can send messages
   - ❌ Cannot edit priority
   - ❌ Cannot assign cases
   - ❌ Cannot view analytics

**Expected Results:**
- ✅ All permissions enforced correctly
- ✅ UI shows/hides elements based on role
- ✅ API endpoints reject unauthorized actions
- ✅ Database RLS policies enforce restrictions

---

### Scenario 4: Organization Suspension

**Objective:** Test organization suspension and its effects

**Steps:**
1. **Submit Report to Organization**
   - Go to `https://www.whistrust.com/org/aisar/report`
   - Submit report
   - Verify success

2. **Suspend Organization (Super Admin)**
   - Login as Super Admin at `https://www.whistrust.com/superadmin/login`
   - Navigate to organizations
   - Edit AISAR organization
   - Change status to "Suspended"
   - Save

3. **Test Report Submission (Blocked)**
   - Try to submit report via `https://www.whistrust.com/org/aisar/report`
   - ❌ Should show error: "Organization is not active"
   - ❌ Report should not be submitted

4. **Test Admin Login (Limited)**
   - Try to login as AISAR admin at `https://www.whistrust.com/org/aisar/login`
   - ❌ Should be blocked or show suspension message

5. **Test Existing Reports (Access)**
   - Existing reports should still be accessible
   - ✅ Reporter can still track case
   - ✅ Admin can still view/manage existing cases (if allowed)

6. **Reactivate Organization (Super Admin)**
   - Super Admin changes status back to "Active"
   - ✅ Report submission works again
   - ✅ Admin login works again

**Expected Results:**
- ✅ Suspension blocks new submissions
- ✅ Suspension limits admin access
- ✅ Existing data remains accessible (if configured)
- ✅ Reactivation restores full functionality

---

## Troubleshooting

### Common Issues

#### 1. Login Fails

**Symptoms:**
- "Invalid credentials" error
- Redirects back to login page

**Solutions:**
- Verify email and password are correct
- Check if user account is active
- Verify Supabase connection (check `/test/connection`)
- Check browser console for errors
- Clear browser cache and cookies

---

#### 2. Reports Not Loading

**Symptoms:**
- Case list is empty
- "No reports found" message

**Solutions:**
- Verify Supabase connection
- Check RLS policies are enabled
- Verify user has correct role/permissions
- Check browser console for API errors
- Verify organization status is "Active"

---

#### 3. Real-Time Updates Not Working

**Symptoms:**
- Messages don't appear immediately
- Status updates not reflected in real-time

**Solutions:**
- Check connection status indicator
- Verify Supabase real-time is enabled
- Check browser console for WebSocket errors
- Refresh page to reload data
- Verify network connection

---

#### 4. File Upload Fails

**Symptoms:**
- Upload progress stuck
- Error message on upload

**Solutions:**
- Verify file size < 10 MB
- Check file type is allowed (PDF, DOC, DOCX, TXT, JPG, PNG)
- Verify Supabase Storage bucket exists
- Check RLS policies on storage bucket
- Verify storage bucket is configured correctly

---

#### 5. Tracking Code Not Found

**Symptoms:**
- "Case not found" error
- Tracking code doesn't work

**Solutions:**
- Verify tracking code is correct (copy-paste recommended)
- Check if report was submitted to correct organization
- Verify organization subdomain matches
- Check if organization is active
- Verify report exists in database

---

#### 6. Permission Errors

**Symptoms:**
- "Access denied" messages
- UI elements missing
- Actions blocked

**Solutions:**
- Verify user role is correct
- Check role permissions in database
- Verify RLS policies allow access
- Check if user is assigned to correct organization
- Verify user account is active

---

#### 7. Environment Detection Issues

**Symptoms:**
- Wrong Supabase database used
- Wrong organization data displayed

**Solutions:**
- Check `/test/connection` page
- Verify environment variables in Vercel (production)
- Verify URL path/subdomain detection
- Check organization subdomain matches URL
- Verify organization status is "Active"

---

### Debug Checklist

When reporting issues, include:

1. **Environment:**
   - [ ] Production URL accessed
   - [ ] Browser and version

2. **User Context:**
   - [ ] Role
   - [ ] Organization (if multi-tenant)
   - [ ] Login status

3. **Error Details:**
   - [ ] Error message (exact text)
   - [ ] Browser console errors
   - [ ] Network tab errors
   - [ ] Steps to reproduce

4. **Expected vs Actual:**
   - [ ] What should happen?
   - [ ] What actually happened?

---

## Test Completion Checklist

### Core Flows
- [ ] Anonymous reporter can submit report (AISAR)
- [ ] Anonymous reporter can submit report (CodeSquare)
- [ ] Reporter can track case (AISAR)
- [ ] Reporter can track case (CodeSquare)
- [ ] Reporter can send/receive messages
- [ ] AISAR Admin can login
- [ ] CodeSquare Admin can login
- [ ] Admin can view cases
- [ ] Admin can update case status
- [ ] Admin can update priority
- [ ] Admin can assign cases
- [ ] Admin can send messages
- [ ] Admin can manage users (if available)
- [ ] Super Admin can login
- [ ] Super Admin can view organizations
- [ ] Super Admin can create organization
- [ ] Super Admin can edit organization
- [ ] Super Admin can suspend organization

### Features
- [ ] Report submission validation
- [ ] File upload/download
- [ ] Real-time messaging
- [ ] Case status management
- [ ] Priority management
- [ ] Case assignment
- [ ] Label management
- [ ] Internal notes
- [ ] Analytics/statistics
- [ ] Audit logging
- [ ] User management
- [ ] Role-based permissions

### Security & Isolation
- [ ] Multi-tenant data isolation
- [ ] RLS policies enforced
- [ ] Role permissions enforced
- [ ] Organization suspension works
- [ ] Tracking code scoping
- [ ] File attachment security

### UI/UX
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Forms validate correctly
- [ ] Error messages display
- [ ] Success messages display
- [ ] Loading states work
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Accessibility (keyboard navigation, screen readers)

---

## Notes for Testers

### Best Practices

1. **Use Sample Content:**
   - Use provided sample descriptions (50+ characters)
   - Use test files for attachments
   - Use realistic but test data

2. **Test Production Environment:**
   - Test on production URLs
   - Note any issues or differences

3. **Document Issues:**
   - Take screenshots of errors
   - Note exact steps to reproduce
   - Include browser console errors
   - Note environment details

4. **Test Edge Cases:**
   - Very long descriptions
   - Special characters in input
   - Multiple file uploads
   - Rapid status changes
   - Concurrent user actions

5. **Verify Data Persistence:**
   - Refresh pages after actions
   - Close and reopen browser
   - Verify data persists across sessions

---

## Contact & Support

For issues or questions during testing:

1. **Check Documentation:**
   - `README.md` - Project overview
   - `CREDENTIALS_SUMMARY.md` - All credentials
   - `README_MULTI_TENANT.md` - Multi-tenant setup

2. **Check Test Page:**
   - `/test/connection` - Environment diagnostics

3. **Review Logs:**
   - Browser console (F12)
   - Network tab
   - Supabase dashboard logs

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** WhisTrust Development Team

# WhisTrust Client Onboarding Guide

**Version:** 1.0  
**Date:** January 2025  
**Purpose:** Complete step-by-step guide for onboarding new clients from organization creation to full system access

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Super Admin Creates Organization](#step-1-super-admin-creates-organization)
4. [Step 2: Create Initial Admin User](#step-2-create-initial-admin-user)
5. [Step 3: Provide Credentials to Client](#step-3-provide-credentials-to-client)
6. [Step 4: Client First Login](#step-4-client-first-login)
7. [Step 5: Client Creates Additional Users](#step-5-client-creates-additional-users)
8. [Step 6: Testing Report Management Flow](#step-6-testing-report-management-flow)
9. [Client Training Checklist](#client-training-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers the complete onboarding process for new WhisTrust clients:

1. **Super Admin** creates the organization in the platform
2. **Super Admin** creates the initial admin user account
3. **Credentials** are provided to the client
4. **Client Admin** logs in and accesses their portal
5. **Client Admin** creates additional users (Managers, Investigators, HR)
6. **Client Team** tests the complete report management workflow

**Timeline:** This process typically takes 15-30 minutes to complete.

---

## Prerequisites

### For Super Admin:

- ✅ Access to Super Admin portal: `https://www.whistrust.com/superadmin/login`
- ✅ Super Admin credentials:
  - Email: `sup-adm@whistrust.com`
  - Password: `<WHISTRUST_TEST_PASSWORD>`
- ✅ Client information ready:
  - Company name
  - Desired subdomain (e.g., `companyname`)
  - Plan type (Free, Essential, Professional, Enterprise)
  - Contact email for initial admin user
  - Payment confirmation (if applicable)

### For Client:

- ✅ Internet connection
- ✅ Email access (to receive credentials)
- ✅ Browser (Chrome, Firefox, Safari, or Edge)

---

## Step 1: Super Admin Creates Organization

### 1.1 Login to Super Admin Portal

**Steps:**

1. Navigate to: `https://www.whistrust.com/superadmin/login`
2. **Enter Super Admin Credentials:**
   - Email: `sup-adm@whistrust.com`
   - Password: `<WHISTRUST_TEST_PASSWORD>`
3. Click **"Sign In"**
4. Verify redirect to Super Admin Dashboard

**Expected Results:**

- ✅ Login successful
- ✅ Dashboard displays platform statistics
- ✅ Navigation menu visible

---

### 1.2 Navigate to Organizations

**Steps:**

1. In the Super Admin dashboard, click **"Organizations"** in the navigation menu
2. Or navigate directly to: `https://www.whistrust.com/superadmin/organizations`
3. Verify organizations list page loads

**Expected Results:**

- ✅ Organizations list displays
- ✅ "Create Organization" or "Add Organization" button visible

---

### 1.3 Create New Organization

**Steps:**

1. Click **"Create Organization"** or **"Add Organization"** button
2. **Fill in Organization Details:**

   **Required Fields:**
   - **Organization Name:** Enter the company's full name
     - Example: `Acme Corporation`
   - **Subdomain:** Enter unique subdomain (lowercase, no spaces, no special characters)
     - Example: `acmecorp`
     - This will be used in URLs: `https://www.whistrust.com/org/acmecorp/report`
   - **Plan:** Select the plan type
     - Options: `Free`, `Essential`, `Professional`, `Enterprise`
   - **Status:** Set to `Active`

   **Optional Fields:**
   - **Max Reports Per Month:** Set limit based on plan
     - Free: 2 reports/month
     - Essential: 50 reports/month
     - Professional: 200 reports/month
     - Enterprise: Unlimited
   - **Max Admin Users:** Set limit based on plan
     - Free: 1 admin user
     - Essential: 5 admin users
     - Professional: 20 admin users
     - Enterprise: Unlimited
   - **Features:** Enable/disable features
     - ✅ Anonymous Reporting (usually enabled)
     - ✅ User Management (usually enabled)
     - ✅ Analytics (based on plan)
     - ✅ Custom Branding (Enterprise only)

3. **Review Information:**
   - Verify subdomain is unique (system will validate)
   - Verify all required fields are filled
   - Check plan and limits match client agreement

4. Click **"Create"** or **"Save"** button

**Expected Results:**

- ✅ Organization created successfully
- ✅ Success notification appears
- ✅ Organization appears in organizations list
- ✅ Organization status is "Active"
- ✅ Organization accessible at: `https://www.whistrust.com/org/{subdomain}/login`

**Important Notes:**

- ⚠️ **Subdomain cannot be changed** after creation - choose carefully
- ⚠️ **Subdomain must be unique** - system will reject duplicates
- ⚠️ **Status must be "Active"** for clients to access the portal

---

## Step 2: Create Initial Admin User

### 2.1 Navigate to User Creation

**Option A: Create User via Super Admin Portal (if available)**

1. In the organization details page, find **"Users"** or **"Admin Users"** section
2. Click **"Add User"** or **"Create User"**

**Option B: Create User via Client Portal (Recommended)**

1. Note the organization subdomain (e.g., `acmecorp`)
2. Navigate to client login page: `https://www.whistrust.com/org/{subdomain}/login`
3. Use Super Admin credentials temporarily (if system allows) OR
4. Use service role to create user directly in database

**For this guide, we'll use the client portal method:**

---

### 2.2 Create Admin User Account

**Steps:**

1. Navigate to: `https://www.whistrust.com/org/{subdomain}/login`
   - Example: `https://www.whistrust.com/org/acmecorp/login`

2. **If "Create Account" or "Sign Up" option is available:**
   - Click the link
   - Fill in the form:
     - Email: Client's admin email (e.g., `admin@acmecorp.com`)
     - Password: Generate a secure password (or let client set it)
     - Full Name: Client admin's name
     - Role: `Admin`
     - Department: (Optional)
   - Click **"Create Account"**

3. **If direct user creation is needed:**
   - Use Supabase Dashboard or API to create user
   - Create user in `auth.users` table
   - Create corresponding entry in `admin_profiles` table:
     ```sql
     INSERT INTO admin_profiles (
       id, 
       full_name, 
       role, 
       department, 
       organization_id, 
       is_active
     ) VALUES (
       'user-uuid-here',
       'Client Admin Name',
       'admin',
       'Administration',
       'organization-uuid-here',
       true
     );
     ```

**Expected Results:**

- ✅ User account created
- ✅ User has "Admin" role
- ✅ User is associated with the organization
- ✅ User account is active

**Important Notes:**

- ⚠️ **Email must be unique** across the platform
- ⚠️ **Password should be strong** (minimum 8 characters, mix of letters, numbers, symbols)
- ⚠️ **Role must be "admin"** for initial user to have full access

---

## Step 3: Provide Credentials to Client

### 3.1 Prepare Credentials Package

**Information to Provide:**

1. **Welcome Email Template:**

   ```
   Subject: Welcome to WhisTrust - Your Secure Reporting Portal is Ready

   Dear [Client Name],

   Your WhisTrust organization has been set up and is ready to use!

   ORGANIZATION DETAILS:
   - Organization Name: [Company Name]
   - Portal URL: https://www.whistrust.com/org/[subdomain]/login
   - Subdomain: [subdomain]

   ADMIN CREDENTIALS:
   - Email: [admin@company.com]
   - Password: [temporary-password]
   - Role: Admin

   NEXT STEPS:
   1. Log in using the credentials above
   2. Change your password immediately after first login
   3. Create additional users for your team (Managers, Investigators, HR)
   4. Test the report submission flow
   5. Share your report submission URL with employees:
      https://www.whistrust.com/org/[subdomain]/report

   SUPPORT:
   If you need assistance, please contact [support email] or visit our documentation.

   Best regards,
   WhisTrust Team
   ```

2. **Credentials Document (PDF or Text):**

   Create a secure document with:
   - Organization details
   - Login URL
   - Admin credentials
   - Quick start guide link
   - Support contact information

3. **Share via Secure Method:**
   - Encrypted email
   - Secure file sharing service
   - Password-protected document
   - Phone call (for password)

---

### 3.2 Send Credentials

**Steps:**

1. **Prepare the email/document** with all information
2. **Send to client contact:**
   - Primary contact email
   - CC: Backup contact (if applicable)
3. **Follow up:**
   - Phone call to confirm receipt
   - Schedule onboarding session (optional)
4. **Set reminder:**
   - Follow up in 24-48 hours if no login activity

**Security Best Practices:**

- ✅ **Never send passwords in plain text email** (use phone call or secure message)
- ✅ **Use temporary password** and require change on first login
- ✅ **Encrypt sensitive documents**
- ✅ **Set password expiration** (if supported)
- ✅ **Enable 2FA** (if available and client requests)

---

## Step 4: Client First Login

### 4.1 Client Receives Credentials

**Client Actions:**

1. **Receive email/document** with credentials
2. **Note the login URL:**
   - Format: `https://www.whistrust.com/org/{subdomain}/login`
   - Example: `https://www.whistrust.com/org/acmecorp/login`
3. **Save credentials securely**

---

### 4.2 Client Logs In

**Steps for Client:**

1. **Open browser** and navigate to the login URL
2. **Enter Credentials:**
   - Email: `admin@company.com` (provided email)
   - Password: `[temporary-password]` (provided password)
3. Click **"Sign In"** or **"Login"**

**Expected Results:**

- ✅ Login successful
- ✅ Redirect to organization dashboard
- ✅ Dashboard shows organization-specific data
- ✅ Navigation menu visible

**If Login Fails:**

- ❌ Check email and password are correct
- ❌ Verify organization status is "Active"
- ❌ Check if account is locked
- ❌ Contact Super Admin for support

---

### 4.3 Change Password (Recommended)

**Steps for Client:**

1. **After successful login**, look for **"Profile"** or **"Settings"** menu
2. Navigate to **"Change Password"** or **"Account Settings"**
3. **Enter:**
   - Current password: `[temporary-password]`
   - New password: `[strong-new-password]`
   - Confirm new password: `[strong-new-password]`
4. Click **"Update Password"** or **"Save"**

**Password Requirements:**

- Minimum 8 characters
- Mix of uppercase and lowercase letters
- At least one number
- At least one special character

**Expected Results:**

- ✅ Password changed successfully
- ✅ Success notification appears
- ✅ User remains logged in
- ✅ New password required for next login

---

### 4.4 Explore Dashboard

**Client Should Verify:**

1. **Dashboard Statistics:**
   - Total reports: Should show 0 (new organization)
   - Pending reports: 0
   - In-progress reports: 0
   - Resolved reports: 0

2. **Navigation Menu:**
   - Dashboard
   - Reports/Cases
   - Users (if available)
   - Settings (if available)
   - Profile

3. **Organization Context:**
   - Organization name displayed
   - Correct subdomain in URL
   - Organization-specific branding (if configured)

**Expected Results:**

- ✅ Dashboard loads correctly
- ✅ All navigation items visible
- ✅ Statistics show zero (new organization)
- ✅ Organization context correct

---

## Step 5: Client Creates Additional Users

### 5.1 Navigate to User Management

**Steps for Client Admin:**

1. **In the dashboard**, click **"Users"** or **"User Management"** in navigation
2. Or navigate to: `https://www.whistrust.com/org/{subdomain}/users` (if available)
3. Verify user management page loads

**Expected Results:**

- ✅ User list displays (showing current admin user)
- ✅ "Add User" or "Create User" button visible
- ✅ User management features accessible

---

### 5.2 Create Manager User

**Steps for Client Admin:**

1. Click **"Add User"** or **"Create User"** button
2. **Fill in User Details:**

   **Required Fields:**
   - **Email:** `manager@company.com` (or appropriate email)
   - **Full Name:** `Manager Name`
   - **Role:** Select `Manager`
   - **Department:** `Compliance` (or appropriate department)
   - **Password:** Generate secure password or let user set it
   - **Is Active:** ✅ Checked

   **Optional Fields:**
   - Phone number
   - Job title
   - Notes

3. Click **"Create User"** or **"Save"**

**Expected Results:**

- ✅ User created successfully
- ✅ Success notification appears
- ✅ User appears in user list
- ✅ User receives credentials (if email notification enabled)
- ✅ User can login with provided credentials

**Manager Permissions:**

- ✅ Can view all reports
- ✅ Can edit report status
- ✅ Can edit priority
- ✅ Can assign cases
- ✅ Can view audit logs
- ✅ Can view analytics
- ✅ Can send messages
- ✅ Can add labels
- ❌ Cannot delete reports
- ❌ Cannot manage users
- ❌ Cannot manage settings

---

### 5.3 Create Investigator User

**Steps for Client Admin:**

1. Click **"Add User"** or **"Create User"** button
2. **Fill in User Details:**

   **Required Fields:**
   - **Email:** `investigator@company.com`
   - **Full Name:** `Investigator Name`
   - **Role:** Select `Investigator`
   - **Department:** `Investigations`
   - **Password:** Generate secure password
   - **Is Active:** ✅ Checked

3. Click **"Create User"** or **"Save"**

**Expected Results:**

- ✅ Investigator user created
- ✅ User appears in user list
- ✅ User can login

**Investigator Permissions:**

- ✅ Can view all reports
- ✅ Can edit report status
- ✅ Can send messages
- ✅ Can add labels
- ❌ Cannot edit priority
- ❌ Cannot assign cases
- ❌ Cannot view audit logs
- ❌ Cannot view analytics
- ❌ Cannot delete reports
- ❌ Cannot manage users

---

### 5.4 Create HR User

**Steps for Client Admin:**

1. Click **"Add User"** or **"Create User"** button
2. **Fill in User Details:**

   **Required Fields:**
   - **Email:** `hr@company.com`
   - **Full Name:** `HR Manager Name`
   - **Role:** Select `HR`
   - **Department:** `Human Resources`
   - **Password:** Generate secure password
   - **Is Active:** ✅ Checked

3. Click **"Create User"** or **"Save"**

**Expected Results:**

- ✅ HR user created
- ✅ User appears in user list
- ✅ User can login

**HR Permissions:**

- ✅ Can view all reports
- ✅ Can edit report status
- ✅ Can send messages
- ✅ Can add labels
- ❌ Cannot edit priority
- ❌ Cannot assign cases
- ❌ Cannot view audit logs
- ❌ Cannot view analytics
- ❌ Cannot delete reports
- ❌ Cannot manage users

---

### 5.5 Verify User Creation

**Steps for Client Admin:**

1. **Review User List:**
   - Verify all created users appear
   - Check roles are correct
   - Verify status is "Active"

2. **Test User Login (Optional):**
   - Share credentials with test user
   - Have user attempt login
   - Verify they can access their portal
   - Verify permissions are correct

**Expected Results:**

- ✅ All users listed correctly
- ✅ Roles assigned properly
- ✅ Users can login
- ✅ Permissions enforced correctly

---

## Step 6: Testing Report Management Flow

### 6.1 Test Report Submission

**Steps:**

1. **Get Report Submission URL:**
   - Format: `https://www.whistrust.com/org/{subdomain}/report`
   - Example: `https://www.whistrust.com/org/acmecorp/report`

2. **Open Report Form:**
   - Navigate to the URL in a new browser (or incognito mode)
   - Verify form loads correctly

3. **Submit Test Report:**
   - **Select Category:** Choose "Fraud & Financial Misconduct"
   - **Enter Description:** 
     ```
     This is a test report to verify the system is working correctly. 
     The report management flow will be tested using this submission.
     ```
   - **Optional Fields:**
     - Name: `Test Reporter`
     - Email: `test@example.com`
   - **File Attachment (Optional):**
     - Upload a test PDF or image file
   - Click **"Submit Report"**

4. **Save Tracking Code:**
   - Copy the tracking code displayed on success page
   - Save it for testing tracking functionality

**Expected Results:**

- ✅ Report form loads correctly
- ✅ Form validation works
- ✅ Report submits successfully
- ✅ Success page displays tracking code
- ✅ Tracking code is copyable

---

### 6.2 Test Case Tracking (Reporter View)

**Steps:**

1. **Navigate to Track Page:**
   - URL: `https://www.whistrust.com/org/{subdomain}/track`
   - Example: `https://www.whistrust.com/org/acmecorp/track`

2. **Enter Tracking Code:**
   - Paste the tracking code from step 6.1
   - Click **"Track Case"** or press Enter

3. **Verify Case Details:**
   - Case status displayed (should be "Pending")
   - Category shown
   - Description displayed
   - Submitted date/time shown
   - Attachments visible (if uploaded)

4. **Test Messaging:**
   - Scroll to messaging section
   - Type a test message: "This is a test message from the reporter."
   - Click **"Send Message"**
   - Verify message appears in thread

**Expected Results:**

- ✅ Tracking code works correctly
- ✅ Case details load
- ✅ Status badge displays
- ✅ Message sends successfully
- ✅ Message appears in thread

---

### 6.3 Test Admin Case Management

**Steps for Client Admin:**

1. **Login as Admin:**
   - Navigate to: `https://www.whistrust.com/org/{subdomain}/login`
   - Login with admin credentials

2. **View Reports:**
   - Navigate to **"Reports"** or **"Cases"** in navigation
   - Verify the test report from step 6.1 appears in the list
   - Click on the report to open case details

3. **Update Case Status:**
   - Find status dropdown
   - Change from "Pending" to "Under Review"
   - Click **"Update Status"** or **"Save"**
   - Verify status updates

4. **Assign Case:**
   - Find assignment dropdown
   - Select the Investigator user created in step 5.3
   - Click **"Assign"** or **"Save"**
   - Verify assignment updates

5. **Update Priority:**
   - Find priority dropdown
   - Change to "High" or "Critical"
   - Click **"Update"** or **"Save"**
   - Verify priority updates

6. **Add Label:**
   - Find "Labels" section
   - Type label: "Test Case"
   - Press Enter or click "Add"
   - Verify label appears

7. **Add Internal Note:**
   - Find "Internal Notes" section
   - Type note: "Initial review completed. Testing system functionality."
   - Click **"Add Note"** or **"Save"**
   - Verify note appears

8. **Send Message to Reporter:**
   - Scroll to message thread
   - Type message: "Thank you for your report. We have received it and assigned an investigator."
   - Click **"Send Message"**
   - Verify message appears in thread

**Expected Results:**

- ✅ Report visible in admin portal
- ✅ Status update works
- ✅ Case assignment works
- ✅ Priority update works
- ✅ Label added successfully
- ✅ Internal note saved
- ✅ Message sent to reporter
- ✅ All changes persist after page refresh

---

### 6.4 Test Investigator Workflow

**Steps for Investigator:**

1. **Login as Investigator:**
   - Navigate to: `https://www.whistrust.com/org/{subdomain}/login`
   - Login with investigator credentials (from step 5.3)

2. **View Assigned Case:**
   - Navigate to **"Reports"** or **"Cases"**
   - Verify the case assigned in step 6.3 appears
   - Open case details

3. **Verify Permissions:**
   - ✅ Can see case details
   - ✅ Can update status
   - ✅ Can send messages
   - ✅ Can add labels
   - ❌ Cannot see priority dropdown (or it's read-only)
   - ❌ Cannot see assignment dropdown (or it's read-only)
   - ❌ Cannot see internal notes section
   - ❌ Cannot access analytics
   - ❌ Cannot access audit logs

4. **Update Status:**
   - Change status to "In Progress"
   - Click **"Update Status"**
   - Verify update saves

5. **Send Message:**
   - Type message: "We are investigating your report. We will keep you updated."
   - Click **"Send Message"**
   - Verify message appears

**Expected Results:**

- ✅ Investigator can view assigned case
- ✅ Permissions enforced correctly
- ✅ Status update works
- ✅ Message sends successfully
- ✅ Reporter sees message on track page

---

### 6.5 Test Reporter Receives Updates

**Steps:**

1. **Return to Track Page:**
   - Navigate to: `https://www.whistrust.com/org/{subdomain}/track`
   - Enter tracking code again

2. **Verify Updates:**
   - Status should now show "In Progress" (updated by Investigator)
   - Admin message should be visible
   - Investigator message should be visible
   - Case number should be displayed (if assigned)

3. **Send Reply:**
   - Type reply: "Thank you for the update. I have additional information if needed."
   - Click **"Send Message"**
   - Verify message appears

**Expected Results:**

- ✅ Status updates visible to reporter
- ✅ All messages visible in thread
- ✅ Real-time updates work (if enabled)
- ✅ Reporter can send replies

---

### 6.6 Test Case Resolution

**Steps for Client Admin:**

1. **Login as Admin** (if not already logged in)

2. **Open Case:**
   - Navigate to reports/cases
   - Open the test case

3. **Resolve Case:**
   - Update status to "Resolved"
   - Add internal note: "Investigation complete. Test case resolved."
   - Send final message: "Your case has been resolved. Thank you for using our reporting system."
   - Click **"Update Status"** and **"Send Message"**

4. **Verify Resolution:**
   - Status shows "Resolved"
   - Final message sent
   - Case appears in resolved reports list

**Expected Results:**

- ✅ Status updates to "Resolved"
- ✅ Final message sent
- ✅ Reporter sees resolution on track page
- ✅ Case appears in resolved statistics

---

## Client Training Checklist

### Essential Training Topics

Use this checklist to ensure clients understand all key features:

#### 1. Login & Navigation

- [ ] How to login
- [ ] How to change password
- [ ] Dashboard overview
- [ ] Navigation menu
- [ ] User profile management

#### 2. User Management

- [ ] How to create users
- [ ] Role permissions explained
- [ ] How to edit users
- [ ] How to deactivate users
- [ ] User limit awareness

#### 3. Report Management

- [ ] How to view reports
- [ ] How to open case details
- [ ] How to update case status
- [ ] How to update priority
- [ ] How to assign cases
- [ ] How to add labels
- [ ] How to add internal notes
- [ ] How to send messages to reporters

#### 4. Report Submission (For Employees)

- [ ] Report submission URL
- [ ] How to submit a report
- [ ] Tracking code importance
- [ ] How to track a case
- [ ] How to send messages

#### 5. Analytics & Reporting

- [ ] Dashboard statistics
- [ ] Report categories breakdown
- [ ] Status distribution
- [ ] Time-based trends (if available)

#### 6. Settings & Configuration

- [ ] Organization settings
- [ ] Feature toggles
- [ ] Limits and quotas
- [ ] Branding (if Enterprise)

#### 7. Best Practices

- [ ] Response time expectations
- [ ] Case assignment guidelines
- [ ] Communication protocols
- [ ] Security practices
- [ ] Data privacy compliance

---

## Troubleshooting

### Common Issues During Onboarding

#### Issue 1: Organization Creation Fails

**Symptoms:**
- Error: "Subdomain already exists"
- Error: "Invalid subdomain format"

**Solutions:**
- Choose a different subdomain
- Ensure subdomain is lowercase, no spaces, no special characters
- Check if organization already exists

---

#### Issue 2: User Creation Fails

**Symptoms:**
- Error: "Email already exists"
- Error: "User limit reached"

**Solutions:**
- Use a different email address
- Check organization user limit
- Verify plan allows user creation
- Contact Super Admin to increase limit

---

#### Issue 3: Client Cannot Login

**Symptoms:**
- "Invalid credentials" error
- "Organization not active" error

**Solutions:**
- Verify email and password are correct
- Check organization status is "Active"
- Verify user account is active
- Check if account is locked
- Reset password if needed

---

#### Issue 4: Reports Not Visible

**Symptoms:**
- Dashboard shows 0 reports
- Reports list is empty

**Solutions:**
- Verify reports were submitted to correct organization
- Check organization subdomain matches
- Verify RLS policies are enabled
- Check user has correct role/permissions

---

#### Issue 5: Permissions Not Working

**Symptoms:**
- User can see features they shouldn't
- User cannot access features they should

**Solutions:**
- Verify user role is correct
- Check role permissions in database
- Verify RLS policies are correct
- Refresh page and try again

---

### Support Contacts

**For Super Admin Issues:**
- Contact: [Super Admin Support Email]
- Portal: `https://www.whistrust.com/superadmin/login`

**For Client Support:**
- Documentation: `https://www.whistrust.com/documentation`
- Support Email: [Client Support Email]
- Test Connection: `https://www.whistrust.com/test/connection`

---

## Quick Reference

### Important URLs Template

```
Organization Login:
https://www.whistrust.com/org/{subdomain}/login

Report Submission:
https://www.whistrust.com/org/{subdomain}/report

Case Tracking:
https://www.whistrust.com/org/{subdomain}/track

Admin Dashboard:
https://www.whistrust.com/org/{subdomain}/dashboard

Admin Cases:
https://www.whistrust.com/org/{subdomain}/reports
```

### User Roles Summary

| Role        | Key Permissions                                    | Limitations                    |
| ----------- | -------------------------------------------------- | ------------------------------ |
| **Admin**   | Full access to all features                       | None                           |
| **Manager** | Most features except user/settings management      | Cannot delete reports          |
| **Investigator** | View reports, update status, send messages    | Cannot assign, no analytics    |
| **HR**      | View reports, update status, send messages         | Cannot assign, no analytics   |

### Status Workflow

```
Pending → Under Review → In Progress → Resolved → Closed
```

### Priority Levels

- **Low:** Routine matters
- **Medium:** Standard priority
- **High:** Urgent attention needed
- **Critical:** Immediate action required

---

## Post-Onboarding Follow-Up

### Within 24 Hours

- [ ] Confirm client successfully logged in
- [ ] Verify first report submission works
- [ ] Answer any initial questions
- [ ] Provide additional resources if needed

### Within 1 Week

- [ ] Check organization activity
- [ ] Verify users are being created
- [ ] Confirm reports are being managed
- [ ] Offer additional training if needed

### Within 1 Month

- [ ] Review organization usage
- [ ] Check if limits are appropriate
- [ ] Gather feedback
- [ ] Offer advanced features training

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** WhisTrust Development Team


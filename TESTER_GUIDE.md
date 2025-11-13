# 🧪 WhisTrust - Tester Guide

**Version:** Phase 1 & 2 Complete  
**Last Updated:** November 12, 2025

---

## 📋 **TESTING OVERVIEW**

WhisTrust is a multi-tenant whistleblowing platform with:
- **Super Admin Portal** - Manage all organizations
- **Client Portals** - Organization-specific portals (CodeSquare & AISAR)

**Testing Focus:**
- ✅ Authentication & Authorization
- ✅ Multi-tenant isolation
- ✅ Dashboard metrics
- ✅ Organization management (Super Admin only)
- ✅ User interface & navigation
- ⚠️ Reports functionality is **NOT YET IMPLEMENTED**

---

## 🌐 **APPLICATION URLS**

### **Local Development:**
- **Base URL:** http://localhost:3000

### **Super Admin Portal:**
- **URL:** http://localhost:3000/superadmin/login

### **CodeSquare Portal:**
- **URL:** http://localhost:3000/org/codesquare/login

### **AISAR Portal:**
- **URL:** http://localhost:3000/org/aisar/login

### **Diagnostic Page (Troubleshooting):**
- **URL:** http://localhost:3000/diagnostic

---

## 🔑 **TEST CREDENTIALS**

### **1. SUPER ADMIN**

**Purpose:** Platform administrator - can manage all organizations

**Login URL:** http://localhost:3000/superadmin/login

**Credentials:**
- **Email:** `sup-adm@whistrust.com`
- **Password:** `sup-pass-adm!1@3#5`

**Access Level:**
- View all organizations
- Create new organizations
- Edit organization details
- Suspend/activate organizations
- View all users across all organizations
- Full system access

---

### **2. CODESQUARE ORGANIZATION**

**Organization Details:**
- **Name:** CodeSquare
- **Subdomain:** `codesquare`
- **Plan:** Professional
- **Status:** Active
- **Max Users:** 15
- **Max Reports/Month:** 100

**Login URL:** http://localhost:3000/org/codesquare/login

#### **User 1: Admin**
- **Email:** `admin@codesquare.com`
- **Password:** `[Your password - set when creating user]`
- **Role:** Admin
- **Department:** IT
- **Permissions:** Full access to CodeSquare portal

#### **User 2: Investigator**
- **Email:** `investigator@codesquare.com`
- **Password:** `[Your password - set when creating user]`
- **Role:** Investigator
- **Department:** Compliance
- **Permissions:** Limited access (reports investigation)

---

### **3. AISAR ORGANIZATION**

**Organization Details:**
- **Name:** AISAR
- **Subdomain:** `aisar`
- **Plan:** Enterprise
- **Status:** Active
- **Max Users:** 50
- **Max Reports/Month:** 500

**Login URL:** http://localhost:3000/org/aisar/login

#### **User 1: Admin**
- **Email:** `admin@aisar.com`
- **Password:** `[Your password - set when creating user]`
- **Role:** Admin
- **Department:** Administration
- **Permissions:** Full access to AISAR portal

#### **User 2: Manager**
- **Email:** `manager@aisar.com`
- **Password:** `[Your password - set when creating user]`
- **Role:** Manager
- **Department:** Operations
- **Permissions:** User & report management

#### **User 3: HR**
- **Email:** `hr@aisar.com`
- **Password:** `[Your password - set when creating user]`
- **Role:** HR
- **Department:** Human Resources
- **Permissions:** View & create reports

---

## 🧪 **TEST SCENARIOS**

### **TEST 1: Super Admin Login & Dashboard**

**Steps:**
1. Go to http://localhost:3000/superadmin/login
2. Enter Super Admin credentials
3. Click "Sign In as Super Admin"

**Expected Results:**
- ✅ Successful login
- ✅ Redirect to Super Admin Dashboard
- ✅ See metrics: "2" organizations, "2" active orgs, "5" total users
- ✅ See "Create Organization" and "View Organizations" quick actions
- ✅ Sidebar shows: Dashboard, Organizations, All Users, Analytics, Settings
- ✅ User profile shows "Super Admin" at bottom

**Screenshots to Capture:**
- Dashboard with metrics
- Sidebar navigation

---

### **TEST 2: Super Admin - View Organizations**

**Steps:**
1. From Super Admin Dashboard, click "View Organizations" or "Organizations" in sidebar
2. Observe the organizations list

**Expected Results:**
- ✅ See 2 organizations: CodeSquare and AISAR
- ✅ CodeSquare shows: "Professional" plan, "active" status, "2 users"
- ✅ AISAR shows: "Enterprise" plan, "active" status, "3 users"
- ✅ Each card has "Edit" button and "View Details" button
- ✅ Search bar visible at top
- ✅ "New Organization" button visible

**Screenshots to Capture:**
- Organizations list page

---

### **TEST 3: Super Admin - View Organization Details**

**Steps:**
1. From Organizations page, click "View Details" on AISAR
2. Observe organization details page

**Expected Results:**
- ✅ See AISAR organization name
- ✅ See all details: subdomain, plan, status, contact info
- ✅ See usage statistics: users (3/50), reports (0/500), storage
- ✅ See feature flags (anonymous reporting, file attachments, etc.)
- ✅ See branding settings
- ✅ "Edit" and "Back" buttons visible
- ✅ Action buttons: Suspend/Activate, Archive

**Screenshots to Capture:**
- Organization details page

---

### **TEST 4: Super Admin - Create New Organization**

**Steps:**
1. From Organizations page, click "New Organization"
2. Fill in form with test data:
   - Name: "Test Company"
   - Subdomain: "testcompany"
   - Primary Contact: "admin@testcompany.com"
   - Plan: Select "Professional"
3. Click "Create Organization"

**Expected Results:**
- ✅ Form validation works (try submitting empty form first)
- ✅ Successful creation message
- ✅ Redirect to organizations list
- ✅ New organization visible in list
- ✅ Can access http://localhost:3000/org/testcompany/login (will show "Organization Not Found" - no users yet)

**Screenshots to Capture:**
- Create organization form
- Success message
- New organization in list

---

### **TEST 5: Super Admin - Edit Organization**

**Steps:**
1. From Organizations page, click "Edit" on CodeSquare
2. Change "Primary Contact Name" to "Updated Admin"
3. Click "Update Organization"

**Expected Results:**
- ✅ Form pre-filled with existing data
- ✅ Can update fields
- ✅ Success message after saving
- ✅ Changes reflected in details page

**Screenshots to Capture:**
- Edit form
- Updated details

---

### **TEST 6: AISAR Admin Login & Dashboard**

**Steps:**
1. Go to http://localhost:3000/org/aisar/login
2. Enter AISAR Admin credentials
3. Click "Sign In"

**Expected Results:**
- ✅ Login page shows AISAR branding (name, logo area, custom color)
- ✅ Successful login
- ✅ Redirect to AISAR Dashboard
- ✅ Welcome message: "Welcome back, AISAR Admin"
- ✅ Metrics show:
  - Total Reports: 0
  - Pending: 0
  - Resolved: 0
  - Active Users: 3
- ✅ Organization details: Plan (Enterprise), Status (active), Users (3/50), Reports (0/500)
- ✅ Sidebar shows AISAR branding at top
- ✅ Navigation: Dashboard, Reports, Analytics, Audit Logs, Users, Settings

**Screenshots to Capture:**
- AISAR login page
- AISAR dashboard

---

### **TEST 7: AISAR - Reports Page**

**Steps:**
1. From AISAR Dashboard, click "Reports" in sidebar
2. Observe reports page

**Expected Results:**
- ✅ Reports page loads
- ✅ Shows empty state (no reports yet)
- ✅ Message: "No reports yet" or similar
- ✅ Note: "Reports functionality coming in Phase 3"

**Screenshots to Capture:**
- Empty reports page

---

### **TEST 8: AISAR - Users Page**

**Steps:**
1. From AISAR Dashboard, click "Users" in sidebar
2. Observe users page

**Expected Results:**
- ✅ Users page loads
- ✅ Shows 3 users: Admin, Manager, HR
- ✅ Each user shows: name, email, role, department, status
- ✅ "Add User" button visible (may not work yet)

**Screenshots to Capture:**
- Users list page

---

### **TEST 9: AISAR - Settings Page**

**Steps:**
1. From AISAR Dashboard, click "Settings" in sidebar
2. Observe settings page

**Expected Results:**
- ✅ Settings page loads
- ✅ Shows organization details
- ✅ Shows plan information
- ✅ Shows feature settings
- ✅ Shows branding settings

**Screenshots to Capture:**
- Settings page

---

### **TEST 10: CodeSquare Login & Dashboard**

**Steps:**
1. Logout from AISAR (if logged in)
2. Go to http://localhost:3000/org/codesquare/login
3. Enter CodeSquare Admin credentials
4. Click "Sign In"

**Expected Results:**
- ✅ Login page shows CodeSquare branding (different from AISAR)
- ✅ Successful login
- ✅ Redirect to CodeSquare Dashboard
- ✅ Metrics show: Active Users: 2 (not 3 like AISAR)
- ✅ Plan shows "Professional" (not Enterprise)
- ✅ User limits: 2/15 (not 3/50)
- ✅ Reports quota: 0/100 (not 0/500)
- ✅ Sidebar shows CodeSquare name

**Screenshots to Capture:**
- CodeSquare login page
- CodeSquare dashboard
- Compare with AISAR dashboard (different metrics)

---

### **TEST 11: Multi-Tenant Isolation**

**Purpose:** Verify that organizations cannot see each other's data

**Steps:**
1. Login to AISAR portal as Admin
2. Navigate to Users page
3. Verify you only see AISAR users (3 users)
4. Logout and login to CodeSquare portal
5. Navigate to Users page
6. Verify you only see CodeSquare users (2 users)

**Expected Results:**
- ✅ AISAR portal shows only AISAR users (3)
- ✅ CodeSquare portal shows only CodeSquare users (2)
- ✅ No cross-organization data visible
- ✅ Cannot access other organization's URL while logged in

**Screenshots to Capture:**
- AISAR users page (3 users)
- CodeSquare users page (2 users)

---

### **TEST 12: Authorization & Access Control**

**Steps:**
1. Try accessing Super Admin portal while logged in as AISAR Admin
2. Go to http://localhost:3000/superadmin/dashboard

**Expected Results:**
- ✅ Redirect to Super Admin login page
- ✅ Cannot access Super Admin features from client portal
- ✅ Session isolation works correctly

**Additional Test:**
1. Login as AISAR HR user (if you have password)
2. Try to access Users page
3. Verify role-based permissions (HR may have limited access)

---

### **TEST 13: Logout Functionality**

**Steps:**
1. Login to any portal (AISAR or CodeSquare)
2. Click on user profile at bottom of sidebar
3. Click "Logout" (if available, or close browser)
4. Try to access dashboard directly

**Expected Results:**
- ✅ Successfully logged out
- ✅ Redirect to login page when accessing protected pages
- ✅ Session cleared

---

### **TEST 14: Responsive Design**

**Steps:**
1. Login to any portal
2. Resize browser window to mobile size (375px width)
3. Test navigation and functionality

**Expected Results:**
- ✅ Sidebar collapses to hamburger menu
- ✅ Dashboard cards stack vertically
- ✅ All functionality accessible on mobile
- ✅ Forms are usable on small screens

**Screenshots to Capture:**
- Mobile view of dashboard
- Mobile view of sidebar menu

---

### **TEST 15: Error Handling**

**Test A: Wrong Password**
1. Try logging in with correct email but wrong password
2. Expected: Error message "Invalid login credentials"

**Test B: Non-existent Organization**
1. Go to http://localhost:3000/org/nonexistent/login
2. Expected: "Organization Not Found" page

**Test C: Invalid Email Format**
1. Try logging in with invalid email format (e.g., "notanemail")
2. Expected: Form validation error

**Screenshots to Capture:**
- Login error message
- Organization not found page
- Validation errors

---

## ⚠️ **KNOWN LIMITATIONS (Phase 1 & 2)**

### **What's NOT Yet Implemented:**

1. **Reports Management:**
   - ❌ Cannot submit reports yet
   - ❌ Reports list is empty
   - ❌ No report creation form
   - ❌ No investigation workflow

2. **Analytics:**
   - ❌ Analytics page shows placeholder
   - ❌ No charts or visualizations yet

3. **Notifications:**
   - ❌ No email notifications
   - ❌ No in-app notifications

4. **User Management:**
   - ❌ Cannot add new users from UI (must use Supabase dashboard)
   - ❌ Cannot delete users
   - ❌ Cannot change user roles

5. **Advanced Features:**
   - ❌ No file uploads
   - ❌ No search functionality
   - ❌ No export features

**Note:** These features are planned for Phase 3-6 and are not bugs!

---

## 🐛 **HOW TO REPORT BUGS**

### **Bug Report Template:**

```
**Title:** [Short description of the issue]

**Steps to Reproduce:**
1. Go to [URL]
2. Login as [role]
3. Click on [action]
4. Observe [issue]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[Attach screenshots]

**Browser & OS:**
- Browser: [Chrome/Firefox/Safari] Version [X.X]
- OS: [Windows/Mac/Linux]

**Additional Context:**
[Any other relevant information]
```

---

## 🎯 **TESTING PRIORITIES**

### **HIGH Priority:**
1. ✅ All login flows (Super Admin, AISAR, CodeSquare)
2. ✅ Dashboard metrics accuracy
3. ✅ Multi-tenant isolation (critical security)
4. ✅ Organization CRUD operations
5. ✅ Navigation and routing

### **MEDIUM Priority:**
1. ✅ User interface consistency
2. ✅ Form validations
3. ✅ Error messages
4. ✅ Responsive design

### **LOW Priority:**
1. ✅ Typography and styling
2. ✅ Animation smoothness
3. ✅ Minor UI improvements

---

## 📊 **TESTING CHECKLIST**

Use this checklist to track your testing progress:

**Authentication:**
- [ ] Super Admin login works
- [ ] AISAR Admin login works
- [ ] CodeSquare Admin login works
- [ ] Wrong password shows error
- [ ] Logout works
- [ ] Session persists on refresh

**Super Admin Portal:**
- [ ] Dashboard loads with correct metrics
- [ ] Can view organizations list
- [ ] Can create new organization
- [ ] Can edit organization
- [ ] Can view organization details
- [ ] Navigation works

**AISAR Portal:**
- [ ] Login page shows AISAR branding
- [ ] Dashboard loads with AISAR data
- [ ] Shows 3 users
- [ ] Shows Enterprise plan
- [ ] All navigation links work

**CodeSquare Portal:**
- [ ] Login page shows CodeSquare branding
- [ ] Dashboard loads with CodeSquare data
- [ ] Shows 2 users
- [ ] Shows Professional plan
- [ ] All navigation links work

**Multi-Tenant Isolation:**
- [ ] AISAR cannot see CodeSquare data
- [ ] CodeSquare cannot see AISAR data
- [ ] Super Admin can see all data

**Security:**
- [ ] Cannot access protected routes without login
- [ ] Cannot access other organization's portal
- [ ] Cannot access Super Admin portal as client user

**UI/UX:**
- [ ] All pages load without errors
- [ ] Navigation is intuitive
- [ ] Forms are user-friendly
- [ ] Error messages are clear
- [ ] Mobile responsive

---

## 💡 **TESTING TIPS**

1. **Use Incognito/Private Mode** for testing different users to avoid session conflicts

2. **Check Browser Console** (F12) for any JavaScript errors

3. **Test Different Browsers:** Chrome, Firefox, Safari, Edge

4. **Clear Cache** if you see weird behavior (Ctrl+Shift+Delete)

5. **Test Edge Cases:**
   - Very long organization names
   - Special characters in forms
   - Rapid clicking
   - Back button navigation

6. **Take Screenshots** of every bug you find

7. **Check Network Tab** (F12 → Network) for failed API calls

---

## 📞 **SUPPORT & QUESTIONS**

If you need help or clarification:
- Check `PROJECT_STATUS_AND_NEXT_STEPS.md` for feature status
- Check `QUICK_STATUS.md` for quick reference
- Review this guide's "Known Limitations" section

---

## ✅ **TESTING COMPLETION CRITERIA**

Testing is complete when:
- [ ] All 15 test scenarios passed
- [ ] All items in checklist marked done
- [ ] All bugs documented
- [ ] Screenshots captured
- [ ] Test report submitted

---

## 🎉 **THANK YOU!**

Your testing helps us build a better platform. Every bug you find makes WhisTrust more secure and reliable!

**Good Luck Testing!** 🚀



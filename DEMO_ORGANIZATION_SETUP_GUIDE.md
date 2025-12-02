# Demo Organization Setup Guide

**Purpose:** Set up a demo organization in the multi-tenant WhisTrust platform for showcasing to potential clients.

---

## 🎯 Overview

This guide will help you:

1. Create a `demo` organization in your multi-tenant system
2. Set up demo users with different roles
3. Populate sample data (reports, messages, timeline)
4. Configure the `/demo` landing page to point to this org
5. Add demo mode banners for visitors

---

## ✅ What's Been Updated

### 1. **SQL Scripts Created**

- `supabase/setup-demo-organization.sql` - Creates demo org and sample data
- `supabase/link-demo-users.sql` - Links auth users to org profiles
- `supabase/reset-demo-data.sql` - Resets data weekly/monthly

### 2. **Demo Page Updated**

- `/demo` now points to `/org/demo/*` (multi-tenant)
- Updated credentials: `admin@demo.com / Demo@2024`
- Reporter demo → `/org/demo/report`
- Manager login → `/org/demo/login`

### 3. **Demo Mode Banner Added**

- Shows on dashboard, reports, and login pages
- Indicates sample data environment
- Can be dismissed by users
- Auto-hides for non-demo orgs

---

## 📋 Step-by-Step Setup

### **Step 1: Create Demo Organization**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run `supabase/setup-demo-organization.sql`
3. This creates:
   - Organization: "Demo Company" (subdomain: `demo`)
   - Plan: Professional (unlimited reports/users)
   - 8 report categories
   - 10 sample reports with various statuses
   - Timeline entries and labels

**Expected Output:**

```
Demo organization created with ID: [UUID]
Created 10 sample reports for demo organization
```

---

### **Step 2: Create Demo Users in Supabase Auth**

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** (repeat for each user below)

**User 1 - Admin:**

- Email: `admin@demo.com`
- Password: `Demo@2024`
- Email Confirm: ✅ (auto-confirm)

**User 2 - Manager:**

- Email: `manager@demo.com`
- Password: `Demo@2024`
- Email Confirm: ✅

**User 3 - Investigator:**

- Email: `investigator@demo.com`
- Password: `Demo@2024`
- Email Confirm: ✅

3. **Copy each user's UUID** (you'll need these for next step)

---

### **Step 3: Link Users to Demo Organization**

1. Open `supabase/link-demo-users.sql`
2. Replace placeholders with actual user IDs:
   ```sql
   admin_user_id UUID := 'YOUR_ADMIN_USER_ID_HERE';
   manager_user_id UUID := 'YOUR_MANAGER_USER_ID_HERE';
   investigator_user_id UUID := 'YOUR_INVESTIGATOR_USER_ID_HERE';
   ```
3. Run the script in **SQL Editor**

**Expected Output:**

```
✅ Demo users linked successfully!
Admin: admin@demo.com / Demo@2024
Manager: manager@demo.com / Demo@2024
Investigator: investigator@demo.com / Demo@2024
Login at: /org/demo/login
```

---

### **Step 4: Verify Setup**

#### **A. Test Anonymous Reporting**

1. Visit: `http://localhost:3000/org/demo/report`
2. Fill form (category + 50+ char description)
3. Submit and save tracking code
4. Verify redirect to success page

#### **B. Test Admin Login**

1. Visit: `http://localhost:3000/org/demo/login`
2. Login with: `admin@demo.com / Demo@2024`
3. Should redirect to: `/org/demo/dashboard`
4. **Verify**: Demo mode banner appears at top
5. Check stats show ~10 reports

#### **C. Test Demo Landing Page**

1. Visit: `http://localhost:3000/demo`
2. Click **"Login to Dashboard"**
3. Should redirect to: `/org/demo/login`
4. Verify credentials shown: `admin@demo.com / Demo@2024`

#### **D. Test Manager Role**

1. Login as: `manager@demo.com / Demo@2024`
2. Verify: Can see analytics, can assign cases
3. Verify: Cannot see Users or Audit Logs pages

#### **E. Test Investigator Role**

1. Login as: `investigator@demo.com / Demo@2024`
2. Verify: Only sees assigned reports (3-4 reports)
3. Verify: Can update status, cannot assign cases

---

## 🔄 Resetting Demo Data (Weekly/Monthly)

### **Option 1: Manual Reset (Recommended)**

Run this SQL script to refresh all demo data:

```bash
# In Supabase SQL Editor
supabase/reset-demo-data.sql
```

This will:

- ✅ Delete old reports, timeline, messages
- ✅ Create fresh 10 sample reports
- ✅ Reassign to investigators
- ✅ Keep organization and users intact
- ✅ Update stats and counters

### **Option 2: Automated Reset (Advanced)**

Set up a **Supabase Edge Function** or **cron job** to run weekly:

```sql
-- Create a cron job (if using pg_cron extension)
SELECT cron.schedule(
  'reset-demo-data',
  '0 0 * * 0', -- Every Sunday at midnight
  $$
  -- Paste contents of reset-demo-data.sql here
  $$
);
```

---

## 📊 Demo Data Overview

### **Reports Created:**

- **Total**: 10 reports
- **Categories**: Fraud, Harassment, Safety, Ethics, Data Privacy, Regulatory
- **Statuses**: Mix of submitted, under review, investigating, resolved, closed
- **Priorities**: Mix of low, medium, high, urgent
- **Anonymous**: ~33% anonymous, rest with reporter info
- **Assigned**: 3-4 assigned to investigator for role testing

### **Timeline & Activity:**

- Each report has 1-3 timeline entries
- Status changes documented
- Comments and notes added
- Realistic timestamps (last 30 days)

### **Users:**

- **Admin**: Full access (all features)
- **Manager**: Can manage cases, view analytics
- **Investigator**: Sees only assigned cases (3-4 reports)

---

## 🎨 Demo Mode Features

### **Demo Banner Displays:**

- ✅ **Login Page**: Shows before login form
- ✅ **Dashboard**: Shows at top of main content
- ✅ **Reports Page**: Shows above filters
- ✅ **All Pages**: Only when `subdomain === 'demo'`

### **Banner Content:**

- 🎪 "Demo Mode" badge
- Organization name
- "Sample data" notice
- "Resets weekly" indicator
- Dismissible (except on login)

---

## 🚀 Sharing Demo with Clients

### **Landing Page:**

```
https://your-domain.com/demo
or
http://localhost:3000/demo
```

**What clients will see:**

1. Two options: "Test as Reporter" or "Test as Manager"
2. Demo credentials displayed
3. One-click login to dashboard

### **Direct Login:**

```
https://your-domain.com/org/demo/login
Credentials: admin@demo.com / Demo@2024
```

### **Anonymous Reporting:**

```
https://your-domain.com/org/demo/report
```

---

## 🔒 Security Considerations

### **Demo Organization Is Isolated:**

- ✅ Separate from production orgs
- ✅ RLS policies apply (no cross-org access)
- ✅ Can be reset anytime without affecting real data
- ✅ Can be deleted/recreated easily

### **Demo Credentials:**

- Use simple, memorable passwords: `Demo@2024`
- Not connected to real email accounts
- Can be shared publicly (it's demo data)

---

## 🛠️ Maintenance

### **Weekly Tasks:**

1. Run `reset-demo-data.sql` to refresh sample data
2. Check that all 3 demo users are active
3. Verify login still works
4. Test one complete flow (report → assign → resolve)

### **Monthly Tasks:**

1. Update demo credentials if needed
2. Review and update sample report content
3. Check that all features are showcased
4. Update documentation if new features added

---

## 🎯 Demo Showcase Checklist

When showing to clients, highlight:

- ✅ **Anonymous Reporting**: Submit a report from `/org/demo/report`
- ✅ **Multi-Role Access**: Login as Admin, Manager, and Investigator
- ✅ **Dashboard Analytics**: Real-time stats and charts
- ✅ **Case Management**: Assign, update status, add notes
- ✅ **Export Features**: PDF and Excel exports
- ✅ **Documentation Center**: New help section (all roles can access)
- ✅ **Audit Logs**: Complete activity tracking (Admin only)
- ✅ **User Management**: Add/edit users (Admin only)
- ✅ **Settings**: Branding, categories, SSO config

---

## 📞 Support

If you encounter issues:

1. **Check Supabase is running** (not paused)
2. **Verify `.env.local`** has correct Supabase credentials
3. **Check user IDs** in `link-demo-users.sql` match auth.users
4. **Review RLS policies** are enabled for all tables
5. **Check browser console** for specific errors

---

## ✅ Quick Verification

After setup, verify everything works:

```bash
# 1. Visit demo landing
http://localhost:3000/demo

# 2. Click "Login to Dashboard" → Should redirect to /org/demo/login

# 3. Login with admin@demo.com / Demo@2024

# 4. Should see:
#    - Dashboard with ~10 reports
#    - Demo mode banner at top
#    - All navigation items (Dashboard, Reports, Analytics, etc.)

# 5. Test other roles:
#    - Logout
#    - Login as manager@demo.com or investigator@demo.com
#    - Verify different permissions
```

---

**Demo organization is now ready to showcase your multi-tenant platform!** 🎉

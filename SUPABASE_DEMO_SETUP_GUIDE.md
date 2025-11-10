# Supabase Demo Users Setup Guide
**Complete Step-by-Step Instructions**
**Date:** November 9, 2025

---

## 📋 **Overview**

This guide will help you set up 5 demo user accounts in Supabase for client demonstrations.

**Time Required:** ~15-20 minutes
**Prerequisites:** Admin access to Supabase Dashboard

---

## 🎯 **Demo Accounts to Create**

| # | Role | Email | Full Name | Department |
|---|------|-------|-----------|------------|
| 1 | Admin | ahmed.admin@whistrust.com | Ahmed Al-Rashid | - |
| 2 | Manager | fatima.hr@whistrust.com | Fatima Hassan | HR |
| 3 | Manager | omar.finance@whistrust.com | Omar Abdullah | Finance |
| 4 | Investigator | yusuf.investigator@whistrust.com | Yusuf Ibrahim | Compliance |
| 5 | HR | aisha.hr@whistrust.com | Aisha Mohammed | HR |

**Common Password for All:** `Admin@WhistTrust2025`, `Manager@WhistTrust2025`, etc.

---

## 📝 **Step-by-Step Setup**

### **STEP 1: Run SQL Script**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your WhisTrust project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Paste SQL Script**
   - Open: `setup_demo_users.sql`
   - Copy entire contents
   - Paste into SQL Editor

4. **Execute Script**
   - Click "Run" button
   - Wait for success message
   - Should see: "Success. No rows returned"

5. **Verify Database Entries**
   - Run the verification query at bottom of script
   - Should see 5 rows returned
   - Check emails, names, roles, departments are correct

---

### **STEP 2: Create Authentication Users**

**IMPORTANT:** Each admin_profile must have a corresponding auth user!

#### **2.1: Navigate to Authentication**
- Click "Authentication" in left sidebar
- Click "Users" tab
- Click "Add user" button

---

#### **2.2: Create Admin User**

**User 1 of 5:**

```
Email: ahmed.admin@whistrust.com
Password: Admin@WhistTrust2025
☑️ Auto Confirm User (check this box)
```

**Click "Create user"**

✅ **Verification:**
- New user appears in list
- Email: ahmed.admin@whistrust.com
- Status: Confirmed (green)
- Copy the User ID (UUID) - you'll need this

---

#### **2.3: Link Auth User to Profile**

**Update admin_profiles with correct UUID:**

```sql
-- Run this in SQL Editor, replacing 'USER_UUID_HERE' with actual UUID
UPDATE admin_profiles 
SET id = 'USER_UUID_HERE'
WHERE email = 'ahmed.admin@whistrust.com';
```

**Or, if you want to use the generated UUID from profile:**

```sql
-- Check what UUID was generated
SELECT id, email FROM admin_profiles 
WHERE email = 'ahmed.admin@whistrust.com';

-- Then manually update auth.users table (advanced)
-- Or delete and recreate the admin_profile with matching UUID
```

---

#### **2.4: Create Manager (HR) User**

**User 2 of 5:**

```
Email: fatima.hr@whistrust.com
Password: Manager@WhistTrust2025
☑️ Auto Confirm User
```

**Click "Create user"**

Then link to profile (same process as step 2.3)

---

#### **2.5: Create Manager (Finance) User**

**User 3 of 5:**

```
Email: omar.finance@whistrust.com
Password: Manager@WhistTrust2025
☑️ Auto Confirm User
```

**Click "Create user"**

Then link to profile

---

#### **2.6: Create Investigator User**

**User 4 of 5:**

```
Email: yusuf.investigator@whistrust.com
Password: Investigator@WhistTrust2025
☑️ Auto Confirm User
```

**Click "Create user"**

Then link to profile

---

#### **2.7: Create HR Specialist User**

**User 5 of 5:**

```
Email: aisha.hr@whistrust.com
Password: HR@WhistTrust2025
☑️ Auto Confirm User
```

**Click "Create user"**

Then link to profile

---

## ✅ **Verification Steps**

### **Step 1: Check Database**

Run this query in SQL Editor:

```sql
-- Verify all 5 demo users exist
SELECT 
  email,
  full_name,
  role,
  department,
  created_at
FROM admin_profiles
WHERE email LIKE '%@whistrust.com'
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'manager' THEN 2
    WHEN 'investigator' THEN 3
    WHEN 'hr' THEN 4
  END,
  department,
  email;
```

**Expected Output:**
```
email                              | full_name        | role         | department  | created_at
-----------------------------------|------------------|--------------|-------------|-------------------
ahmed.admin@whistrust.com          | Ahmed Al-Rashid  | admin        | NULL        | 2025-11-09 ...
fatima.hr@whistrust.com            | Fatima Hassan    | manager      | HR          | 2025-11-09 ...
omar.finance@whistrust.com         | Omar Abdullah    | manager      | Finance     | 2025-11-09 ...
yusuf.investigator@whistrust.com   | Yusuf Ibrahim    | investigator | Compliance  | 2025-11-09 ...
aisha.hr@whistrust.com             | Aisha Mohammed   | hr           | HR          | 2025-11-09 ...
```

---

### **Step 2: Test Login**

For each user, test login:

1. **Go to:** `http://localhost:3000/admin/login` (or your deployed URL)

2. **Test Admin Login:**
   - Email: `ahmed.admin@whistrust.com`
   - Password: `Admin@WhistTrust2025`
   - **Expected:** Successful login → Dashboard

3. **Test Manager (HR) Login:**
   - Email: `fatima.hr@whistrust.com`
   - Password: `Manager@WhistTrust2025`
   - **Expected:** Successful login → Dashboard (HR cases only)

4. **Test Manager (Finance) Login:**
   - Email: `omar.finance@whistrust.com`
   - Password: `Manager@WhistTrust2025`
   - **Expected:** Successful login → Dashboard (Finance cases only)

5. **Test Investigator Login:**
   - Email: `yusuf.investigator@whistrust.com`
   - Password: `Investigator@WhistTrust2025`
   - **Expected:** Successful login → Dashboard (assigned cases only)

6. **Test HR Login:**
   - Email: `aisha.hr@whistrust.com`
   - Password: `HR@WhistTrust2025`
   - **Expected:** Successful login → Dashboard (HR cases only)

---

## 🔧 **Troubleshooting**

### **Issue 1: "User not found" error**
**Cause:** Auth user not created in Authentication tab
**Solution:** Create auth user manually in Supabase Dashboard

### **Issue 2: "Invalid credentials" error**
**Cause:** Password mismatch or typo
**Solution:** Reset password in Authentication → Users → Edit

### **Issue 3: User can login but has no role**
**Cause:** admin_profiles and auth.users IDs don't match
**Solution:** Update admin_profiles.id to match auth user UUID

### **Issue 4: Manager sees all cases (not filtered)**
**Cause:** Department not set correctly
**Solution:** 
```sql
UPDATE admin_profiles 
SET department = 'HR' 
WHERE email = 'fatima.hr@whistrust.com';
```

### **Issue 5: Investigator sees too many cases**
**Cause:** Cases not assigned to investigator
**Solution:** As Admin, assign some cases to the investigator

---

## 🧪 **Test Checklist**

After setup, verify each account:

### Admin (ahmed.admin@whistrust.com):
- [ ] Can login successfully
- [ ] Sees all cases (all departments)
- [ ] Can access Analytics
- [ ] Can access Audit Logs
- [ ] Can access User Management
- [ ] Can assign cases to anyone
- [ ] Can edit all cases

### Manager - HR (fatima.hr@whistrust.com):
- [ ] Can login successfully
- [ ] Sees ONLY HR department cases
- [ ] Can access Analytics
- [ ] Can access Audit Logs
- [ ] CANNOT access User Management
- [ ] Can assign cases within HR only
- [ ] Can edit HR cases

### Manager - Finance (omar.finance@whistrust.com):
- [ ] Can login successfully
- [ ] Sees ONLY Finance department cases
- [ ] Can access Analytics
- [ ] Can access Audit Logs
- [ ] CANNOT access User Management
- [ ] Can assign cases within Finance only
- [ ] Can edit Finance cases

### Investigator (yusuf.investigator@whistrust.com):
- [ ] Can login successfully
- [ ] Sees ONLY assigned cases
- [ ] CANNOT access Analytics
- [ ] CANNOT access Audit Logs
- [ ] CANNOT access User Management
- [ ] CANNOT assign cases
- [ ] Can edit assigned cases only

### HR Specialist (aisha.hr@whistrust.com):
- [ ] Can login successfully
- [ ] Sees HR-related cases only
- [ ] CANNOT access Analytics
- [ ] CANNOT access Audit Logs
- [ ] CANNOT access User Management
- [ ] Can send messages
- [ ] Limited editing permissions

---

## 📊 **Quick Reference**

### **Supabase Dashboard URLs:**

```
Project Dashboard: https://supabase.com/dashboard/project/[your-project-id]
SQL Editor: https://supabase.com/dashboard/project/[your-project-id]/sql
Authentication: https://supabase.com/dashboard/project/[your-project-id]/auth/users
Table Editor: https://supabase.com/dashboard/project/[your-project-id]/editor
```

### **Important Tables:**

- `admin_profiles` - User roles and departments
- `auth.users` - Authentication data
- `reports` - Case submissions
- `messages` - Case messages
- `audit_logs` - Activity tracking

---

## 🎭 **Alternative Setup Method (If UUID Issues)**

If you're having trouble matching UUIDs between auth.users and admin_profiles:

### **Method 1: Create Auth First**

1. Create all 5 auth users in Authentication tab
2. Copy each user's UUID
3. Modify SQL script to use specific UUIDs:

```sql
-- Example with specific UUID
INSERT INTO admin_profiles (
  id,
  email,
  full_name,
  role,
  department,
  created_at,
  updated_at
) VALUES (
  '12345678-1234-1234-1234-123456789abc', -- UUID from auth user
  'ahmed.admin@whistrust.com',
  'Ahmed Al-Rashid',
  'admin',
  NULL,
  NOW(),
  NOW()
);
```

### **Method 2: Use Trigger (Advanced)**

Create a database trigger that auto-creates admin_profile when auth user is created:

```sql
-- Create function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if email is @whistrust.com
  IF NEW.email LIKE '%@whistrust.com' THEN
    INSERT INTO public.admin_profiles (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Then manually update role and department after creation.

---

## 🎯 **Success Criteria**

Setup is complete when:

✅ All 5 SQL profile entries exist
✅ All 5 auth users created and confirmed
✅ UUIDs match between tables
✅ All users can login successfully
✅ Role-based access works correctly
✅ Department filtering works for managers

---

## 📞 **Support**

If you encounter issues:

1. Check Supabase logs
2. Verify RLS policies are enabled
3. Check admin_profiles structure matches schema
4. Ensure auth.users and admin_profiles IDs match
5. Test with Supabase PostgREST API explorer

---

## 🔐 **Security Notes**

**For Demo/Testing Only:**
- These are demo credentials
- Use strong, unique passwords for production
- Change passwords after client demo
- Consider temporary accounts that expire
- Monitor audit logs for demo account activity

**Production Recommendations:**
- Use more complex passwords
- Enable 2FA for admin accounts
- Implement password rotation policy
- Use role-based email aliases
- Add account expiration dates

---

## ✨ **Quick Setup Summary**

```bash
# 1. Open Supabase Dashboard
# 2. Go to SQL Editor
# 3. Run: setup_demo_users.sql
# 4. Go to Authentication → Users
# 5. Create 5 auth users (one for each email)
# 6. Set passwords as specified
# 7. Enable "Auto Confirm User"
# 8. Verify all users can login
# 9. Test role-based access
# 10. Ready for client demo! 🎉
```

---

**Estimated Time:**
- SQL Script: 2 minutes
- Auth Users: 10 minutes (2 minutes each)
- Testing: 5 minutes
- **Total: ~17 minutes**

---

**Created:** setup_demo_users.sql
**Documentation:** DEMO_CREDENTIALS.md
**Testing Guide:** COMPREHENSIVE_ROLE_BASED_TESTING_GUIDE.md

---


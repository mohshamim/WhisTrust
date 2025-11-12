# 🗄️ Phase 1: Database Setup Guide

## 📋 Overview

This guide walks you through setting up the multi-tenant database schema in your **Production Supabase** project.

**What you'll create:**
- `organizations` table (client companies)
- `admin_profiles` table (multi-tenant users)
- `reports` table (with tenant isolation)
- `audit_logs` table (compliance tracking)
- Row Level Security (RLS) policies
- Helper functions and triggers

---

## ⏱️ Estimated Time: 10 minutes

---

## 🎯 STEP 1: Open Production Supabase

1. Go to: https://supabase.com/dashboard
2. Select your **PRODUCTION** Supabase project
   - **NOT the demo project!**
   - Should be: `lyboxkxohvxkcolgrumw` or similar
   - The one you created for multi-tenant

3. Click **SQL Editor** in the left sidebar

---

## 🎯 STEP 2: Run Schema Migration

### Copy the First Migration:

1. Open the file: `supabase/migrations/001_organizations_schema.sql`
2. **Copy ALL the contents** (Ctrl+A, Ctrl+C)
3. Go back to Supabase SQL Editor
4. **Paste** into the editor
5. Click **"Run"** (or press Ctrl+Enter)

**Expected Result:**
```
✅ Organizations schema created successfully!
📊 Tables created: organizations, admin_profiles, reports, audit_logs
🔧 Helper functions ready
⏭️  Next: Run RLS policies migration
```

**If you see errors:**
- Make sure you're in the **PRODUCTION** Supabase (not demo)
- Check that you copied the entire SQL file
- Verify the project is fully initialized

---

## 🎯 STEP 3: Run RLS Policies Migration

### Copy the Second Migration:

1. Open the file: `supabase/migrations/002_rls_policies.sql`
2. **Copy ALL the contents** (Ctrl+A, Ctrl+C)
3. Go back to Supabase SQL Editor
4. **Clear** the previous SQL (or open a new query)
5. **Paste** the RLS policies SQL
6. Click **"Run"** (or press Ctrl+Enter)

**Expected Result:**
```
✅ RLS policies configured successfully!
🔒 Tenant isolation enabled
👮 Permission system ready
📊 Usage tracking active
⏭️  Next: Create first super admin user
```

---

## 🎯 STEP 4: Create Your First Super Admin

Now let's create YOUR super admin account!

### Copy this SQL (replace with YOUR email):

```sql
-- Create your super admin account
-- Replace 'your-email@example.com' with your actual email

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'your-email@example.com', -- ⚠️ CHANGE THIS!
    crypt('SuperAdmin@2025', gen_salt('bf')), -- ⚠️ CHANGE PASSWORD!
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
) RETURNING id;

-- Save the UUID returned above, then use it below!

-- Create super admin profile (use the UUID from above)
INSERT INTO admin_profiles (
    id,
    email,
    full_name,
    role,
    is_super_admin,
    organization_id,
    is_active
) VALUES (
    'PASTE-UUID-FROM-ABOVE-HERE', -- ⚠️ Paste the UUID!
    'your-email@example.com', -- ⚠️ Same as above!
    'Your Name', -- ⚠️ Your full name
    'super_admin',
    true,
    NULL, -- Super admins don't belong to an org
    true
);
```

**Instructions:**
1. **Replace** `your-email@example.com` with your actual email (2 places)
2. **Replace** `SuperAdmin@2025` with a strong password
3. **Replace** `Your Name` with your full name
4. Run the **first part** (INSERT INTO auth.users)
5. **Copy the UUID** that's returned
6. **Paste the UUID** into the second part
7. Run the **second part** (INSERT INTO admin_profiles)

---

## 🎯 STEP 5: Verify Setup

Run this verification query:

```sql
-- Verify tables exist
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('organizations', 'admin_profiles', 'reports', 'audit_logs')
ORDER BY table_name;

-- Verify your super admin was created
SELECT 
    id,
    email,
    full_name,
    role,
    is_super_admin,
    organization_id,
    created_at
FROM admin_profiles
WHERE is_super_admin = true;

-- Count tables
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';
```

**Expected Results:**
- ✅ 4 tables listed (organizations, admin_profiles, reports, audit_logs)
- ✅ Your super admin account appears
- ✅ `is_super_admin = true`
- ✅ `organization_id IS NULL`

---

## 🎯 STEP 6: Test Tenant Isolation

Create a test organization:

```sql
-- Create a test organization
INSERT INTO organizations (
    name,
    slug,
    subdomain,
    primary_contact_email,
    primary_contact_name,
    plan,
    status,
    max_admin_users,
    max_reports_per_month
) VALUES (
    'Test Company Inc',
    'test-company',
    'testco',
    'admin@testcompany.com',
    'Test Admin',
    'professional',
    'active',
    10,
    100
) RETURNING id, name, subdomain, created_at;
```

**Save the organization ID** - you'll need it later!

---

## ✅ VERIFICATION CHECKLIST

Before proceeding, verify:

- [ ] Schema migration ran successfully
- [ ] RLS policies migration ran successfully
- [ ] Super admin account created
- [ ] Can query organizations table
- [ ] Can query admin_profiles table
- [ ] Test organization created
- [ ] No errors in Supabase logs

---

## 🚨 TROUBLESHOOTING

### Error: "relation already exists"

**Solution:** Tables were already created. Safe to ignore or drop them first:
```sql
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS admin_profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
```
Then run the migrations again.

---

### Error: "permission denied"

**Solution:** Make sure you're logged in as the project owner in Supabase.

---

### Error: "function does not exist"

**Solution:** Run the schema migration (001) before the RLS migration (002).

---

### Can't login with super admin account

**Solution:** 
1. Verify the account exists in `auth.users`
2. Check the email is correct
3. Try resetting the password through Supabase Auth UI

---

## 🎯 WHAT YOU'VE ACCOMPLISHED

```
✅ Multi-tenant database schema created
✅ Tenant isolation with RLS enabled
✅ Organizations table ready
✅ Admin profiles table ready
✅ Reports table with tenant scoping
✅ Audit logging system
✅ Your super admin account created
✅ Test organization created
```

---

## 🚀 NEXT STEPS

Once database setup is complete, we'll build:

1. **Super Admin Authentication** - Login system
2. **Super Admin Dashboard** - Overview & metrics
3. **Organization Management UI** - CRUD operations
4. **Organization Details Page** - Individual org management

---

## 📞 READY TO CONTINUE?

Once you've completed all verification steps, tell me:

**"✅ Database setup complete"**

Or if you encounter issues:
- "Error at step X: [error message]"
- Screenshot of the error
- Which migration is causing the issue

---

**You're building a production-grade multi-tenant system!** 💪

**Next up: Super Admin authentication & UI!** 🚀


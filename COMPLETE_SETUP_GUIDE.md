# 🚀 COMPLETE SETUP GUIDE: CodeSquare & Al-Bawani Organizations

## ⚠️ IMPORTANT: Follow These Steps IN ORDER

---

## 📋 STEP 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/lyboxkxohvxkcolgrumw
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

---

## 📝 STEP 2: Create Organizations

Copy and paste this SQL script and click **RUN**:

```sql
-- DELETE all existing organizations
DELETE FROM organizations WHERE TRUE;

-- CREATE CodeSquare
INSERT INTO organizations (
    id, name, slug, subdomain, status, plan,
    primary_contact_email, primary_contact_name, billing_email,
    max_admin_users, max_reports_per_month, max_storage_mb,
    current_admin_users, current_reports_count, current_storage_mb,
    features, branding, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'CodeSquare', 'codesquare', 'codesquare', 'active', 'professional',
    'admin@codesquare.com', 'CodeSquare Admin', 'billing@codesquare.com',
    15, 100, 5120, 0, 0, 0,
    '{"anonymous_reporting": true, "file_attachments": true, "real_time_notifications": true, "advanced_analytics": true, "custom_branding": false, "api_access": false, "sso": false}'::jsonb,
    '{"primary_color": "#2563eb", "logo_url": null}'::jsonb,
    NOW(), NOW()
);

-- CREATE Al-Bawani
INSERT INTO organizations (
    id, name, slug, subdomain, status, plan,
    primary_contact_email, primary_contact_name, billing_email,
    max_admin_users, max_reports_per_month, max_storage_mb,
    current_admin_users, current_reports_count, current_storage_mb,
    features, branding, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'Al-Bawani', 'al-bawani', 'al-bawani', 'active', 'enterprise',
    'admin@al-bawani.com', 'Al-Bawani Admin', 'billing@al-bawani.com',
    50, 500, 10240, 0, 0, 0,
    '{"anonymous_reporting": true, "file_attachments": true, "real_time_notifications": true, "advanced_analytics": true, "custom_branding": true, "api_access": true, "sso": true}'::jsonb,
    '{"primary_color": "#059669", "logo_url": null}'::jsonb,
    NOW(), NOW()
);

-- VERIFY
SELECT id, name, slug, subdomain, status, plan FROM organizations ORDER BY name;
```

✅ **You should see 2 rows returned: Al-Bawani and CodeSquare**

---

## 👥 STEP 3: Create Auth Users Manually

### **Method A: Using Supabase Dashboard (RECOMMENDED)**

1. Go to **Authentication** → **Users** in your Supabase dashboard
2. Click **Add user** → **Create new user**
3. Create these users **ONE BY ONE**:

#### **CodeSquare Users:**

**User 1:**

- Email: `admin@codesquare.com`
- Password: `Code@123!`
- Auto Confirm User: ✅ YES

**User 2:**

- Email: `manager@codesquare.com`
- Password: `Code@123!`
- Auto Confirm User: ✅ YES

#### **Al-Bawani Users:**

**User 3:**

- Email: `admin@al-bawani.com`
- Password: `Bawani@123!`
- Auto Confirm User: ✅ YES

**User 4:**

- Email: `manager@al-bawani.com`
- Password: `Bawani@123!`
- Auto Confirm User: ✅ YES

**User 5:**

- Email: `investigator@al-bawani.com`
- Password: `Bawani@123!`
- Auto Confirm User: ✅ YES

✅ **You should now have 5 auth users + 1 super admin = 6 total users**

---

## 📝 STEP 4: Create Admin Profiles

After creating all 5 auth users, go back to **SQL Editor** and run this script:

```sql
DO $$
DECLARE
    codesquare_org_id UUID;
    albawani_org_id UUID;
    admin_codesquare_uid UUID;
    manager_codesquare_uid UUID;
    admin_albawani_uid UUID;
    manager_albawani_uid UUID;
    investigator_albawani_uid UUID;
BEGIN
    -- Get organization IDs
    SELECT id INTO codesquare_org_id FROM organizations WHERE subdomain = 'codesquare';
    SELECT id INTO albawani_org_id FROM organizations WHERE subdomain = 'al-bawani';

    -- Get user IDs from auth.users
    SELECT id INTO admin_codesquare_uid FROM auth.users WHERE email = 'admin@codesquare.com';
    SELECT id INTO manager_codesquare_uid FROM auth.users WHERE email = 'manager@codesquare.com';
    SELECT id INTO admin_albawani_uid FROM auth.users WHERE email = 'admin@al-bawani.com';
    SELECT id INTO manager_albawani_uid FROM auth.users WHERE email = 'manager@al-bawani.com';
    SELECT id INTO investigator_albawani_uid FROM auth.users WHERE email = 'investigator@al-bawani.com';

    -- Create CodeSquare profiles
    INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin)
    VALUES
        (admin_codesquare_uid, codesquare_org_id, 'admin@codesquare.com', 'John Smith', 'admin', 'IT', true, false),
        (manager_codesquare_uid, codesquare_org_id, 'manager@codesquare.com', 'Sarah Johnson', 'manager', 'HR', true, false)
    ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        department = EXCLUDED.department;

    -- Create Al-Bawani profiles
    INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin)
    VALUES
        (admin_albawani_uid, albawani_org_id, 'admin@al-bawani.com', 'Ahmed Al-Bawani', 'admin', 'Administration', true, false),
        (manager_albawani_uid, albawani_org_id, 'manager@al-bawani.com', 'Fatima Hassan', 'manager', 'Compliance', true, false),
        (investigator_albawani_uid, albawani_org_id, 'investigator@al-bawani.com', 'Omar Abdullah', 'investigator', 'Internal Audit', true, false)
    ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        department = EXCLUDED.department;
END $$;

-- VERIFY
SELECT ap.email, ap.full_name, ap.role, o.name as organization
FROM admin_profiles ap
JOIN organizations o ON ap.organization_id = o.id
WHERE ap.is_super_admin = false
ORDER BY o.name, ap.role;
```

✅ **You should see 5 rows returned with all user details**

---

## 🧪 STEP 5: Test in Browser

1. **Clear your browser cache**: Press `Ctrl + Shift + Delete` → Clear ALL data
2. **Restart your dev server**: Stop (`Ctrl+C`) and run `npm run dev`
3. **Test the diagnostic page**: Open http://localhost:3000/diagnostic
   - Should show: "1 organization found" → Al-Bawani
4. **Test Al-Bawani login**: http://localhost:3000/org/al-bawani/login
   - Email: `admin@al-bawani.com`
   - Password: `Bawani@123!`
5. **Test CodeSquare login**: http://localhost:3000/org/codesquare/login
   - Email: `admin@codesquare.com`
   - Password: `Code@123!`

---

## 📊 STEP 6: Check Console Logs

With the debugging code I added, you should see these logs in your browser console:

```
🔍 [MULTI-TENANT] Detected environment: production
🔍 [CLIENT-AUTH] Subdomain parameter: al-bawani
🔍 [CLIENT-AUTH] Data received: { name: "Al-Bawani", subdomain: "al-bawani", ... }
✅ [CLIENT-AUTH] Organization found!
✅ [CLIENT LOGIN] Organization found: Al-Bawani
```

If you see `❌ No data returned`, then the SQL script didn't work. Re-run Step 2.

---

## 🔑 COMPLETE CREDENTIALS

### **Super Admin**

- URL: http://localhost:3000/superadmin/login
- Email: `sup-adm@whistrust.com`
- Password: `sup-pass-adm!1@3#5`

### **CodeSquare**

- URL: http://localhost:3000/org/codesquare/login
- Admin: `admin@codesquare.com` / `Code@123!`
- Manager: `manager@codesquare.com` / `Code@123!`

### **Al-Bawani**

- URL: http://localhost:3000/org/al-bawani/login
- Admin: `admin@al-bawani.com` / `Bawani@123!`
- Manager: `manager@al-bawani.com` / `Bawani@123!`
- Investigator: `investigator@al-bawani.com` / `Bawani@123!`

---

## 🐛 IF IT STILL DOESN'T WORK

**Check the console logs in your browser (F12 → Console tab) and send me a screenshot!**

The debug code will tell us exactly where it's failing. Look for:

- ❌ Red error messages
- The Supabase URL being used
- The environment detected
- The query results

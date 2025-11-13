# 🚀 REPLACE AL-BAWANI WITH AISAR - Quick Guide

## 📋 **STEP-BY-STEP PROCESS**

---

## **STEP 1: Delete Al-Bawani & Create AISAR Organization**

### Run in Supabase SQL Editor:

**File:** `supabase/REPLACE_ALBAWANI_WITH_AISAR.sql`

```sql
-- Delete Al-Bawani
DELETE FROM organizations WHERE subdomain = 'al-bawani';

-- Create AISAR
INSERT INTO organizations (
    id, name, slug, subdomain, status, plan,
    primary_contact_email, primary_contact_name, billing_email,
    max_admin_users, max_reports_per_month, max_storage_mb,
    current_admin_users, current_reports_count, current_storage_mb,
    features, branding, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'AISAR', 'aisar', 'aisar', 'active', 'enterprise',
    'admin@aisar.com', 'AISAR Admin', 'billing@aisar.com',
    50, 500, 10240, 0, 0, 0,
    '{"anonymous_reporting": true, "file_attachments": true, "real_time_notifications": true, "advanced_analytics": true, "custom_branding": true, "api_access": true, "sso": true}'::jsonb,
    '{"primary_color": "#0891b2", "logo_url": null}'::jsonb,
    NOW(), NOW()
);

-- Verify
SELECT id, name, slug, subdomain, status, plan FROM organizations ORDER BY name;
```

✅ **Expected Result:** 2 organizations (CodeSquare, AISAR)

---

## **STEP 2: Delete Old Al-Bawani Auth Users**

Go to **Supabase Dashboard → Authentication → Users**

Delete these users:
- ❌ `admin@al-bawani.com`
- ❌ `manager@al-bawani.com`
- ❌ `hr@al-bawani.com`

---

## **STEP 3: Create AISAR Auth Users**

Go to **Supabase Dashboard → Authentication → Users** → Click **"Add user"**

Create these 3 users:

### **User 1:**
- Email: `admin@aisar.com`
- Password: `Aisar@123!` (or your choice)
- Auto Confirm User: ✅ YES

### **User 2:**
- Email: `manager@aisar.com`
- Password: `Aisar@123!`
- Auto Confirm User: ✅ YES

### **User 3:**
- Email: `hr@aisar.com`
- Password: `Aisar@123!`
- Auto Confirm User: ✅ YES

---

## **STEP 4: Create AISAR Admin Profiles**

### Run in Supabase SQL Editor:

**File:** `supabase/CREATE_AISAR_PROFILES.sql`

This will create admin_profiles for all 3 AISAR users.

✅ **Expected Result:** 3 rows showing AISAR users with their roles

---

## **STEP 5: Test in Browser**

1. **Clear browser cache**: `Ctrl + Shift + Delete` → Clear all
2. **Restart dev server**: `Ctrl+C` then `npm run dev`
3. **Test AISAR login**: http://localhost:3000/org/aisar/login
   - Email: `admin@aisar.com`
   - Password: `Aisar@123!`
4. **Check diagnostic**: http://localhost:3000/diagnostic
   - Should show: **2 organizations** (CodeSquare, AISAR)

---

## 🔑 **UPDATED CREDENTIALS**

### **Super Admin**
- URL: http://localhost:3000/superadmin/login
- Email: `sup-adm@whistrust.com`
- Password: `sup-pass-adm!1@3#5`

### **CodeSquare** (unchanged)
- URL: http://localhost:3000/org/codesquare/login
- Admin: `admin@codesquare.com`
- Investigator: `investigator@codesquare.com`

### **AISAR** (new)
- URL: http://localhost:3000/org/aisar/login
- Admin: `admin@aisar.com` / `Aisar@123!`
- Manager: `manager@aisar.com` / `Aisar@123!`
- HR: `hr@aisar.com` / `Aisar@123!`

---

## 📊 **Final Setup Summary**

| Organization | Users | Total |
|-------------|-------|-------|
| CodeSquare | admin, investigator | 2 |
| AISAR | admin, manager, hr | 3 |
| **Total** | | **5** |

Plus 1 Super Admin = **6 total users**

---

## 🐛 **Troubleshooting**

If you see "Organization Not Found" error:

1. Check console logs (F12) for debug messages
2. Verify organization exists: http://localhost:3000/diagnostic
3. Check Supabase SQL Editor:
   ```sql
   SELECT * FROM organizations WHERE subdomain = 'aisar';
   ```

If the organization doesn't exist, re-run Step 1.



# Setup Test Users for WhisTrust Testing

This guide will help you create test users with different roles for comprehensive testing.

## Prerequisites

- CodeSquare organization must exist in your Supabase database
- Access to Supabase SQL Editor
- Access to Supabase Auth UI

## Step 1: Create Auth Users FIRST (Required!)

**⚠️ IMPORTANT: You MUST create auth users BEFORE running the SQL script!**

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Create these users **ONE BY ONE**:

**User 1 - Admin:**
- Email: `admin@codesquare.com`
- Password: `CodeSquare@2024`
- Auto Confirm User: ✅ **YES** (check this box!)

**User 2 - Manager:**
- Email: `manager@codesquare.com`
- Password: `Manager@2024`
- Auto Confirm User: ✅ **YES**

**User 3 - Investigator:**
- Email: `investigator@codesquare.com`
- Password: `Investigator@2024`
- Auto Confirm User: ✅ **YES**

✅ **After creating all 3 users, proceed to Step 2**

## Step 2: Run SQL Script to Create User Profiles

1. Open your Supabase project
2. Go to **SQL Editor**
3. Open the file: `whistrust-tester-web/setup-test-users.sql`
4. Copy and paste the entire SQL script
5. Click **Run**

This will create admin profiles for:
- `admin@codesquare.com` (Admin role)
- `manager@codesquare.com` (Manager role)
- `investigator@codesquare.com` (Investigator role)

**Note:** The script will automatically use the UUIDs from the auth users you created in Step 1.

After running the SQL script, you need to create corresponding auth users:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User** → **Create New User**
3. For each user, create with these credentials:

**Admin:**
- Email: `admin@codesquare.com`
- Password: `CodeSquare@2024`
- Auto Confirm User: ✅ (checked)

**Manager:**
- Email: `manager@codesquare.com`
- Password: `Manager@2024`
- Auto Confirm User: ✅ (checked)

**HR:**
- Email: `hr@codesquare.com`
- Password: `HR@2024`
- Auto Confirm User: ✅ (checked)

**Investigator:**
- Email: `investigator@codesquare.com`
- Password: `Investigator@2024`
- Auto Confirm User: ✅ (checked)

### Option B: Using SQL (Advanced)

If you prefer to create auth users via SQL, you'll need to:

1. Get the user IDs from the admin_profiles created in Step 1
2. Create auth users with matching IDs
3. Set encrypted passwords

**Note:** This is more complex and requires direct database access.

## Step 3: Verify Users Are Created

Run this query in Supabase SQL Editor:

```sql
SELECT 
    ap.email,
    ap.full_name,
    ap.role,
    ap.department,
    ap.is_active,
    o.name as organization
FROM admin_profiles ap
JOIN organizations o ON ap.organization_id = o.id
WHERE o.subdomain = 'codesquare'
ORDER BY ap.role, ap.email;
```

You should see 3 users:
- admin@codesquare.com (admin)
- manager@codesquare.com (manager)
- investigator@codesquare.com (investigator)

## Step 4: Test Login

Test each user can login:

1. **Admin:** `http://localhost:3001/org/codesquare/login`
   - Email: `admin@codesquare.com`
   - Password: `CodeSquare@2024`

2. **Manager:** `http://localhost:3001/org/codesquare/login`
   - Email: `manager@codesquare.com`
   - Password: `Manager@2024`

3. **Investigator:** `http://localhost:3001/org/codesquare/login`
   - Email: `investigator@codesquare.com`
   - Password: `Investigator@2024`

## Test Credentials Summary

| Role | Email | Password | Organization |
|------|-------|----------|--------------|
| Admin | `admin@codesquare.com` | `CodeSquare@2024` | CodeSquare |
| Manager | `manager@codesquare.com` | `Manager@2024` | CodeSquare |
| Investigator | `investigator@codesquare.com` | `Investigator@2024` | CodeSquare |

## Troubleshooting

### Issue: "Auth user ... not found!" error when running SQL
**Solution:** You must create the auth users in Supabase Auth UI FIRST before running the SQL script. The script checks for existing auth users and uses their UUIDs.

### Issue: "User not found" when logging in
**Solution:** Make sure you created the auth user in Supabase Auth UI with the exact same email and password.

### Issue: "Profile not found" after login
**Solution:** Make sure you ran the SQL script AFTER creating the auth users. The script automatically links the profiles to the auth users.

### Issue: "Organization not found"
**Solution:** Make sure CodeSquare organization exists. Run:
```sql
SELECT * FROM organizations WHERE subdomain = 'codesquare';
```

### Issue: "Invalid credentials"
**Solution:** 
- Verify password is correct
- Check if user is confirmed in Supabase Auth
- Verify email matches exactly (case-sensitive)

## Next Steps

Once users are created, you can run all the tests:

```bash
cd whistrust-tester-web
npx playwright test
```

Or run specific role tests:
```bash
npx playwright test tests/organization-admin-complete-flow.spec.ts
npx playwright test tests/manager-complete-flow.spec.ts
npx playwright test tests/investigator-complete-flow.spec.ts
```


-- =====================================================
-- DIAGNOSE DEMO ORGANIZATION SETUP
-- =====================================================

-- Step 1: Check if organizations table exists
SELECT 
  '=== CHECKING TABLES ===' AS check_type,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'organizations';

-- Step 2: Check all columns in organizations table
SELECT 
  '=== ORGANIZATIONS TABLE COLUMNS ===' AS check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
ORDER BY ordinal_position;

-- Step 3: Check if demo organization exists
SELECT 
  '=== DEMO ORG CHECK ===' AS check_type,
  *
FROM organizations
WHERE subdomain = 'demo';

-- Step 4: List all organizations
SELECT 
  '=== ALL ORGANIZATIONS ===' AS check_type,
  subdomain,
  name,
  status,
  plan,
  created_at
FROM organizations
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Check if demo users exist in auth.users
SELECT 
  '=== AUTH USERS CHECK ===' AS check_type,
  id,
  email,
  created_at
FROM auth.users
WHERE email IN ('admin@demo.com', 'manager@demo.com', 'investigator@demo.com');

-- Step 6: Check if demo users are in admin_profiles
SELECT 
  '=== ADMIN PROFILES CHECK ===' AS check_type,
  id,
  email,
  full_name,
  role,
  organization_id,
  is_active
FROM admin_profiles
WHERE email IN ('admin@demo.com', 'manager@demo.com', 'investigator@demo.com');

-- Step 7: Check required columns exist
SELECT 
  '=== REQUIRED COLUMNS CHECK ===' AS check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'slug') 
    THEN '✅ slug exists'
    ELSE '❌ slug missing'
  END as slug_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'subdomain') 
    THEN '✅ subdomain exists'
    ELSE '❌ subdomain missing'
  END as subdomain_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'primary_contact_email') 
    THEN '✅ primary_contact_email exists'
    ELSE '❌ primary_contact_email missing'
  END as email_status;


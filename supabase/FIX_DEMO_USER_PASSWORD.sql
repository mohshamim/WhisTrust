-- =====================================================
-- FIX DEMO USER PASSWORD
-- =====================================================
-- This script resets the password for demo users
-- Run this if you're getting "Invalid email or password"
-- =====================================================

-- OPTION 1: Check if users exist and their details
SELECT 
  '=== CHECKING AUTH USERS ===' AS info,
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email IN ('admin@demo.com', 'manager@demo.com', 'investigator@demo.com')
ORDER BY email;

-- OPTION 2: If users don't exist, you need to create them manually
-- Go to: Supabase Dashboard → Authentication → Users → Add User
-- Create:
--   Email: admin@demo.com
--   Password: Demo@2024
--   Auto-confirm email: YES
--
-- Then get the UUID and update DEMO_SETUP_SIMPLIFIED.sql

-- OPTION 3: If password is wrong, reset it
-- You'll need to do this in Supabase Dashboard:
-- Authentication → Users → Find user → Reset Password
-- Or send password reset email

-- Check if admin_profiles are linked correctly
SELECT 
  '=== CHECKING ADMIN PROFILES ===' AS info,
  ap.id,
  ap.email,
  ap.organization_id,
  ap.is_active,
  o.subdomain as org_subdomain,
  o.name as org_name,
  o.status as org_status
FROM admin_profiles ap
LEFT JOIN organizations o ON ap.organization_id = o.id
WHERE ap.email IN ('admin@demo.com', 'manager@demo.com', 'investigator@demo.com')
ORDER BY ap.email;

-- Check demo organization
SELECT 
  '=== DEMO ORGANIZATION ===' AS info,
  id,
  name,
  subdomain,
  status,
  plan,
  current_admin_users,
  current_reports_count
FROM organizations
WHERE subdomain = 'demo';


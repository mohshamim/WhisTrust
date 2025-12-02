-- =====================================================
-- RESET ADMIN PASSWORD TO Demo@2024
-- =====================================================
-- This manually sets the password using Supabase admin functions
-- Note: You may need to do this via Dashboard instead
-- =====================================================

-- OPTION 1: Send password reset email (safest)
-- Go to Supabase Dashboard → Authentication → Users → admin@demo.com
-- Click "Send Password Recovery"
-- User will receive email to set password

-- OPTION 2: Manually update password (requires service role key)
-- This won't work with anon key, needs to be done via Dashboard

-- OPTION 3: Delete and recreate user (easiest via Dashboard)
-- 1. Delete admin@demo.com from Authentication → Users
-- 2. Add user: admin@demo.com / Demo@2024 / Auto-confirm ✅
-- 3. Copy new UUID
-- 4. Run this:

-- UPDATE admin_profiles
-- SET id = 'NEW_UUID_HERE'
-- WHERE email = 'admin@demo.com';

-- OPTION 4: Check what password was actually set
-- Unfortunately can't view password hash from SQL
-- Must reset via Dashboard

SELECT 
  '⚠️ PASSWORD RESET REQUIRED' as message,
  'The password for admin@demo.com needs to be reset to Demo@2024' as action,
  'Go to Supabase Dashboard → Authentication → Users → Find admin@demo.com' as step_1,
  'Click three dots → Reset Password or Delete & Recreate' as step_2;


-- Fix Admin Profiles Issue
-- Run this in Supabase SQL Editor

-- 1. Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admin_profiles'
ORDER BY ordinal_position;

-- 2. Check if admin profile exists
SELECT * FROM admin_profiles;

-- 3. Insert admin profile (NO email column)
-- Replace 'YOUR_AUTH_UID' with the actual UUID from auth.users
INSERT INTO admin_profiles (id, full_name, role)
VALUES (
  'YOUR_AUTH_UID',  -- Replace with actual auth.uid()
  'Admin User', 
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 4. Verify the profile was created
SELECT * FROM admin_profiles;

-- 5. Check reports count
SELECT COUNT(*) as total_reports FROM reports;

-- 6. Check current authenticated user
SELECT auth.uid() as current_user_id;

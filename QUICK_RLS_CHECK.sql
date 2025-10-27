-- Quick RLS Check for WhisTrust
-- Run this in Supabase SQL Editor to debug why reports aren't showing

-- 1. Check if the report exists at all
SELECT * FROM reports WHERE tracking_code = 'OXWV362';

-- 2. Check what user you're authenticated as in Supabase
SELECT auth.uid() as current_user_id, auth.role() as current_role;

-- 3. Check if you have admin_profiles entry
SELECT * FROM admin_profiles WHERE id = auth.uid();

-- 4. Check all RLS policies on reports table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'reports';

-- 5. Count total reports (this should work regardless of RLS when logged in as postgres)
SELECT COUNT(*) as total_reports FROM reports;

-- 6. Try to manually query with different roles
SET ROLE anon;
SELECT * FROM reports WHERE tracking_code = 'OXWV362';
RESET ROLE;

-- 7. Check if table has all Phase 3 columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reports'
ORDER BY ordinal_position;

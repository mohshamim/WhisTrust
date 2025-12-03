-- =============================================================================
-- DEBUG: Check ALL RLS policies on organizations table
-- =============================================================================

-- 1. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'organizations';

-- 2. Show ALL policies on organizations
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies 
WHERE tablename = 'organizations'
ORDER BY cmd, policyname;

-- 3. Try to query as anon would
SET ROLE anon;
SELECT id, name, subdomain, status FROM organizations WHERE subdomain = 'demo';
RESET ROLE;

-- 4. Try to query as authenticated would
SET ROLE authenticated;
SELECT id, name, subdomain, status FROM organizations WHERE subdomain = 'demo';
RESET ROLE;

-- If these fail, we need to fix the policies


-- =============================================================================
-- TEMPORARY: Disable RLS on organizations table
-- =============================================================================
-- This will help us test if RLS is the issue
-- =============================================================================

-- Disable RLS temporarily
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'organizations';

-- Test query that tracking page uses
SELECT id, name, subdomain, status FROM organizations WHERE subdomain = 'demo';
SELECT id, name, subdomain, status FROM organizations WHERE subdomain = 'codesquare';

DO $$
BEGIN
  RAISE NOTICE '⚠️  RLS DISABLED on organizations table';
  RAISE NOTICE '⚠️  This is temporary for testing';
  RAISE NOTICE '✅ Tracking page should work now';
END $$;


-- =============================================================================
-- TEMPORARY: DISABLE RLS FOR TESTING
-- =============================================================================
-- This will help us confirm if RLS is the issue
-- We'll re-enable it properly after confirming the insert works
-- =============================================================================

-- Completely disable RLS for testing
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'contact_submissions';

DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE '⚠️  RLS TEMPORARILY DISABLED FOR TESTING';
  RAISE NOTICE '⚠️  contact_submissions is now open';
  RAISE NOTICE '⚠️  Test the contact form now!';
  RAISE NOTICE '================================================';
END $$;


-- =============================================================================
-- FIX: Add explicit anon role to INSERT policy
-- =============================================================================
-- The issue: "public" in PostgreSQL policies means "all roles"
-- BUT Supabase anon key authenticates as "anon" role specifically
-- We need to explicitly grant to anon role
-- =============================================================================

-- Check current policies
SELECT policyname, roles, cmd
FROM pg_policies 
WHERE tablename = 'contact_submissions';

-- Drop the public policy and create one specifically for anon
DROP POLICY IF EXISTS "contact_allow_all_insert" ON contact_submissions;

-- Create policy specifically for anon role (unauthenticated users)
CREATE POLICY "contact_anon_insert"
  ON contact_submissions
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also create for authenticated (just in case)
CREATE POLICY "contact_authenticated_insert"
  ON contact_submissions
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verify the changes
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'contact_submissions'
ORDER BY cmd, policyname;

-- Double-check grants
SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'contact_submissions';

DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ Fixed! Policies now specifically target:';
  RAISE NOTICE '   - anon role (for anonymous submissions)';
  RAISE NOTICE '   - authenticated role (for logged-in users)';
  RAISE NOTICE '================================================';
END $$;


-- =============================================================================
-- CHECK CURRENT STATE AND RESET COMPLETELY
-- =============================================================================

-- 1. Show ALL current policies
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
WHERE tablename = 'contact_submissions'
ORDER BY cmd, policyname;

-- 2. Show table owner
SELECT tableowner 
FROM pg_tables 
WHERE tablename = 'contact_submissions';

-- 3. Show RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'contact_submissions';

-- Now let's do a COMPLETE RESET

-- 4. DISABLE RLS temporarily
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;

-- 5. Drop ALL policies (even ones we might have missed)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'contact_submissions'
    ) LOOP
        EXECUTE 'DROP POLICY ' || quote_ident(r.policyname) || ' ON contact_submissions';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- 6. RE-ENABLE RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- 7. Create ONLY the anon INSERT policy (simplest possible)
CREATE POLICY "anon_can_insert"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 8. Create authenticated INSERT policy
CREATE POLICY "auth_can_insert"
  ON contact_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 9. SELECT policies for admins
CREATE POLICY "auth_can_select"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "auth_can_update"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 10. Verify final state
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'contact_submissions'
ORDER BY cmd, policyname;

DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ COMPLETE RESET DONE';
  RAISE NOTICE '✅ RLS enabled with fresh policies';
  RAISE NOTICE '✅ anon can INSERT';
  RAISE NOTICE '✅ authenticated can INSERT, SELECT, UPDATE';
  RAISE NOTICE '================================================';
END $$;


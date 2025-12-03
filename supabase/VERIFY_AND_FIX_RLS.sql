-- =============================================================================
-- VERIFY AND FIX: Contact Form RLS - More Permissive Policy
-- =============================================================================
-- This creates a completely open policy for INSERT to contact_submissions
-- =============================================================================

-- Step 1: Check what policies currently exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command
FROM pg_policies 
WHERE tablename = 'contact_submissions';

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Allow public to insert contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for anon" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anonymous submissions" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_insert_policy" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON contact_submissions;

-- Step 3: Create a completely permissive INSERT policy
-- This allows ANYONE (even unauthenticated) to insert
CREATE POLICY "contact_submissions_allow_anonymous_insert"
  ON contact_submissions
  FOR INSERT
  WITH CHECK (true);  -- No restrictions at all

-- Step 4: Create SELECT policy for authenticated users
DROP POLICY IF EXISTS "Allow authenticated admins to read contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_select_policy" ON contact_submissions;

CREATE POLICY "contact_submissions_select_authenticated"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Step 5: Create UPDATE policy for authenticated users
DROP POLICY IF EXISTS "Allow authenticated admins to update contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_update_policy" ON contact_submissions;

CREATE POLICY "contact_submissions_update_authenticated"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 6: Make absolutely sure RLS is enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Step 7: Verify the setup
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  CASE 
    WHEN qual IS NULL THEN 'No restriction'
    ELSE qual
  END as using_clause,
  CASE 
    WHEN with_check IS NULL THEN 'No restriction'
    ELSE with_check
  END as check_clause
FROM pg_policies 
WHERE tablename = 'contact_submissions'
ORDER BY cmd, policyname;

-- Step 8: Test that we can see the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contact_submissions'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ RLS Policies Updated!';
  RAISE NOTICE '✅ INSERT: Open to all (no auth needed)';
  RAISE NOTICE '✅ SELECT: Authenticated users only';
  RAISE NOTICE '✅ UPDATE: Authenticated users only';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Now test the contact form!';
END $$;


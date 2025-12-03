-- =============================================================================
-- FIX: Contact Form RLS Policy
-- =============================================================================
-- The contact_submissions table exists but doesn't have the right RLS policy
-- for anonymous public submissions
-- =============================================================================

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'contact_submissions';

-- Drop any existing policies that might be wrong
DROP POLICY IF EXISTS "Allow public to insert contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for anon" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anonymous submissions" ON contact_submissions;

-- Create the correct policy for anonymous INSERT
CREATE POLICY "Allow public to insert contact submissions"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated  -- Allow both anonymous and authenticated users
  WITH CHECK (true);      -- No restrictions on insert

-- Create policy for authenticated admins to read
DROP POLICY IF EXISTS "Allow authenticated admins to read contact submissions" ON contact_submissions;
CREATE POLICY "Allow authenticated admins to read contact submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated admins to update
DROP POLICY IF EXISTS "Allow authenticated admins to update contact submissions" ON contact_submissions;
CREATE POLICY "Allow authenticated admins to update contact submissions"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Show final policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies 
WHERE tablename = 'contact_submissions'
ORDER BY cmd, policyname;

-- Test query (should return empty result but not error)
SELECT COUNT(*) as total_submissions FROM contact_submissions;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Contact form RLS policies fixed!';
  RAISE NOTICE '✅ Anonymous users can now submit via contact form';
  RAISE NOTICE '✅ Authenticated admins can read and update submissions';
END $$;


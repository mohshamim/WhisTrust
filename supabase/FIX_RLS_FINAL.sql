-- =============================================================================
-- FINAL FIX: Contact Form RLS - Grant Direct Access to anon Role
-- =============================================================================
-- This completely disables RLS checks for INSERT on contact_submissions
-- OR grants explicit INSERT to public/anon role
-- =============================================================================

-- Option 1: Check if RLS is causing issues by temporarily disabling it
-- (We'll re-enable with proper policy after)
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;

-- Now enable it back with the most permissive policy
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'contact_submissions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON contact_submissions';
    END LOOP;
END $$;

-- Create the most permissive INSERT policy possible
-- This allows ALL roles (including anon, authenticated, service_role)
CREATE POLICY "contact_allow_all_insert"
  ON contact_submissions
  AS PERMISSIVE
  FOR INSERT
  TO public  -- public means ALL roles
  WITH CHECK (true);

-- Create SELECT policy for authenticated
CREATE POLICY "contact_authenticated_select"
  ON contact_submissions
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (true);

-- Create UPDATE policy for authenticated
CREATE POLICY "contact_authenticated_update"
  ON contact_submissions
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'contact_submissions'
ORDER BY cmd;

-- Grant explicit INSERT permission to anon role
GRANT INSERT ON contact_submissions TO anon;
GRANT INSERT ON contact_submissions TO authenticated;

-- Grant USAGE on the sequence for id generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ RLS Fixed with maximum permissions!';
  RAISE NOTICE '✅ INSERT: Open to ALL roles (anon, authenticated)';
  RAISE NOTICE '✅ Direct GRANT permissions added';
  RAISE NOTICE '✅ Sequence permissions granted';
  RAISE NOTICE '================================================';
END $$;


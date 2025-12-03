-- =============================================================================
-- FIX: Organizations Table RLS for Public Access
-- =============================================================================
-- The tracking page needs to read organization details anonymously
-- =============================================================================

-- Check current policies
SELECT policyname, roles, cmd
FROM pg_policies 
WHERE tablename = 'organizations';

-- Drop restrictive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON organizations;
DROP POLICY IF EXISTS "Allow public read for active organizations" ON organizations;
DROP POLICY IF EXISTS "organizations_select_policy" ON organizations;

-- Create policy allowing anyone (including anon) to read active organizations
CREATE POLICY "allow_public_read_active_organizations"
  ON organizations
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Verify RLS is enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Test query (should work now)
SELECT id, name, subdomain, status 
FROM organizations 
WHERE subdomain = 'demo';

-- Show policies
SELECT policyname, roles, cmd
FROM pg_policies 
WHERE tablename = 'organizations';

DO $$
BEGIN
  RAISE NOTICE '✅ Organizations RLS fixed!';
  RAISE NOTICE '✅ Anonymous users can now read active organizations';
  RAISE NOTICE '✅ Tracking page should work now';
END $$;


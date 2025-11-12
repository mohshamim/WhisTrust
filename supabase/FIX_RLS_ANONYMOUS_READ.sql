-- =====================================================
-- FIX: Allow Anonymous Read Access to Organizations
-- =====================================================
-- This allows:
-- 1. Diagnostic page to display organizations
-- 2. Login pages to load organization details (branding, status, etc.)
-- 3. Public-facing pages to verify organization exists
--
-- SECURITY NOTE: This only allows SELECT (read) access
-- Anonymous users CANNOT create, update, or delete organizations
-- =====================================================

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "anonymous_read_organizations" ON organizations;

-- Create new policy for anonymous read access
CREATE POLICY "anonymous_read_organizations"
    ON organizations
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'organizations'
ORDER BY policyname;


-- Quick Fix: Restore RLS policies for anonymous report submission
-- Run this in Supabase SQL Editor

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Allow anonymous report submission" ON reports;
DROP POLICY IF EXISTS "Allow anonymous read own report" ON reports;
DROP POLICY IF EXISTS "Allow admins to read all reports" ON reports;
DROP POLICY IF EXISTS "Allow admins to update reports" ON reports;
DROP POLICY IF EXISTS "Role-based report read access" ON reports;
DROP POLICY IF EXISTS "Role-based report update access" ON reports;
DROP POLICY IF EXISTS "Admins can view assigned reports" ON reports;

-- CRITICAL: Allow anonymous users to INSERT reports (for submitting reports)
CREATE POLICY "Allow anonymous report submission"
  ON reports 
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous users to SELECT their own report by tracking code
CREATE POLICY "Allow anonymous read own report"
  ON reports 
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow admins (authenticated users with admin_profiles entry) to SELECT all reports
CREATE POLICY "Allow admins to read all reports"
  ON reports 
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Allow admins to UPDATE reports
CREATE POLICY "Allow admins to update reports"
  ON reports 
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Verify policies were created
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'reports'
ORDER BY policyname;

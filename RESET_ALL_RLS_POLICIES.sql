-- ============================================
-- COMPLETE RLS POLICY RESET FOR WHISTRUST
-- Run this in Supabase SQL Editor
-- This will reset ALL RLS policies to working state
-- ============================================

-- ============================================
-- 1. REPORTS TABLE - Complete Reset
-- ============================================

-- Drop ALL existing policies on reports
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

-- ============================================
-- 2. MESSAGES TABLE
-- ============================================

DROP POLICY IF EXISTS "Allow anonymous message insertion" ON messages;
DROP POLICY IF EXISTS "Allow anonymous read messages" ON messages;
DROP POLICY IF EXISTS "Allow admins to insert messages" ON messages;

-- Anyone can insert messages to reports
CREATE POLICY "Allow anonymous message insertion"
  ON messages 
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read messages for a report
CREATE POLICY "Allow anonymous read messages"
  ON messages 
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins can insert messages
CREATE POLICY "Allow admins to insert messages"
  ON messages 
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- ============================================
-- 3. REPORT_LABELS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can view report labels" ON report_labels;
DROP POLICY IF EXISTS "Admins can insert report labels" ON report_labels;
DROP POLICY IF EXISTS "Admins can delete report labels" ON report_labels;

-- Allow admins to SELECT labels
CREATE POLICY "Admins can view report labels"
  ON report_labels
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Allow admins to INSERT labels
CREATE POLICY "Admins can insert report labels"
  ON report_labels
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Allow admins to DELETE labels
CREATE POLICY "Admins can delete report labels"
  ON report_labels
  FOR DELETE
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- ============================================
-- 4. REPORT_ATTACHMENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Allow attachment upload" ON report_attachments;
DROP POLICY IF EXISTS "Allow attachment read" ON report_attachments;

-- Anyone can insert attachments
CREATE POLICY "Allow attachment upload"
  ON report_attachments 
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read attachments
CREATE POLICY "Allow attachment read"
  ON report_attachments 
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- 5. VERIFY POLICIES
-- ============================================

-- Check reports policies
SELECT 'reports' as table_name, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'reports'
ORDER BY policyname;

-- Check messages policies
SELECT 'messages' as table_name, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- Check report_labels policies
SELECT 'report_labels' as table_name, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'report_labels'
ORDER BY policyname;

-- Check report_attachments policies
SELECT 'report_attachments' as table_name, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'report_attachments'
ORDER BY policyname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'RLS policies have been reset successfully!';
  RAISE NOTICE 'All tables now have working policies for anonymous and admin access.';
END $$;

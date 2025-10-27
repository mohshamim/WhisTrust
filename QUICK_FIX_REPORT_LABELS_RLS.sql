-- Quick Fix: Add RLS policies for report_labels table
-- Run this in Supabase SQL Editor

-- Enable RLS if not already enabled
ALTER TABLE report_labels ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, DELETE ON report_labels TO authenticated;

-- Verify the table exists and has correct structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'report_labels'
ORDER BY ordinal_position;

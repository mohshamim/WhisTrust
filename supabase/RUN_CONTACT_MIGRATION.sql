-- =============================================================================
-- CONTACT FORM SUBMISSIONS TABLE MIGRATION
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  company_size TEXT,
  subject TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to insert contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated admins to read contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated admins to update contact submissions" ON contact_submissions;

-- Create policy for inserting (public can submit)
CREATE POLICY "Allow public to insert contact submissions"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for reading (only authenticated admins)
CREATE POLICY "Allow authenticated admins to read contact submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for updating (only authenticated admins)
CREATE POLICY "Allow authenticated admins to update contact submissions"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
DROP FUNCTION IF EXISTS update_contact_submissions_updated_at();

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_submissions_updated_at();

-- Add comment
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from the website';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Contact submissions table created successfully!';
  RAISE NOTICE 'Table: contact_submissions';
  RAISE NOTICE 'RLS: Enabled';
  RAISE NOTICE 'Policies: Public insert, Authenticated read/update';
END $$;


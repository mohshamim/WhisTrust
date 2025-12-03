-- =============================================================================
-- AI ATTACHMENT ANALYSIS TABLE
-- =============================================================================
-- Stores AI-generated insights for report attachments using Gemini API
-- =============================================================================

-- Create the AI analysis table
CREATE TABLE IF NOT EXISTS report_attachments_ai_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to attachment
  attachment_id UUID NOT NULL REFERENCES report_attachments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- AI Analysis Results
  summary TEXT NOT NULL,
  extracted_text TEXT,
  entities JSONB DEFAULT '[]'::jsonb, -- [{type: "person|date|amount|location", value: "..."}]
  suggested_category TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  findings JSONB DEFAULT '[]'::jsonb, -- ["finding 1", "finding 2", ...]
  
  -- Metadata
  model_used TEXT DEFAULT 'gemini-2.0-flash-exp',
  confidence_score NUMERIC(3, 2), -- 0.00 to 1.00
  processing_time_ms INTEGER,
  
  -- Analysis status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_by UUID REFERENCES admin_profiles(id), -- Who triggered the analysis
  
  -- Ensure one analysis per attachment (can update if re-run)
  UNIQUE(attachment_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_summary_attachment_id ON report_attachments_ai_summary(attachment_id);
CREATE INDEX IF NOT EXISTS idx_ai_summary_organization_id ON report_attachments_ai_summary(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_summary_risk_level ON report_attachments_ai_summary(risk_level);
CREATE INDEX IF NOT EXISTS idx_ai_summary_status ON report_attachments_ai_summary(status);

-- Enable RLS
ALTER TABLE report_attachments_ai_summary ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated admins can read AI summaries in their organization
CREATE POLICY "admins_can_read_ai_summaries"
  ON report_attachments_ai_summary
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM admin_profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy: Authenticated admins can insert/update AI summaries
CREATE POLICY "admins_can_manage_ai_summaries"
  ON report_attachments_ai_summary
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM admin_profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM admin_profiles 
      WHERE id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_ai_summary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_summary_updated_at
  BEFORE UPDATE ON report_attachments_ai_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_summary_updated_at();

-- Add comment
COMMENT ON TABLE report_attachments_ai_summary IS 'AI-generated analysis of report attachments using Gemini API';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ AI Attachment Analysis table created!';
  RAISE NOTICE '   Table: report_attachments_ai_summary';
  RAISE NOTICE '   Features: Gemini API integration';
  RAISE NOTICE '   RLS: Organization-scoped, admin-only';
  RAISE NOTICE '================================================';
END $$;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'report_attachments_ai_summary'
ORDER BY ordinal_position;


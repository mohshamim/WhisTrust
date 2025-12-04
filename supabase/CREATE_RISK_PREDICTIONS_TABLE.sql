-- Create case_risk_predictions table
CREATE TABLE IF NOT EXISTS case_risk_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Risk Assessment
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Score Breakdown
  keyword_score INTEGER DEFAULT 0 CHECK (keyword_score >= 0 AND keyword_score <= 30),
  category_score INTEGER DEFAULT 0 CHECK (category_score >= 0 AND category_score <= 25),
  attachment_score INTEGER DEFAULT 0 CHECK (attachment_score >= 0 AND attachment_score <= 20),
  description_score INTEGER DEFAULT 0 CHECK (description_score >= 0 AND description_score <= 15),
  ai_analysis_score INTEGER DEFAULT 0 CHECK (ai_analysis_score >= 0 AND ai_analysis_score <= 25),
  
  -- AI Analysis
  ai_sentiment TEXT, -- positive, negative, neutral, urgent
  ai_urgency_level TEXT, -- immediate, high, moderate, low
  ai_reasoning TEXT, -- AI's explanation for the risk level
  
  -- Detected Risk Factors
  detected_keywords JSONB DEFAULT '[]'::jsonb, -- Array of detected risk keywords
  risk_factors JSONB DEFAULT '[]'::jsonb, -- Array of specific risk factors identified
  
  -- Priority Recommendation
  recommended_priority TEXT CHECK (recommended_priority IN ('immediate', 'urgent', 'high', 'normal', 'low')),
  recommended_actions JSONB DEFAULT '[]'::jsonb, -- Suggested next steps
  
  -- Metadata
  analyzed_by TEXT DEFAULT 'system', -- 'system' or user_id if manually triggered
  analysis_version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_risk_predictions_report ON case_risk_predictions(report_id);
CREATE INDEX idx_risk_predictions_org ON case_risk_predictions(organization_id);
CREATE INDEX idx_risk_predictions_risk_level ON case_risk_predictions(risk_level);
CREATE INDEX idx_risk_predictions_score ON case_risk_predictions(overall_score DESC);
CREATE INDEX idx_risk_predictions_created ON case_risk_predictions(created_at DESC);

-- Enable RLS
ALTER TABLE case_risk_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view risk predictions for their organization"
  ON case_risk_predictions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM admin_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create risk predictions for their organization"
  ON case_risk_predictions
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM admin_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update risk predictions for their organization"
  ON case_risk_predictions
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM admin_profiles 
      WHERE id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_risk_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_risk_predictions_updated_at
  BEFORE UPDATE ON case_risk_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_risk_predictions_updated_at();

-- Add comments
COMMENT ON TABLE case_risk_predictions IS 'Stores AI-powered risk predictions for cases';
COMMENT ON COLUMN case_risk_predictions.overall_score IS 'Combined risk score (0-100)';
COMMENT ON COLUMN case_risk_predictions.risk_level IS 'Categorical risk level: critical, high, medium, low';
COMMENT ON COLUMN case_risk_predictions.confidence_score IS 'AI confidence in the prediction (0-100%)';


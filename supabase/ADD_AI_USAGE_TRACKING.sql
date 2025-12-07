-- =====================================================
-- AI Usage Tracking for Demo Organization
-- =====================================================
-- Adds AI usage limit tracking columns to organizations table
-- Only applies limits to demo organization
-- =====================================================

-- Add AI usage tracking columns (daily limits per feature)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS max_ai_requests_per_day INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ai_usage_per_feature JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ai_requests_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Set limits only for demo organization (3 requests per day per feature)
UPDATE organizations 
SET 
  max_ai_requests_per_day = 3,  -- 3 requests per day per feature for demo
  ai_usage_per_feature = '{"smart_search": 0, "risk_predictor": 0, "attachment_analyzer": 0}'::jsonb,
  ai_requests_reset_at = DATE_TRUNC('day', NOW()) + INTERVAL '1 day'
WHERE subdomain = 'demo';

-- Verify the update
SELECT 
  id,
  name,
  subdomain,
  max_ai_requests_per_day,
  ai_usage_per_feature,
  ai_requests_reset_at
FROM organizations 
WHERE subdomain = 'demo';


-- =============================================================================
-- CREATE DEMO ORGANIZATION
-- =============================================================================
-- This creates a demo organization for testing and demonstrations
-- =============================================================================

-- Check if demo org already exists
SELECT id, name, subdomain, status FROM organizations WHERE subdomain = 'demo';

-- Insert demo organization (if doesn't exist)
INSERT INTO organizations (
  name,
  slug,
  subdomain,
  primary_contact_email,
  primary_contact_name,
  plan,
  status,
  max_admin_users,
  max_reports_per_month,
  max_storage_mb,
  features,
  branding
)
VALUES (
  'Demo Company',
  'demo-company',
  'demo',
  'admin@demo.com',
  'Demo Admin',
  'professional',
  'active',
  15,
  100,
  5000,
  '{
    "anonymous_reporting": true,
    "file_uploads": true,
    "custom_categories": true,
    "custom_branding": true,
    "advanced_analytics": true,
    "api_access": false,
    "sso": false,
    "audit_logs": true,
    "email_notifications": true,
    "custom_fields": true,
    "pdf_export": true
  }'::jsonb,
  '{
    "logo_url": null,
    "primary_color": "#8B4513",
    "secondary_color": "#D2691E",
    "company_name": "Demo Company Compliance Portal",
    "support_email": "support@demo.com",
    "support_phone": "+1-555-0100"
  }'::jsonb
)
ON CONFLICT (subdomain) DO UPDATE
SET 
  status = 'active',
  updated_at = NOW();

-- Verify
SELECT id, name, subdomain, status, plan FROM organizations WHERE subdomain = 'demo';

-- Show success
DO $$
BEGIN
  RAISE NOTICE '✅ Demo organization ready!';
  RAISE NOTICE '   Name: Demo Company';
  RAISE NOTICE '   Subdomain: demo';
  RAISE NOTICE '   URL: http://localhost:3000/org/demo/';
END $$;


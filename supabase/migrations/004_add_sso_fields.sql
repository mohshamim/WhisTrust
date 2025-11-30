-- =====================================================
-- SSO (Single Sign-On) Configuration Fields
-- =====================================================
-- Adds SSO configuration fields to organizations table
-- Supports Azure AD, Google Workspace, and Generic OIDC
-- =====================================================

-- Add SSO configuration columns to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS sso_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS sso_provider TEXT CHECK (sso_provider IN ('azure', 'google', 'oidc')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sso_client_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sso_client_secret TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sso_issuer_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sso_redirect_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sso_domain_restriction TEXT DEFAULT NULL;

-- Add constraint: SSO fields required when SSO is enabled
ALTER TABLE organizations
ADD CONSTRAINT sso_configuration_check CHECK (
  (sso_enabled = false) OR
  (sso_enabled = true AND 
   sso_provider IS NOT NULL AND 
   sso_client_id IS NOT NULL AND 
   sso_client_secret IS NOT NULL AND
   sso_redirect_url IS NOT NULL AND
   (sso_provider != 'oidc' OR sso_issuer_url IS NOT NULL)
  )
);

-- Add index for SSO-enabled organizations
CREATE INDEX IF NOT EXISTS idx_organizations_sso_enabled ON organizations(sso_enabled) WHERE sso_enabled = true;

-- Add comment for documentation
COMMENT ON COLUMN organizations.sso_enabled IS 'Whether SSO is enabled for this organization';
COMMENT ON COLUMN organizations.sso_provider IS 'SSO provider: azure, google, or oidc';
COMMENT ON COLUMN organizations.sso_client_id IS 'OAuth client ID from SSO provider';
COMMENT ON COLUMN organizations.sso_client_secret IS 'OAuth client secret (encrypted in application)';
COMMENT ON COLUMN organizations.sso_issuer_url IS 'OIDC issuer URL (required for generic OIDC)';
COMMENT ON COLUMN organizations.sso_redirect_url IS 'OAuth redirect URL for this organization';
COMMENT ON COLUMN organizations.sso_domain_restriction IS 'Optional: restrict SSO to specific email domain';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ SSO fields added to organizations table successfully!';
    RAISE NOTICE '📊 SSO providers supported: azure, google, oidc';
    RAISE NOTICE '⏭️  Next: Configure SSO in Supabase dashboard and update application code';
END $$;


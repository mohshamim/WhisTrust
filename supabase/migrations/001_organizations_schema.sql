-- =====================================================
-- Phase 1: Multi-Tenant Organizations Schema
-- =====================================================
-- This migration creates the foundation for multi-tenant
-- organization management in the Production Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ORGANIZATIONS TABLE
-- =====================================================
-- Stores all client organizations (companies using WhisTrust)
-- Each organization is a separate tenant with isolated data

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier (e.g., 'acme-corp')
    subdomain TEXT UNIQUE NOT NULL, -- Subdomain for access (e.g., 'acme')
    
    -- Contact & Billing
    primary_contact_email TEXT NOT NULL,
    primary_contact_name TEXT,
    billing_email TEXT,
    
    -- Subscription & Plan
    plan TEXT NOT NULL DEFAULT 'essential' CHECK (plan IN ('essential', 'professional', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_starts_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage Limits (hard limits enforced by the system)
    max_admin_users INTEGER NOT NULL DEFAULT 5,
    max_reports_per_month INTEGER NOT NULL DEFAULT 50,
    max_storage_mb INTEGER NOT NULL DEFAULT 1000,
    
    -- Current Usage (tracked for monitoring)
    current_admin_users INTEGER NOT NULL DEFAULT 0,
    current_reports_count INTEGER NOT NULL DEFAULT 0,
    current_storage_mb INTEGER NOT NULL DEFAULT 0,
    
    -- Feature Flags (per-organization feature toggles)
    features JSONB NOT NULL DEFAULT '{
        "anonymous_reporting": true,
        "file_uploads": true,
        "custom_categories": false,
        "custom_branding": false,
        "advanced_analytics": false,
        "api_access": false,
        "sso": false,
        "audit_logs": true,
        "email_notifications": true,
        "custom_fields": false,
        "pdf_export": true
    }'::jsonb,
    
    -- Custom Branding (JSON storage for theme/logo)
    branding JSONB NOT NULL DEFAULT '{
        "logo_url": null,
        "primary_color": "#3b82f6",
        "secondary_color": "#1e40af",
        "company_name": null,
        "support_email": null,
        "support_phone": null
    }'::jsonb,
    
    -- Custom Report Categories (organization-specific)
    custom_categories JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata & Settings
    settings JSONB NOT NULL DEFAULT '{
        "require_approval": false,
        "auto_assign_cases": false,
        "notification_settings": {
            "email_on_new_report": true,
            "email_on_status_change": true
        },
        "retention_days": 2555
    }'::jsonb,
    
    -- Notes (internal use by super admin)
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID, -- Super admin who created this org
    
    -- Indexes for performance
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT subdomain_format CHECK (subdomain ~ '^[a-z0-9-]+$')
);

-- Create indexes for fast lookups
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_subdomain ON organizations(subdomain);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_plan ON organizations(plan);

-- Add comment for documentation
COMMENT ON TABLE organizations IS 'Stores all client organizations using the WhisTrust platform';

-- =====================================================
-- 2. MULTI-TENANT ADMIN PROFILES
-- =====================================================
-- Extends admin_profiles to support multi-tenancy
-- Each admin belongs to ONE organization

CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Organization Link (NULL for super admins)
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic Information
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Role (within their organization)
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'manager', 'investigator', 'hr', 'viewer')),
    
    -- Department (optional, organization-specific)
    department TEXT,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Super Admin Flag (for platform administrators)
    is_super_admin BOOLEAN NOT NULL DEFAULT false,
    
    CONSTRAINT valid_super_admin CHECK (
        (is_super_admin = true AND organization_id IS NULL) OR
        (is_super_admin = false AND organization_id IS NOT NULL)
    )
);

-- Create indexes
CREATE INDEX idx_admin_profiles_org ON admin_profiles(organization_id);
CREATE INDEX idx_admin_profiles_role ON admin_profiles(role);
CREATE INDEX idx_admin_profiles_email ON admin_profiles(email);
CREATE INDEX idx_admin_profiles_super_admin ON admin_profiles(is_super_admin) WHERE is_super_admin = true;

COMMENT ON TABLE admin_profiles IS 'Admin users - can belong to an organization or be super admins';

-- =====================================================
-- 3. REPORTS TABLE (Multi-Tenant)
-- =====================================================
-- Reports are scoped to organizations for tenant isolation

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Organization Link (REQUIRED for tenant isolation)
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Case Information
    case_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    
    -- Reporter Information (can be anonymous)
    reporter_name TEXT,
    reporter_email TEXT,
    reporter_phone TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    
    -- Case Management
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'investigating', 'resolved', 'closed', 'dismissed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
    
    -- Tracking Code (for anonymous follow-up)
    tracking_code TEXT UNIQUE NOT NULL,
    
    -- Custom Fields (organization-specific)
    custom_fields JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    evidence_files JSONB DEFAULT '[]'::jsonb,
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_reports_org ON reports(organization_id);
CREATE INDEX idx_reports_case_number ON reports(case_number);
CREATE INDEX idx_reports_tracking_code ON reports(tracking_code);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_assigned_to ON reports(assigned_to);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

COMMENT ON TABLE reports IS 'Whistleblower reports - scoped to organizations';

-- =====================================================
-- 4. AUDIT LOGS (Multi-Tenant)
-- =====================================================
-- Track all actions for compliance and security

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Organization Link (NULL for super admin actions)
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Actor
    user_id UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    
    -- Action Details
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address TEXT,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions';

-- =====================================================
-- 5. AUTO-UPDATE TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at
    BEFORE UPDATE ON admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Generate unique case number
CREATE OR REPLACE FUNCTION generate_case_number(org_id UUID)
RETURNS TEXT AS $$
DECLARE
    org_prefix TEXT;
    next_number INTEGER;
BEGIN
    -- Get organization slug for prefix
    SELECT UPPER(SUBSTRING(subdomain FROM 1 FOR 3)) INTO org_prefix
    FROM organizations WHERE id = org_id;
    
    -- Get next number
    SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM reports
    WHERE organization_id = org_id;
    
    RETURN org_prefix || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate unique tracking code
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(
        SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8) || '-' ||
        SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8)
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Organizations schema created successfully!';
    RAISE NOTICE '📊 Tables created: organizations, admin_profiles, reports, audit_logs';
    RAISE NOTICE '🔧 Helper functions ready';
    RAISE NOTICE '⏭️  Next: Run RLS policies migration';
END $$;


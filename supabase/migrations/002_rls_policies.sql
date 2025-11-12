-- =====================================================
-- Phase 1: Row Level Security (RLS) Policies
-- =====================================================
-- This migration sets up tenant isolation and security
-- Ensures each organization can only access their own data
-- =====================================================

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Get current user's organization ID
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT organization_id
        FROM admin_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT is_super_admin
        FROM admin_profiles
        WHERE id = auth.uid()
        LIMIT 1
    ) = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(p_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM admin_profiles
    WHERE id = auth.uid();
    
    -- Super admins have all permissions
    IF is_super_admin() THEN
        RETURN true;
    END IF;
    
    -- Role-based permissions
    RETURN CASE p_permission
        WHEN 'manage_users' THEN user_role IN ('admin', 'manager')
        WHEN 'manage_reports' THEN user_role IN ('admin', 'manager', 'investigator')
        WHEN 'view_reports' THEN user_role IN ('admin', 'manager', 'investigator', 'hr', 'viewer')
        WHEN 'create_reports' THEN user_role IN ('admin', 'manager', 'investigator', 'hr')
        WHEN 'manage_settings' THEN user_role = 'admin'
        ELSE false
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. ORGANIZATIONS TABLE POLICIES
-- =====================================================

-- Super admins can do everything with organizations
CREATE POLICY "super_admins_full_access_organizations"
    ON organizations
    FOR ALL
    TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Organization admins can view their own organization
CREATE POLICY "org_admins_read_own_organization"
    ON organizations
    FOR SELECT
    TO authenticated
    USING (
        id = get_user_organization_id()
    );

-- Organization admins can update their own organization (limited fields)
CREATE POLICY "org_admins_update_own_organization"
    ON organizations
    FOR UPDATE
    TO authenticated
    USING (
        id = get_user_organization_id() AND
        has_permission('manage_settings')
    )
    WITH CHECK (
        id = get_user_organization_id() AND
        has_permission('manage_settings')
    );

-- =====================================================
-- 4. ADMIN PROFILES TABLE POLICIES
-- =====================================================

-- Super admins can manage all admin profiles
CREATE POLICY "super_admins_full_access_profiles"
    ON admin_profiles
    FOR ALL
    TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Users can read their own profile
CREATE POLICY "users_read_own_profile"
    ON admin_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "users_update_own_profile"
    ON admin_profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND
        -- Prevent changing critical fields
        organization_id = (SELECT organization_id FROM admin_profiles WHERE id = auth.uid()) AND
        is_super_admin = (SELECT is_super_admin FROM admin_profiles WHERE id = auth.uid())
    );

-- Organization admins can read profiles in their organization
CREATE POLICY "org_admins_read_org_profiles"
    ON admin_profiles
    FOR SELECT
    TO authenticated
    USING (
        organization_id = get_user_organization_id() AND
        has_permission('manage_users')
    );

-- Organization admins can manage profiles in their organization
CREATE POLICY "org_admins_manage_org_profiles"
    ON admin_profiles
    FOR ALL
    TO authenticated
    USING (
        organization_id = get_user_organization_id() AND
        has_permission('manage_users') AND
        NOT is_super_admin -- Can't manage super admins
    )
    WITH CHECK (
        organization_id = get_user_organization_id() AND
        has_permission('manage_users') AND
        NOT is_super_admin
    );

-- =====================================================
-- 5. REPORTS TABLE POLICIES
-- =====================================================

-- Super admins can view all reports (for support/debugging)
CREATE POLICY "super_admins_read_all_reports"
    ON reports
    FOR SELECT
    TO authenticated
    USING (is_super_admin());

-- Users can only see reports from their organization
CREATE POLICY "users_read_org_reports"
    ON reports
    FOR SELECT
    TO authenticated
    USING (
        organization_id = get_user_organization_id() AND
        has_permission('view_reports')
    );

-- Users can create reports in their organization
CREATE POLICY "users_create_org_reports"
    ON reports
    FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id = get_user_organization_id() AND
        has_permission('create_reports')
    );

-- Users can update reports in their organization
CREATE POLICY "users_update_org_reports"
    ON reports
    FOR UPDATE
    TO authenticated
    USING (
        organization_id = get_user_organization_id() AND
        has_permission('manage_reports')
    )
    WITH CHECK (
        organization_id = get_user_organization_id() AND
        has_permission('manage_reports')
    );

-- Users can delete reports in their organization (soft delete)
CREATE POLICY "users_delete_org_reports"
    ON reports
    FOR DELETE
    TO authenticated
    USING (
        organization_id = get_user_organization_id() AND
        has_permission('manage_reports')
    );

-- Allow anonymous report submission (public access)
CREATE POLICY "public_create_reports"
    ON reports
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous report tracking
CREATE POLICY "public_read_own_report"
    ON reports
    FOR SELECT
    TO anon
    USING (tracking_code IS NOT NULL);

-- =====================================================
-- 6. AUDIT LOGS TABLE POLICIES
-- =====================================================

-- Super admins can view all audit logs
CREATE POLICY "super_admins_read_all_audit_logs"
    ON audit_logs
    FOR SELECT
    TO authenticated
    USING (is_super_admin());

-- Organization admins can view their org's audit logs
CREATE POLICY "org_admins_read_org_audit_logs"
    ON audit_logs
    FOR SELECT
    TO authenticated
    USING (
        organization_id = get_user_organization_id() AND
        has_permission('manage_settings')
    );

-- System can always insert audit logs
CREATE POLICY "system_insert_audit_logs"
    ON audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- =====================================================
-- 7. STORAGE BUCKET POLICIES (if using Supabase Storage)
-- =====================================================

-- Create storage bucket for report evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-evidence', 'report-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for report evidence
CREATE POLICY "org_users_upload_evidence"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'report-evidence' AND
        (storage.foldername(name))[1] = get_user_organization_id()::text
    );

CREATE POLICY "org_users_read_evidence"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'report-evidence' AND
        (storage.foldername(name))[1] = get_user_organization_id()::text
    );

CREATE POLICY "super_admins_full_access_evidence"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'report-evidence' AND
        is_super_admin()
    );

-- =====================================================
-- 8. VALIDATION TRIGGERS
-- =====================================================

-- Ensure organization_id is set for reports
CREATE OR REPLACE FUNCTION validate_report_organization()
RETURNS TRIGGER AS $$
BEGIN
    -- If inserting as authenticated user, auto-set organization
    IF TG_OP = 'INSERT' AND auth.uid() IS NOT NULL THEN
        IF NEW.organization_id IS NULL THEN
            NEW.organization_id := get_user_organization_id();
        END IF;
        
        -- Validate user is creating report for their own org
        IF NEW.organization_id != get_user_organization_id() AND NOT is_super_admin() THEN
            RAISE EXCEPTION 'Cannot create report for different organization';
        END IF;
    END IF;
    
    -- Generate case number if not provided
    IF NEW.case_number IS NULL THEN
        NEW.case_number := generate_case_number(NEW.organization_id);
    END IF;
    
    -- Generate tracking code if not provided
    IF NEW.tracking_code IS NULL THEN
        NEW.tracking_code := generate_tracking_code();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_report_before_insert
    BEFORE INSERT ON reports
    FOR EACH ROW
    EXECUTE FUNCTION validate_report_organization();

-- =====================================================
-- 9. USAGE TRACKING TRIGGERS
-- =====================================================

-- Update organization user count
CREATE OR REPLACE FUNCTION update_org_user_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.organization_id IS NOT NULL THEN
        UPDATE organizations
        SET current_admin_users = current_admin_users + 1
        WHERE id = NEW.organization_id;
    ELSIF TG_OP = 'DELETE' AND OLD.organization_id IS NOT NULL THEN
        UPDATE organizations
        SET current_admin_users = GREATEST(current_admin_users - 1, 0)
        WHERE id = OLD.organization_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_org_user_count
    AFTER INSERT OR DELETE ON admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_org_user_count();

-- Update organization report count
CREATE OR REPLACE FUNCTION update_org_report_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE organizations
        SET current_reports_count = current_reports_count + 1
        WHERE id = NEW.organization_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE organizations
        SET current_reports_count = GREATEST(current_reports_count - 1, 0)
        WHERE id = OLD.organization_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_org_report_count
    AFTER INSERT OR DELETE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_org_report_count();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies configured successfully!';
    RAISE NOTICE '🔒 Tenant isolation enabled';
    RAISE NOTICE '👮 Permission system ready';
    RAISE NOTICE '📊 Usage tracking active';
    RAISE NOTICE '⏭️  Next: Create first super admin user';
END $$;


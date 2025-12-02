-- =====================================================
-- Phase 3: Documentation Center (Org-Scoped)
-- =====================================================
-- Tables:
--   - documentation_pages   (markdown pages, global or org-specific)
--   - documentation_files   (file library per org)
-- Storage:
--   - org-documents bucket  (per-organization documentation files)
-- RLS:
--   - Org users can read their org docs + global docs
--   - Only org Admin/Manager (and super_admin) can write
-- =====================================================

-- 1. TABLE: documentation_pages
-------------------------------------------------------

CREATE TABLE IF NOT EXISTS documentation_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Nullable organization_id: NULL = global default documentation
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  category TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_md TEXT NOT NULL,

  is_global BOOLEAN NOT NULL DEFAULT TRUE,

  -- Optional explicit ordering within category (lower = earlier)
  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT documentation_pages_slug_unique UNIQUE (organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_documentation_pages_org
  ON documentation_pages(organization_id);

CREATE INDEX IF NOT EXISTS idx_documentation_pages_category
  ON documentation_pages(category);

-- 2. TABLE: documentation_files
-------------------------------------------------------

CREATE TABLE IF NOT EXISTS documentation_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  category TEXT,
  uploaded_by UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documentation_files_org
  ON documentation_files(organization_id);

-- 3. ENABLE RLS
-------------------------------------------------------

ALTER TABLE documentation_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation_files ENABLE ROW LEVEL SECURITY;

-- 4. EXTEND has_permission() FOR DOCS
-------------------------------------------------------
-- Add new logical permission "manage_docs" mapped to Admin/Manager roles.

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
    WHEN 'manage_docs' THEN user_role IN ('admin', 'manager')
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS POLICIES: documentation_pages
-------------------------------------------------------

-- Super admins can do everything
CREATE POLICY "super_admins_full_access_documentation_pages"
  ON documentation_pages
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Org users can read their org pages + global pages
CREATE POLICY "org_users_read_documentation_pages"
  ON documentation_pages
  FOR SELECT
  TO authenticated
  USING (
    -- Org-specific docs for this org
    organization_id = get_user_organization_id()
    OR
    -- Global docs visible to all org users
    (organization_id IS NULL AND is_global = TRUE)
  );

-- Org Admin/Manager can insert/update/delete org-scoped docs
CREATE POLICY "org_admins_manage_documentation_pages"
  ON documentation_pages
  FOR ALL
  TO authenticated
  USING (
    organization_id = get_user_organization_id()
    AND has_permission('manage_docs')
  )
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND has_permission('manage_docs')
  );

-- 6. RLS POLICIES: documentation_files
-------------------------------------------------------

-- Super admins full access
CREATE POLICY "super_admins_full_access_documentation_files"
  ON documentation_files
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Org users can read files in their org
CREATE POLICY "org_users_read_documentation_files"
  ON documentation_files
  FOR SELECT
  TO authenticated
  USING (organization_id = get_user_organization_id());

-- Org Admin/Manager can insert/delete files in their org
CREATE POLICY "org_admins_manage_documentation_files"
  ON documentation_files
  FOR ALL
  TO authenticated
  USING (
    organization_id = get_user_organization_id()
    AND has_permission('manage_docs')
  )
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND has_permission('manage_docs')
  );

-- 7. STORAGE BUCKET FOR DOCUMENTATION FILES
-------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('org-documents', 'org-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Upload: org users (Admin/Manager) uploading into their own org folder
CREATE POLICY "org_users_upload_documentation_files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'org-documents'
    AND has_permission('manage_docs')
    -- Folder structure: <organization_id>/...
    AND (storage.foldername(name))[1] = get_user_organization_id()::text
  );

-- Read: any authenticated user in org can read files for their org
CREATE POLICY "org_users_read_documentation_storage"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'org-documents'
    AND (storage.foldername(name))[1] = get_user_organization_id()::text
  );

-- Delete/update: Admin/Manager only
CREATE POLICY "org_admins_manage_documentation_storage"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'org-documents'
    AND has_permission('manage_docs')
    AND (storage.foldername(name))[1] = get_user_organization_id()::text
  );

-- 8. SEED GLOBAL DEFAULT DOCUMENTATION
-------------------------------------------------------

INSERT INTO documentation_pages (organization_id, category, title, slug, content_md, is_global, sort_order)
VALUES
  (NULL, 'Introduction', 'Welcome to WhisTrust', 'introduction-welcome',
   '# Welcome to WhisTrust\n\nWhisTrust helps your organization capture, triage, and resolve sensitive reports in a secure, compliant way.\n\nUse this Documentation Center as your source of truth for how reporting, case management, and administration works.', TRUE, 0),
  (NULL, 'Getting Started', 'Logging In & Access', 'getting-started-login',
   '# Getting Started\n\n- Access your tenant at `/org/{your-subdomain}`\n- Use the credentials provided by your administrator\n- Admins can invite additional team members from **Users > Invite User**.', TRUE, 0),
  (NULL, 'Reporting', 'Submitting a New Report', 'reporting-submission',
   '# Submitting a New Report\n\nReporters can submit anonymous or identified reports using your public reporting URL.\n\nKey fields:\n- Category\n- Description\n- Optional attachments\n\nEach submission generates a tracking code for follow-up.', TRUE, 0),
  (NULL, 'Case Management', 'Case Lifecycle Overview', 'case-management-lifecycle',
   '# Case Lifecycle\n\nTypical lifecycle:\n1. Submitted\n2. Under Review\n3. Investigating\n4. Resolved\n5. Closed\n\nAdmins and investigators update status as work progresses.', TRUE, 0),
  (NULL, 'User Management', 'Roles & Permissions', 'user-management-roles',
   '# Roles & Permissions\n\nCommon roles:\n- **Admin** – full configuration and case management\n- **Manager** – manages cases and team\n- **Investigator** – works assigned cases\n- **HR / Viewer** – read-only access depending on configuration.', TRUE, 0),
  (NULL, 'Security & Compliance', 'Data Security Overview', 'security-compliance-overview',
   '# Security & Compliance\n\nWhisTrust is built on Supabase Postgres with strict Row Level Security (RLS) to isolate each tenant.\n\n- All reports are scoped to your organization\n- Access is role-based\n- Audit logs track sensitive actions.', TRUE, 0),
  (NULL, 'FAQs', 'Common Questions', 'faqs-common',
   '# FAQs\n\n**Q: How do reporters track a case?**\nA: Use the tracking code on the **Track Case** page.\n\n**Q: Who can see anonymous reports?**\nA: Only authorized admins and investigators in your organization.', TRUE, 0),
  (NULL, 'Troubleshooting', 'Cannot Log In', 'troubleshooting-login',
   '# Troubleshooting Login Issues\n\nIf you cannot log in:\n- Verify the URL includes your organization subdomain\n- Confirm your account is active with an Admin\n- Reset your password from the login screen.', TRUE, 0),
  (NULL, 'Downloads & Templates', 'Templates Overview', 'downloads-templates-overview',
   '# Downloads & Templates\n\nYour organization can upload policies, templates, and guides here for quick access by your internal team.', TRUE, 0),
  (NULL, 'Organization Policies (Uploads)', 'Managing Internal Policies', 'organization-policies-managing',
   '# Organization Policies\n\nAdmins and Managers can upload internal policy PDFs and other reference material into the **Documentation Center > Downloads & Templates** section.', TRUE, 0)
ON CONFLICT DO NOTHING;

-- 9. SUCCESS MESSAGE
-------------------------------------------------------

DO $$
BEGIN
  RAISE NOTICE '✅ Documentation Center schema created successfully!';
END $$;



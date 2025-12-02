-- =====================================================
-- SIMPLIFIED DEMO SETUP FOR MULTI-TENANT
-- =====================================================
-- Works with existing multi-tenant schema
-- No report_categories or report_timeline tables needed
-- =====================================================

-- ⚠️ REPLACE THESE WITH ACTUAL USER IDs FROM SUPABASE AUTH
DO $$
DECLARE
  demo_org_id UUID;
  admin_user_id UUID := 'daa0cdd7-cb30-4b74-9017-dac183cdffd1'; -- ✅ Your admin UUID
  manager_user_id UUID := 'd40ca0cb-2124-4585-85fe-d72c6ed2c61e'; -- ✅ Your manager UUID
  investigator_user_id UUID := '5fd7a5fe-d5b6-460f-a241-1b3cac2b3edc'; -- ✅ Your investigator UUID
  report_id UUID;
  i INT;
BEGIN
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'WhisTrust Demo Organization Setup';
  RAISE NOTICE '========================================';
  
  -- =====================================================
  -- STEP 1: Create Demo Organization
  -- =====================================================
  
  RAISE NOTICE '📦 Creating demo organization...';
  
  INSERT INTO organizations (
    name,
    slug,
    subdomain,
    status,
    plan,
    primary_contact_email,
    primary_contact_name,
    max_admin_users,
    max_reports_per_month,
    max_storage_mb,
    features,
    branding,
    created_at,
    updated_at
  ) VALUES (
    'Demo Company',
    'demo-company',
    'demo',
    'active',
    'professional',
    'demo@whistrust.com',
    'Demo Admin',
    0, -- 0 = unlimited users
    0, -- 0 = unlimited reports
    5120, -- 5GB storage
    jsonb_build_object(
      'anonymous_reporting', true,
      'file_uploads', true,
      'custom_categories', true,
      'custom_branding', true,
      'advanced_analytics', true,
      'api_access', true,
      'sso', false,
      'audit_logs', true,
      'email_notifications', true,
      'custom_fields', true,
      'pdf_export', true
    ),
    jsonb_build_object(
      'logo_url', null,
      'primary_color', '#c45a3a',
      'secondary_color', '#a04a2f',
      'company_name', 'Demo Company',
      'support_email', 'support@demo.com',
      'support_phone', '+1-555-DEMO-123'
    ),
    NOW(),
    NOW()
  ) ON CONFLICT (subdomain) DO UPDATE SET
    name = 'Demo Company',
    status = 'active',
    plan = 'professional',
    max_admin_users = 0,
    max_reports_per_month = 0,
    updated_at = NOW()
  RETURNING id INTO demo_org_id;
  
  RAISE NOTICE '   ✅ Organization created: Demo Company (ID: %)', demo_org_id;
  
  -- =====================================================
  -- STEP 2: Link Demo Users
  -- =====================================================
  
  RAISE NOTICE '👥 Linking demo users...';
  
  -- Admin
  INSERT INTO admin_profiles (
    id, organization_id, email, full_name, role, department, is_active, is_super_admin
  ) VALUES (
    admin_user_id, demo_org_id, 'admin@demo.com', 'Demo Admin', 'admin', 'Administration', true, false
  ) ON CONFLICT (id) DO UPDATE SET
    organization_id = demo_org_id,
    email = 'admin@demo.com',
    full_name = 'Demo Admin',
    role = 'admin',
    is_active = true;
  
  RAISE NOTICE '   ✅ Admin user linked';
  
  -- Manager
  INSERT INTO admin_profiles (
    id, organization_id, email, full_name, role, department, is_active, is_super_admin
  ) VALUES (
    manager_user_id, demo_org_id, 'manager@demo.com', 'Demo Manager', 'manager', 'Operations', true, false
  ) ON CONFLICT (id) DO UPDATE SET
    organization_id = demo_org_id,
    email = 'manager@demo.com',
    full_name = 'Demo Manager',
    role = 'manager',
    is_active = true;
  
  RAISE NOTICE '   ✅ Manager user linked';
  
  -- Investigator
  INSERT INTO admin_profiles (
    id, organization_id, email, full_name, role, department, is_active, is_super_admin
  ) VALUES (
    investigator_user_id, demo_org_id, 'investigator@demo.com', 'Demo Investigator', 'investigator', 'Compliance', true, false
  ) ON CONFLICT (id) DO UPDATE SET
    organization_id = demo_org_id,
    email = 'investigator@demo.com',
    full_name = 'Demo Investigator',
    role = 'investigator',
    is_active = true;
  
  RAISE NOTICE '   ✅ Investigator user linked';
  
  -- =====================================================
  -- STEP 3: Clean Old Demo Data
  -- =====================================================
  
  RAISE NOTICE '🧹 Cleaning old demo data...';
  
  -- Delete in correct order (use table aliases to avoid ambiguity)
  DELETE FROM messages m WHERE m.report_id IN (SELECT r.id FROM reports r WHERE r.organization_id = demo_org_id);
  DELETE FROM report_labels l WHERE l.report_id IN (SELECT r.id FROM reports r WHERE r.organization_id = demo_org_id);
  DELETE FROM report_attachments a WHERE a.report_id IN (SELECT r.id FROM reports r WHERE r.organization_id = demo_org_id);
  DELETE FROM reports r WHERE r.organization_id = demo_org_id;
  
  RAISE NOTICE '   ✅ Old data cleaned';
  
  -- =====================================================
  -- STEP 4: Create Sample Reports
  -- =====================================================
  
  RAISE NOTICE '📊 Creating sample reports...';
  
  FOR i IN 1..10 LOOP
    INSERT INTO reports (
      organization_id,
      case_number,
      title,
      description,
      category,
      status,
      priority,
      is_anonymous,
      tracking_code,
      assigned_to,
      created_at,
      updated_at
    ) VALUES (
      demo_org_id,
      'CASE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
      CASE (i % 5)
        WHEN 0 THEN 'Financial Discrepancy Report'
        WHEN 1 THEN 'Workplace Harassment Concern'
        WHEN 2 THEN 'Safety Violation Report'
        WHEN 3 THEN 'Conflict of Interest'
        ELSE 'Data Privacy Concern'
      END,
      CASE (i % 5)
        WHEN 0 THEN 'Sample report regarding financial discrepancies in Q3 budget allocation. Multiple invoices appear to be duplicated or inflated beyond reasonable market rates. This requires immediate investigation.'
        WHEN 1 THEN 'Concerns about inappropriate behavior from a department manager. Multiple team members have expressed discomfort but fear retaliation if they speak up officially through normal channels.'
        WHEN 2 THEN 'Safety equipment in the warehouse is outdated and not properly maintained. Several near-miss incidents have occurred in the past month involving forklift operations and loading dock procedures.'
        WHEN 3 THEN 'Potential conflict of interest discovered: vendor relationship with procurement manager. Unusual contract terms favor specific supplier without competitive bidding process as required by policy.'
        ELSE 'Customer data may have been accessed without proper authorization. System logs show unusual database queries executed after hours from unrecognized IP addresses outside normal working hours.'
      END,
      CASE (i % 6)
        WHEN 0 THEN 'Fraud & Financial Misconduct'
        WHEN 1 THEN 'Harassment & Discrimination'
        WHEN 2 THEN 'Safety & Health Violations'
        WHEN 3 THEN 'Ethical Violations'
        WHEN 4 THEN 'Data Privacy & Security'
        ELSE 'Regulatory Compliance'
      END,
      CASE (i % 5)
        WHEN 0 THEN 'submitted'
        WHEN 1 THEN 'under_review'
        WHEN 2 THEN 'investigating'
        WHEN 3 THEN 'resolved'
        ELSE 'closed'
      END,
      CASE (i % 4)
        WHEN 0 THEN 'low'
        WHEN 1 THEN 'medium'
        WHEN 2 THEN 'high'
        ELSE 'critical'
      END,
      i % 3 = 0, -- Every third is anonymous
      'DEMO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
      CASE 
        WHEN i % 3 = 0 THEN investigator_user_id
        WHEN i % 4 = 0 THEN manager_user_id
        ELSE NULL
      END,
      NOW() - (random() * INTERVAL '45 days'),
      NOW() - (random() * INTERVAL '20 days')
    ) RETURNING id INTO report_id;
    
    -- Add labels to some reports (using report_labels table)
    IF i % 2 = 0 THEN
      INSERT INTO report_labels (report_id, label_name, label_color, created_by)
      VALUES (
        report_id, 
        CASE (i % 4)
          WHEN 0 THEN 'urgent-review'
          WHEN 1 THEN 'requires-investigation'
          WHEN 2 THEN 'legal-review'
          ELSE 'follow-up-needed'
        END,
        CASE (i % 4)
          WHEN 0 THEN '#ef4444' -- red
          WHEN 1 THEN '#f97316' -- orange
          WHEN 2 THEN '#8b5cf6' -- purple
          ELSE '#3b82f6' -- blue
        END,
        admin_user_id
      );
    END IF;
    
    -- Add messages to some reports
    IF i % 3 = 0 AND i <= 6 THEN
      INSERT INTO messages (report_id, sender_type, sender_id, content, created_at)
      VALUES 
        (report_id, 'admin', admin_user_id, 'Thank you for your report. We take all concerns seriously and have begun our review process. An investigator will be assigned shortly.', NOW() - (random() * INTERVAL '25 days')),
        (report_id, 'admin', manager_user_id, 'Initial assessment complete. Gathering additional information and interviewing relevant parties. Will update within 48 hours.', NOW() - (random() * INTERVAL '15 days'));
    END IF;
  END LOOP;
  
  RAISE NOTICE '   ✅ 10 sample reports created';
  
  -- =====================================================
  -- STEP 5: Update Organization Stats
  -- =====================================================
  
  UPDATE organizations
  SET 
    current_reports_count = (SELECT COUNT(*) FROM reports WHERE organization_id = demo_org_id),
    current_admin_users = (SELECT COUNT(*) FROM admin_profiles WHERE organization_id = demo_org_id AND is_active = true),
    updated_at = NOW()
  WHERE id = demo_org_id;
  
  RAISE NOTICE '   ✅ Organization stats updated';
  
  -- =====================================================
  -- STEP 6: Add Audit Log Entry
  -- =====================================================
  
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    user_email,
    action,
    resource_type,
    resource_id,
    created_at
  ) VALUES (
    demo_org_id,
    admin_user_id,
    'admin@demo.com',
    'demo_organization_setup',
    'organization',
    demo_org_id,
    NOW()
  );
  
  -- =====================================================
  -- SUMMARY
  -- =====================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ DEMO SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Demo Organization Details:';
  RAISE NOTICE '   Name: Demo Company';
  RAISE NOTICE '   Subdomain: demo';
  RAISE NOTICE '   Plan: Professional (unlimited)';
  RAISE NOTICE '';
  RAISE NOTICE '👥 Demo Credentials:';
  RAISE NOTICE '   Admin: admin@demo.com / Demo@2024';
  RAISE NOTICE '   Manager: manager@demo.com / Demo@2024';
  RAISE NOTICE '   Investigator: investigator@demo.com / Demo@2024';
  RAISE NOTICE '';
  RAISE NOTICE '🔗 Access URLs:';
  RAISE NOTICE '   Landing: http://localhost:3000/demo';
  RAISE NOTICE '   Login: http://localhost:3000/org/demo/login';
  RAISE NOTICE '   Report: http://localhost:3000/org/demo/report';
  RAISE NOTICE '   Dashboard: http://localhost:3000/org/demo/dashboard';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Sample Data Created:';
  RAISE NOTICE '   Reports: %', (SELECT COUNT(*) FROM reports r WHERE r.organization_id = demo_org_id);
  RAISE NOTICE '   Users: %', (SELECT COUNT(*) FROM admin_profiles ap WHERE ap.organization_id = demo_org_id);
  RAISE NOTICE '   Messages: %', (SELECT COUNT(*) FROM messages m WHERE m.report_id IN (SELECT r.id FROM reports r WHERE r.organization_id = demo_org_id));
  RAISE NOTICE '   Labels: %', (SELECT COUNT(*) FROM report_labels rl WHERE rl.report_id IN (SELECT r.id FROM reports r WHERE r.organization_id = demo_org_id));
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Ready to demo!';
  RAISE NOTICE '========================================';
  
END $$;

-- Show summary table
SELECT 
  'Demo Setup Summary' AS info,
  (SELECT name FROM organizations WHERE subdomain = 'demo') AS organization,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo')) AS total_reports,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo') AND status = 'submitted') AS submitted,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo') AND status = 'under_review') AS under_review,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo') AND status = 'investigating') AS investigating,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo') AND status = 'resolved') AS resolved,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo') AND status = 'closed') AS closed;


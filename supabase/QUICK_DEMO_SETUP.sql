-- =====================================================
-- QUICK DEMO SETUP - All-in-One Script
-- =====================================================
-- This script creates everything needed for the demo
-- Just replace the user IDs and run!
-- =====================================================

-- ⚠️ IMPORTANT: Replace these with actual user IDs from Supabase Auth
-- Go to: Supabase Dashboard → Authentication → Users → Create users → Copy UUIDs

DO $$
DECLARE
  demo_org_id UUID;
  admin_user_id UUID := 'REPLACE_WITH_ADMIN_UUID'; -- ⚠️ REPLACE THIS
  manager_user_id UUID := 'REPLACE_WITH_MANAGER_UUID'; -- ⚠️ REPLACE THIS
  investigator_user_id UUID := 'REPLACE_WITH_INVESTIGATOR_UUID'; -- ⚠️ REPLACE THIS
  report_id UUID;
  i INT;
BEGIN
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'WhisTrust Demo Organization Quick Setup';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Check if user IDs have been replaced
  IF admin_user_id::TEXT LIKE '%REPLACE%' THEN
    RAISE EXCEPTION 'Please replace user IDs with actual UUIDs from Supabase Auth!';
  END IF;
  
  -- =====================================================
  -- STEP 1: Create Demo Organization
  -- =====================================================
  
  RAISE NOTICE '📦 Step 1: Creating demo organization...';
  
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
    NOW(),
    NOW()
  ) ON CONFLICT (subdomain) DO UPDATE SET
    name = 'Demo Company',
    status = 'active',
    plan = 'professional',
    updated_at = NOW()
  RETURNING id INTO demo_org_id;
  
  RAISE NOTICE '   ✅ Organization created: % (ID: %)', 'Demo Company', demo_org_id;
  
  -- =====================================================
  -- STEP 2: Link Demo Users
  -- =====================================================
  
  RAISE NOTICE '👥 Step 2: Linking demo users...';
  
  -- Admin
  INSERT INTO admin_profiles (
    id, organization_id, email, full_name, role, department, is_active, is_super_admin
  ) VALUES (
    admin_user_id, demo_org_id, 'admin@demo.com', 'Demo Admin', 'admin', 'Administration', true, false
  ) ON CONFLICT (id) DO UPDATE SET
    organization_id = demo_org_id,
    email = 'admin@demo.com',
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
    role = 'investigator',
    is_active = true;
  
  RAISE NOTICE '   ✅ Investigator user linked';
  
  -- =====================================================
  -- STEP 4: Create Sample Reports
  -- =====================================================
  
  RAISE NOTICE '📊 Step 4: Creating sample reports...';
  
  -- Delete existing demo reports first
  DELETE FROM report_timeline WHERE report_id IN (SELECT id FROM reports WHERE organization_id = demo_org_id);
  DELETE FROM report_labels WHERE report_id IN (SELECT id FROM reports WHERE organization_id = demo_org_id);
  DELETE FROM report_messages WHERE report_id IN (SELECT id FROM reports WHERE organization_id = demo_org_id);
  DELETE FROM report_attachments WHERE report_id IN (SELECT id FROM reports WHERE organization_id = demo_org_id);
  DELETE FROM reports WHERE organization_id = demo_org_id;
  
  FOR i IN 1..10 LOOP
    INSERT INTO reports (
      organization_id,
      category,
      description,
      status,
      priority,
      is_anonymous,
      tracking_code,
      assigned_to,
      created_at,
      updated_at
    ) VALUES (
      demo_org_id,
      CASE (i % 6)
        WHEN 0 THEN 'Fraud & Financial Misconduct'
        WHEN 1 THEN 'Harassment & Discrimination'
        WHEN 2 THEN 'Safety & Health Violations'
        WHEN 3 THEN 'Ethical Violations'
        WHEN 4 THEN 'Data Privacy & Security'
        ELSE 'Regulatory Compliance'
      END,
      CASE (i % 5)
        WHEN 0 THEN 'Sample report regarding financial discrepancies in Q3 budget allocation. Multiple invoices appear to be duplicated or inflated.'
        WHEN 1 THEN 'Concerns about inappropriate behavior from a department manager. Multiple team members have expressed discomfort but fear retaliation.'
        WHEN 2 THEN 'Safety equipment in the warehouse is outdated and not properly maintained. Several near-miss incidents have occurred.'
        WHEN 3 THEN 'Potential conflict of interest: vendor relationship with procurement manager. Unusual contract terms favor specific supplier.'
        WHEN 4 THEN 'Customer data may have been accessed without proper authorization. Logs show unusual database queries after hours.'
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
        ELSE 'urgent'
      END,
      i % 3 = 0, -- Every third is anonymous
      'DEMO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
      CASE 
        WHEN i % 3 = 0 THEN investigator_user_id
        ELSE NULL
      END,
      NOW() - (random() * INTERVAL '30 days'),
      NOW() - (random() * INTERVAL '15 days')
    ) RETURNING id INTO report_id;
    
    -- Add labels
    IF i % 2 = 0 THEN
      INSERT INTO report_labels (report_id, label)
      VALUES (report_id, CASE (i % 3) WHEN 0 THEN 'urgent-review' WHEN 1 THEN 'requires-investigation' ELSE 'follow-up-needed' END);
    END IF;
    
    -- Add timeline
    IF i <= 7 THEN
      INSERT INTO report_timeline (report_id, action, description, created_by, created_at)
      VALUES (report_id, 'status_change', 'Report submitted anonymously', NULL, NOW() - (random() * INTERVAL '25 days'));
      
      IF i <= 5 THEN
        INSERT INTO report_timeline (report_id, action, description, created_by, created_at)
        VALUES (report_id, 'comment', 'Initial assessment completed. Gathering additional information.', admin_user_id, NOW() - (random() * INTERVAL '20 days'));
      END IF;
    END IF;
  END LOOP;
  
  RAISE NOTICE '   ✅ 10 sample reports created';
  
  -- =====================================================
  -- STEP 5: Update Organization Stats
  -- =====================================================
  
  UPDATE organizations
  SET 
    current_reports_count = (SELECT COUNT(*) FROM reports WHERE organization_id = demo_org_id),
    current_admin_users = (SELECT COUNT(*) FROM admin_profiles WHERE organization_id = demo_org_id),
    updated_at = NOW()
  WHERE id = demo_org_id;
  
  RAISE NOTICE '   ✅ Organization stats updated';
  
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
  RAISE NOTICE '   Landing: /demo';
  RAISE NOTICE '   Login: /org/demo/login';
  RAISE NOTICE '   Report: /org/demo/report';
  RAISE NOTICE '   Dashboard: /org/demo/dashboard';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Sample Data:';
  RAISE NOTICE '   Reports: %', (SELECT COUNT(*) FROM reports WHERE organization_id = demo_org_id);
  RAISE NOTICE '   Users: %', (SELECT COUNT(*) FROM admin_profiles WHERE organization_id = demo_org_id);
  RAISE NOTICE '   Categories: %', (SELECT COUNT(*) FROM report_categories WHERE organization_id = demo_org_id);
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Ready to demo!';
  RAISE NOTICE '========================================';
  
END $$;


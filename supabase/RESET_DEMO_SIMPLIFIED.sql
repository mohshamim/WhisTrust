-- =====================================================
-- RESET DEMO DATA (Weekly/Monthly)
-- =====================================================
-- Simplified version for multi-tenant schema
-- Refreshes demo data while keeping org and users
-- =====================================================

DO $$
DECLARE
  demo_org_id UUID;
  admin_user_id UUID;
  manager_user_id UUID;
  investigator_user_id UUID;
  report_id UUID;
  i INT;
BEGIN
  -- Get demo organization ID
  SELECT id INTO demo_org_id FROM organizations WHERE subdomain = 'demo';
  
  IF demo_org_id IS NULL THEN
    RAISE EXCEPTION 'Demo organization not found. Please run DEMO_SETUP_SIMPLIFIED.sql first.';
  END IF;
  
  -- Get user IDs
  SELECT id INTO admin_user_id FROM admin_profiles WHERE organization_id = demo_org_id AND email = 'admin@demo.com';
  SELECT id INTO manager_user_id FROM admin_profiles WHERE organization_id = demo_org_id AND email = 'manager@demo.com';
  SELECT id INTO investigator_user_id FROM admin_profiles WHERE organization_id = demo_org_id AND email = 'investigator@demo.com';
  
  RAISE NOTICE 'Resetting demo data for: % (ID: %)', (SELECT name FROM organizations WHERE id = demo_org_id), demo_org_id;
  
  -- =====================================================
  -- STEP 1: Clean Up Old Data
  -- =====================================================
  
  DELETE FROM messages m WHERE m.report_id IN (SELECT r.id FROM reports r WHERE r.organization_id = demo_org_id);
  DELETE FROM report_labels l WHERE l.report_id IN (SELECT r.id FROM reports r WHERE r.organization_id = demo_org_id);
  DELETE FROM report_attachments a WHERE a.report_id IN (SELECT r.id FROM reports r WHERE r.organization_id = demo_org_id);
  DELETE FROM reports r WHERE r.organization_id = demo_org_id;
  
  -- Clean old audit logs (keep last 30 days)
  DELETE FROM audit_logs 
  WHERE organization_id = demo_org_id 
    AND created_at < NOW() - INTERVAL '30 days';
  
  RAISE NOTICE '✅ Old data cleaned';
  
  -- =====================================================
  -- STEP 2: Create Fresh Sample Reports
  -- =====================================================
  
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
        WHEN 0 THEN 'Sample report regarding financial discrepancies in Q3 budget allocation. Multiple invoices appear to be duplicated or inflated beyond reasonable market rates.'
        WHEN 1 THEN 'Concerns about inappropriate behavior from a department manager. Multiple team members have expressed discomfort but fear retaliation if they speak up officially.'
        WHEN 2 THEN 'Safety equipment in the warehouse is outdated and not properly maintained. Several near-miss incidents have occurred in the past month involving forklift operations.'
        WHEN 3 THEN 'Potential conflict of interest: vendor relationship with procurement manager. Unusual contract terms favor specific supplier without competitive bidding process.'
        ELSE 'Customer data may have been accessed without proper authorization. Logs show unusual database queries after hours from unrecognized IP addresses.'
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
    
    -- Add labels to some reports
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
          WHEN 0 THEN '#ef4444'
          WHEN 1 THEN '#f97316'
          WHEN 2 THEN '#8b5cf6'
          ELSE '#3b82f6'
        END,
        admin_user_id
      );
    END IF;
    
    -- Add messages to some reports
    IF i % 4 = 0 AND i <= 6 THEN
      INSERT INTO messages (report_id, sender_type, sender_id, content, created_at)
      VALUES 
        (report_id, 'admin', admin_user_id, 'Thank you for your report. We take all concerns seriously and have begun our review process.', NOW() - (random() * INTERVAL '25 days')),
        (report_id, 'admin', manager_user_id, 'Initial assessment completed. Gathering supporting documentation and interviewing relevant parties.', NOW() - (random() * INTERVAL '15 days'));
    END IF;
  END LOOP;
  
  -- =====================================================
  -- STEP 3: Update Organization Stats
  -- =====================================================
  
  UPDATE organizations
  SET 
    current_reports_count = (SELECT COUNT(*) FROM reports WHERE organization_id = demo_org_id),
    current_admin_users = (SELECT COUNT(*) FROM admin_profiles WHERE organization_id = demo_org_id AND is_active = true),
    updated_at = NOW()
  WHERE id = demo_org_id;
  
  -- Add audit log
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
    'demo_data_reset',
    'organization',
    demo_org_id,
    NOW()
  );
  
  RAISE NOTICE '✅ Demo data reset complete!';
  RAISE NOTICE 'Reports: %', (SELECT COUNT(*) FROM reports r WHERE r.organization_id = demo_org_id);
  RAISE NOTICE 'Messages: %', (SELECT COUNT(*) FROM messages m WHERE m.report_id IN (SELECT r.id FROM reports r WHERE r.organization_id = demo_org_id));
  RAISE NOTICE 'Labels: %', (SELECT COUNT(*) FROM report_labels rl WHERE rl.report_id IN (SELECT r.id FROM reports r WHERE r.organization_id = demo_org_id));
  
END $$;


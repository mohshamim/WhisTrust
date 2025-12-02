-- =====================================================
-- Reset Demo Organization Data (Weekly/Monthly)
-- =====================================================
-- This script refreshes demo data while preserving the
-- organization and user accounts
-- Run this weekly or monthly to keep demo fresh
-- =====================================================

DO $$
DECLARE
  demo_org_id UUID;
  admin_user_id UUID;
  manager_user_id UUID;
  investigator_user_id UUID;
  report_id UUID;
  category_names TEXT[] := ARRAY[
    'Fraud & Financial Misconduct',
    'Harassment & Discrimination',
    'Safety & Health Violations',
    'Ethical Violations',
    'Data Privacy & Security',
    'Regulatory Compliance'
  ];
  statuses TEXT[] := ARRAY['submitted', 'under_review', 'investigating', 'resolved', 'closed'];
  priorities TEXT[] := ARRAY['low', 'medium', 'high', 'urgent'];
  descriptions TEXT[] := ARRAY[
    'Sample report regarding financial discrepancies in Q3 budget allocation. Multiple invoices appear to be duplicated or inflated beyond reasonable market rates.',
    'Concerns about inappropriate behavior from a department manager. Multiple team members have expressed discomfort but fear retaliation if they speak up officially.',
    'Safety equipment in the warehouse is outdated and not properly maintained. Several near-miss incidents have occurred in the past month involving forklift operations.',
    'Potential conflict of interest: vendor relationship with procurement manager. Unusual contract terms favor specific supplier without competitive bidding process.',
    'Customer data may have been accessed without proper authorization. Logs show unusual database queries after hours from unrecognized IP addresses.',
    'Environmental compliance concerns at manufacturing facility. Waste disposal procedures may not meet current regulatory standards.',
    'Time sheet fraud suspected in remote team. Hours logged don''t match project deliverables or meeting attendance records.',
    'Discrimination complaint regarding hiring practices in marketing department. Qualified candidates from diverse backgrounds consistently passed over.',
    'Product quality concerns not being escalated properly. Customer complaints about defects are being suppressed rather than investigated.',
    'Insider trading concerns. Executive sold significant stock holdings days before quarterly earnings announcement.'
  ];
  i INT;
BEGIN
  -- Get demo organization ID
  SELECT id INTO demo_org_id FROM organizations WHERE subdomain = 'demo';
  
  IF demo_org_id IS NULL THEN
    RAISE EXCEPTION 'Demo organization not found. Please run setup-demo-organization.sql first.';
  END IF;
  
  -- Get user IDs
  SELECT id INTO admin_user_id FROM admin_profiles WHERE organization_id = demo_org_id AND email = 'admin@demo.com';
  SELECT id INTO manager_user_id FROM admin_profiles WHERE organization_id = demo_org_id AND email = 'manager@demo.com';
  SELECT id INTO investigator_user_id FROM admin_profiles WHERE organization_id = demo_org_id AND email = 'investigator@demo.com';
  
  RAISE NOTICE 'Starting demo data reset for organization: %', demo_org_id;
  
  -- Step 1: Clean up old data
  -- =====================================================
  
  RAISE NOTICE 'Cleaning up old demo data...';
  
  -- Delete in correct order to respect foreign key constraints
  DELETE FROM report_timeline WHERE report_id IN (SELECT id FROM reports WHERE organization_id = demo_org_id);
  DELETE FROM report_labels WHERE report_id IN (SELECT id FROM reports WHERE organization_id = demo_org_id);
  DELETE FROM report_messages WHERE report_id IN (SELECT id FROM reports WHERE organization_id = demo_org_id);
  DELETE FROM report_attachments WHERE report_id IN (SELECT id FROM reports WHERE organization_id = demo_org_id);
  DELETE FROM reports WHERE organization_id = demo_org_id;
  
  -- Clean audit logs (keep last 30 days for realism)
  DELETE FROM audit_logs 
  WHERE organization_id = demo_org_id 
    AND created_at < NOW() - INTERVAL '30 days';
  
  RAISE NOTICE 'Old data cleaned';
  
  -- Step 2: Create fresh sample reports
  -- =====================================================
  
  RAISE NOTICE 'Creating fresh sample reports...';
  
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
      category_names[1 + (i % array_length(category_names, 1))],
      descriptions[1 + (i % array_length(descriptions, 1))],
      statuses[1 + (i % array_length(statuses, 1))],
      priorities[1 + (i % array_length(priorities, 1))],
      i % 3 = 0, -- Every third report is anonymous
      'DEMO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
      CASE 
        WHEN i % 3 = 0 THEN investigator_user_id
        WHEN i % 3 = 1 THEN manager_user_id
        ELSE NULL
      END,
      NOW() - (random() * INTERVAL '45 days'),
      NOW() - (random() * INTERVAL '20 days')
    ) RETURNING id INTO report_id;
    
    -- Add labels to some reports
    IF i % 2 = 0 THEN
      INSERT INTO report_labels (report_id, label)
      VALUES 
        (report_id, CASE (i % 4)
          WHEN 0 THEN 'urgent-review'
          WHEN 1 THEN 'requires-investigation'
          WHEN 2 THEN 'legal-review'
          ELSE 'follow-up-needed'
        END);
    END IF;
    
    -- Add timeline entries for progression
    IF i <= 7 THEN -- Most reports have some history
      -- Initial submission
      INSERT INTO report_timeline (
        report_id,
        action,
        description,
        created_by,
        created_at
      ) VALUES
        (report_id, 'status_change', 'Report submitted anonymously', NULL, NOW() - (random() * INTERVAL '30 days'));
      
      -- Some have additional history
      IF i <= 5 THEN
        INSERT INTO report_timeline (
          report_id,
          action,
          description,
          created_by,
          created_at
        ) VALUES
          (report_id, 'status_change', 'Moved to under review - initial assessment ongoing', admin_user_id, NOW() - (random() * INTERVAL '25 days')),
          (report_id, 'comment', 'Preliminary investigation initiated. Gathering supporting documentation and interviewing relevant parties.', manager_user_id, NOW() - (random() * INTERVAL '20 days'));
      END IF;
      
      -- Some are resolved
      IF i <= 3 THEN
        INSERT INTO report_timeline (
          report_id,
          action,
          description,
          created_by,
          created_at
        ) VALUES
          (report_id, 'status_change', 'Investigation completed. Appropriate corrective actions implemented.', investigator_user_id, NOW() - (random() * INTERVAL '10 days')),
          (report_id, 'status_change', 'Case closed after verification of remediation steps.', admin_user_id, NOW() - (random() * INTERVAL '5 days'));
      END IF;
    END IF;
    
    -- Add some messages for communication examples
    IF i % 4 = 0 AND i <= 6 THEN
      INSERT INTO report_messages (
        report_id,
        message,
        is_internal,
        sender_role,
        created_at
      ) VALUES
        (report_id, 'Thank you for your report. We take all concerns seriously and have begun our review process.', false, 'admin', NOW() - (random() * INTERVAL '25 days')),
        (report_id, 'Can you provide any additional details about the timeframe when these incidents occurred?', false, 'admin', NOW() - (random() * INTERVAL '20 days')),
        (report_id, '[Internal Note] Assigned to compliance team for priority review. Initial findings suggest policy violation.', true, 'manager', NOW() - (random() * INTERVAL '15 days'));
    END IF;
  END LOOP;
  
  -- Step 3: Update organization stats
  -- =====================================================
  
  UPDATE organizations
  SET 
    current_reports_count = (SELECT COUNT(*) FROM reports WHERE organization_id = demo_org_id),
    current_admin_users = (SELECT COUNT(*) FROM admin_profiles WHERE organization_id = demo_org_id AND is_active = true),
    updated_at = NOW()
  WHERE id = demo_org_id;
  
  -- Step 4: Add audit log entry for reset
  -- =====================================================
  
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    user_email,
    action,
    resource_type,
    resource_id,
    details,
    created_at
  ) VALUES (
    demo_org_id,
    admin_user_id,
    'admin@demo.com',
    'demo_data_reset',
    'organization',
    demo_org_id,
    jsonb_build_object(
      'reset_date', NOW(),
      'reports_created', 10,
      'automated', true
    ),
    NOW()
  );
  
  -- Step 5: Summary
  -- =====================================================
  
  RAISE NOTICE '✅ Demo data reset complete!';
  RAISE NOTICE 'Organization: % (ID: %)', (SELECT name FROM organizations WHERE id = demo_org_id), demo_org_id;
  RAISE NOTICE 'Reports created: %', (SELECT COUNT(*) FROM reports WHERE organization_id = demo_org_id);
  RAISE NOTICE 'Timeline entries: %', (SELECT COUNT(*) FROM report_timeline WHERE report_id IN (SELECT id FROM reports WHERE organization_id = demo_org_id));
  RAISE NOTICE 'Active users: %', (SELECT COUNT(*) FROM admin_profiles WHERE organization_id = demo_org_id AND is_active = true);
  RAISE NOTICE '';
  RAISE NOTICE 'Login credentials:';
  RAISE NOTICE 'Admin: admin@demo.com / Demo@2024';
  RAISE NOTICE 'Manager: manager@demo.com / Demo@2024';
  RAISE NOTICE 'Investigator: investigator@demo.com / Demo@2024';
  RAISE NOTICE '';
  RAISE NOTICE 'Access at: /org/demo/login';
  
END $$;

-- Show summary
SELECT 
  'Demo Data Reset Summary' AS info,
  (SELECT name FROM organizations WHERE subdomain = 'demo') AS organization,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo')) AS total_reports,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo') AND status = 'submitted') AS submitted,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo') AND status = 'under_review') AS under_review,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo') AND status = 'investigating') AS investigating,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo') AND status = 'resolved') AS resolved,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo') AND status = 'closed') AS closed;


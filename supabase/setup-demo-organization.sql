-- =====================================================
-- WhisTrust Demo Organization Setup Script
-- =====================================================
-- Creates a demo organization with sample users and data
-- for showcasing the multi-tenant platform
-- =====================================================

-- Step 1: Create Demo Organization
-- =====================================================

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
  name = EXCLUDED.name,
  status = 'active',
  plan = 'professional',
  updated_at = NOW();

-- Get the organization ID
DO $$
DECLARE
  demo_org_id UUID;
  admin_user_id UUID;
  manager_user_id UUID;
  investigator_user_id UUID;
BEGIN
  -- Get demo organization ID
  SELECT id INTO demo_org_id FROM organizations WHERE subdomain = 'demo';
  
  -- Step 2: Create Demo Users in Supabase Auth
  -- =====================================================
  -- Note: These users need to be created in Supabase Auth Dashboard first
  -- Or use Supabase Admin API to create them programmatically
  
  -- User 1: Admin (create in Supabase Auth with email: admin@demo.com, password: Demo@2024)
  -- User 2: Manager (create in Supabase Auth with email: manager@demo.com, password: Demo@2024)
  -- User 3: Investigator (create in Supabase Auth with email: investigator@demo.com, password: Demo@2024)
  
  -- For now, we'll insert placeholder profiles that will be linked when users are created
  -- You'll need to update the 'id' values with actual Supabase Auth user IDs
  
  RAISE NOTICE 'Demo organization created with ID: %', demo_org_id;
  RAISE NOTICE 'Please create the following users in Supabase Auth Dashboard:';
  RAISE NOTICE '1. Email: admin@demo.com, Password: Demo@2024';
  RAISE NOTICE '2. Email: manager@demo.com, Password: Demo@2024';
  RAISE NOTICE '3. Email: investigator@demo.com, Password: Demo@2024';
  RAISE NOTICE 'Then run the "link-demo-users.sql" script with their user IDs';
  
END $$;

-- Step 3: Create Report Categories for Demo Org
-- =====================================================

INSERT INTO report_categories (organization_id, name, description, is_active)
SELECT 
  (SELECT id FROM organizations WHERE subdomain = 'demo'),
  name,
  description,
  true
FROM (VALUES
  ('Fraud & Financial Misconduct', 'Financial fraud, embezzlement, or accounting irregularities'),
  ('Harassment & Discrimination', 'Workplace harassment, discrimination, or hostile behavior'),
  ('Safety & Health Violations', 'Unsafe working conditions or health hazards'),
  ('Ethical Violations', 'Code of conduct breaches or conflicts of interest'),
  ('Data Privacy & Security', 'Data breaches or privacy violations'),
  ('Regulatory Compliance', 'Violations of laws, regulations, or company policies'),
  ('Retaliation', 'Retaliation against whistleblowers'),
  ('Other', 'Other concerns not covered above')
) AS categories(name, description)
ON CONFLICT (organization_id, name) DO NOTHING;

-- Step 4: Create Sample Reports
-- =====================================================

DO $$
DECLARE
  demo_org_id UUID;
  report_id UUID;
  category_names TEXT[] := ARRAY[
    'Fraud & Financial Misconduct',
    'Harassment & Discrimination',
    'Safety & Health Violations',
    'Ethical Violations',
    'Data Privacy & Security'
  ];
  statuses TEXT[] := ARRAY['submitted', 'under_review', 'investigating', 'resolved', 'closed'];
  priorities TEXT[] := ARRAY['low', 'medium', 'high', 'urgent'];
  i INT;
BEGIN
  SELECT id INTO demo_org_id FROM organizations WHERE subdomain = 'demo';
  
  -- Create 10 sample reports
  FOR i IN 1..10 LOOP
    INSERT INTO reports (
      organization_id,
      category,
      description,
      status,
      priority,
      is_anonymous,
      tracking_code,
      created_at,
      updated_at
    ) VALUES (
      demo_org_id,
      category_names[1 + (i % array_length(category_names, 1))],
      CASE (i % 5)
        WHEN 0 THEN 'Sample report regarding financial discrepancies in Q3 budget allocation. Multiple invoices appear to be duplicated or inflated.'
        WHEN 1 THEN 'Concerns about inappropriate behavior from a department manager. Multiple team members have expressed discomfort but fear retaliation.'
        WHEN 2 THEN 'Safety equipment in the warehouse is outdated and not properly maintained. Several near-miss incidents have occurred.'
        WHEN 3 THEN 'Potential conflict of interest: vendor relationship with procurement manager. Unusual contract terms favor specific supplier.'
        WHEN 4 THEN 'Customer data may have been accessed without proper authorization. Logs show unusual database queries after hours.'
      END,
      statuses[1 + (i % array_length(statuses, 1))],
      priorities[1 + (i % array_length(priorities, 1))],
      i % 3 = 0, -- Every third report is anonymous
      'DEMO-' || LPAD(i::TEXT, 8, '0'),
      NOW() - (random() * INTERVAL '30 days'),
      NOW() - (random() * INTERVAL '15 days')
    ) RETURNING id INTO report_id;
    
    -- Add labels to some reports
    IF i % 2 = 0 THEN
      INSERT INTO report_labels (report_id, label)
      VALUES 
        (report_id, 'urgent-review'),
        (report_id, 'requires-investigation');
    END IF;
    
    -- Add timeline entries for some reports
    IF i % 3 = 0 THEN
      INSERT INTO report_timeline (
        report_id,
        action,
        description,
        created_by,
        created_at
      ) VALUES
        (report_id, 'status_change', 'Report submitted and acknowledged', NULL, NOW() - (random() * INTERVAL '20 days')),
        (report_id, 'status_change', 'Moved to under review', NULL, NOW() - (random() * INTERVAL '15 days')),
        (report_id, 'comment', 'Initial assessment completed. Gathering additional information.', NULL, NOW() - (random() * INTERVAL '10 days'));
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Created 10 sample reports for demo organization';
END $$;

-- Step 5: Summary
-- =====================================================

SELECT 
  'Demo Organization Setup Complete!' AS message,
  (SELECT name FROM organizations WHERE subdomain = 'demo') AS org_name,
  (SELECT subdomain FROM organizations WHERE subdomain = 'demo') AS subdomain,
  (SELECT COUNT(*) FROM reports WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo')) AS total_reports;

-- Next Steps:
-- =====================================================
-- 1. Create users in Supabase Auth Dashboard:
--    - admin@demo.com / Demo@2024
--    - manager@demo.com / Demo@2024
--    - investigator@demo.com / Demo@2024
--
-- 2. Run link-demo-users.sql with the actual user IDs
--
-- 3. Visit: http://localhost:3000/org/demo/login
--
-- 4. Use the credentials above to login and test!


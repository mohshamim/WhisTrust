-- =============================================================================
-- ADD DEMO NOTIFICATIONS FOR DEMO ORGANIZATION
-- =============================================================================
-- This adds sample notifications to show in the notifications dropdown
-- =============================================================================

-- First, get the demo organization ID and admin user ID
-- You'll need to replace these with actual IDs from your database

-- Option 1: If you know the demo org subdomain
DO $$
DECLARE
  demo_org_id UUID;
  demo_admin_id UUID;
BEGIN
  -- Get demo organization ID
  SELECT id INTO demo_org_id
  FROM organizations
  WHERE subdomain = 'demo'
  LIMIT 1;

  -- Get a demo admin user ID (first admin in demo org)
  SELECT id INTO demo_admin_id
  FROM admin_profiles
  WHERE organization_id = demo_org_id
  AND role = 'admin'
  LIMIT 1;

  -- Only proceed if we found both
  IF demo_org_id IS NOT NULL AND demo_admin_id IS NOT NULL THEN
    
    -- Insert sample notifications
    INSERT INTO notifications (user_id, organization_id, type, title, message, link, is_read, created_at)
    VALUES
      -- New report notification (unread)
      (demo_admin_id, demo_org_id, 'new_report', 'New Report Submitted', 
       'A new fraud report has been submitted and requires your attention.', 
       '/org/demo/reports', false, NOW() - INTERVAL '5 minutes'),
      
      -- Case assignment notification (unread)
      (demo_admin_id, demo_org_id, 'assignment', 'Case Assigned to You', 
       'You have been assigned to investigate Report #WTR-2024-0042.',
       '/org/demo/reports', false, NOW() - INTERVAL '2 hours'),
      
      -- Status update notification (read)
      (demo_admin_id, demo_org_id, 'status_change', 'Report Status Updated', 
       'Report #WTR-2024-0038 has been marked as resolved.',
       '/org/demo/reports', true, NOW() - INTERVAL '1 day'),
      
      -- New message notification (unread)
      (demo_admin_id, demo_org_id, 'message', 'New Message from Reporter', 
       'Anonymous reporter has sent a new message on Report #WTR-2024-0041.',
       '/org/demo/reports', false, NOW() - INTERVAL '30 minutes'),
      
      -- System notification (read)
      (demo_admin_id, demo_org_id, 'system', 'System Update', 
       'New features have been added to the compliance portal.',
       '/org/demo/dashboard', true, NOW() - INTERVAL '3 days'),
      
      -- High priority alert (unread)
      (demo_admin_id, demo_org_id, 'alert', 'High Priority Report', 
       'A critical report requires immediate attention.',
       '/org/demo/reports', false, NOW() - INTERVAL '15 minutes');

    RAISE NOTICE '✅ Demo notifications added successfully!';
    RAISE NOTICE '   Organization: demo';
    RAISE NOTICE '   Admin User ID: %', demo_admin_id;
    RAISE NOTICE '   Unread: 4, Read: 2';
  ELSE
    RAISE NOTICE '❌ Could not find demo organization or admin user';
    RAISE NOTICE '   Demo Org ID: %', demo_org_id;
    RAISE NOTICE '   Admin ID: %', demo_admin_id;
  END IF;
END $$;

-- Verify the notifications were added
SELECT 
  n.id,
  n.type,
  n.title,
  n.is_read,
  n.created_at,
  o.subdomain as org,
  ap.email as user_email
FROM notifications n
JOIN organizations o ON n.organization_id = o.id
JOIN admin_profiles ap ON n.user_id = ap.id
WHERE o.subdomain = 'demo'
ORDER BY n.created_at DESC;


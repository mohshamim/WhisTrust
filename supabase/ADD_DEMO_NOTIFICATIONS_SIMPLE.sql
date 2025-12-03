-- =============================================================================
-- SIMPLE: ADD DEMO NOTIFICATIONS
-- =============================================================================
-- Run this to add sample notifications for demo purposes
-- This version manually finds the demo org and admin
-- =============================================================================

-- Step 1: Find the demo organization and admin user
WITH demo_info AS (
  SELECT 
    o.id as org_id,
    o.subdomain,
    ap.id as admin_id,
    ap.email as admin_email
  FROM organizations o
  LEFT JOIN admin_profiles ap ON ap.organization_id = o.id AND ap.role = 'admin'
  WHERE o.subdomain = 'demo'
  LIMIT 1
)
SELECT 
  org_id,
  subdomain,
  admin_id,
  admin_email
FROM demo_info;

-- Step 2: Insert demo notifications
-- Replace the UUIDs below with the values from Step 1

-- Example (you'll need to replace these):
INSERT INTO notifications (user_id, organization_id, type, title, message, link, is_read, created_at)
SELECT 
  ap.id as user_id,
  o.id as organization_id,
  'new_report' as type,
  'New Report Submitted' as title,
  'A new fraud report has been submitted and requires your attention.' as message,
  '/org/demo/reports' as link,
  false as is_read,
  NOW() - INTERVAL '5 minutes' as created_at
FROM organizations o
CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin'
LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, title, message, link, is_read, created_at)
SELECT 
  ap.id,
  o.id,
  'assignment',
  'Case Assigned to You',
  'You have been assigned to investigate Report #WTR-2024-0042.',
  '/org/demo/reports',
  false,
  NOW() - INTERVAL '2 hours'
FROM organizations o
CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin'
LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, title, message, link, is_read, created_at)
SELECT 
  ap.id,
  o.id,
  'message',
  'New Message from Reporter',
  'Anonymous reporter has sent a new message on Report #WTR-2024-0041.',
  '/org/demo/reports',
  false,
  NOW() - INTERVAL '30 minutes'
FROM organizations o
CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin'
LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, title, message, link, is_read, created_at)
SELECT 
  ap.id,
  o.id,
  'alert',
  'High Priority Report',
  'A critical report requires immediate attention.',
  '/org/demo/reports',
  false,
  NOW() - INTERVAL '15 minutes'
FROM organizations o
CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin'
LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, title, message, link, is_read, created_at)
SELECT 
  ap.id,
  o.id,
  'status_change',
  'Report Status Updated',
  'Report #WTR-2024-0038 has been marked as resolved.',
  '/org/demo/reports',
  true,
  NOW() - INTERVAL '1 day'
FROM organizations o
CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin'
LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, title, message, link, is_read, created_at)
SELECT 
  ap.id,
  o.id,
  'system',
  'System Update',
  'New features have been added to the compliance portal.',
  '/org/demo/dashboard',
  true,
  NOW() - INTERVAL '3 days'
FROM organizations o
CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin'
LIMIT 1;

-- Verify notifications were added
SELECT 
  COUNT(*) as total_notifications,
  SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) as unread_count,
  SUM(CASE WHEN is_read = true THEN 1 ELSE 0 END) as read_count
FROM notifications n
JOIN organizations o ON n.organization_id = o.id
WHERE o.subdomain = 'demo';

-- Show the notifications
SELECT 
  n.type,
  n.title,
  n.is_read,
  to_char(n.created_at, 'YYYY-MM-DD HH24:MI') as time
FROM notifications n
JOIN organizations o ON n.organization_id = o.id
WHERE o.subdomain = 'demo'
ORDER BY n.created_at DESC;


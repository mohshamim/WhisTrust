-- =============================================================================
-- FIXED: ADD DEMO NOTIFICATIONS (Correct Schema)
-- =============================================================================
-- This uses the correct columns that actually exist in the notifications table
-- =============================================================================

-- Add demo notifications with correct schema
INSERT INTO notifications (user_id, organization_id, type, message, is_read, created_at)
SELECT 
  ap.id as user_id,
  o.id as organization_id,
  'new_report' as type,
  'A new fraud report has been submitted and requires your attention.' as message,
  false as is_read,
  NOW() - INTERVAL '5 minutes' as created_at
FROM organizations o
CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin'
LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, message, is_read, created_at)
SELECT 
  ap.id, o.id, 'assignment',
  'You have been assigned to investigate Report #WTR-2024-0042.',
  false, NOW() - INTERVAL '2 hours'
FROM organizations o CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin'
LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, message, is_read, created_at)
SELECT 
  ap.id, o.id, 'new_message',
  'Anonymous reporter has sent a new message on Report #WTR-2024-0041.',
  false, NOW() - INTERVAL '30 minutes'
FROM organizations o CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin'
LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, message, is_read, created_at)
SELECT 
  ap.id, o.id, 'priority_change',
  'Report #WTR-2024-0039 has been marked as high priority and requires immediate attention.',
  false, NOW() - INTERVAL '15 minutes'
FROM organizations o CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin'
LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, message, is_read, created_at)
SELECT 
  ap.id, o.id, 'status_change',
  'Report #WTR-2024-0038 has been marked as resolved.',
  true, NOW() - INTERVAL '1 day'
FROM organizations o CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin'
LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, message, is_read, created_at)
SELECT 
  ap.id, o.id, 'new_report',
  'A new harassment complaint has been submitted via the anonymous portal.',
  true, NOW() - INTERVAL '3 days'
FROM organizations o CROSS JOIN admin_profiles ap
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
  LEFT(n.message, 50) || '...' as message_preview,
  n.is_read,
  to_char(n.created_at, 'YYYY-MM-DD HH24:MI') as time
FROM notifications n
JOIN organizations o ON n.organization_id = o.id
WHERE o.subdomain = 'demo'
ORDER BY n.created_at DESC;


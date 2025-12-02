-- =====================================================
-- CHECK DEMO ORGANIZATION STATUS
-- =====================================================
-- Run this to verify if demo org exists and see its details
-- =====================================================

-- Check if demo organization exists
SELECT 
  '=== DEMO ORGANIZATION ===' AS section,
  id,
  name,
  subdomain,
  status,
  plan,
  current_admin_users,
  current_reports_count,
  created_at
FROM organizations 
WHERE subdomain = 'demo';

-- Check demo users
SELECT 
  '=== DEMO USERS ===' AS section,
  id,
  email,
  full_name,
  role,
  department,
  is_active,
  organization_id
FROM admin_profiles
WHERE email IN ('admin@demo.com', 'manager@demo.com', 'investigator@demo.com');

-- Check demo reports
SELECT 
  '=== DEMO REPORTS ===' AS section,
  COUNT(*) as total_reports,
  COUNT(*) FILTER (WHERE status = 'submitted') as submitted,
  COUNT(*) FILTER (WHERE status = 'under_review') as under_review,
  COUNT(*) FILTER (WHERE status = 'investigating') as investigating,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
  COUNT(*) FILTER (WHERE status = 'closed') as closed
FROM reports
WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo');

-- List all organizations (to see what exists)
SELECT 
  '=== ALL ORGANIZATIONS ===' AS section,
  subdomain,
  name,
  status,
  current_reports_count,
  current_admin_users
FROM organizations
ORDER BY created_at DESC;


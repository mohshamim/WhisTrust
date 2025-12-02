-- =====================================================
-- CHECK DEMO ORGANIZATION STATUS
-- =====================================================

-- 1. Does demo org exist?
SELECT 
  '=== DEMO ORGANIZATION ===' AS section,
  *
FROM organizations
WHERE subdomain = 'demo';

-- 2. List all organizations (see what's there)
SELECT 
  '=== ALL ORGANIZATIONS ===' AS section,
  subdomain,
  name,
  status,
  plan,
  current_reports_count,
  current_admin_users,
  created_at
FROM organizations
ORDER BY created_at DESC;

-- 3. Check demo users in auth.users
SELECT 
  '=== DEMO USERS IN AUTH ===' AS section,
  id,
  email,
  created_at,
  confirmed_at
FROM auth.users
WHERE email IN ('admin@demo.com', 'manager@demo.com', 'investigator@demo.com');

-- 4. Check demo users in admin_profiles
SELECT 
  '=== DEMO USERS IN PROFILES ===' AS section,
  ap.id,
  ap.email,
  ap.full_name,
  ap.role,
  ap.department,
  ap.organization_id,
  ap.is_active,
  o.name as org_name,
  o.subdomain as org_subdomain
FROM admin_profiles ap
LEFT JOIN organizations o ON ap.organization_id = o.id
WHERE ap.email IN ('admin@demo.com', 'manager@demo.com', 'investigator@demo.com');

-- 5. Count demo reports
SELECT 
  '=== DEMO REPORTS COUNT ===' AS section,
  COUNT(*) as total_reports
FROM reports
WHERE organization_id = (SELECT id FROM organizations WHERE subdomain = 'demo');


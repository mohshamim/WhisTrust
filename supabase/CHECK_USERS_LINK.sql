-- Check if demo users exist in auth.users and are linked properly

-- 1. Check auth.users (authentication)
SELECT 
  '=== USERS IN AUTH.USERS ===' AS section,
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at
FROM auth.users
WHERE email IN ('admin@demo.com', 'manager@demo.com', 'investigator@demo.com')
ORDER BY email;

-- 2. Check admin_profiles (linked to organization)
SELECT 
  '=== USERS IN ADMIN_PROFILES ===' AS section,
  ap.id,
  ap.email,
  ap.full_name,
  ap.role,
  ap.organization_id,
  ap.is_active,
  o.subdomain as org_subdomain,
  o.name as org_name
FROM admin_profiles ap
LEFT JOIN organizations o ON ap.organization_id = o.id
WHERE ap.email IN ('admin@demo.com', 'manager@demo.com', 'investigator@demo.com')
ORDER BY ap.email;

-- 3. Find any mismatch (users in auth but not in profiles)
SELECT 
  '=== USERS NOT LINKED ===' AS section,
  au.id,
  au.email,
  'User exists in auth but not in admin_profiles' as issue
FROM auth.users au
WHERE au.email IN ('admin@demo.com', 'manager@demo.com', 'investigator@demo.com')
  AND NOT EXISTS (
    SELECT 1 FROM admin_profiles ap WHERE ap.id = au.id
  );


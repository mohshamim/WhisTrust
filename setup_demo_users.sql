-- =====================================================
-- WhisTrust Demo Users Setup Script
-- =====================================================
-- Purpose: Create demo user accounts for client demonstrations
-- Last Updated: November 9, 2025
-- 
-- INSTRUCTIONS:
-- 1. Run this script in Supabase SQL Editor
-- 2. Then create corresponding Auth users in Supabase Authentication
--    (Auth users must be created manually via Supabase Dashboard)
-- =====================================================

-- Clean up existing demo users (if any)
-- Uncomment below to remove old demo users before creating new ones
-- DELETE FROM admin_profiles WHERE email LIKE '%@whistrust.com';

-- =====================================================
-- 1. ADMINISTRATOR ACCOUNT
-- =====================================================
-- Full system access, can manage all departments and users
INSERT INTO admin_profiles (
  id,
  email,
  full_name,
  role,
  department,
  created_at,
  updated_at
) VALUES (
  '54027233-0bda-41c7-903f-cd251c22b2df',
  'ahmed.admin@whistrust.com',
  'Ahmed Al-Rashid',
  'admin',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  updated_at = NOW();

-- =====================================================
-- 2. MANAGER ACCOUNT (HR DEPARTMENT)
-- =====================================================
-- Department-level access, can only manage HR cases
INSERT INTO admin_profiles (
  id,
  email,
  full_name,
  role,
  department,
  created_at,
  updated_at
) VALUES (
  'b0a8fba8-f606-472c-806c-cd8c1445c44f',
  'hassan.hr@whistrust.com',
  'Hassan Al-Khalifa',
  'manager',
  'HR',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  updated_at = NOW();

-- =====================================================
-- 3. MANAGER ACCOUNT (FINANCE DEPARTMENT)
-- =====================================================
-- Department-level access, can only manage Finance cases
INSERT INTO admin_profiles (
  id,
  email,
  full_name,
  role,
  department,
  created_at,
  updated_at
) VALUES (
  'a441f15d-ecd9-4a9e-8c35-e8f2dc739ac9',
  'omar.finance@whistrust.com',
  'Omar Abdullah',
  'manager',
  'Finance',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  updated_at = NOW();

-- =====================================================
-- 4. INVESTIGATOR ACCOUNT
-- =====================================================
-- Limited access, can only view and manage assigned cases
INSERT INTO admin_profiles (
  id,
  email,
  full_name,
  role,
  department,
  created_at,
  updated_at
) VALUES (
  'e38e988e-e61a-457f-917f-52b1fa6e2bc0',
  'yusuf.investigator@whistrust.com',
  'Yusuf Ibrahim',
  'investigator',
  'Compliance',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  updated_at = NOW();

-- =====================================================
-- 5. MANAGER ACCOUNT (IT DEPARTMENT)
-- =====================================================
-- Department-level access, can only manage IT cases
INSERT INTO admin_profiles (
  id,
  email,
  full_name,
  role,
  department,
  created_at,
  updated_at
) VALUES (
  'ecfe028d-b1d9-4d59-854f-03d81be42b10',
  'faisal.it@whistrust.com',
  'Faisal Al-Shehri',
  'manager',
  'IT',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  updated_at = NOW();

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify all demo users were created successfully
SELECT 
  email,
  full_name,
  role,
  department,
  created_at
FROM admin_profiles
WHERE email LIKE '%@whistrust.com'
ORDER BY role, department, email;

-- =====================================================
-- EXPECTED OUTPUT:
-- =====================================================
-- Should show 5 users:
-- 1. ahmed.admin@whistrust.com (admin, no department)
-- 2. fatima.hr@whistrust.com (manager, HR)
-- 3. omar.finance@whistrust.com (manager, Finance)
-- 4. yusuf.investigator@whistrust.com (investigator, Compliance)
-- 5. aisha.hr@whistrust.com (hr, HR)
-- =====================================================


-- =====================================================
-- NEXT STEPS: CREATE AUTH USERS
-- =====================================================
-- After running this SQL script, you MUST create corresponding
-- authentication users in Supabase Authentication Dashboard:
--
-- Go to: Supabase Dashboard → Authentication → Users → Add User
--
-- Create these 5 auth users:
--
-- 1. Email: ahmed.admin@whistrust.com
--    Password: Admin@WhistTrust2025
--    Email Confirm: Yes (skip email confirmation)
--
-- 2. Email: fatima.hr@whistrust.com
--    Password: Manager@WhistTrust2025
--    Email Confirm: Yes
--
-- 3. Email: omar.finance@whistrust.com
--    Password: Manager@WhistTrust2025
--    Email Confirm: Yes
--
-- 4. Email: yusuf.investigator@whistrust.com
--    Password: Investigator@WhistTrust2025
--    Email Confirm: Yes
--
-- 5. Email: aisha.hr@whistrust.com
--    Password: HR@WhistTrust2025
--    Email Confirm: Yes
--
-- IMPORTANT: The user ID generated in Supabase Auth must match
-- the admin_profiles entries. You may need to update the script
-- with actual UUIDs after creating auth users.
-- =====================================================


-- =====================================================
-- OPTIONAL: EXTENDED DEMO USERS (MORE DEPARTMENTS)
-- =====================================================
-- Uncomment below to add additional managers for other departments

-- Manager (Compliance)
-- INSERT INTO admin_profiles (
--   id,
--   email,
--   full_name,
--   role,
--   department,
--   created_at,
--   updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   'zahra.compliance@whistrust.com',
--   'Zahra Al-Mansouri',
--   'manager',
--   'Compliance',
--   NOW(),
--   NOW()
-- );

-- Manager (Operations)
-- INSERT INTO admin_profiles (
--   id,
--   email,
--   full_name,
--   role,
--   department,
--   created_at,
--   updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   'ibrahim.operations@whistrust.com',
--   'Ibrahim Al-Fahad',
--   'manager',
--   'Operations',
--   NOW(),
--   NOW()
-- );

-- Manager (Legal)
-- INSERT INTO admin_profiles (
--   id,
--   email,
--   full_name,
--   role,
--   department,
--   created_at,
--   updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   'khadija.legal@whistrust.com',
--   'Khadija Al-Siddiq',
--   'manager',
--   'Legal',
--   NOW(),
--   NOW()
-- );

-- Manager (IT)
-- INSERT INTO admin_profiles (
--   id,
--   email,
--   full_name,
--   role,
--   department,
--   created_at,
--   updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   'mustafa.it@whistrust.com',
--   'Mustafa Al-Dosari',
--   'manager',
--   'IT',
--   NOW(),
--   NOW()
-- );

-- Additional Investigator
-- INSERT INTO admin_profiles (
--   id,
--   email,
--   full_name,
--   role,
--   department,
--   created_at,
--   updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   'ali.investigator@whistrust.com',
--   'Ali Al-Otaibi',
--   'investigator',
--   'Compliance',
--   NOW(),
--   NOW()
-- );

-- =====================================================
-- END OF SCRIPT
-- =====================================================


-- =====================================================
-- Link Demo Users to Demo Organization
-- =====================================================
-- Run this AFTER creating users in Supabase Auth Dashboard
-- Replace the UUIDs below with actual user IDs from auth.users
-- =====================================================

-- Instructions:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Create these users (if not already created):
--    - admin@demo.com / Demo@2024
--    - manager@demo.com / Demo@2024
--    - investigator@demo.com / Demo@2024
-- 3. Copy each user's UUID
-- 4. Replace 'YOUR_ADMIN_USER_ID_HERE' etc. below
-- 5. Run this script

DO $$
DECLARE
  demo_org_id UUID;
  admin_user_id UUID := 'YOUR_ADMIN_USER_ID_HERE'; -- Replace with actual UUID from auth.users
  manager_user_id UUID := 'YOUR_MANAGER_USER_ID_HERE'; -- Replace with actual UUID from auth.users
  investigator_user_id UUID := 'YOUR_INVESTIGATOR_USER_ID_HERE'; -- Replace with actual UUID from auth.users
BEGIN
  -- Get demo organization ID
  SELECT id INTO demo_org_id FROM organizations WHERE subdomain = 'demo';
  
  IF demo_org_id IS NULL THEN
    RAISE EXCEPTION 'Demo organization not found. Please run setup-demo-organization.sql first.';
  END IF;
  
  -- Insert Admin Profile
  INSERT INTO admin_profiles (
    id,
    organization_id,
    email,
    full_name,
    role,
    department,
    is_active,
    is_super_admin,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    demo_org_id,
    'admin@demo.com',
    'Demo Admin',
    'admin',
    'Administration',
    true,
    false,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    organization_id = demo_org_id,
    email = 'admin@demo.com',
    full_name = 'Demo Admin',
    role = 'admin',
    is_active = true,
    updated_at = NOW();
  
  -- Insert Manager Profile
  INSERT INTO admin_profiles (
    id,
    organization_id,
    email,
    full_name,
    role,
    department,
    is_active,
    is_super_admin,
    created_at,
    updated_at
  ) VALUES (
    manager_user_id,
    demo_org_id,
    'manager@demo.com',
    'Demo Manager',
    'manager',
    'Operations',
    true,
    false,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    organization_id = demo_org_id,
    email = 'manager@demo.com',
    full_name = 'Demo Manager',
    role = 'manager',
    is_active = true,
    updated_at = NOW();
  
  -- Insert Investigator Profile
  INSERT INTO admin_profiles (
    id,
    organization_id,
    email,
    full_name,
    role,
    department,
    is_active,
    is_super_admin,
    created_at,
    updated_at
  ) VALUES (
    investigator_user_id,
    demo_org_id,
    'investigator@demo.com',
    'Demo Investigator',
    'investigator',
    'Compliance',
    true,
    false,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    organization_id = demo_org_id,
    email = 'investigator@demo.com',
    full_name = 'Demo Investigator',
    role = 'investigator',
    is_active = true,
    updated_at = NOW();
  
  -- Assign some reports to the investigator
  UPDATE reports
  SET assigned_to = investigator_user_id,
      updated_at = NOW()
  WHERE organization_id = demo_org_id
    AND status IN ('under_review', 'investigating')
  LIMIT 3;
  
  RAISE NOTICE '✅ Demo users linked successfully!';
  RAISE NOTICE 'Admin: admin@demo.com / Demo@2024';
  RAISE NOTICE 'Manager: manager@demo.com / Demo@2024';
  RAISE NOTICE 'Investigator: investigator@demo.com / Demo@2024';
  RAISE NOTICE 'Login at: /org/demo/login';
  
END $$;


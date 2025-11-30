-- =====================================================
-- SETUP TEST USERS FOR CodeSquare Organization
-- Run this in Supabase SQL Editor
-- =====================================================
-- 
-- This script creates admin_profiles for test users.
-- IMPORTANT: You MUST create auth users FIRST in Supabase Auth UI!
--
-- STEPS:
-- 1. Go to Supabase Dashboard → Authentication → Users → Add User
-- 2. Create these 3 users (one by one):
--    - admin@codesquare.com (Password: CodeSquare@2024)
--    - manager@codesquare.com (Password: Manager@2024)
--    - investigator@codesquare.com (Password: Investigator@2024)
-- 3. Make sure "Auto Confirm User" is checked for each
-- 4. Then run this script to create the admin_profiles
-- =====================================================

-- Get CodeSquare organization ID
DO $$
DECLARE
    codesquare_org_id UUID;
    admin_user_id UUID;
    manager_user_id UUID;
    investigator_user_id UUID;
BEGIN
    -- Get CodeSquare org ID
    SELECT id INTO codesquare_org_id 
    FROM organizations 
    WHERE subdomain = 'codesquare';
    
    IF codesquare_org_id IS NULL THEN
        RAISE EXCEPTION 'CodeSquare organization not found. Please create it first.';
    END IF;
    
    RAISE NOTICE 'CodeSquare Org ID: %', codesquare_org_id;
    
    -- =====================================================
    -- CREATE ADMIN USER PROFILE
    -- =====================================================
    -- Check if auth user exists first
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@codesquare.com' 
    LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Auth user admin@codesquare.com not found! Please create it in Supabase Auth UI first.';
    END IF;
    
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM admin_profiles WHERE id = admin_user_id) THEN
        RAISE NOTICE 'Admin profile already exists: admin@codesquare.com';
    ELSE
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
            codesquare_org_id,
            'admin@codesquare.com',
            'CodeSquare Administrator',
            'admin',
            NULL,
            true,
            false,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created admin profile: admin@codesquare.com (ID: %)', admin_user_id;
    END IF;
    
    -- =====================================================
    -- CREATE MANAGER USER PROFILE
    -- =====================================================
    SELECT id INTO manager_user_id 
    FROM auth.users 
    WHERE email = 'manager@codesquare.com' 
    LIMIT 1;
    
    IF manager_user_id IS NULL THEN
        RAISE EXCEPTION 'Auth user manager@codesquare.com not found! Please create it in Supabase Auth UI first.';
    END IF;
    
    IF EXISTS (SELECT 1 FROM admin_profiles WHERE id = manager_user_id) THEN
        RAISE NOTICE 'Manager profile already exists: manager@codesquare.com';
    ELSE
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
            codesquare_org_id,
            'manager@codesquare.com',
            'CodeSquare Manager',
            'manager',
            'Operations',
            true,
            false,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created manager profile: manager@codesquare.com (ID: %)', manager_user_id;
    END IF;
    
    -- =====================================================
    -- CREATE INVESTIGATOR USER PROFILE
    -- =====================================================
    SELECT id INTO investigator_user_id 
    FROM auth.users 
    WHERE email = 'investigator@codesquare.com' 
    LIMIT 1;
    
    IF investigator_user_id IS NULL THEN
        RAISE EXCEPTION 'Auth user investigator@codesquare.com not found! Please create it in Supabase Auth UI first.';
    END IF;
    
    IF EXISTS (SELECT 1 FROM admin_profiles WHERE id = investigator_user_id) THEN
        RAISE NOTICE 'Investigator profile already exists: investigator@codesquare.com';
    ELSE
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
            codesquare_org_id,
            'investigator@codesquare.com',
            'CodeSquare Investigator',
            'investigator',
            'Compliance',
            true,
            false,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created investigator profile: investigator@codesquare.com (ID: %)', investigator_user_id;
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ All test user profiles created successfully!';
    RAISE NOTICE '========================================';
    
END $$;

-- Verify created users
SELECT 
    ap.email,
    ap.full_name,
    ap.role,
    ap.department,
    ap.is_active,
    o.name as organization
FROM admin_profiles ap
JOIN organizations o ON ap.organization_id = o.id
WHERE o.subdomain = 'codesquare'
ORDER BY ap.role, ap.email;


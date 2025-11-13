-- =====================================================
-- CREATE AUTH USERS for CodeSquare and AISAR
-- Run this in Supabase SQL Editor (Production)
-- =====================================================

-- NOTE: You need to create these users through Supabase Auth UI or use this SQL
-- This creates the users in auth.users and then links them to admin_profiles

-- For CodeSquare:
-- Email: admin@codesquare.com
-- Password: Password123!

-- For AISAR:
-- Email: admin@aisar.com
-- Password: Password123!

-- MANUAL STEPS (Because Supabase Auth doesn't allow SQL-based user creation):
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Invite user" or "Add user"
-- 3. Create these users:
--    - admin@codesquare.com (Password123!)
--    - investigator@codesquare.com (Password123!)
--    - admin@aisar.com (Password123!)
--    - manager@aisar.com (Password123!)

-- AFTER creating users in Supabase Auth UI, run this to create their profiles:

DO $$
DECLARE
    codesquare_org_id UUID;
    aisar_org_id UUID;
    admin_codesquare_uid UUID;
    investigator_codesquare_uid UUID;
    admin_aisar_uid UUID;
    manager_aisar_uid UUID;
BEGIN
    -- Get organization IDs
    SELECT id INTO codesquare_org_id FROM organizations WHERE subdomain = 'codesquare';
    SELECT id INTO aisar_org_id FROM organizations WHERE subdomain = 'aisar';
    
    IF codesquare_org_id IS NULL THEN
        RAISE EXCEPTION 'CodeSquare organization not found!';
    END IF;
    IF aisar_org_id IS NULL THEN
        RAISE EXCEPTION 'AISAR organization not found!';
    END IF;
    
    -- Get user IDs from auth.users
    SELECT id INTO admin_codesquare_uid FROM auth.users WHERE email = 'admin@codesquare.com';
    SELECT id INTO investigator_codesquare_uid FROM auth.users WHERE email = 'investigator@codesquare.com';
    SELECT id INTO admin_aisar_uid FROM auth.users WHERE email = 'admin@aisar.com';
    SELECT id INTO manager_aisar_uid FROM auth.users WHERE email = 'manager@aisar.com';
    
    -- Check if users exist
    IF admin_codesquare_uid IS NULL THEN
        RAISE EXCEPTION 'User admin@codesquare.com not found! Create it in Supabase Auth UI first.';
    END IF;
    
    -- Create CodeSquare profiles
    IF admin_codesquare_uid IS NOT NULL THEN
        INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin)
        VALUES (admin_codesquare_uid, codesquare_org_id, 'admin@codesquare.com', 'CodeSquare Admin', 'admin', 'IT', true, false)
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active;
        RAISE NOTICE '✅ Created profile for admin@codesquare.com';
    END IF;
    
    IF investigator_codesquare_uid IS NOT NULL THEN
        INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin)
        VALUES (investigator_codesquare_uid, codesquare_org_id, 'investigator@codesquare.com', 'Mike Wilson', 'investigator', 'Compliance', true, false)
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active;
        RAISE NOTICE '✅ Created profile for investigator@codesquare.com';
    END IF;
    
    -- Create AISAR profiles
    IF admin_aisar_uid IS NOT NULL THEN
        INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin)
        VALUES (admin_aisar_uid, aisar_org_id, 'admin@aisar.com', 'AISAR Admin', 'admin', 'Administration', true, false)
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active;
        RAISE NOTICE '✅ Created profile for admin@aisar.com';
    END IF;
    
    IF manager_aisar_uid IS NOT NULL THEN
        INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin)
        VALUES (manager_aisar_uid, aisar_org_id, 'manager@aisar.com', 'AISAR Manager', 'manager', 'Operations', true, false)
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active;
        RAISE NOTICE '✅ Created profile for manager@aisar.com';
    END IF;
    
    RAISE NOTICE '✅ Profile creation complete!';
END $$;

-- VERIFY: Show all organization admin profiles
SELECT 
    ap.email,
    ap.full_name,
    ap.role,
    ap.department,
    ap.is_active,
    o.name as organization,
    o.subdomain
FROM admin_profiles ap
JOIN organizations o ON ap.organization_id = o.id
WHERE ap.is_super_admin = false
ORDER BY o.name, ap.role;


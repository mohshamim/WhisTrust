-- =====================================================
-- CREATE ADMIN PROFILES FOR AISAR Organization
-- Run this AFTER creating auth users in Supabase Dashboard
-- Run this in Supabase SQL Editor (Production)
-- =====================================================

-- STEP 1: Create these users manually in Supabase Dashboard first:
-- 1. admin@aisar.com
-- 2. manager@aisar.com  
-- 3. hr@aisar.com

-- STEP 2: Then run this SQL to create their profiles

DO $$
DECLARE
    aisar_org_id UUID;
    admin_aisar_uid UUID;
    manager_aisar_uid UUID;
    hr_aisar_uid UUID;
BEGIN
    -- Get AISAR organization ID
    SELECT id INTO aisar_org_id FROM organizations WHERE subdomain = 'aisar';
    
    -- Verify organization exists
    IF aisar_org_id IS NULL THEN
        RAISE EXCEPTION 'AISAR organization not found! Run REPLACE_ALBAWANI_WITH_AISAR.sql first';
    END IF;
    
    -- Get user IDs from auth.users
    SELECT id INTO admin_aisar_uid FROM auth.users WHERE email = 'admin@aisar.com';
    SELECT id INTO manager_aisar_uid FROM auth.users WHERE email = 'manager@aisar.com';
    SELECT id INTO hr_aisar_uid FROM auth.users WHERE email = 'hr@aisar.com';
    
    -- Verify all users exist
    IF admin_aisar_uid IS NULL THEN
        RAISE EXCEPTION 'User admin@aisar.com not found! Create this user in Supabase Auth first';
    END IF;
    IF manager_aisar_uid IS NULL THEN
        RAISE EXCEPTION 'User manager@aisar.com not found! Create this user in Supabase Auth first';
    END IF;
    IF hr_aisar_uid IS NULL THEN
        RAISE EXCEPTION 'User hr@aisar.com not found! Create this user in Supabase Auth first';
    END IF;
    
    RAISE NOTICE 'All checks passed! Creating AISAR profiles...';
    RAISE NOTICE 'AISAR Org ID: %', aisar_org_id;
    
    -- Create AISAR profiles
    INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin)
    VALUES 
        (admin_aisar_uid, aisar_org_id, 'admin@aisar.com', 'AISAR Admin', 'admin', 'Administration', true, false),
        (manager_aisar_uid, aisar_org_id, 'manager@aisar.com', 'AISAR Manager', 'manager', 'Operations', true, false),
        (hr_aisar_uid, aisar_org_id, 'hr@aisar.com', 'AISAR HR', 'hr', 'Human Resources', true, false)
    ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        department = EXCLUDED.department;
    
    RAISE NOTICE '✅ SUCCESS! AISAR profiles created.';
END $$;

-- VERIFY: Show all AISAR profiles
SELECT 
    ap.email, 
    ap.full_name, 
    ap.role, 
    ap.department,
    o.name as organization,
    o.subdomain
FROM admin_profiles ap
JOIN organizations o ON ap.organization_id = o.id
WHERE o.subdomain = 'aisar'
ORDER BY ap.role;


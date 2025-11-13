-- =====================================================
-- CREATE ADMIN PROFILES - Using YOUR Actual Auth Users
-- Run this in Supabase SQL Editor (Production)
-- =====================================================

DO $$
DECLARE
    codesquare_org_id UUID;
    albawani_org_id UUID;
    admin_codesquare_uid UUID;
    investigator_codesquare_uid UUID;
    admin_albawani_uid UUID;
    manager_albawani_uid UUID;
    hr_albawani_uid UUID;
BEGIN
    -- Get organization IDs
    SELECT id INTO codesquare_org_id FROM organizations WHERE subdomain = 'codesquare';
    SELECT id INTO albawani_org_id FROM organizations WHERE subdomain = 'al-bawani';
    
    -- Verify organizations exist
    IF codesquare_org_id IS NULL THEN
        RAISE EXCEPTION 'CodeSquare organization not found! Run SETUP_TWO_ORGS_FINAL.sql first';
    END IF;
    IF albawani_org_id IS NULL THEN
        RAISE EXCEPTION 'Al-Bawani organization not found! Run SETUP_TWO_ORGS_FINAL.sql first';
    END IF;
    
    -- Get user IDs from auth.users (using YOUR actual user emails)
    SELECT id INTO admin_codesquare_uid FROM auth.users WHERE email = 'admin@codesquare.com';
    SELECT id INTO investigator_codesquare_uid FROM auth.users WHERE email = 'investigator@codesquare.com';
    SELECT id INTO admin_albawani_uid FROM auth.users WHERE email = 'admin@al-bawani.com';
    SELECT id INTO manager_albawani_uid FROM auth.users WHERE email = 'manager@al-bawani.com';
    SELECT id INTO hr_albawani_uid FROM auth.users WHERE email = 'hr@al-bawani.com';
    
    -- Verify all users exist
    IF admin_codesquare_uid IS NULL THEN
        RAISE EXCEPTION 'User admin@codesquare.com not found in auth.users!';
    END IF;
    IF investigator_codesquare_uid IS NULL THEN
        RAISE EXCEPTION 'User investigator@codesquare.com not found in auth.users!';
    END IF;
    IF admin_albawani_uid IS NULL THEN
        RAISE EXCEPTION 'User admin@al-bawani.com not found in auth.users!';
    END IF;
    IF manager_albawani_uid IS NULL THEN
        RAISE EXCEPTION 'User manager@al-bawani.com not found in auth.users!';
    END IF;
    IF hr_albawani_uid IS NULL THEN
        RAISE EXCEPTION 'User hr@al-bawani.com not found in auth.users!';
    END IF;
    
    RAISE NOTICE 'All checks passed! Creating profiles...';
    RAISE NOTICE 'CodeSquare Org ID: %', codesquare_org_id;
    RAISE NOTICE 'Al-Bawani Org ID: %', albawani_org_id;
    
    -- Create CodeSquare profiles
    INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin)
    VALUES 
        (admin_codesquare_uid, codesquare_org_id, 'admin@codesquare.com', 'John Smith', 'admin', 'IT', true, false),
        (investigator_codesquare_uid, codesquare_org_id, 'investigator@codesquare.com', 'Mike Wilson', 'investigator', 'Compliance', true, false)
    ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        department = EXCLUDED.department;
    
    RAISE NOTICE 'CodeSquare profiles created!';
    
    -- Create Al-Bawani profiles
    INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin)
    VALUES 
        (admin_albawani_uid, albawani_org_id, 'admin@al-bawani.com', 'Ahmed Al-Bawani', 'admin', 'Administration', true, false),
        (manager_albawani_uid, albawani_org_id, 'manager@al-bawani.com', 'Fatima Hassan', 'manager', 'Operations', true, false),
        (hr_albawani_uid, albawani_org_id, 'hr@al-bawani.com', 'Sara Ahmed', 'hr', 'Human Resources', true, false)
    ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        department = EXCLUDED.department;
    
    RAISE NOTICE 'Al-Bawani profiles created!';
    RAISE NOTICE '✅ SUCCESS! All profiles created.';
END $$;

-- VERIFY: Show all created profiles
SELECT 
    ap.email, 
    ap.full_name, 
    ap.role, 
    ap.department,
    o.name as organization,
    o.subdomain
FROM admin_profiles ap
JOIN organizations o ON ap.organization_id = o.id
WHERE ap.is_super_admin = false
ORDER BY o.name, ap.role;


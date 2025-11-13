-- =====================================================
-- ADD TEST USERS FOR CodeSquare & Al-Bawani
-- Run this AFTER creating the organizations
-- Run this in Supabase SQL Editor (Production)
-- =====================================================

-- IMPORTANT: These INSERT statements will create admin_profiles
-- You MUST create the corresponding auth users manually in Supabase Auth UI
-- OR use the Supabase dashboard to invite these users

-- Get organization IDs (we'll use them below)
DO $$
DECLARE
    codesquare_org_id UUID;
    albawani_org_id UUID;
BEGIN
    -- Get CodeSquare org ID
    SELECT id INTO codesquare_org_id FROM organizations WHERE subdomain = 'codesquare';
    
    -- Get Al-Bawani org ID
    SELECT id INTO albawani_org_id FROM organizations WHERE subdomain = 'al-bawani';
    
    -- Output for verification
    RAISE NOTICE 'CodeSquare Org ID: %', codesquare_org_id;
    RAISE NOTICE 'Al-Bawani Org ID: %', albawani_org_id;
    
    -- Insert CodeSquare Users (profiles only - auth users must be created separately)
    -- Admin user
    INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin, created_at, updated_at)
    VALUES (
        'a1111111-1111-1111-1111-111111111111',
        codesquare_org_id,
        'admin@codesquare.com',
        'John Smith',
        'admin',
        'IT',
        true,
        false,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Manager user
    INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin, created_at, updated_at)
    VALUES (
        'a2222222-2222-2222-2222-222222222222',
        codesquare_org_id,
        'manager@codesquare.com',
        'Sarah Johnson',
        'manager',
        'HR',
        true,
        false,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Insert Al-Bawani Users (profiles only - auth users must be created separately)
    -- Admin user
    INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin, created_at, updated_at)
    VALUES (
        'b1111111-1111-1111-1111-111111111111',
        albawani_org_id,
        'admin@al-bawani.com',
        'Ahmed Al-Bawani',
        'admin',
        'Administration',
        true,
        false,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Manager user
    INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin, created_at, updated_at)
    VALUES (
        'b2222222-2222-2222-2222-222222222222',
        albawani_org_id,
        'manager@al-bawani.com',
        'Fatima Hassan',
        'manager',
        'Compliance',
        true,
        false,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Investigator user
    INSERT INTO admin_profiles (id, organization_id, email, full_name, role, department, is_active, is_super_admin, created_at, updated_at)
    VALUES (
        'b3333333-3333-3333-3333-333333333333',
        albawani_org_id,
        'investigator@al-bawani.com',
        'Omar Abdullah',
        'investigator',
        'Internal Audit',
        true,
        false,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
END $$;

-- Verify profiles were created
SELECT ap.email, ap.full_name, ap.role, o.name as organization
FROM admin_profiles ap
JOIN organizations o ON ap.organization_id = o.id
WHERE ap.is_super_admin = false
ORDER BY o.name, ap.role;


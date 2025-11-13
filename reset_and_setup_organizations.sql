-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- RESET & SETUP: CodeSquare & Al-Bawani Organizations
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Run this in your PRODUCTION Supabase SQL Editor
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- =============================================================================
-- STEP 1: DELETE ALL EXISTING ORGANIZATIONS & RELATED DATA
-- =============================================================================

-- Delete all admin profiles (except super admin)
DELETE FROM admin_profiles WHERE is_super_admin = false;

-- Delete all auth users (except super admin)
DELETE FROM auth.users 
WHERE email != 'sup-adm@whistrust.com';

-- Delete all audit logs
DELETE FROM audit_logs;

-- Delete all reports
DELETE FROM reports;

-- Delete all organizations
DELETE FROM organizations;

-- =============================================================================
-- STEP 2: CREATE CODESQUARE ORGANIZATION
-- =============================================================================

INSERT INTO organizations (
    id,
    name,
    slug,
    subdomain,
    status,
    plan,
    primary_contact_email,
    primary_contact_name,
    billing_email,
    max_admin_users,
    max_reports_per_month,
    max_storage_mb,
    current_admin_users,
    current_reports_count,
    current_storage_mb,
    features,
    branding,
    trial_ends_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'CodeSquare',
    'codesquare',
    'codesquare',
    'active',
    'professional',
    'admin@codesquare.com',
    'CodeSquare Admin',
    'billing@codesquare.com',
    15,
    100,
    5120,
    0,
    0,
    0,
    '{
        "anonymous_reporting": true,
        "file_uploads": true,
        "custom_branding": true,
        "advanced_analytics": true,
        "api_access": false,
        "sso": false,
        "priority_support": true
    }'::jsonb,
    '{
        "logo_url": null,
        "primary_color": "#2563eb",
        "support_email": "support@codesquare.com",
        "support_phone": "+1 (555) 100-1000"
    }'::jsonb,
    NULL,
    NOW(),
    NOW()
) RETURNING id, name, slug, subdomain;

-- =============================================================================
-- STEP 3: CREATE AL-BAWANI ORGANIZATION
-- =============================================================================

INSERT INTO organizations (
    id,
    name,
    slug,
    subdomain,
    status,
    plan,
    primary_contact_email,
    primary_contact_name,
    billing_email,
    max_admin_users,
    max_reports_per_month,
    max_storage_mb,
    current_admin_users,
    current_reports_count,
    current_storage_mb,
    features,
    branding,
    trial_ends_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Al-Bawani',
    'al-bawani',
    'al-bawani',
    'active',
    'enterprise',
    'admin@al-bawani.com',
    'Al-Bawani Admin',
    'billing@al-bawani.com',
    50,
    500,
    20480,
    0,
    0,
    0,
    '{
        "anonymous_reporting": true,
        "file_uploads": true,
        "custom_branding": true,
        "advanced_analytics": true,
        "api_access": true,
        "sso": true,
        "priority_support": true
    }'::jsonb,
    '{
        "logo_url": null,
        "primary_color": "#059669",
        "support_email": "support@al-bawani.com",
        "support_phone": "+966 (11) 234-5678"
    }'::jsonb,
    NULL,
    NOW(),
    NOW()
) RETURNING id, name, slug, subdomain;

-- =============================================================================
-- STEP 4: GET ORGANIZATION IDs (YOU NEED THESE FOR NEXT STEPS!)
-- =============================================================================

-- Run this separately to get the IDs
SELECT 
    id,
    name,
    slug,
    subdomain,
    status,
    plan,
    primary_contact_email
FROM organizations
ORDER BY name;

-- ⚠️ COPY THE IDs FROM ABOVE BEFORE CONTINUING! ⚠️

-- =============================================================================
-- STEP 5: CREATE CODESQUARE ADMIN USER
-- =============================================================================

-- First, create the auth user
DO $$
DECLARE
    v_user_id uuid;
    v_org_id uuid;
BEGIN
    -- Get CodeSquare org ID
    SELECT id INTO v_org_id FROM organizations WHERE subdomain = 'codesquare';
    
    -- Create auth user
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@codesquare.com',
        crypt('CodeSquare@2024', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        false,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO v_user_id;
    
    -- Create admin profile
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
        v_user_id,
        v_org_id,
        'admin@codesquare.com',
        'CodeSquare Administrator',
        'admin',
        'Compliance & Ethics',
        true,
        false,
        NOW(),
        NOW()
    );
END $$;

-- =============================================================================
-- STEP 6: CREATE CODESQUARE INVESTIGATOR USER
-- =============================================================================

DO $$
DECLARE
    v_user_id uuid;
    v_org_id uuid;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE subdomain = 'codesquare';
    
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'investigator@codesquare.com',
        crypt('Investigator@2024', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        false,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO v_user_id;
    
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
        v_user_id,
        v_org_id,
        'investigator@codesquare.com',
        'Sarah Johnson',
        'investigator',
        'Investigation Team',
        true,
        false,
        NOW(),
        NOW()
    );
END $$;

-- =============================================================================
-- STEP 7: CREATE AL-BAWANI ADMIN USER
-- =============================================================================

DO $$
DECLARE
    v_user_id uuid;
    v_org_id uuid;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE subdomain = 'al-bawani';
    
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@al-bawani.com',
        crypt('AlBawani@2024', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        false,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO v_user_id;
    
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
        v_user_id,
        v_org_id,
        'admin@al-bawani.com',
        'Al-Bawani Administrator',
        'admin',
        'الامتثال والأخلاقيات',
        true,
        false,
        NOW(),
        NOW()
    );
END $$;

-- =============================================================================
-- STEP 8: CREATE AL-BAWANI MANAGER USER
-- =============================================================================

DO $$
DECLARE
    v_user_id uuid;
    v_org_id uuid;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE subdomain = 'al-bawani';
    
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'manager@al-bawani.com',
        crypt('Manager@2024', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        false,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO v_user_id;
    
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
        v_user_id,
        v_org_id,
        'manager@al-bawani.com',
        'Ahmed Al-Mahmoud',
        'manager',
        'Risk Management',
        true,
        false,
        NOW(),
        NOW()
    );
END $$;

-- =============================================================================
-- STEP 9: CREATE AL-BAWANI HR USER
-- =============================================================================

DO $$
DECLARE
    v_user_id uuid;
    v_org_id uuid;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE subdomain = 'al-bawani';
    
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'hr@al-bawani.com',
        crypt('HR@2024', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        false,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO v_user_id;
    
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
        v_user_id,
        v_org_id,
        'hr@al-bawani.com',
        'Fatima Al-Rashid',
        'hr',
        'Human Resources',
        true,
        false,
        NOW(),
        NOW()
    );
END $$;

-- =============================================================================
-- STEP 10: VERIFICATION - CHECK ALL DATA
-- =============================================================================

-- View organizations
SELECT 
    id,
    name,
    slug,
    subdomain,
    status,
    plan,
    primary_contact_email,
    max_admin_users,
    max_reports_per_month
FROM organizations
ORDER BY name;

-- View all users
SELECT 
    ap.id,
    ap.organization_id,
    o.name as organization_name,
    ap.email,
    ap.full_name,
    ap.role,
    ap.department,
    ap.is_active
FROM admin_profiles ap
JOIN organizations o ON ap.organization_id = o.id
WHERE ap.is_super_admin = false
ORDER BY o.name, ap.role;

-- =============================================================================
-- 🎉 SETUP COMPLETE!
-- =============================================================================

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        CREDENTIALS SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CODESQUARE ORGANIZATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subdomain:    codesquare
Portal URL:   http://localhost:3000/org/codesquare/login
              (Production: codesquare.whistrust.app)
Plan:         Professional

USERS:
------
1. Admin:
   Email:     admin@codesquare.com
   Password:  CodeSquare@2024
   Role:      admin
   Name:      CodeSquare Administrator

2. Investigator:
   Email:     investigator@codesquare.com
   Password:  Investigator@2024
   Role:      investigator
   Name:      Sarah Johnson


AL-BAWANI ORGANIZATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subdomain:    al-bawani
Portal URL:   http://localhost:3000/org/al-bawani/login
              (Production: al-bawani.whistrust.app)
Plan:         Enterprise

USERS:
------
1. Admin:
   Email:     admin@al-bawani.com
   Password:  AlBawani@2024
   Role:      admin
   Name:      Al-Bawani Administrator

2. Manager:
   Email:     manager@al-bawani.com
   Password:  Manager@2024
   Role:      manager
   Name:      Ahmed Al-Mahmoud

3. HR:
   Email:     hr@al-bawani.com
   Password:  HR@2024
   Role:      hr
   Name:      Fatima Al-Rashid


SUPER ADMIN (Unchanged):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal URL:   http://localhost:3000/superadmin/login
Email:        sup-adm@whistrust.com
Password:     sup-pass-adm!1@3#5


TESTING CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Super Admin → View both organizations
✅ CodeSquare Admin → Login & access all pages
✅ CodeSquare Investigator → Login (limited access)
✅ Al-Bawani Admin → Login & access all pages
✅ Al-Bawani Manager → Login (reports + analytics)
✅ Al-Bawani HR → Login (HR-specific access)
✅ Verify tenant isolation (CodeSquare can't see Al-Bawani data)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/


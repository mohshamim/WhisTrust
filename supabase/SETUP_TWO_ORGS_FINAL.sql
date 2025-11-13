-- =====================================================
-- SETUP TWO ORGANIZATIONS: CodeSquare & Al-Bawani
-- Run this in Supabase SQL Editor (Production)
-- =====================================================

-- Step 1: DELETE all existing organizations (cascade will delete users, reports, etc.)
DELETE FROM organizations WHERE TRUE;

-- Step 2: CREATE CodeSquare Organization
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
    '{"anonymous_reporting": true, "file_attachments": true, "real_time_notifications": true, "advanced_analytics": true, "custom_branding": false, "api_access": false, "sso": false}'::jsonb,
    '{"primary_color": "#2563eb", "logo_url": null}'::jsonb,
    NULL,
    NOW(),
    NOW()
);

-- Step 3: CREATE Al-Bawani Organization  
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
    10240,
    0,
    0,
    0,
    '{"anonymous_reporting": true, "file_attachments": true, "real_time_notifications": true, "advanced_analytics": true, "custom_branding": true, "api_access": true, "sso": true}'::jsonb,
    '{"primary_color": "#059669", "logo_url": null}'::jsonb,
    NULL,
    NOW(),
    NOW()
);

-- Step 4: Verify organizations were created
SELECT id, name, slug, subdomain, status, plan FROM organizations ORDER BY name;


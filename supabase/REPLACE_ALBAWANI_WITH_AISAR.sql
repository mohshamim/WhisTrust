-- =====================================================
-- DELETE Al-Bawani & CREATE AISAR Organization
-- Run this in Supabase SQL Editor (Production)
-- =====================================================

-- Step 1: DELETE Al-Bawani Organization
-- This will cascade delete all related admin_profiles, reports, audit_logs
DELETE FROM organizations WHERE subdomain = 'al-bawani';

-- Step 2: CREATE AISAR Organization
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
    'AISAR',
    'aisar',
    'aisar',
    'active',
    'enterprise',
    'admin@aisar.com',
    'AISAR Admin',
    'billing@aisar.com',
    50,
    500,
    10240,
    0,
    0,
    0,
    '{"anonymous_reporting": true, "file_attachments": true, "real_time_notifications": true, "advanced_analytics": true, "custom_branding": true, "api_access": true, "sso": true}'::jsonb,
    '{"primary_color": "#0891b2", "logo_url": null}'::jsonb,
    NULL,
    NOW(),
    NOW()
);

-- Step 3: Verify organizations
SELECT id, name, slug, subdomain, status, plan 
FROM organizations 
ORDER BY name;


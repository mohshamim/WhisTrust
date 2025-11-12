-- =====================================================
-- Sample Organizations Data
-- =====================================================
-- Run this in Production Supabase to add sample organizations
-- for testing and demonstration
-- =====================================================

-- Organization 1: Tech Startup (Essential Plan, Trial)
INSERT INTO organizations (
    name,
    slug,
    subdomain,
    primary_contact_email,
    primary_contact_name,
    billing_email,
    plan,
    status,
    trial_ends_at,
    max_admin_users,
    max_reports_per_month,
    max_storage_mb,
    internal_notes
) VALUES (
    'TechFlow Innovations',
    'techflow-innovations',
    'techflow',
    'sarah.johnson@techflow.io',
    'Sarah Johnson',
    'billing@techflow.io',
    'essential',
    'trial',
    NOW() + INTERVAL '14 days', -- Trial ends in 14 days
    5,
    50,
    1000,
    'Startup company, interested in upgrading to Professional after trial'
);

-- Organization 2: Large Corporation (Enterprise Plan, Active)
INSERT INTO organizations (
    name,
    slug,
    subdomain,
    primary_contact_email,
    primary_contact_name,
    billing_email,
    plan,
    status,
    subscription_starts_at,
    subscription_ends_at,
    max_admin_users,
    max_reports_per_month,
    max_storage_mb,
    features,
    branding,
    internal_notes
) VALUES (
    'GlobalCorp Industries',
    'globalcorp-industries',
    'globalcorp',
    'compliance@globalcorp.com',
    'Michael Chen',
    'accounts.payable@globalcorp.com',
    'enterprise',
    'active',
    NOW() - INTERVAL '3 months', -- Started 3 months ago
    NOW() + INTERVAL '9 months', -- Annual subscription
    100,
    1000,
    25000,
    '{
        "anonymous_reporting": true,
        "file_uploads": true,
        "custom_categories": true,
        "custom_branding": true,
        "advanced_analytics": true,
        "api_access": true,
        "sso": true,
        "audit_logs": true,
        "email_notifications": true,
        "custom_fields": true,
        "pdf_export": true
    }'::jsonb,
    '{
        "logo_url": null,
        "primary_color": "#1e40af",
        "secondary_color": "#3b82f6",
        "company_name": "GlobalCorp Industries",
        "support_email": "support@globalcorp.com",
        "support_phone": "+1-800-GLOBAL-1"
    }'::jsonb,
    'VIP client - Annual contract. Contact Michael for any issues. Very responsive.'
);

-- Organization 3: Mid-Size Company (Professional Plan, Active)
INSERT INTO organizations (
    name,
    slug,
    subdomain,
    primary_contact_email,
    primary_contact_name,
    billing_email,
    plan,
    status,
    subscription_starts_at,
    subscription_ends_at,
    max_admin_users,
    max_reports_per_month,
    max_storage_mb,
    features,
    custom_categories,
    internal_notes
) VALUES (
    'HealthTech Solutions',
    'healthtech-solutions',
    'healthtech',
    'compliance.officer@healthtech.com',
    'Dr. Aisha Rahman',
    'finance@healthtech.com',
    'professional',
    'active',
    NOW() - INTERVAL '45 days',
    NOW() + INTERVAL '10 months',
    15,
    200,
    5000,
    '{
        "anonymous_reporting": true,
        "file_uploads": true,
        "custom_categories": true,
        "custom_branding": false,
        "advanced_analytics": true,
        "api_access": false,
        "sso": false,
        "audit_logs": true,
        "email_notifications": true,
        "custom_fields": true,
        "pdf_export": true
    }'::jsonb,
    '["Patient Safety", "HIPAA Violation", "Billing Fraud", "Data Privacy", "Quality of Care"]'::jsonb,
    'Healthcare industry - very sensitive about compliance. Requires HIPAA-compliant handling.'
);

-- Organization 4: Retail Company (Professional Plan, Trial)
INSERT INTO organizations (
    name,
    slug,
    subdomain,
    primary_contact_email,
    primary_contact_name,
    plan,
    status,
    trial_ends_at,
    max_admin_users,
    max_reports_per_month,
    max_storage_mb,
    custom_categories,
    internal_notes
) VALUES (
    'RetailMax Group',
    'retailmax-group',
    'retailmax',
    'hr.director@retailmax.com',
    'James Peterson',
    'professional',
    'trial',
    NOW() + INTERVAL '7 days', -- 7 days trial remaining
    15,
    200,
    5000,
    '["Workplace Harassment", "Theft", "Safety Violation", "Discrimination", "Policy Breach", "Vendor Issues"]'::jsonb,
    'Retail chain - 50+ locations. Evaluating platform before rollout. Hot lead for Professional plan.'
);

-- Organization 5: Financial Services (Enterprise Plan, Suspended - for testing)
INSERT INTO organizations (
    name,
    slug,
    subdomain,
    primary_contact_email,
    primary_contact_name,
    billing_email,
    plan,
    status,
    subscription_starts_at,
    max_admin_users,
    max_reports_per_month,
    max_storage_mb,
    features,
    internal_notes
) VALUES (
    'FinanceFirst Corp',
    'financefirst-corp',
    'financefirst',
    'risk@financefirst.com',
    'Robert Williams',
    'billing@financefirst.com',
    'enterprise',
    'suspended',
    NOW() - INTERVAL '6 months',
    100,
    1000,
    25000,
    '{
        "anonymous_reporting": true,
        "file_uploads": true,
        "custom_categories": true,
        "custom_branding": true,
        "advanced_analytics": true,
        "api_access": true,
        "sso": true,
        "audit_logs": true,
        "email_notifications": true,
        "custom_fields": true,
        "pdf_export": true
    }'::jsonb,
    'SUSPENDED - Payment issue. Contact billing before reactivating.'
);

-- Verify organizations were created
SELECT 
    name,
    subdomain,
    plan,
    status,
    CONCAT(current_admin_users, '/', max_admin_users) as users,
    CONCAT(current_reports_count, '/', max_reports_per_month) as reports,
    created_at
FROM organizations
ORDER BY created_at DESC;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Sample organizations created successfully!';
    RAISE NOTICE '📦 5 organizations added:';
    RAISE NOTICE '   1. TechFlow Innovations (Essential, Trial)';
    RAISE NOTICE '   2. GlobalCorp Industries (Enterprise, Active) - VIP';
    RAISE NOTICE '   3. HealthTech Solutions (Professional, Active)';
    RAISE NOTICE '   4. RetailMax Group (Professional, Trial)';
    RAISE NOTICE '   5. FinanceFirst Corp (Enterprise, Suspended)';
    RAISE NOTICE '🎯 Total: 5 diverse sample organizations for testing';
    RAISE NOTICE '⏭️  Refresh your dashboard to see updated stats!';
END $$;


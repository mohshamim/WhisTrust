-- =====================================================
-- CREATE SIMPLE TEST REPORTS (Using Only Existing Columns)
-- Run this in Supabase SQL Editor
-- =====================================================

DO $$
DECLARE
    aisar_org_id UUID;
    codesquare_org_id UUID;
BEGIN
    -- Get organization IDs
    SELECT id INTO aisar_org_id FROM organizations WHERE subdomain = 'aisar';
    SELECT id INTO codesquare_org_id FROM organizations WHERE subdomain = 'codesquare';
    
    -- Verify organizations exist
    IF aisar_org_id IS NULL THEN
        RAISE EXCEPTION 'AISAR organization not found!';
    END IF;
    IF codesquare_org_id IS NULL THEN
        RAISE EXCEPTION 'CodeSquare organization not found!';
    END IF;
    
    -- Create 3 test reports for AISAR
    INSERT INTO reports (
        organization_id,
        case_number,
        tracking_code,
        category,
        title,
        description,
        reporter_email,
        status,
        priority,
        is_anonymous,
        created_at,
        updated_at
    ) VALUES
    (
        aisar_org_id,
        'AIS-000001',
        'A1B2C3D4-EFGH',
        'fraud',
        'Suspicious financial transactions in accounting department',
        'I have noticed irregular financial transactions being processed through the accounting system over the past 3 months. Large sums are being transferred to unknown accounts in the Finance Department - Head Office.',
        NULL,
        'submitted',
        'high',
        true,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        aisar_org_id,
        'AIS-000002',
        'X9Y8Z7W6-ABCD',
        'harassment',
        'Workplace harassment by senior manager',
        'Multiple instances of inappropriate behavior and verbal harassment by a senior manager towards junior staff in Operations Department. Witnesses include Sarah from HR and John from IT. Incident occurred on October 28, 2025.',
        'concerned.employee@aisar.com',
        'investigating',
        'critical',
        false,
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '1 day'
    ),
    (
        aisar_org_id,
        'AIS-000003',
        'M4N5P6Q7-WXYZ',
        'safety',
        'Safety equipment not being provided',
        'Safety equipment and protective gear are not being provided to workers in Warehouse Building B. This violates safety regulations. Incident date: November 10, 2025.',
        NULL,
        'submitted',
        'medium',
        true,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    );
    
    -- Create 2 test reports for CodeSquare
    INSERT INTO reports (
        organization_id,
        case_number,
        tracking_code,
        category,
        title,
        description,
        status,
        priority,
        is_anonymous,
        created_at,
        updated_at
    ) VALUES
    (
        codesquare_org_id,
        'COD-000001',
        'P1Q2R3S4-TUVW',
        'data_breach',
        'Potential data leak in customer database',
        'Customer personal information may have been exposed due to misconfigured database in IT Department. Incident occurred November 11, 2025. Urgent investigation required.',
        'investigating',
        'critical',
        true,
        NOW() - INTERVAL '1 day',
        NOW()
    ),
    (
        codesquare_org_id,
        'COD-000002',
        'K8L9M0N1-PQRS',
        'ethical',
        'Conflict of interest in vendor selection',
        'A procurement manager appears to be favoring a specific vendor in Procurement Department. Personal connections may be involved. Incident date: November 8, 2025. Investigation completed.',
        'resolved',
        'low',
        true,
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '1 hour'
    );
    
    RAISE NOTICE '✅ Created 5 test reports: 3 for AISAR, 2 for CodeSquare';
END $$;

-- VERIFY: Show all created reports
SELECT 
    r.case_number,
    r.tracking_code,
    r.category,
    r.title,
    r.status,
    r.priority,
    r.is_anonymous,
    o.name as organization
FROM reports r
JOIN organizations o ON r.organization_id = o.id
ORDER BY o.name, r.created_at DESC;


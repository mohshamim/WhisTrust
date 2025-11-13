-- =====================================================
-- CREATE TEST REPORTS FOR TESTING
-- Run this in Supabase SQL Editor (Production or Local)
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
        incident_date,
        location,
        witness_info,
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
        'I have noticed irregular financial transactions being processed through the accounting system. Large sums of money are being transferred to unknown accounts. This has been ongoing for the past 3 months.',
        '2025-11-01',
        'Finance Department - Head Office',
        NULL,
        NULL,
        'new',
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
        'There have been multiple instances of inappropriate behavior and verbal harassment by a senior manager towards junior staff members. Multiple employees have witnessed this behavior.',
        '2025-10-28',
        'Operations Department',
        'Sarah from HR, John from IT',
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
        'Safety equipment and protective gear are not being provided to workers in the warehouse. This violates safety regulations.',
        '2025-11-10',
        'Warehouse - Building B',
        NULL,
        NULL,
        'new',
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
        incident_date,
        location,
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
        'Customer personal information may have been exposed due to a misconfigured database. Urgent investigation required.',
        '2025-11-11',
        'IT Department',
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
        'A procurement manager appears to be favoring a specific vendor who may have personal connections. This needs to be investigated.',
        '2025-11-08',
        'Procurement Department',
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


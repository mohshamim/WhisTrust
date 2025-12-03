-- Check which organization owns the report with tracking code DEMO-20251202-0003
SELECT 
  r.case_number,
  r.tracking_code,
  r.title,
  r.status,
  r.organization_id,
  o.name as org_name,
  o.subdomain as org_subdomain
FROM reports r
LEFT JOIN organizations o ON r.organization_id = o.id
WHERE r.tracking_code = 'DEMO-20251202-0003';


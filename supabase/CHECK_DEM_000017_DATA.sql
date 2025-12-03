-- Check if DEM-000017 has reporter contact info
SELECT 
  case_number,
  tracking_code,
  title,
  is_anonymous,
  reporter_name,
  reporter_email,
  reporter_phone,
  created_at
FROM reports
WHERE case_number = 'DEM-000017'
  OR tracking_code = 'MMG37CL4-9JYS'
ORDER BY created_at DESC
LIMIT 1;


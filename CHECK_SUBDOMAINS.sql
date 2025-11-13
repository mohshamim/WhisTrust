-- Check what subdomains are actually in the database
SELECT 
    id,
    name,
    slug,
    subdomain,
    status,
    plan
FROM organizations
ORDER BY name;


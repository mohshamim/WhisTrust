-- Just check auth.users table
SELECT 
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email IN ('admin@demo.com', 'manager@demo.com', 'investigator@demo.com')
ORDER BY email;


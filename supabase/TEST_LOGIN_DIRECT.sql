-- =====================================================
-- TEST: Check Password Hash
-- =====================================================
-- This shows if password exists and when it was set
-- =====================================================

SELECT 
  'Admin User Password Check' as info,
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  LENGTH(encrypted_password) as password_length,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at,
  updated_at,
  last_sign_in_at,
  CASE 
    WHEN last_sign_in_at IS NOT NULL THEN 'User has logged in before'
    WHEN email_confirmed_at IS NULL THEN 'Email not confirmed'
    WHEN encrypted_password IS NULL THEN 'No password set'
    ELSE 'Ready to login (never logged in yet)'
  END as status
FROM auth.users
WHERE email = 'admin@demo.com';

-- Also check if there are any identity providers (social login)
SELECT 
  'Auth Identities' as info,
  id,
  user_id,
  provider,
  created_at,
  last_sign_in_at
FROM auth.identities
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@demo.com');


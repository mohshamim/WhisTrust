-- =====================================================
-- Reset Super Admin Password
-- =====================================================
-- Run this in Production Supabase to reset your password
-- =====================================================

-- Option 1: Update the existing super admin password
-- Replace 'YOUR-NEW-PASSWORD' with your desired password

UPDATE auth.users
SET encrypted_password = crypt('sup-pass-adm!1@3#5', gen_salt('bf'))
WHERE email = 'sup-adm@whistrust.com';

-- Verify it worked
SELECT 
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    created_at
FROM auth.users
WHERE email = 'sup-adm@whistrust.com';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Password updated successfully!';
    RAISE NOTICE '📧 Email: sup-adm@whistrust.com';
    RAISE NOTICE '🔑 Password: sup-pass-adm!1@3#5';
    RAISE NOTICE '⏭️  Try logging in again!';
END $$;


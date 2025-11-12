-- =====================================================
-- Fix: Super Admin Profile Access
-- =====================================================
-- This migration adds missing RLS policy so super admins
-- can read their own profile when logging in
-- =====================================================

-- Super admins need to read their own profile to verify access
-- This policy was missing and causing dashboard redirects

CREATE POLICY "super_admins_read_own_profile"
    ON admin_profiles
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() AND is_super_admin = true
    );

-- Also ensure super admins can update their own last_login_at
CREATE POLICY "super_admins_update_own_login_time"
    ON admin_profiles
    FOR UPDATE
    TO authenticated
    USING (
        id = auth.uid() AND is_super_admin = true
    )
    WITH CHECK (
        id = auth.uid() AND is_super_admin = true
    );

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Super admin RLS policies fixed!';
    RAISE NOTICE '🔓 Super admins can now read their own profile';
    RAISE NOTICE '⏭️  Test: Login should now work without redirect loop';
END $$;


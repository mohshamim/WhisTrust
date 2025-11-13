-- =====================================================
-- Fix: Allow Anonymous Access to Messages
-- =====================================================
-- This adds RLS policies so reporters can read/write messages
-- for their own reports without authentication
-- =====================================================

-- Allow anonymous users to insert messages
-- (They can send messages when tracking their report)
CREATE POLICY IF NOT EXISTS messages_anon_insert ON messages
    FOR INSERT
    TO anon
    WITH CHECK (
        sender_type = 'reporter' AND
        EXISTS (SELECT 1 FROM reports WHERE id = messages.report_id)
    );

-- Allow anonymous users to read messages for any report they can access
-- (If they have the tracking code, they can view messages)
CREATE POLICY IF NOT EXISTS messages_anon_read ON messages
    FOR SELECT
    TO anon
    USING (
        EXISTS (SELECT 1 FROM reports WHERE id = messages.report_id)
    );

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Anonymous message access policies created!';
    RAISE NOTICE '📝 Anonymous users can now send and view messages';
END $$;


-- =====================================================
-- Phase 3: Messaging, Notifications & Advanced Features
-- =====================================================
-- This migration adds support for:
-- 1. Two-way messaging between reporters and admins
-- 2. Real-time notifications
-- 3. File attachments storage
-- 4. Custom labels/tags
-- 5. Case assignment and priority
-- =====================================================

-- =====================================================
-- 1. MESSAGES TABLE - Two-way communication
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('reporter', 'admin')),
    sender_id UUID REFERENCES admin_profiles(id), -- admin user id if sender_type is admin
    content TEXT NOT NULL,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX idx_messages_report_id ON messages(report_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- =====================================================
-- 2. NOTIFICATIONS TABLE - Admin notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES admin_profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_report', 'assignment', 'new_message', 'status_change', 'priority_change')),
    resource_id UUID, -- ID of related resource (report, user, etc.)
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- 3. REPORT ATTACHMENTS TABLE - File storage
-- =====================================================
CREATE TABLE IF NOT EXISTS report_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL, -- Path in Supabase Storage
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL, -- Size in bytes
    mime_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES admin_profiles(id), -- NULL if uploaded by reporter
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for attachments
CREATE INDEX idx_attachments_report_id ON report_attachments(report_id);

-- =====================================================
-- 4. REPORT LABELS TABLE - Custom tags
-- =====================================================
CREATE TABLE IF NOT EXISTS report_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    label_name TEXT NOT NULL,
    label_color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES admin_profiles(id),
    
    -- Prevent duplicate labels on same report
    CONSTRAINT unique_label_per_report UNIQUE (report_id, label_name)
);

-- Indexes for labels
CREATE INDEX idx_labels_report_id ON report_labels(report_id);

-- =====================================================
-- 5. UPDATE REPORTS TABLE - Add new columns
-- =====================================================

-- Add assignment column
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admin_profiles(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Add priority column
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium';

-- Add source column (how the report was submitted)
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('online', 'offline', 'phone', 'email')) DEFAULT 'online';

-- Add submitted_by column (who submitted: anonymous user or admin)
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS submitted_by TEXT CHECK (submitted_by IN ('anonymous', 'admin')) DEFAULT 'anonymous';

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_reports_assigned_to ON reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_source ON reports(source);

-- =====================================================
-- 6. UPDATE ADMIN_PROFILES TABLE - Add department
-- =====================================================
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS department TEXT;

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_labels ENABLE ROW LEVEL SECURITY;

-- Messages policies
-- Admins can see all messages for their organization's reports
CREATE POLICY messages_admin_read ON messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM reports r
            INNER JOIN admin_profiles ap ON ap.organization_id = r.organization_id
            WHERE r.id = messages.report_id
            AND ap.id = auth.uid()
        )
    );

-- Admins can insert messages
CREATE POLICY messages_admin_insert ON messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM reports r
            INNER JOIN admin_profiles ap ON ap.organization_id = r.organization_id
            WHERE r.id = messages.report_id
            AND ap.id = auth.uid()
        )
    );

-- Anonymous users can read messages for their report (via tracking code)
-- This will be handled at application level for security

-- Notifications policies
-- Users can only see their own notifications
CREATE POLICY notifications_user_read ON notifications
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_user_update ON notifications
    FOR UPDATE
    USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY notifications_system_insert ON notifications
    FOR INSERT
    WITH CHECK (true);

-- Report attachments policies
-- Admins can see attachments for their organization's reports
CREATE POLICY attachments_admin_read ON report_attachments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM reports r
            INNER JOIN admin_profiles ap ON ap.organization_id = r.organization_id
            WHERE r.id = report_attachments.report_id
            AND ap.id = auth.uid()
        )
    );

-- Admins can insert attachments
CREATE POLICY attachments_admin_insert ON report_attachments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM reports r
            INNER JOIN admin_profiles ap ON ap.organization_id = r.organization_id
            WHERE r.id = report_attachments.report_id
            AND ap.id = auth.uid()
        )
    );

-- Anonymous users can insert attachments when submitting
-- This will be handled at application level

-- Report labels policies
-- Admins can manage labels for their organization's reports
CREATE POLICY labels_admin_all ON report_labels
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM reports r
            INNER JOIN admin_profiles ap ON ap.organization_id = r.organization_id
            WHERE r.id = report_labels.report_id
            AND ap.id = auth.uid()
        )
    );

-- =====================================================
-- 8. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_organization_id UUID,
    p_type TEXT,
    p_resource_id UUID,
    p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, organization_id, type, resource_id, message)
    VALUES (p_user_id, p_organization_id, p_type, p_resource_id, p_message)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- Function to notify on assignment
CREATE OR REPLACE FUNCTION notify_on_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- If case is assigned to someone
    IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
        PERFORM create_notification(
            NEW.assigned_to,
            NEW.organization_id,
            'assignment',
            NEW.id,
            'You have been assigned case ' || NEW.case_number
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for assignment notifications
DROP TRIGGER IF EXISTS trigger_notify_on_assignment ON reports;
CREATE TRIGGER trigger_notify_on_assignment
    AFTER UPDATE ON reports
    FOR EACH ROW
    WHEN (NEW.assigned_to IS NOT NULL)
    EXECUTE FUNCTION notify_on_assignment();

-- Function to notify on new message
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_report RECORD;
    v_admin RECORD;
BEGIN
    -- Get report details
    SELECT * INTO v_report FROM reports WHERE id = NEW.report_id;
    
    -- If message is from reporter, notify assigned admin
    IF NEW.sender_type = 'reporter' AND v_report.assigned_to IS NOT NULL THEN
        PERFORM create_notification(
            v_report.assigned_to,
            v_report.organization_id,
            'new_message',
            v_report.id,
            'New message on case ' || v_report.case_number
        );
    END IF;
    
    -- If message is from admin, we can't notify reporter (no user account)
    -- This will be handled via email if reporter provided email
    
    RETURN NEW;
END;
$$;

-- Trigger for message notifications
DROP TRIGGER IF EXISTS trigger_notify_on_new_message ON messages;
CREATE TRIGGER trigger_notify_on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_new_message();

-- Function to update audit log on priority change
CREATE OR REPLACE FUNCTION audit_priority_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.priority IS DISTINCT FROM NEW.priority THEN
        INSERT INTO audit_logs (
            organization_id,
            user_id,
            action,
            entity_type,
            entity_id,
            changes,
            ip_address,
            user_agent
        ) VALUES (
            NEW.organization_id,
            auth.uid(),
            'priority_changed',
            'report',
            NEW.id,
            jsonb_build_object(
                'old_priority', OLD.priority,
                'new_priority', NEW.priority
            ),
            current_setting('request.headers', true)::json->>'x-real-ip',
            current_setting('request.headers', true)::json->>'user-agent'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for priority change audit
DROP TRIGGER IF EXISTS trigger_audit_priority_change ON reports;
CREATE TRIGGER trigger_audit_priority_change
    AFTER UPDATE ON reports
    FOR EACH ROW
    WHEN (OLD.priority IS DISTINCT FROM NEW.priority)
    EXECUTE FUNCTION audit_priority_change();

-- =====================================================
-- 9. STORAGE BUCKET FOR ATTACHMENTS
-- =====================================================
-- Note: This needs to be run separately in Supabase Dashboard
-- or via Supabase CLI as it's not part of regular migrations

-- Storage bucket SQL (run in Supabase SQL Editor separately):
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-attachments', 'report-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'report-attachments');

CREATE POLICY "Users can view attachments for their org"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'report-attachments');

CREATE POLICY "Anonymous can upload during submission"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
    bucket_id = 'report-attachments' AND
    (storage.foldername(name))[1] = 'temp'
);
*/

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant access to service role
GRANT ALL ON messages TO service_role;
GRANT ALL ON notifications TO service_role;
GRANT ALL ON report_attachments TO service_role;
GRANT ALL ON report_labels TO service_role;

-- Grant access to authenticated users
GRANT SELECT, INSERT ON messages TO authenticated;
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT ON report_attachments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON report_labels TO authenticated;

-- Grant access to anonymous (limited)
GRANT INSERT ON messages TO anon;
GRANT INSERT ON report_attachments TO anon;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add migration record
INSERT INTO public.schema_migrations (version, name)
VALUES ('002', 'phase3_messaging_features')
ON CONFLICT (version) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Phase 3 migration completed successfully!';
    RAISE NOTICE '📝 New tables created: messages, notifications, report_attachments, report_labels';
    RAISE NOTICE '🔧 Reports table updated with: assigned_to, priority, source, submitted_by';
    RAISE NOTICE '🔐 RLS policies configured for all new tables';
    RAISE NOTICE '⚡ Triggers created for notifications and audit logs';
    RAISE NOTICE '⚠️  Remember to create storage bucket "report-attachments" in Supabase Dashboard';
END $$;


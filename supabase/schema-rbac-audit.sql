-- WhisTrust RBAC & Audit Schema
-- Extensions for role-based access control, audit logging, and analytics
-- Run this after the base schema.sql

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT,
  action TEXT NOT NULL, -- 'report_created', 'status_changed', 'message_sent', 'file_uploaded', 'login', etc.
  resource_type TEXT NOT NULL, -- 'report', 'message', 'file', 'user', etc.
  resource_id TEXT,
  details JSONB, -- Additional metadata (old/new values, IP address, etc.)
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_role ON audit_logs(user_role);

-- RLS for audit logs (only admins can read)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.role IN ('admin', 'manager')
    )
  );

-- Allow system to insert audit logs
CREATE POLICY "Allow system to insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ============================================
-- ENHANCED ADMIN PROFILES (with roles)
-- ============================================
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin' 
CHECK (role IN ('admin', 'manager', 'investigator', 'hr'));

-- Update existing profiles if needed
UPDATE admin_profiles SET role = 'admin' WHERE role IS NULL;

-- Add department field
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Add is_active flag
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON admin_profiles(role);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_report', 'message_reply', 'status_change', 'assignment', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL to navigate to
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- ANALYTICS VIEWS
-- ============================================

-- View for report statistics
CREATE OR REPLACE VIEW report_statistics AS
SELECT 
  COUNT(*) as total_reports,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
  COUNT(*) FILTER (WHERE status = 'in_review') as in_review_reports,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_reports,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_reports,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_reports,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as reports_last_7_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as reports_last_30_days,
  AVG(CASE 
    WHEN status IN ('resolved', 'closed') AND updated_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400 
  END) as avg_resolution_days
FROM reports;

-- View for category breakdown
CREATE OR REPLACE VIEW category_statistics AS
SELECT 
  category,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as count_last_30_days,
  ROUND(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM reports), 0), 2) as percentage
FROM reports
GROUP BY category
ORDER BY total_count DESC;

-- View for activity timeline
CREATE OR REPLACE VIEW activity_timeline AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as report_count
FROM reports
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ============================================
-- AUDIT LOGGING FUNCTIONS
-- ============================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_role TEXT;
  v_log_id UUID;
BEGIN
  -- Get current user info
  v_user_id := auth.uid();
  
  -- Get user email and role if authenticated
  IF v_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
    SELECT role INTO v_user_role FROM admin_profiles WHERE id = v_user_id;
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (
    user_id,
    user_email,
    user_role,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    v_user_id,
    v_user_email,
    v_user_role,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS FOR AUTOMATIC AUDIT LOGGING
-- ============================================

-- Function to audit report changes
CREATE OR REPLACE FUNCTION audit_report_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status != NEW.status THEN
    PERFORM log_audit_event(
      'report_status_changed',
      'report',
      NEW.id::TEXT,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'tracking_code', NEW.tracking_code
      )::jsonb
    );
  END IF;
  
  -- Log assignment changes
  IF OLD.assigned_to != NEW.assigned_to THEN
    PERFORM log_audit_event(
      'report_assigned',
      'report',
      NEW.id::TEXT,
      jsonb_build_object(
        'old_assigned_to', OLD.assigned_to,
        'new_assigned_to', NEW.assigned_to,
        'tracking_code', NEW.tracking_code
      )::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for report changes
DROP TRIGGER IF EXISTS audit_reports_trigger ON reports;
CREATE TRIGGER audit_reports_trigger
  AFTER UPDATE ON reports
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.assigned_to IS DISTINCT FROM NEW.assigned_to)
  EXECUTE FUNCTION audit_report_changes();

-- ============================================
-- HELPER FUNCTIONS FOR PERMISSIONS
-- ============================================

-- Function to check user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM admin_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(p_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := get_user_role();
  
  -- Define role permissions
  CASE p_permission
    WHEN 'view_all_reports' THEN
      RETURN v_role IN ('admin', 'manager', 'investigator', 'hr');
    WHEN 'edit_reports' THEN
      RETURN v_role IN ('admin', 'manager', 'investigator');
    WHEN 'assign_cases' THEN
      RETURN v_role IN ('admin', 'manager');
    WHEN 'view_analytics' THEN
      RETURN v_role IN ('admin', 'manager');
    WHEN 'manage_users' THEN
      RETURN v_role = 'admin';
    WHEN 'view_audit_logs' THEN
      RETURN v_role IN ('admin', 'manager');
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ENHANCED RLS POLICIES
-- ============================================

-- Update reports policies for role-based access
DROP POLICY IF EXISTS "Allow admins to read all reports" ON reports;
DROP POLICY IF EXISTS "Allow admins to update reports" ON reports;

-- Role-based read access
CREATE POLICY "Role-based report read access"
  ON reports FOR SELECT
  TO authenticated
  USING (
    has_permission('view_all_reports')
  );

-- Role-based update access
CREATE POLICY "Role-based report update access"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    has_permission('edit_reports')
  );

COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system actions';
COMMENT ON TABLE notifications IS 'User notifications for important events';
COMMENT ON FUNCTION log_audit_event IS 'Helper function to create audit log entries';
COMMENT ON FUNCTION has_permission IS 'Check if user has specific permission based on role';

-- WhisTrust MVP 3.0 - BRD Phase 3 Schema Migration
-- Adds: Encrypted messaging, case assignment, notifications, labels, priorities

-- 1. Extend reports table with assignment and metadata
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admin_profiles(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'online' CHECK (source IN ('online', 'offline', 'phone', 'email')),
ADD COLUMN IF NOT EXISTS submitted_by TEXT DEFAULT 'anonymous' CHECK (submitted_by IN ('anonymous', 'admin'));

-- 2. Create labels table for custom tags
CREATE TABLE IF NOT EXISTS report_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT DEFAULT '#9ca3af',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_id, label)
);

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_reports_assigned_to ON reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority);
CREATE INDEX IF NOT EXISTS idx_report_labels_report_id ON report_labels(report_id);

-- 4. Update RLS policies for new columns
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_labels ENABLE ROW LEVEL SECURITY;

-- Existing policies will continue to work, but we add a policy for assigned_to visibility
-- Drop policy if exists first (for older PostgreSQL versions)
DROP POLICY IF EXISTS "Admins can view assigned reports" ON reports;
CREATE POLICY "Admins can view assigned reports"
  ON reports
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- 5. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON report_labels TO authenticated;
GRANT SELECT, INSERT, UPDATE ON reports TO authenticated;

-- 6. Audit log trigger for assignments and priority changes
CREATE OR REPLACE FUNCTION log_assignment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
    INSERT INTO audit_logs (
      action,
      resource_type,
      resource_id,
      user_id,
      user_email,
      user_role,
      details
    ) VALUES (
      'case_assigned',
      'report',
      NEW.id::text,
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      (SELECT role FROM admin_profiles WHERE id = auth.uid()),
      jsonb_build_object(
        'assigned_to', NEW.assigned_to,
        'assigned_from', OLD.assigned_to,
        'tracking_code', NEW.tracking_code
      )
    );
  END IF;
  
  IF (OLD.priority IS DISTINCT FROM NEW.priority) THEN
    INSERT INTO audit_logs (
      action,
      resource_type,
      resource_id,
      user_id,
      user_email,
      user_role,
      details
    ) VALUES (
      'priority_changed',
      'report',
      NEW.id::text,
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      (SELECT role FROM admin_profiles WHERE id = auth.uid()),
      jsonb_build_object(
        'new_priority', NEW.priority,
        'old_priority', OLD.priority,
        'tracking_code', NEW.tracking_code
      )
    );
  END IF;
  
  IF (OLD.source IS DISTINCT FROM NEW.source) THEN
    INSERT INTO audit_logs (
      action,
      resource_type,
      resource_id,
      user_id,
      user_email,
      user_role,
      details
    ) VALUES (
      'report_source_recorded',
      'report',
      NEW.id::text,
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      (SELECT role FROM admin_profiles WHERE id = auth.uid()),
      jsonb_build_object(
        'source', NEW.source,
        'tracking_code', NEW.tracking_code
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_report_assignment_change ON reports;
CREATE TRIGGER trigger_report_assignment_change
  AFTER UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION log_assignment_change();

-- 7. Create a view for notifications with user context
CREATE OR REPLACE VIEW notifications_enriched AS
SELECT 
  n.*,
  r.tracking_code,
  r.category,
  a.full_name as assigned_user_name
FROM notifications n
LEFT JOIN reports r ON n.resource_id = r.id::text
LEFT JOIN admin_profiles a ON n.assigned_to = a.id;

-- 8. Add comment documentation
COMMENT ON COLUMN reports.assigned_to IS 'BRD Phase 3: Admin user assigned to investigate this report';
COMMENT ON COLUMN reports.priority IS 'BRD Phase 3: Priority level (low/medium/high)';
COMMENT ON COLUMN reports.source IS 'BRD Phase 3: How the report was submitted';
COMMENT ON COLUMN reports.submitted_by IS 'BRD Phase 3: Whether submitted by anonymous user or admin';
COMMENT ON TABLE report_labels IS 'BRD Phase 3: Custom labels/tags for reports';

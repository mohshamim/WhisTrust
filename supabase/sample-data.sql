-- WhisTrust Sample Data for Testing
-- Purpose: Insert test data to verify all functionality
-- Run this AFTER all schema migrations are complete

-- ============================================
-- STEP 1: Insert Sample Reports
-- ============================================

-- High Priority - Online Report
INSERT INTO reports (tracking_code, category, description, status, priority, source, submitted_by)
VALUES 
(
  'WR-2024-001',
  'Workplace Harassment',
  'I have been experiencing consistent harassment from my supervisor. This includes inappropriate comments about my personal life, unwelcome physical contact during meetings, and being excluded from important team communications. The situation has been ongoing for 3 months and has significantly impacted my work performance and mental health.',
  'pending',
  'high',
  'online',
  'anonymous'
);

-- Medium Priority - Offline Report
INSERT INTO reports (tracking_code, category, description, status, priority, source, submitted_by)
VALUES 
(
  'WR-2024-002',
  'Financial Fraud',
  'I discovered discrepancies in our department budget allocations. There are unauthorized transactions totaling approximately $50,000 over the past 6 months. The funds appear to be routed to a personal account. I have documented evidence including bank statements and transaction logs.',
  'in_review',
  'medium',
  'offline',
  'anonymous'
);

-- Low Priority - Phone Report
INSERT INTO reports (tracking_code, category, description, status, priority, source, submitted_by)
VALUES 
(
  'WR-2024-003',
  'Policy Violation',
  'Multiple employees in my department are consistently violating the remote work policy by logging in from unapproved locations. This raises security concerns and compliance issues with our data protection agreements.',
  'pending',
  'low',
  'phone',
  'anonymous'
);

-- High Priority - Email Report
INSERT INTO reports (tracking_code, category, description, status, priority, source, submitted_by, reporter_name, reporter_email)
VALUES 
(
  'WR-2024-004',
  'Safety Concern',
  'There is a significant safety hazard in the warehouse area. The emergency exit routes are blocked by equipment and storage boxes, and fire extinguishers are past their expiration date. This poses a serious risk to employee safety in case of an emergency.',
  'in_progress',
  'high',
  'email',
  'anonymous',
  'Jane Doe',
  'jane.doe@example.com'
);

-- Medium Priority - Online Report
INSERT INTO reports (tracking_code, category, description, status, priority, source, submitted_by)
VALUES 
(
  'WR-2024-005',
  'Data Breach',
  'I believe our customer database may have been compromised. I noticed unusual login patterns and data export activities from several admin accounts outside of business hours. Customer contact information and transaction history may be at risk.',
  'pending',
  'medium',
  'online',
  'anonymous'
);

-- ============================================
-- STEP 2: Insert Sample Messages (with encryption test)
-- ============================================

-- Messages for WR-2024-001
INSERT INTO messages (report_id, sender_type, content)
VALUES 
(
  (SELECT id FROM reports WHERE tracking_code = 'WR-2024-001'),
  'reporter',
  'Hello, I submitted this report and would like to provide additional context if needed.'
),
(
  (SELECT id FROM reports WHERE tracking_code = 'WR-2024-001'),
  'admin',
  'Thank you for your report. Our team is reviewing the details and will follow up with you shortly. Your identity remains confidential.'
);

-- Messages for WR-2024-002
INSERT INTO messages (report_id, sender_type, content)
VALUES 
(
  (SELECT id FROM reports WHERE tracking_code = 'WR-2024-002'),
  'reporter',
  'I am available to provide the supporting documentation mentioned in my report.'
),
(
  (SELECT id FROM reports WHERE tracking_code = 'WR-2024-002'),
  'admin',
  'We have received your report and documentation. Our investigation team is reviewing the evidence. We will keep you updated on the progress.'
);

-- Messages for WR-2024-004
INSERT INTO messages (report_id, sender_type, content)
VALUES 
(
  (SELECT id FROM reports WHERE tracking_code = 'WR-2024-004'),
  'reporter',
  'Has there been any progress on addressing the safety concerns?'
),
(
  (SELECT id FROM reports WHERE tracking_code = 'WR-2024-004'),
  'admin',
  'Yes, we have initiated an immediate safety audit and are working with facilities management to address the issues. Emergency exits are now clear and all fire extinguishers have been replaced.'
);

-- ============================================
-- STEP 3: Insert Sample Report Labels
-- ============================================

-- Labels for WR-2024-001
INSERT INTO report_labels (report_id, label, color)
SELECT id, 'Sensitive', '#ef4444' FROM reports WHERE tracking_code = 'WR-2024-001';

INSERT INTO report_labels (report_id, label, color)
SELECT id, 'HR Concern', '#f59e0b' FROM reports WHERE tracking_code = 'WR-2024-001';

-- Labels for WR-2024-002
INSERT INTO report_labels (report_id, label, color)
SELECT id, 'Finance', '#3b82f6' FROM reports WHERE tracking_code = 'WR-2024-002';

INSERT INTO report_labels (report_id, label, color)
SELECT id, 'Legal Review', '#8b5cf6' FROM reports WHERE tracking_code = 'WR-2024-002';

-- Labels for WR-2024-004
INSERT INTO report_labels (report_id, label, color)
SELECT id, 'Safety', '#ef4444' FROM reports WHERE tracking_code = 'WR-2024-004';

INSERT INTO report_labels (report_id, label, color)
SELECT id, 'Priority Action', '#f59e0b' FROM reports WHERE tracking_code = 'WR-2024-004';

-- Labels for WR-2024-005
INSERT INTO report_labels (report_id, label, color)
SELECT id, 'IT Security', '#10b981' FROM reports WHERE tracking_code = 'WR-2024-005';

INSERT INTO report_labels (report_id, label, color)
SELECT id, 'Data Privacy', '#3b82f6' FROM reports WHERE tracking_code = 'WR-2024-005';

-- ============================================
-- STEP 4: Insert Sample Attachments (metadata will be in file storage)
-- ============================================

-- Sample attachments (these reference files that would be uploaded via the UI)
INSERT INTO report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT id, 'evidence_document.pdf', 'reports/' || id::text || '/attachments/evidence_document.pdf', 245678, 'application/pdf'
FROM reports WHERE tracking_code = 'WR-2024-002';

INSERT INTO report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT id, 'safety_photos.jpg', 'reports/' || id::text || '/attachments/safety_photos.jpg', 1024567, 'image/jpeg'
FROM reports WHERE tracking_code = 'WR-2024-004';

-- ============================================
-- STEP 5: Create Sample Admin Users (First get your admin UUID from auth.users)
-- ============================================

-- Note: Replace 'YOUR_ADMIN_UUID' with actual UUID from your Supabase auth.users table
-- To get your UUID: SELECT id, email FROM auth.users WHERE email = 'admin@whistrust.com';

-- Sample admin profiles (uncomment and update UUIDs after creating actual auth users)
/*
INSERT INTO admin_profiles (id, full_name, role, department, is_active)
VALUES 
(
  'YOUR_ADMIN_UUID_1',
  'Admin User',
  'admin',
  'Compliance',
  true
),
(
  'YOUR_ADMIN_UUID_2',
  'Manager User',
  'manager',
  'Investigations',
  true
),
(
  'YOUR_ADMIN_UUID_3',
  'Investigator User',
  'investigator',
  'Security',
  true
),
(
  'YOUR_ADMIN_UUID_4',
  'HR User',
  'hr',
  'Human Resources',
  true
);
*/

-- ============================================
-- STEP 6: Assign Some Reports to Admins (if admin UUIDs are available)
-- ============================================

-- Uncomment when admin UUIDs are available
/*
-- Assign high priority report to investigator
UPDATE reports 
SET assigned_to = 'INVESTIGATOR_UUID', assigned_at = NOW()
WHERE tracking_code = 'WR-2024-001';

-- Assign financial report to manager
UPDATE reports 
SET assigned_to = 'MANAGER_UUID', assigned_at = NOW()
WHERE tracking_code = 'WR-2024-002';

-- Assign safety report to HR
UPDATE reports 
SET assigned_to = 'HR_UUID', assigned_at = NOW()
WHERE tracking_code = 'WR-2024-004';
*/

-- ============================================
-- STEP 7: Create Sample Notifications
-- ============================================

-- Uncomment when admin user_id is available
/*
-- Notification for new high-priority report
INSERT INTO notifications (user_id, type, title, message, link, read, resource_id)
VALUES 
(
  'ADMIN_UUID',
  'new_report',
  'New High Priority Report',
  'A new high priority report has been submitted: Workplace Harassment',
  '/admin/cases',
  false,
  (SELECT id::text FROM reports WHERE tracking_code = 'WR-2024-001')
),
(
  'MANAGER_UUID',
  'new_report',
  'New Financial Fraud Report',
  'Financial discrepancies report requires attention',
  '/admin/cases',
  false,
  (SELECT id::text FROM reports WHERE tracking_code = 'WR-2024-002')
);

-- Notification for message reply
INSERT INTO notifications (user_id, type, title, message, link, read, resource_id)
VALUES 
(
  'REPORTER_USER_ID',
  'message_reply',
  'Response to Your Report',
  'Admin has responded to your report WR-2024-002',
  '/track?code=WR-2024-002',
  false,
  (SELECT id::text FROM reports WHERE tracking_code = 'WR-2024-002')
);
*/

-- ============================================
-- STEP 8: Create Sample Audit Logs (these should be created automatically by triggers)
-- ============================================

-- Sample manual audit log for testing
INSERT INTO audit_logs (user_id, user_email, user_role, action, resource_type, resource_id, details)
VALUES 
(
  NULL,
  'system',
  NULL,
  'report_created',
  'report',
  (SELECT id::text FROM reports WHERE tracking_code = 'WR-2024-001'),
  '{"tracking_code": "WR-2024-001", "category": "Workplace Harassment", "priority": "high"}'::jsonb
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all reports
SELECT 
  tracking_code,
  category,
  status,
  priority,
  source,
  submitted_by,
  created_at
FROM reports
ORDER BY created_at DESC;

-- Check all messages (content will be encrypted)
SELECT 
  r.tracking_code,
  m.sender_type,
  m.content,
  m.created_at
FROM messages m
JOIN reports r ON m.report_id = r.id
ORDER BY m.created_at DESC;

-- Check all labels
SELECT 
  r.tracking_code,
  rl.label,
  rl.color
FROM report_labels rl
JOIN reports r ON rl.report_id = r.id
ORDER BY r.tracking_code, rl.created_at;

-- Check all attachments
SELECT 
  r.tracking_code,
  ra.file_name,
  ra.file_size,
  ra.mime_type
FROM report_attachments ra
JOIN reports r ON ra.report_id = r.id
ORDER BY ra.created_at DESC;

-- Check notifications
SELECT 
  n.type,
  n.title,
  n.message,
  n.read,
  n.created_at
FROM notifications n
ORDER BY n.created_at DESC
LIMIT 10;

-- Check audit logs
SELECT 
  action,
  resource_type,
  resource_id,
  user_email,
  created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- SUMMARY
-- ============================================

SELECT 'Sample data inserted successfully!' as status;
SELECT COUNT(*) as total_reports FROM reports;
SELECT COUNT(*) as total_messages FROM messages;
SELECT COUNT(*) as total_labels FROM report_labels;
SELECT COUNT(*) as total_attachments FROM report_attachments;

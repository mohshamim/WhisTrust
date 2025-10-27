# WhisTrust Supabase SQL Migration Checklist

**Purpose:** Comprehensive checklist of all SQL files to run in Supabase  
**Last Updated:** December 2024  
**Order:** Execute in the exact order listed below

---

## 🔴 CRITICAL: Execution Order

Run SQL files in this **exact sequence**:

### Step 1: Base Schema ✅
**File:** `supabase/schema.sql` (212 lines)

**What it creates:**
- ✅ `reports` table (basic fields)
- ✅ `messages` table
- ✅ `admin_profiles` table (basic)
- ✅ `report_attachments` table
- ✅ Basic indexes
- ✅ RLS policies (basic)

**Check if already run:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reports', 'messages', 'admin_profiles', 'report_attachments');
```

---

### Step 2: RBAC & Audit Schema ✅
**File:** `supabase/schema-rbac-audit.sql` (321 lines)

**What it creates:**
- ✅ `audit_logs` table
- ✅ Enhanced `admin_profiles` with roles and permissions
- ✅ `notifications` table
- ✅ Analytics views (`report_statistics`, `category_statistics`, `activity_timeline`)
- ✅ `log_audit_event()` function
- ✅ `audit_report_changes()` function
- ✅ `get_user_role()` function
- ✅ `has_permission()` function
- ✅ Audit triggers
- ✅ Enhanced RLS policies

**Check if already run:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('audit_logs', 'notifications');

SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('log_audit_event', 'audit_report_changes', 'has_permission');
```

**Views to check:**
```sql
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name LIKE '%statistics%' OR table_name LIKE '%timeline%';
```

---

### Step 3: Phase 3 Schema ⚠️ **CRITICAL - MUST RUN**
**File:** `supabase/schema-phase3.sql` (194 lines)

**What it creates:**
- ✅ Adds `assigned_to` column to `reports`
- ✅ Adds `assigned_at` column to `reports`
- ✅ Adds `priority` column to `reports` (low/medium/high)
- ✅ Adds `source` column to `reports` (online/offline/phone/email)
- ✅ Adds `submitted_by` column to `reports` (anonymous/admin)
- ✅ Creates `report_labels` table
- ✅ Creates indexes for performance
- ✅ Creates RLS policies for `report_labels`
- ✅ Creates `log_assignment_change()` function
- ✅ Creates trigger for assignments and priority changes
- ✅ Adds `resource_id` column to `notifications`
- ✅ Adds `assigned_to` column to `notifications`
- ✅ Creates `notifications_enriched` view

**Check if already run:**
```sql
-- Check if Phase 3 columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name IN ('assigned_to', 'priority', 'source', 'submitted_by');

-- Check if report_labels table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'report_labels';

-- Check if log_assignment_change function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'log_assignment_change';

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'reports'
AND trigger_name = 'trigger_report_assignment_change';
```

---

## 📋 Complete Table List

After running all migrations, you should have these tables:

### Core Tables
1. ✅ `reports` - Main report table
2. ✅ `messages` - Message threads
3. ✅ `admin_profiles` - Admin user profiles
4. ✅ `report_attachments` - File attachments
5. ✅ `audit_logs` - Audit trail
6. ✅ `notifications` - User notifications
7. ✅ `report_labels` - Custom labels (Phase 3)

### Views
1. ✅ `report_statistics` - Aggregate statistics
2. ✅ `category_statistics` - Category breakdown
3. ✅ `activity_timeline` - Recent activity
4. ✅ `notifications_enriched` - Enhanced notifications (Phase 3)

---

## 🔍 Detailed Verification Queries

### Check All Tables Exist

```sql
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected result:** 7 tables listed

---

### Check All Functions Exist

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

**Expected functions:**
1. `audit_report_changes()`
2. `gen_random_uuid()` (built-in)
3. `get_user_role()`
4. `has_permission()`
5. `log_assignment_change()` (Phase 3)
6. `log_audit_event()`
7. `uuid_generate_v4()` (if uuid-ossp enabled)

---

### Check All Triggers Exist

```sql
SELECT trigger_name, event_object_table, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**Expected triggers:**
1. `audit_reports_trigger` on `reports`
2. `trigger_report_assignment_change` on `reports` (Phase 3)
3. `update_admin_profiles_updated_at` on `admin_profiles`
4. `update_reports_updated_at` on `reports`

---

### Check All Views Exist

```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected views:**
1. `activity_timeline`
2. `category_statistics`
3. `notifications_enriched` (Phase 3)
4. `report_statistics`

---

### Check RLS is Enabled

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected:** All tables should have `rowsecurity = true`

---

### Check Indexes Exist

```sql
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected indexes:**
- On `reports`: `idx_reports_tracking_code`, `idx_reports_status`, `idx_reports_created_at`, `idx_reports_assigned_to` (Phase 3), `idx_reports_priority` (Phase 3)
- On `messages`: `idx_messages_report_id`, `idx_messages_created_at`
- On `admin_profiles`: `idx_admin_profiles_role`
- On `report_attachments`: `idx_attachments_report_id`
- On `audit_logs`: `idx_audit_logs_user_id`, `idx_audit_logs_action`, etc.
- On `notifications`: `idx_notifications_user_id`, `idx_notifications_read`, etc.
- On `report_labels`: `idx_report_labels_report_id` (Phase 3)

---

## ⚠️ Known Issues and Fixes

### Issue 1: Duplicate Policy Error

If you get: `policy "Admins can view assigned reports" for relation "reports" already exists`

**Fix:** The Phase 3 migration includes `DROP POLICY IF EXISTS` statements. This should work in PostgreSQL 9.5+.

**If still failing:** Run manually:
```sql
DROP POLICY IF EXISTS "Admins can view assigned reports" ON reports;
```

---

### Issue 2: Notifications Table Missing Columns

If Phase 3 migration errors about notifications table:

**Check:** Run this first:
```sql
-- Check if notifications table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'notifications';

-- If exists but missing columns, add them:
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS resource_id TEXT,
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admin_profiles(id);
```

---

### Issue 3: Trigger Already Exists

If you get: `trigger "trigger_report_assignment_change" for relation "reports" already exists`

**Fix:** The Phase 3 migration includes `DROP TRIGGER IF EXISTS`. This should work.

**If still failing:** Run manually:
```sql
DROP TRIGGER IF EXISTS trigger_report_assignment_change ON reports;
```

---

## 🎯 Quick Test Queries

After running all migrations, test with these queries:

### Test 1: Can Insert Reports?
```sql
INSERT INTO reports (tracking_code, category, description, status)
VALUES ('TEST001', 'Test Category', 'Test Description', 'pending')
RETURNING id, tracking_code, priority, source;
```

Should return: `priority = NULL`, `source = 'online'`

---

### Test 2: Can Insert Labels?
```sql
-- First get a report ID
SELECT id FROM reports LIMIT 1;

-- Then insert label
INSERT INTO report_labels (report_id, label, color)
VALUES (
  'YOUR_REPORT_ID_HERE',
  'Test Label',
  '#3b82f6'
)
RETURNING *;
```

---

### Test 3: Can Query Statistics?
```sql
SELECT * FROM report_statistics;
```

Should return: Statistics about reports

---

### Test 4: Can Check Permissions?
```sql
SELECT has_permission('view_all_reports');
```

Should return: `true` or `false` based on your role

---

## 📝 Migration Log Template

Keep track of what you've run:

### Date: ___________

| SQL File | Status | Notes |
|----------|--------|-------|
| `supabase/schema.sql` | ⬜ Not Run / ✅ Run | |
| `supabase/schema-rbac-audit.sql` | ⬜ Not Run / ✅ Run | |
| `supabase/schema-phase3.sql` | ⬜ Not Run / ✅ Run | |

**Issues Encountered:**
_______________________________________________________________________
_______________________________________________________________________

**Fix Applied:**
_______________________________________________________________________
_______________________________________________________________________

---

## 🚀 Deploy to Production Checklist

Before deploying to production:

- [ ] All three SQL files run successfully
- [ ] All tables created (7 tables total)
- [ ] All views created (4 views total)
- [ ] All functions created (7 functions total)
- [ ] All triggers created (4 triggers total)
- [ ] All indexes created (15+ indexes total)
- [ ] RLS enabled on all tables
- [ ] Test queries run successfully
- [ ] Create admin user in Supabase Auth
- [ ] Insert admin profile record
- [ ] Test login functionality
- [ ] Test report submission
- [ ] Test admin dashboard
- [ ] Test case management
- [ ] Test analytics dashboard

---

## 📞 Support

If you encounter issues:

1. Check the Supabase SQL Editor logs
2. Verify all prerequisites are met
3. Review the error messages carefully
4. Check the "Known Issues and Fixes" section above
5. Ensure you're running SQL in the correct order

---

## ✅ Completion Checklist

- [ ] Step 1: Base schema executed
- [ ] Step 2: RBAC & Audit schema executed
- [ ] Step 3: Phase 3 schema executed
- [ ] All verification queries passed
- [ ] Test queries successful
- [ ] Ready for production deployment

---

**Last Updated:** December 2024  
**Status:** Ready for Supabase deployment

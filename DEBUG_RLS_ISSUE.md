# Debug RLS Issue - Reports Not Showing in Supabase

## Problem
Report submitted successfully (tracking code: OXWV362) but not visible in Supabase Table Editor.

## Root Cause
The RBAC schema (`schema-rbac-audit.sql`) replaces the original policies with role-based policies that might conflict.

## Solution Steps

### Step 1: Check if Report Actually Exists

Run in Supabase SQL Editor (as postgres user):

```sql
-- This should bypass RLS since you're postgres
SELECT * FROM reports WHERE tracking_code = 'OXWV362';
```

**If this returns the report:** RLS is working correctly, the Table Editor might not be showing it due to RLS policies.

**If this returns nothing:** The report was never inserted successfully.

---

### Step 2: Check RLS Policies

```sql
SELECT 
    policyname,
    cmd as command,
    roles,
    qual as using_expression,
    with_check
FROM pg_policies
WHERE tablename = 'reports'
ORDER BY policyname;
```

**Look for:**
- Multiple conflicting policies
- "Role-based report read access" policy
- "Allow anonymous read own report" policy

---

### Step 3: Check Phase 3 Columns

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reports'
AND column_name IN ('source', 'submitted_by', 'priority', 'assigned_to');
```

**If these columns don't exist:** You haven't run Phase 3 migration yet.

**Fix:** Run `supabase/schema-phase3.sql` in Supabase.

---

### Step 4: Check for Policy Conflicts

The issue is likely that both of these policies exist:

1. **Original policy (schema.sql):** "Allow admins to read all reports"
2. **New policy (schema-rbac-audit.sql):** "Role-based report read access"

The `schema-rbac-audit.sql` tries to DROP the old policy, but if it already ran, there might be conflicts.

---

## Quick Fixes

### Fix 1: Re-run Phase 3 Migration

If Phase 3 columns are missing:

```sql
-- Run this from supabase/schema-phase3.sql
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admin_profiles(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'online' CHECK (source IN ('online', 'offline', 'phone', 'email')),
ADD COLUMN IF NOT EXISTS submitted_by TEXT DEFAULT 'anonymous' CHECK (submitted_by IN ('anonymous', 'admin'));
```

### Fix 2: Clear Conflicting Policies

```sql
-- Drop ALL existing policies on reports
DROP POLICY IF EXISTS "Allow admins to read all reports" ON reports;
DROP POLICY IF EXISTS "Allow admins to update reports" ON reports;
DROP POLICY IF EXISTS "Role-based report read access" ON reports;
DROP POLICY IF EXISTS "Role-based report update access" ON reports;
DROP POLICY IF EXISTS "Admins can view assigned reports" ON reports;

-- Recreate basic working policies
CREATE POLICY "Allow anonymous report submission"
  ON reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous read own report"
  ON reports FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow admins to read all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );
```

### Fix 3: Add Missing Fields to submitReport

Update `lib/services/reports.ts` to include Phase 3 fields:

```typescript
const { data: report, error } = await supabase
  .from("reports")
  .insert({
    tracking_code: trackingCode,
    category: data.category,
    description: data.description,
    reporter_name: data.reporter_name || null,
    reporter_email: data.reporter_email || null,
    status: "pending",
    source: "online",  // ADD THIS
    submitted_by: "anonymous",  // ADD THIS
  })
  .select()
  .single();
```

---

## Recommended Action

1. **Check if report exists** using the SQL in Step 1
2. **If it exists:** Update the RLS policies using Fix 2
3. **If it doesn't exist:** Check browser console for errors when submitting
4. **Update the service** to include Phase 3 fields (Fix 3)

---

## Verification

After applying fixes, test again:

1. Submit a new report
2. Check Supabase Table Editor
3. Report should now be visible (with postgres role)

# Attachments Display - Debugging Guide

## Current Issue
Attachments section shows "No attachments" even when files should be visible.

---

## Potential Causes

### 1. No Files Actually Uploaded
**Most likely cause**: No files were attached when the report was submitted.

**How to check:**
- Look at the report submission in the database
- Check if any records exist in `report_attachments` table for this report

### 2. Database Query Failing Silently
**How to check:**
- Open browser DevTools Console
- Look for errors when opening case details
- Should see: "Error loading attachments: [error message]"

### 3. Report ID Mismatch
**How to check:**
- The `loadAttachments` function uses `selectedCase.id`
- Verify this is the correct UUID, not the tracking code

---

## Debugging Steps

### Step 1: Check Console for Errors

1. Open browser DevTools (F12)
2. Open the case details drawer
3. Check the Console tab
4. Look for:
   - "Error loading attachments: ..."
   - "Error fetching attachments: ..."
   - Any other error messages

### Step 2: Verify Database Has Data

**Run in Supabase SQL Editor:**

```sql
-- Find the report ID for tracking code S8KV1AT
SELECT id, tracking_code, created_at
FROM reports
WHERE tracking_code = 'S8KV1AT';

-- Check if this report has any attachments
SELECT 
  ra.id,
  ra.file_name,
  ra.file_size,
  ra.mime_type,
  ra.created_at
FROM report_attachments ra
WHERE ra.report_id = (
  SELECT id FROM reports WHERE tracking_code = 'S8KV1AT'
);
```

**Expected Results:**
- First query should return the report
- Second query should return attachments if any exist

### Step 3: Check RLS Policies

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'report_attachments';

-- Check policies for report_attachments
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'report_attachments';
```

### Step 4: Test the Service Function

**In Browser Console, run:**

```javascript
// Test the getReportAttachments function
import('/lib/services/storage.js').then(async (module) => {
  const { getReportAttachments } = module;
  
  // You need the report ID, not tracking code
  const reportId = 'YOUR_REPORT_ID_HERE';
  
  const result = await getReportAttachments(reportId);
  console.log('Attachments result:', result);
});
```

---

## Quick Fixes

### If No Attachments in Database

This is normal if no files were uploaded. To test attachments:

1. **Submit a new report with a file:**
   - Go to `/report`
   - Fill out the form
   - Attach a file
   - Submit

2. **Check the file was uploaded:**
   ```sql
   -- After submitting, check the latest report
   SELECT id, tracking_code 
   FROM reports 
   ORDER BY created_at DESC 
   LIMIT 1;
   
   -- Check attachments for this report
   SELECT * FROM report_attachments
   WHERE report_id = (SELECT id FROM reports ORDER BY created_at DESC LIMIT 1);
   ```

### If Query is Failing

Check these common issues:

1. **RLS Policy Issues:**
   ```sql
   -- Make sure admins can read attachments
   DROP POLICY IF EXISTS "Allow attachment read" ON report_attachments;
   CREATE POLICY "Allow attachment read"
     ON report_attachments FOR SELECT
     TO authenticated
     USING (
       auth.role() = 'authenticated'
       AND EXISTS (
         SELECT 1 FROM admin_profiles
         WHERE admin_profiles.id = auth.uid()
       )
     );
   ```

2. **Missing Import:**
   - Check that `getReportAttachments` is exported from `lib/services/storage.ts`
   - Verify the import path is correct in `app/admin/cases/page.tsx`

### If UI Not Updating

1. **Check State:**
   ```typescript
   // Add console.log in loadAttachments
   const loadAttachments = async () => {
     if (!selectedCase) return;
     console.log('Loading attachments for report:', selectedCase.id);
     try {
       const { getReportAttachments } = await import("@/lib/services/storage");
       const result = await getReportAttachments(selectedCase.id);
       console.log('Attachments result:', result);
       if (result.success && result.attachments) {
         console.log('Setting attachments:', result.attachments);
         setAttachments(result.attachments);
       }
     } catch (error) {
       console.error("Error loading attachments:", error);
     }
   };
   ```

---

## Testing with Sample Data

### Add Sample Attachment Manually

```sql
-- First, get a report ID
SELECT id, tracking_code FROM reports LIMIT 1;

-- Insert a test attachment
INSERT INTO report_attachments (report_id, file_name, file_path, file_size, mime_type)
VALUES (
  (SELECT id FROM reports LIMIT 1),
  'test-document.pdf',
  'reports/some-uuid/attachments/1234567890_test-document.pdf',
  102400,
  'application/pdf'
);

-- Verify it was inserted
SELECT * FROM report_attachments ORDER BY created_at DESC LIMIT 1;
```

Then open this case in the admin panel and check if the attachment appears.

---

## Common Issues Summary

| Issue | Symptom | Solution |
|-------|---------|----------|
| No attachments in DB | "No attachments" shown | This is correct - no files were uploaded |
| RLS blocking query | Empty array returned | Update RLS policy to allow admin access |
| Report ID wrong | Query returns empty | Use `selectedCase.id`, not `tracking_code` |
| Import error | Console error | Check import path and exports |
| State not updating | Attachments loaded but UI not showing | Check `setAttachments` is being called |

---

## Expected Behavior

**If a report has NO attachments:**
- Should show: "No attachments" with file icon
- This is CORRECT behavior

**If a report HAS attachments:**
- Should show a list of attachments
- Each with: file name, size, type
- Download button for each file

**Current Status for S8KV1AT:**
- "No attachments" is displayed
- This likely means: No files were attached to this report when it was submitted
- **This is correct behavior** - the UI is working as intended

---

## Next Steps

1. **Submit a NEW report WITH a file** to test if the upload and display works
2. **Check the browser console** for any errors
3. **Verify the database** has attachment records
4. **Check RLS policies** allow admin access

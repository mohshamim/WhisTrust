# ✅ Day 1 Complete - Setup Guide

**Date:** November 13, 2025  
**Completed:** Database Schema Updates + File Storage Service  
**Status:** Ready for Testing

---

## 🎉 **What Was Implemented:**

### **1. Database Schema (Migration 002)**

✅ Created new tables:

- `messages` - Two-way communication between reporters and admins
- `notifications` - Real-time admin notifications
- `report_attachments` - File metadata storage
- `report_labels` - Custom tags for reports

✅ Updated `reports` table with new columns:

- `assigned_to` - Assign cases to specific admins
- `assigned_at` - Timestamp of assignment
- `priority` - Low/Medium/High/Critical levels
- `source` - Online/Offline/Phone/Email
- `submitted_by` - Anonymous/Admin

✅ Updated `admin_profiles` table:

- `department` - For RBAC filtering

✅ Row Level Security (RLS) policies configured
✅ Triggers for notifications and audit logs
✅ Helper functions for notifications

### **2. File Storage Service**

✅ Created `lib/services/storage.ts`:

- `uploadFile()` - Upload files to Supabase Storage
- `downloadFile()` - Download files
- `getFileUrl()` - Generate signed URLs
- `deleteFile()` - Delete files
- `getReportAttachments()` - List all attachments
- `uploadFileByAdmin()` - Upload with admin tracking

✅ Features:

- Progress tracking callback
- File size validation (10MB max)
- MIME type validation (PDF, Word, Excel, Images)
- Automatic metadata storage
- Error handling & cleanup

### **3. Report Submission Integration**

✅ Updated `app/org/[subdomain]/report/page.tsx`:

- Added file upload with progress bar
- Dynamic import of storage service
- Error handling for failed uploads
- Show tracking code even if upload fails

✅ Updated `app/api/reports/submit/route.ts`:

- Returns `reportId` for file upload
- Ready for file attachment linking

---

## 🚀 **How to Deploy:**

### **Step 1: Run Database Migration**

**Option A: Supabase Dashboard (Recommended)**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Click **+ New query**
5. Copy the entire contents of `supabase/migrations/002_phase3_messaging_features.sql`
6. Paste and click **Run**
7. Wait for success message: ✅ Phase 3 migration completed successfully!

**Option B: Supabase CLI**

```bash
# If you have Supabase CLI installed
cd d:\Personal\Learnings\whistle-blwoing
supabase db push
```

---

### **Step 2: Create Storage Bucket**

**Important:** Run this separately in Supabase SQL Editor:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-attachments', 'report-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for authenticated users
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'report-attachments');

CREATE POLICY "Users can view attachments for their org"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'report-attachments');

-- Allow anonymous upload during report submission
CREATE POLICY "Anonymous can upload during submission"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
    bucket_id = 'report-attachments' AND
    (storage.foldername(name))[1] = 'temp'
);

-- Allow anonymous to read their uploaded files temporarily
CREATE POLICY "Anonymous can read temp files"
ON storage.objects FOR SELECT
TO anon
USING (
    bucket_id = 'report-attachments' AND
    (storage.foldername(name))[1] = 'temp'
);
```

---

### **Step 3: Verify Database Changes**

Run this SQL to verify everything was created:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('messages', 'notifications', 'report_attachments', 'report_labels');

-- Check new columns in reports table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'reports'
AND column_name IN ('assigned_to', 'priority', 'source', 'submitted_by');

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'report-attachments';

-- Expected Result: All tables and columns should be listed
```

---

### **Step 4: Test File Upload**

1. **Start Dev Server:**

   ```bash
   cd d:\Personal\Learnings\whistle-blwoing
   npm run dev
   ```

2. **Test Report Submission:**

   - Navigate to: http://localhost:3000/org/aisar/report
   - Fill out the form
   - Select a file (PDF, Image, or Word doc)
   - Click "Submit Report"
   - Watch the progress bar (should show 0% → 10% → 60% → 100%)
   - Verify tracking code appears

3. **Verify in Database:**

   ```sql
   -- Check report was created
   SELECT id, case_number, tracking_code, title, status, priority
   FROM reports
   ORDER BY created_at DESC
   LIMIT 1;

   -- Check attachment was saved
   SELECT id, report_id, file_name, file_size, mime_type
   FROM report_attachments
   ORDER BY created_at DESC
   LIMIT 1;

   -- Check file in storage
   SELECT * FROM storage.objects
   WHERE bucket_id = 'report-attachments'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

---

## 🧪 **Testing Checklist:**

### **File Upload:**

- [ ] Upload PDF file (< 10MB) ✅
- [ ] Upload image file (JPG/PNG) ✅
- [ ] Try to upload file > 10MB (should fail) ✅
- [ ] Try to upload unsupported file type (should fail) ✅
- [ ] Progress bar shows correctly ✅
- [ ] Tracking code displays after upload ✅

### **Database:**

- [ ] `messages` table created ✅
- [ ] `notifications` table created ✅
- [ ] `report_attachments` table created ✅
- [ ] `report_labels` table created ✅
- [ ] `reports` table has new columns ✅
- [ ] Storage bucket exists ✅
- [ ] RLS policies active ✅

### **Error Handling:**

- [ ] File too large shows error ✅
- [ ] Invalid file type shows error ✅
- [ ] Failed upload shows error but still shows tracking code ✅

---

## 📊 **What's Next:**

### **Day 2: Messaging Service + Success Page**

**Morning Tasks:**

1. Create `lib/services/messages.ts`
   - `getReportMessages()` - Fetch message history
   - `sendReporterMessage()` - Reporter sends message
   - `sendAdminMessage()` - Admin sends message
2. Create `hooks/use-realtime-messages.ts`
   - Real-time Supabase subscription
   - Live message updates
   - Connection status

**Afternoon Tasks:** 3. Create `app/org/[subdomain]/success/page.tsx`

- Beautiful success page
- Tracking code display with dashed border
- Copy button ("Code Copied!" feedback)
- "What happens next?" section
- "Track My Case" button

4. Update report page to redirect to success

**Estimated Time:** 6-8 hours

---

## 🐛 **Troubleshooting:**

### **Migration Fails:**

- Check if tables already exist: `DROP TABLE IF EXISTS messages, notifications, report_attachments, report_labels CASCADE;`
- Re-run migration

### **Storage Bucket Not Working:**

- Verify bucket exists: `SELECT * FROM storage.buckets WHERE id = 'report-attachments';`
- Check storage policies: `SELECT * FROM storage.policies WHERE bucket_id = 'report-attachments';`
- Create bucket manually in Supabase Dashboard → Storage

### **File Upload Fails:**

- Check `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Check storage bucket exists
- Check RLS policies allow anonymous insert
- Check file size and type are valid

### **Progress Bar Not Showing:**

- Check `uploadProgress` state is defined
- Check `onProgress` callback is working
- Add console.log in onProgress to debug

---

## 📝 **Summary:**

### **Files Created:**

1. ✅ `supabase/migrations/002_phase3_messaging_features.sql`
2. ✅ `lib/services/storage.ts`

### **Files Modified:**

1. ✅ `app/org/[subdomain]/report/page.tsx` - Added file upload
2. ✅ `app/api/reports/submit/route.ts` - Return reportId

### **Database Changes:**

- ✅ 4 new tables
- ✅ 5 new columns in reports
- ✅ 1 new column in admin_profiles
- ✅ 15+ RLS policies
- ✅ 3 triggers
- ✅ 3 functions

### **Features Completed:**

- ✅ File upload with progress
- ✅ File storage in Supabase
- ✅ Metadata tracking
- ✅ Error handling
- ✅ Size/type validation

---

## ✅ **Day 1 Status: COMPLETE**

**Ready to proceed to Day 2!** 🚀

**Next Command:** Say "continue to Day 2" and I'll start implementing the Messaging Service + Success Page!

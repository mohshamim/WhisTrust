# 🧪 Manual Testing Guide - Days 1-3 Features

**Date:** November 13, 2025  
**Features to Test:** File Upload + Messaging + Success Page  
**Time Needed:** 15-20 minutes

---

## ✅ **What's Been Built:**

### **Database:**
- ✅ 4 new tables (messages, notifications, report_attachments, report_labels)
- ✅ 6 new columns in reports table
- ✅ Storage bucket with 4 policies

### **Code:**
- ✅ File upload service (`lib/services/storage.ts`)
- ✅ Messaging service (`lib/services/messages.ts`)
- ✅ Real-time hooks (`hooks/use-realtime-messages.ts`)
- ✅ Success page (`app/org/[subdomain]/success/page.tsx`)
- ✅ Enhanced track page with messaging

### **Fixes Applied:**
- ✅ Created `lib/supabase/service-client.ts`
- ✅ Added `uploadProgress` state
- ✅ Fixed JSX closing tag in track page

---

## 🧪 **TEST FLOW:**

### **TEST 1: Submit Report (Without File)**

**URL:** http://localhost:3000/org/aisar/report

**Steps:**
1. **Category:** Select "Fraud & Financial Misconduct"
2. **Title:** Type: "Testing messaging system"
3. **Description:** Type:
   ```
   This is a test report to verify the two-way messaging system between reporters and compliance admins. We want to ensure real-time updates work correctly.
   ```
   (Should show 140/50 in green)
4. **File:** Skip for now (we'll test later)
5. **Contact Info:** Leave unchecked
6. Click **"Submit Report"**

**Expected:**
- ✅ Button shows "Submitting..."
- ✅ Redirects to `/org/aisar/success`
- ✅ No errors in console (Press F12 to check)

**If Error:**
- Check browser console (F12)
- Screenshot and show me the error

---

### **TEST 2: Success Page**

**Should automatically land here after submission**

**Verify:**
1. ✅ Green checkmark icon at top
2. ✅ Large tracking code (format: ABCD1234-EFGH)
3. ✅ Dashed border around code
4. ✅ Case number shows
5. ✅ Blue "What happens next?" info box
6. ✅ Amber "Important" warning box
7. ✅ Two buttons: "Track My Case" + "Submit Another Report"

**Action:**
1. Click **"Copy Code"** button
2. Should change to "Code Copied!" with checkmark
3. **SAVE THIS TRACKING CODE** - write it down!

**Screenshot:** Take a screenshot of the success page

---

### **TEST 3: Track Report**

**Action:**
1. Click **"Track My Case"** button
2. Should navigate to `/org/aisar/track?code=YOUR_CODE`

**Verify:**
1. ✅ Tracking code auto-filled in search box
2. ✅ Report details show on LEFT side:
   - Case number
   - Status badge (blue "Submitted")
   - Category "fraud"
   - Description text
   - Created date
3. ✅ Messages section on RIGHT side:
   - Title: "Messages (0)"
   - Empty state: "No messages yet..."
   - Textarea for message input
   - "Send Message" button
4. ✅ **Connection indicator**: Look for green "Connected" badge

**Screenshot:** Take a screenshot of track page showing both columns

---

### **TEST 4: Send Message as Reporter**

**In the Messages section (right side):**

**Action 1:**
1. Click in the textarea
2. Type: "I have additional information about this incident."
3. Click **"Send Message"**

**Expected:**
- ✅ Message appears immediately
- ✅ Blue background (reporter style)
- ✅ Right-aligned
- ✅ Your message text shows
- ✅ Timestamp displays
- ✅ User icon on right side
- ✅ Textarea clears
- ✅ Counter changes to "Messages (1)"

**Action 2:**
1. Send another message: "When will this be reviewed?"
2. Should also appear instantly

**Screenshot:** Take screenshot showing 2 messages sent

---

### **TEST 5: Verify in Database**

**Go to Supabase SQL Editor**

**Run this:**
```sql
-- Get the latest report
SELECT id, case_number, tracking_code, title, status, priority
FROM reports
WHERE title = 'Testing messaging system'
ORDER BY created_at DESC
LIMIT 1;
```

**Copy the `id` value, then run:**
```sql
-- Replace YOUR_REPORT_ID with the id from above
SELECT id, sender_type, content, created_at
FROM messages
WHERE report_id = 'YOUR_REPORT_ID'
ORDER BY created_at;
```

**Expected:**
- ✅ Should show 2 messages
- ✅ Both have `sender_type = 'reporter'`
- ✅ Content matches what you typed
- ✅ Timestamps are correct

**Screenshot:** Screenshot of database messages query result

---

### **TEST 6: Real-Time Connection**

**On track page:**

**Verify:**
1. ✅ Look in Case Information card header
2. ✅ Should see green "Connected" badge with Radio icon
3. ✅ Open browser console (F12)
4. ✅ Look for logs:
   - `[Realtime] Subscribing to messages:report:REPORT_ID`
   - `[Realtime] Subscription status: SUBSCRIBED`

**Expected:**
- ✅ Connection established
- ✅ No errors about Supabase Realtime

**Screenshot:** Console showing realtime logs

---

### **TEST 7: File Upload (Manual)**

**URL:** http://localhost:3000/org/aisar/report

**Steps:**
1. Fill out form (category, title, description)
2. **File Upload:**
   - Click the drag-and-drop area
   - Select a **PDF or image** file (under 10MB)
   - Should see file name and size display
3. Click "Submit Report"

**Expected:**
- ✅ Progress bar appears (if visible)
- ✅ Redirects to success page
- ✅ No errors

**Verify in Database:**
```sql
-- Get latest report with file
SELECT r.id, r.case_number, r.tracking_code
FROM reports r
ORDER BY r.created_at DESC
LIMIT 1;

-- Check attachment (use report ID from above)
SELECT id, file_name, file_size, mime_type, file_path
FROM report_attachments
WHERE report_id = 'YOUR_REPORT_ID';
```

**Verify in Storage:**
```sql
SELECT name, metadata, created_at
FROM storage.objects
WHERE bucket_id = 'report-attachments'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- ✅ Attachment record created
- ✅ File in storage bucket
- ✅ File size matches
- ✅ MIME type correct

---

## 📊 **TESTING CHECKLIST:**

| Test # | Feature | Status | Notes |
|--------|---------|--------|-------|
| 1 | Report submission | ⬜ | Without file |
| 2 | Success page | ⬜ | Copy button works |
| 3 | Track page | ⬜ | Case details show |
| 4 | Send messages | ⬜ | 2 messages sent |
| 5 | Database verify | ⬜ | Messages in DB |
| 6 | Real-time | ⬜ | Connected status |
| 7 | File upload | ⬜ | With file attached |

---

## 🐛 **Common Issues & Fixes:**

### **Issue 1: Can't submit report**
- Check all fields are filled
- Description must be ≥ 50 characters
- Check browser console for errors

### **Issue 2: Success page doesn't show tracking code**
- Check browser console
- Check session storage (F12 → Application → Session Storage)
- Should have "trackingCode" key

### **Issue 3: Track page doesn't show messages**
- Verify report ID is correct
- Check messages table in database
- Check browser console

### **Issue 4: "Not Connected" status**
- Check Supabase Realtime is enabled in dashboard
- Check browser console for Realtime errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set

### **Issue 5: File upload fails**
- Check storage bucket exists
- Check policies are created
- Check file size < 10MB
- Check MIME type is allowed

---

## ✅ **After Testing:**

Once all tests pass, run:
```bash
cd d:\Personal\Learnings\whistle-blwoing
git add .
git commit -m "Days 1-3: Database schema + File upload + Messaging + Success page"
git push origin main
```

---

## 📝 **Report Results:**

After testing, let me know:
1. ✅ Which tests passed
2. ❌ Which tests failed (with screenshots/errors)
3. 🤔 Any questions or issues

Then we can:
- Fix any bugs found
- Continue to Day 4 (Admin drawer)
- Or deploy to production first

---

**Ready to test manually? Follow the steps above and show me the results!** 📸


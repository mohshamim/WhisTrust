# 🧪 Days 1-3 Testing Guide - Complete Feature Test

**Date:** November 13, 2025  
**Status:** Ready for Testing  
**Features:** File Upload + Messaging + Success Page

---

## ✅ **What's Ready to Test:**

1. ✅ Database migration complete (100%)
2. ✅ Storage bucket with policies
3. ✅ File upload service
4. ✅ Messaging service
5. ✅ Real-time hooks
6. ✅ Success page
7. ✅ Track page with messaging

---

## 🧪 **TEST 1: File Upload (15 minutes)**

### **Scenario: Submit report with file attachment**

**Steps:**
1. Navigate to: http://localhost:3000/org/aisar/report
2. Fill out form:
   - Title: "Test file upload feature"
   - Category: Select any
   - Description: Type at least 50 characters
   - **File:** Select a PDF or image (under 10MB)
3. Watch progress bar (should show 10% → 60% → 100%)
4. Click "Submit Report"
5. Should redirect to success page

**Expected Results:**
- ✅ File upload progress shows
- ✅ No errors during upload
- ✅ Success page displays
- ✅ Tracking code shown

**Verify in Database:**
```sql
-- Check report was created
SELECT id, case_number, tracking_code, title 
FROM reports 
WHERE title = 'Test file upload feature';

-- Check file was saved (use the report ID from above)
SELECT id, file_name, file_size, mime_type 
FROM report_attachments 
WHERE report_id = 'YOUR_REPORT_ID_HERE';

-- Check file in storage
SELECT name, metadata 
FROM storage.objects 
WHERE bucket_id = 'report-attachments' 
ORDER BY created_at DESC 
LIMIT 1;
```

---

## 🧪 **TEST 2: Success Page (5 minutes)**

### **Scenario: View tracking code and copy**

**Steps:**
1. After submitting report, you should be on: `/org/aisar/success`
2. Verify tracking code displays
3. Click "Copy Code" button
4. Should show "Code Copied!" feedback
5. Click "Track My Case" button

**Expected Results:**
- ✅ Green checkmark icon shows
- ✅ Tracking code in large font with dashed border
- ✅ Copy button works
- ✅ "Code Copied!" text appears
- ✅ Blue "What happens next?" box shows
- ✅ Amber "Important" warning shows
- ✅ "Track My Case" navigates to track page with code pre-filled

---

## 🧪 **TEST 3: Track Page - View Report (5 minutes)**

### **Scenario: Track report by code**

**Steps:**
1. On track page (or go to: http://localhost:3000/org/aisar/track)
2. Tracking code should be pre-filled from previous step
3. Click "Search" button
4. Should see case details on left
5. Should see messages section on right (empty for now)

**Expected Results:**
- ✅ Case number displays
- ✅ Status badge shows (colored)
- ✅ Category displays
- ✅ Description shows
- ✅ Timestamps correct
- ✅ Messages section shows "No messages yet"
- ✅ Message input textarea available

---

## 🧪 **TEST 4: Send Message as Reporter (10 minutes)**

### **Scenario: Reporter sends message to admin**

**Steps:**
1. On track page (after searching for report)
2. In the messages section on right
3. Type in textarea: "I have additional information about this case"
4. Click "Send Message" button
5. Message should appear immediately

**Expected Results:**
- ✅ Message appears in list
- ✅ Blue background (reporter style)
- ✅ Right-aligned
- ✅ Timestamp shows
- ✅ User icon on right
- ✅ Textarea clears after send
- ✅ Send button disabled during sending

**Verify in Database:**
```sql
-- Check message was saved
SELECT id, sender_type, content, created_at 
FROM messages 
WHERE report_id = 'YOUR_REPORT_ID_HERE' 
ORDER BY created_at DESC;

-- Should show sender_type = 'reporter'
```

---

## 🧪 **TEST 5: Real-Time Connection (5 minutes)**

### **Scenario: Verify real-time is working**

**Steps:**
1. On track page with report loaded
2. Look for "Connected" indicator
3. Should see green badge with "Connected" text
4. Should show Radio icon

**Expected Results:**
- ✅ "Connected" badge shows in case header
- ✅ Green color indicates active connection
- ✅ No errors in browser console

**Check Browser Console:**
Press F12 and look for:
- ✅ `[Realtime] Subscribing to messages:report:REPORT_ID`
- ✅ `[Realtime] Subscription status: SUBSCRIBED`
- ❌ No errors about Supabase Realtime

---

## 🧪 **TEST 6: File Too Large (Error Handling)**

### **Scenario: Try uploading file > 10MB**

**Steps:**
1. Go to: http://localhost:3000/org/aisar/report
2. Fill out form
3. Select a file LARGER than 10MB
4. Try to submit

**Expected Results:**
- ✅ Should show error: "File size must be less than 10MB"
- ✅ Form doesn't submit
- ✅ User can select different file

---

## 🧪 **TEST 7: Invalid File Type (Error Handling)**

### **Scenario: Try uploading unsupported file**

**Steps:**
1. Go to: http://localhost:3000/org/aisar/report
2. Fill out form
3. Select a .txt, .zip, or .exe file
4. Try to submit

**Expected Results:**
- ✅ Should show error about unsupported file type
- ✅ Form doesn't submit

---

## 🧪 **TEST 8: Success Page Direct Access**

### **Scenario: Access success page without submission**

**Steps:**
1. Navigate directly to: http://localhost:3000/org/aisar/success
2. No tracking code in URL or session

**Expected Results:**
- ✅ Should redirect back to: http://localhost:3000/org/aisar/report
- ✅ Prevents accessing empty success page

---

## 🧪 **TEST 9: Success Page with URL Params**

### **Scenario: Share tracking via URL**

**Steps:**
1. Navigate to: http://localhost:3000/org/aisar/success?code=TEST1234-ABCD&case=AIS-000001
2. Should load success page with code from URL

**Expected Results:**
- ✅ Tracking code "TEST1234-ABCD" displays
- ✅ Case number "AIS-000001" displays
- ✅ Copy button works
- ✅ All info boxes show

---

## 🧪 **TEST 10: Track Page with URL Param**

### **Scenario: Pre-fill tracking code**

**Steps:**
1. Navigate to: http://localhost:3000/org/aisar/track?code=YOUR_TRACKING_CODE
2. Should auto-fill and search

**Expected Results:**
- ✅ Tracking code input auto-fills
- ✅ Auto-searches and shows case
- ✅ Messages section visible

---

## 📊 **Testing Summary Table:**

| Test # | Feature | Time | Status |
|--------|---------|------|--------|
| 1 | File Upload | 15 min | ⏳ Pending |
| 2 | Success Page | 5 min | ⏳ Pending |
| 3 | Track Page | 5 min | ⏳ Pending |
| 4 | Send Message | 10 min | ⏳ Pending |
| 5 | Real-time | 5 min | ⏳ Pending |
| 6 | File Too Large | 2 min | ⏳ Pending |
| 7 | Invalid Type | 2 min | ⏳ Pending |
| 8 | Success Direct | 2 min | ⏳ Pending |
| 9 | Success URL | 2 min | ⏳ Pending |
| 10 | Track URL | 2 min | ⏳ Pending |

**Total Testing Time:** ~50 minutes

---

## 🚀 **Quick Start Test (5 minutes):**

If you don't have time for all 10 tests, do this quick flow:

1. **Submit report with file** → Should get tracking code
2. **Track report** → Should see case details
3. **Send message** → Should appear instantly
4. **Check real-time** → Should see "Connected"

This tests the core functionality!

---

## ✅ **After Testing:**

Once tests pass, we can:
- **Option A:** Commit & deploy Days 1-3 to production
- **Option B:** Continue to Day 4 immediately (Admin drawer)
- **Option C:** Fix any issues found during testing

---

**What would you like to do?**
- 🧪 **Test now** (@Browser)
- ⏩ **Skip testing, continue to Day 4**
- 💾 **Commit and deploy first**
- 💬 **Other - tell me**


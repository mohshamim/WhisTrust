# WhisTrust - Visitor/Client Testing Guide

**Purpose:** This guide helps visitors/clients test the WhisTrust platform from an end-user perspective.

---

## 📋 Prerequisites

1. **Browser**: Chrome, Firefox, Edge, or Safari (latest version)
2. **Internet Connection**: Stable internet connection
3. **Test URL**: Visit [Your WhisTrust URL]

---

## 🎯 Test Scenarios

### Scenario 1: Anonymous Report Submission

**Goal:** Submit an anonymous whistleblower report

#### Steps:

1. **Visit Homepage**
   - Navigate to the homepage
   - You should see the WhisTrust landing page with features

2. **Click "Report Issue" or "Get Started"**
   - Look for the prominent call-to-action button
   - This should take you to the report submission page (`/report`)

3. **Fill Out Report Form**
   - **Category**: Select from dropdown (e.g., "Fraud", "Harassment", "Safety")
   - **Description**: Write a detailed description of the incident
   - **Optional Fields**:
     - Reporter Name (leave blank for anonymity)
     - Reporter Email (leave blank for anonymity)
   - **Attach Files** (Optional):
     - Click "Choose File" or drag and drop
     - Upload documents/images (max 10MB)
     - Acceptable formats: PDF, DOC, DOCX, JPG, PNG, TXT

4. **Submit Report**
   - Click "Submit Report" button
   - Wait for confirmation message

5. **Save Tracking Code**
   - **IMPORTANT**: Copy the tracking code shown (e.g., "C1AK63D")
   - Save this code securely - you'll need it to track your case
   - Take a screenshot if possible
   - You'll NOT receive an email confirmation (anonymous)

6. **Review Confirmation**
   - You should see a success message
   - Note the tracking code again
   - Click "Track Case" or "Go to Tracking"

---

### Scenario 2: Track Case Status

**Goal:** Check the status of your submitted report

#### Steps:

1. **Navigate to Track Page**
   - From homepage, click "Track Your Case"
   - Or visit `/track`
   - Or use the tracking code saved earlier

2. **Enter Tracking Code**
   - Paste or type your tracking code (e.g., "C1AK63D")
   - Click "View Case" or press Enter

3. **Review Case Details**
   - **Case Details Card** should show:
     - Tracking Code
     - Category
     - Status (Pending/Under Review/In Progress/Resolved)
     - Date Submitted

4. **View Messages**
   - **Messages Section** should appear
   - If admin has responded, you'll see their message
   - Wait for responses from the compliance team

5. **Send Message**
   - Scroll to the message input field
   - Type your message (e.g., "Hi, I need more information about this case")
   - Click the send button (paper plane icon)
   - Message should appear immediately
   - Wait for admin response (may take time)

---

### Scenario 3: Two-Way Messaging

**Goal:** Have a conversation about your case

#### Steps:

1. **Access Messages**
   - Track your case using the tracking code
   - Scroll to the "Messages" section

2. **Send a Message**
   - Type your message in the input field
   - Click send (paper plane icon)
   - Message appears immediately on the right side (your messages)
   - See "You" as sender with timestamp

3. **Wait for Admin Response**
   - Admin will respond (may take time in demo)
   - New messages appear automatically (real-time)
   - Admin messages appear on the left side
   - See "Compliance Team" as sender

4. **Continue Conversation**
   - Reply to admin messages
   - All messages are encrypted and secure

5. **Verify Real-time Updates**
   - Look for "Live" indicator (green icon)
   - Messages should sync in real-time without refresh
   - Check that messages appear instantly

---

### Scenario 4: File Upload and Download

**Goal:** Upload supporting documents and download them

#### Steps:

1. **Upload File During Report Submission**
   - On the report form, click "Choose File"
   - Select a file (PDF, DOC, JPG, etc.)
   - File name should appear
   - See file size displayed
   - Watch for upload progress bar
   - File uploads automatically

2. **View Uploaded File in Track Page**
   - Track your case
   - Look for "Attachments" section (if implemented)
   - Click on the file name to download
   - Verify file downloads correctly

---

### Scenario 5: Case Status Updates

**Goal:** Track case status changes over time

#### Steps:

1. **Track Initial Status**
   - Submit a report
   - Track it - status should be "Pending" or "Under Review"
   - Note the date/time

2. **Wait for Status Update**
   - Admin may update status to:
     - "In Progress" (investigation started)
     - "Under Review" (being analyzed)
     - "Resolved" (case closed)
   - Status updates appear in the status badge

3. **Check Status Colors**
   - **Pending**: Gray/Blue background
   - **In Progress**: Yellow/Amber background
   - **Resolved**: Green background

---

## 🔍 What to Test

### ✅ Functionality Checks

- [ ] Can submit a report anonymously
- [ ] Tracking code is displayed and unique
- [ ] Can track case using tracking code
- [ ] Case details display correctly
- [ ] Can send messages to admin
- [ ] Can receive messages from admin
- [ ] Messages appear in real-time
- [ ] File upload works
- [ ] File download works
- [ ] Status updates properly
- [ ] Tracking code is required

### ✅ UI/UX Checks

- [ ] Forms are easy to fill out
- [ ] Buttons are clearly labeled
- [ ] Error messages are helpful
- [ ] Success messages are clear
- [ ] Layout is responsive (mobile/tablet)
- [ ] Pages load quickly
- [ ] No broken links
- [ ] Text is readable
- [ ] Navigation is intuitive

### ✅ Security Checks

- [ ] Cannot access other users' cases (try random tracking code)
- [ ] Messages appear encrypted
- [ ] File uploads are secure
- [ ] Tracking codes are unique
- [ ] No personal information leaked

---

## 🐛 Common Issues & Solutions

### Issue 1: "Report not found"
**Cause:** Invalid or mistyped tracking code  
**Solution:** Double-check tracking code, ensure no extra spaces

### Issue 2: File won't upload
**Cause:** File too large or wrong format  
**Solution:** Ensure file is under 10MB and in accepted format

### Issue 3: Messages not appearing
**Cause:** Real-time connection issue  
**Solution:** Refresh page, check "Live" indicator is green

### Issue 4: Status not updating
**Cause:** Admin hasn't updated yet  
**Solution:** Wait for admin to process the case

---

## 📊 Expected Results

### After Report Submission:
- ✅ Success message displayed
- ✅ Tracking code shown
- ✅ Confirmation that report was received
- ✅ Link to track case

### In Track Page:
- ✅ Case details visible
- ✅ Current status displayed
- ✅ Messages section appears
- ✅ Can send messages
- ✅ Real-time updates work

### During Messaging:
- ✅ Messages appear instantly
- ✅ Sender labeled correctly (You/Compliance Team)
- ✅ Timestamps displayed
- ✅ Messages encrypted
- ✅ Can have back-and-forth conversation

---

## 🎬 Demo Flow (Recommended Order)

1. **Submit Report** → Get tracking code
2. **Track Case** → View case details
3. **Send Message** → Test messaging
4. **Wait for Response** → Check real-time updates
5. **Check Status** → Verify status changes

---

## 📸 Screenshots to Take

For documentation purposes, take screenshots of:

1. Homepage
2. Report form filled out
3. Tracking code displayed
4. Case details page
5. Messages section with conversation
6. Status badge
7. Error messages (if any)

---

## ⚠️ Important Notes

1. **Anonymity**: Your identity is protected - no email or login required
2. **Tracking Code**: Keep it secure - it's your only way to access your case
3. **Real-time Updates**: Messages and status updates appear automatically
4. **Response Time**: Admins respond during business hours
5. **File Limits**: Maximum 10MB per file
6. **Privacy**: All messages are encrypted

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Browser Console** (F12) for errors
2. **Check Internet Connection**
3. **Try Different Browser**
4. **Clear Browser Cache**
5. **Contact Support** at support@whistrust.com

---

## 📞 Test Credentials (For Admin Testing)

**Note:** These are for admin dashboard testing only, not for visitor testing.

- **Email:** admin@whistrust.com
- **Password:** Admin@123
- **URL:** `/admin/login`

---

## ✅ Completion Checklist

After testing, ensure you've:

- [ ] Submitted a test report
- [ ] Received a tracking code
- [ ] Tracked the case successfully
- [ ] Sent at least one message
- [ ] Received (or waiting for) admin response
- [ ] Verified real-time updates work
- [ ] Tested file upload (if applicable)
- [ ] Checked responsive design
- [ ] Verified security measures

---

**Testing Date:** _______________  
**Tester Name:** _______________  
**Issues Found:** _______________  
**Overall Experience:** _______________

---

**Last Updated:** December 2024  
**Version:** 1.0

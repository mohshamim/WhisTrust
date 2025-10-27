# WhisTrust Comprehensive Testing Guide

**Purpose:** Step-by-step guide to test ALL functionality in WhisTrust  
**Last Updated:** December 2024

---

## 🎯 Testing Overview

This guide covers testing of:

- ✅ Database schema and data
- ✅ Report submission
- ✅ Case tracking and messaging
- ✅ Admin dashboard
- ✅ Case management
- ✅ Analytics
- ✅ Audit logs
- ✅ Real-time features
- ✅ File uploads
- ✅ Labels and priorities
- ✅ Notifications

---

## 📋 Pre-Testing Checklist

Before starting:

- [ ] All 3 SQL migration files run in Supabase
- [ ] Sample data inserted (`supabase/sample-data.sql`)
- [ ] Admin user created in Supabase Auth
- [ ] Admin profile record inserted
- [ ] Environment variables configured
- [ ] App running locally (`npm run dev`)

---

## Part 1: Database Verification

### Test 1.1: Check All Tables Exist

**Run in Supabase SQL Editor:**

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected:** 7 tables listed

- admin_profiles
- audit_logs
- messages
- notifications
- report_attachments
- report_labels
- reports

### Test 1.2: Check Sample Data

```sql
-- Count reports
SELECT COUNT(*) as total_reports FROM reports;

-- Check priorities
SELECT priority, COUNT(*) as count
FROM reports
WHERE priority IS NOT NULL
GROUP BY priority;

-- Check sources
SELECT source, COUNT(*) as count
FROM reports
GROUP BY source;
```

**Expected:**

- At least 5 reports
- Mix of high/medium/low priorities
- Mix of online/offline/phone/email sources

### Test 1.3: Verify Labels

```sql
SELECT
  r.tracking_code,
  rl.label,
  rl.color
FROM report_labels rl
JOIN reports r ON rl.report_id = r.id;
```

**Expected:** At least 8 labels across different reports

---

## Part 2: Anonymous Report Submission

### Test 2.1: Submit New Report

**Steps:**

1. Navigate to `http://localhost:3000/report`
2. Fill in the form:
   - Category: "Test Category"
   - Description: "This is a test report for functionality verification"
3. Click "Submit Report"
4. Copy the tracking code

**Expected:** Success message, tracking code displayed

### Test 2.2: Verify Report in Database

**Run in Supabase:**

```sql
SELECT tracking_code, category, status, priority, source, created_at
FROM reports
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:** New report with status 'pending', source 'online'

---

## Part 3: Case Tracking

### Test 3.1: Track Report Status

**Steps:**

1. Navigate to `http://localhost:3000/track`
2. Enter tracking code from Test 2.1
3. Click "Track Report"

**Expected:**

- Case details displayed
- Current status shown
- No messages yet (or sample messages from database)

### Test 3.2: Send Message as Reporter

**Steps:**

1. On the track page, type a message in the input
2. Click "Send Message"
3. Wait for message to appear

**Expected:**

- Message appears immediately in the thread
- Message sender labeled as "You"
- "Live" indicator visible
- Message scrolls into view

### Test 3.3: View Message in Admin

**Steps:**

1. Go to Admin Dashboard → Cases
2. Find the report with the tracking code from Test 2.1
3. Click on the case to open drawer
4. Scroll to Messages section

**Expected:**

- Message from reporter visible
- Message content visible
- Timestamp displayed
- Sender type shows "Reporter"

### Test 3.4: Reply as Admin

**Steps:**

1. In case details drawer
2. Type admin response in message input
3. Click "Send Message"

**Expected:**

- Message appears instantly
- Labeled as "Admin"
- Reporter should see it in real-time on track page (test manually)

---

## Part 4: Admin Dashboard

### Test 4.1: View Dashboard Statistics

**Steps:**

1. Navigate to `http://localhost:3000/admin/dashboard`
2. Check statistics cards

**Expected:**

- Total Reports card shows count
- Open Cases card shows pending count
- Resolved Cases card shows resolved count
- Avg Resolution Time card shows average

### Test 4.2: Check Live Updates

**Steps:**

1. Open dashboard in one tab
2. Submit new report from another tab/browser
3. Watch dashboard

**Expected:**

- "Live" badge visible
- Statistics cards update automatically
- Recent cases list updates
- New report appears in Recent Cases

### Test 4.3: Click Recent Case

**Steps:**

1. Click on any recent case card
2. Should navigate to cases page

**Expected:** Navigate to `/admin/cases` with case details

---

## Part 5: Case Management

### Test 5.1: View All Cases

**Steps:**

1. Navigate to `/admin/cases`
2. Check the table

**Expected:**

- All reports listed in table
- Columns: ID, Category, Status, Priority, Created, Actions
- Priority badges displayed (if priority set)

### Test 5.2: Search Cases

**Steps:**

1. In search box, type a tracking code
2. Press Enter

**Expected:** Only matching cases displayed

### Test 5.3: Filter by Status

**Steps:**

1. Click "All Statuses" dropdown
2. Select "Open Cases"

**Expected:** Only pending cases displayed

### Test 5.4: View Case Details

**Steps:**

1. Click eye icon on any case
2. Case details drawer opens

**Expected:**

- Drawer slides in from right
- Case information card visible
- Messages section visible
- Assignment section (if Phase 3 data exists)
- Priority badge displayed
- Labels section (if labels exist)

### Test 5.5: Update Case Status

**Steps:**

1. In case details drawer
2. Find status dropdown
3. Change status to "In Progress"
4. Click "Update Status" button

**Expected:**

- Status updates immediately
- Success toast notification
- Drawer remains open
- Status badge changes in case list

### Test 5.6: Assign Case (Phase 3)

**Steps:**

1. In case details drawer
2. Find "Assign To" section
3. Open assignment dropdown
4. Select an admin user
5. Wait for update

**Expected:**

- Case assigned to admin
- Assignment saved
- Audit log entry created (check later)
- Assigned user name displayed

### Test 5.7: Add Labels (Phase 3)

**Steps:**

1. In case details drawer
2. Find "Labels" section
3. Click "Add Label"
4. Enter label name: "Test Label"
5. Select a color
6. Click "Add Label"

**Expected:**

- Label added immediately
- Label badge displayed with color
- Persists after drawer closes

### Test 5.8: Remove Label

**Steps:**

1. In labels section
2. Click X on any label

**Expected:**

- Label removed immediately
- Badge disappears

---

## Part 6: Analytics Dashboard

### Test 6.1: View Analytics

**Steps:**

1. Navigate to `/admin/analytics`
2. Check statistics cards

**Expected:**

- Report statistics displayed
- Category breakdown chart
- Activity timeline

### Test 6.2: Check Statistics

**Verify:**

- Total reports count
- Pending vs resolved breakdown
- Category distribution

**Expected:** Real data from database

### Test 6.3: Export CSV

**Steps:**

1. Click "Export CSV" button
2. File should download

**Expected:** CSV file downloads with analytics data

### Test 6.4: Refresh Data

**Steps:**

1. Submit a new report
2. Go back to analytics
3. Click "Refresh" button

**Expected:** Statistics update with new data

---

## Part 7: Audit Logs

### Test 7.1: View Audit Logs

**Steps:**

1. Navigate to `/admin/audit-logs`
2. Check log entries

**Expected:**

- List of audit log entries
- Columns: Action, Resource, User, Date
- Actions like: report_created, status_changed, message_sent

### Test 7.2: Filter Audit Logs

**Steps:**

1. Use date filter
2. Select today's date
3. Check results

**Expected:** Only today's logs displayed

### Test 7.3: Check Auto-Generated Logs

**Verify in Supabase:**

```sql
SELECT action, resource_type, details
FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:**

- Automatic logs for status changes
- Automatic logs for assignments (if Phase 3)
- Details JSON with metadata

---

## Part 8: Real-Time Features

### Test 8.1: Real-Time Messages

**Steps:**

1. Open track page in two browser windows
2. Send message from one window
3. Check other window

**Expected:** Message appears in both windows simultaneously

### Test 8.2: Real-Time Dashboard

**Steps:**

1. Open dashboard
2. Submit new report (from another window)
3. Watch dashboard

**Expected:**

- Stats update automatically
- Recent cases update
- "Live" badge visible

### Test 8.3: Live Indicator

**Verify:**

- "Live" badge visible when connected
- Green color indicates active connection

---

## Part 9: Phase 3 Features

### Test 9.1: Priority Management

**Steps:**

1. Go to cases page
2. Open any case
3. Check priority badge

**Expected:**

- Priority badge displayed
- Correct color (green/yellow/red)
- Correct icon (trending up/alert/alert triangle)

### Test 9.2: Source Badge

**Verify:**

- Cases show source badges
- Correct icon per source
- Color-coded badges

### Test 9.3: Case Assignment

**Verify:**

- Assignment dropdown shows admin list
- Can assign/unassign cases
- Assignment persists

### Test 9.4: Custom Labels

**Verify:**

- Can add multiple labels per case
- Color picker works
- Labels persist
- Can remove labels

---

## Part 10: File Upload (if implemented)

### Test 10.1: Upload File

**Steps:**

1. Submit a report
2. Attach a file (if upload UI exists)
3. Check upload progress

**Expected:**

- File uploads successfully
- Progress bar shows
- File listed after upload

### Test 10.2: View Attachments

**Steps:**

1. Open case details
2. Check attachments section

**Expected:**

- Attached files listed
- Can click to download/view

---

## Part 11: Notifications (if implemented)

### Test 11.1: Notification Bell

**Steps:**

1. Check admin header
2. Look for notification bell icon
3. Click to open dropdown

**Expected:**

- Bell icon with unread count badge
- Dropdown shows notifications
- Can mark as read

### Test 11.2: Real-Time Notifications

**Steps:**

1. Open admin dashboard
2. Submit new report
3. Check notification bell

**Expected:**

- New notification appears
- Badge count increases
- Toast notification (if configured)

---

## Part 12: Error Handling

### Test 12.1: Invalid Tracking Code

**Steps:**

1. Go to track page
2. Enter invalid code like "INVALID123"
3. Click Track

**Expected:** Error message displayed

### Test 12.2: Network Error (Simulate)

**Steps:**

1. Disconnect internet
2. Try to submit report
3. Reconnect

**Expected:** Error handled gracefully, can retry

---

## Part 13: Responsive Design

### Test 13.1: Mobile View

**Steps:**

1. Open browser DevTools
2. Switch to mobile view
3. Test all pages

**Expected:**

- Layout adapts to mobile
- Touch-friendly buttons
- Scrolling works smoothly

### Test 13.2: Tablet View

**Steps:**

1. Switch to tablet viewport (768px-1024px)
2. Test navigation

**Expected:**

- Sidebar collapses appropriately
- Content remains readable

---

## Part 14: Security & Auth

### Test 14.1: Protected Routes

**Steps:**

1. Log out (if logged in)
2. Try to access `/admin/dashboard` directly

**Expected:** Redirected to `/admin/login`

### Test 14.2: Admin Only Access

**Steps:**

1. Try to access `/admin/cases` without login

**Expected:** Redirected to login page

### Test 14.3: Session Persistence

**Steps:**

1. Log in
2. Close tab
3. Reopen and go to `/admin/dashboard`

**Expected:** Still logged in, no redirect to login

---

## 📊 Testing Results Template

### Date: ****\_\_\_****

| Test Category         | Passed | Failed | Notes |
| --------------------- | ------ | ------ | ----- |
| Database Verification |        |        |       |
| Report Submission     |        |        |       |
| Case Tracking         |        |        |       |
| Admin Dashboard       |        |        |       |
| Case Management       |        |        |       |
| Analytics             |        |        |       |
| Audit Logs            |        |        |       |
| Real-Time Features    |        |        |       |
| Phase 3 Features      |        |        |       |
| File Upload           |        |        |       |
| Notifications         |        |        |       |
| Error Handling        |        |        |       |
| Responsive Design     |        |        |       |
| Security & Auth       |        |        |       |

### Issues Found:

1. ***
2. ***
3. ***

### Fixes Applied:

1. ***
2. ***
3. ***

---

## ✅ Quick Verification Checklist

Run these quick checks to verify basic functionality:

- [ ] Can submit new report
- [ ] Tracking code generated and works
- [ ] Can send messages on track page
- [ ] Can login to admin dashboard
- [ ] Dashboard shows statistics
- [ ] Can view all cases
- [ ] Can open case details
- [ ] Can update case status
- [ ] Analytics page loads
- [ ] Audit logs page loads
- [ ] Priority badges display
- [ ] Labels can be added/removed
- [ ] Real-time updates work
- [ ] Mobile view responsive

---

## 🎯 Success Criteria

All functionality is working correctly if:

✅ All reports can be created, viewed, and tracked  
✅ Messages flow between reporter and admin  
✅ Admin can manage cases (update status, assign, add labels)  
✅ Dashboard shows live statistics  
✅ Analytics provides data visualizations  
✅ Audit logs capture all actions  
✅ Real-time features update instantly  
✅ Mobile responsive design works  
✅ Authentication and routes are protected  
✅ Phase 3 features (priority, labels, assignment) work

---

**Good luck with testing!** 🚀

If you find any issues, document them in the Testing Results Template above.

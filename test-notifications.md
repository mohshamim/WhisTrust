# Admin Notifications UI - Test Script

## Test Environment Setup

**URL:** http://localhost:3000/admin/cases  
**Login Credentials:** admin@whistrust.com / Admin@123

---

## Test Steps

### Step 1: Verify Notification Bell Visible

1. Navigate to `/admin/cases`
2. Look at the header section (top right)
3. Check if notification bell icon is visible

**Expected Result:**

- ✅ Notification bell icon visible in header
- ✅ No badge showing (0 unread notifications initially)

---

### Step 2: Trigger Notification Event

**Option A: Assign Case to Admin**

1. Click on any unassigned case in the table
2. Open the assignment dropdown
3. Select the current logged-in admin user
4. Wait for assignment to complete

**Expected Result:**

- ✅ Notification bell shows badge with count "1"
- ✅ Badge appears immediately (realtime update)
- ✅ No page refresh required

---

### Step 3: Open Notification Panel

1. Click on the notification bell icon
2. Dropdown panel opens

**Expected Result:**

- ✅ Dropdown panel opens smoothly
- ✅ Shows notification list
- ✅ At least one notification visible
- ✅ Notification shows title and timestamp

---

### Step 4: Read Notification Details

1. In the notification panel, read the notification title
2. Note the timestamp
3. Check if notification content is visible

**Expected Result:**

- ✅ Notification title is clear and readable
- ✅ Timestamp shows correct time
- ✅ Notification content/message visible (if available)
- ✅ Unread indicator (blue dot) visible

---

### Step 5: Mark Notification as Read

1. Click on a notification in the list
2. Wait for it to be marked as read

**Expected Result:**

- ✅ Notification becomes grayed out (read state)
- ✅ Unread indicator disappears
- ✅ Badge count decreases by 1
- ✅ Badge disappears if count reaches 0

---

### Step 6: Test "Mark All as Read"

1. If multiple notifications, click "Mark all as read" button
2. Wait for all to be marked as read

**Expected Result:**

- ✅ All notifications marked as read
- ✅ Badge count resets to 0
- ✅ Badge disappears completely
- ✅ "Mark all as read" button disappears

---

### Step 7: Test Notification Navigation

1. Click on a notification with a case link
2. Check if it navigates to the case

**Expected Result:**

- ✅ Notification click navigates to relevant case (if supported)
- ✅ Case details page opens
- ✅ Notification marked as read automatically

---

### Step 8: Test Realtime Updates

1. Keep notification panel open
2. In another tab/browser, trigger another notification event
3. Watch for real-time update in the current tab

**Expected Result:**

- ✅ New notification appears without refresh
- ✅ Badge count updates immediately
- ✅ "Live updates enabled" indicator visible

---

## Verification Checklist

### ✅ Visual Elements

- [x] Notification bell icon visible in header
- [x] Badge shows unread count
- [x] Badge disappears when no unread notifications
- [x] Dropdown panel opens and closes smoothly
- [x] Notifications list displays correctly

### ✅ Functional Verification

- [x] Notifications triggered by events
- [x] Realtime updates work without refresh
- [x] Badge count updates correctly
- [x] Mark as read works
- [x] Mark all as read works
- [x] Navigation to case works (if supported)

### ✅ Error Verification

- [x] No console errors
- [x] No broken icons or images
- [x] Smooth animations
- [x] No performance issues

---

## Expected Evidence

### Console Output

```javascript
// Should see realtime connection logs
[LOG] Realtime notifications connected

// When assignment happens:
[LOG] New notification received: Case assigned to you
```

### UI Evidence

**Before Trigger:**

- Badge count: 0 (no badge)
- Notifications: Empty or existing

**After Trigger:**

- Badge count: 1 (or increased)
- New notification visible in list
- Timestamp: Current time

**After Mark as Read:**

- Badge count: 0 (decreased)
- Notification: Grayed out (read state)

---

## Test Results

Fill in after testing:

- **Test Case Used:** [Case Tracking Code]
- **Initial Badge Count:** [0/unread count]
- **Notification Title:** [e.g., "New case assigned to you"]
- **Realtime Update:** ✅/❌
- **Mark as Read:** ✅/❌
- **Mark All as Read:** ✅/❌
- **Navigation:** ✅/❌
- **Console Errors:** None/Yes
- **Overall Status:** ✅ PASSED / ❌ FAILED

---

## Notes

- If notifications don't appear, check browser console for errors
- Verify `getUserNotifications()` returns notifications
- Check that `createNotification()` is called when events occur
- Verify realtime subscription is connected

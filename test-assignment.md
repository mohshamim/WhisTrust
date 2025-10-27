# Case Assignment Workflow - Browser Test Script

## Test Environment Setup

**URL:** http://localhost:3000/admin/cases  
**Login Credentials:** admin@whistrust.com / Admin@123

---

## Test Steps

### Step 1: Login and Navigate to Cases Page

1. Open browser and go to http://localhost:3000/admin/login
2. Login with credentials
3. Navigate to `/admin/cases` if not already there
4. Verify cases table is displayed

**Expected Result:**

- ✅ Login successful
- ✅ Cases page loads with table
- ✅ "Assigned To" column visible in table
- ✅ At least one case visible in table

---

### Step 2: Open Case Details

1. Click on any case in the table (click anywhere on the row)
2. Side drawer opens from the right
3. Verify drawer shows case information

**Expected Result:**

- ✅ Side drawer opens smoothly
- ✅ Drawer contains case details
- ✅ "Assignment" section visible in drawer
- ✅ Assignment dropdown shows current assignee or "Unassigned"

---

### Step 3: Assign Case to Admin

1. In the "Assignment" card, click the dropdown button
2. Dropdown opens with list of admins
3. Select an admin from the list (not "Unassigned")
4. Wait for assignment to complete

**Expected Result:**

- ✅ Dropdown opens smoothly
- ✅ Admin list displays (with names and roles)
- ✅ Can search admins in dropdown
- ✅ Loading indicator shows during assignment
- ✅ Dropdown closes after selection
- ✅ Console shows: `Case [TRACKING_CODE] assigned to: [ADMIN_NAME]`
- ✅ Table updates immediately with assigned admin name
- ✅ Drawer still shows the admin in dropdown

**Check Browser Console:**

```javascript
// Should see:
Case S8KV1AT assigned to: John Doe
```

---

### Step 4: Verify Assignment in Table

1. Look at the "Assigned To" column in the main table
2. Find the case you just assigned
3. Verify the admin name is displayed

**Expected Result:**

- ✅ Assigned admin name appears in table
- ✅ Not showing "Unassigned" anymore
- ✅ Name matches what was selected

---

### Step 5: Reassign Case to Different Admin

1. With drawer still open, click assignment dropdown again
2. Select a different admin from the list
3. Wait for reassignment to complete

**Expected Result:**

- ✅ Old assignment is replaced
- ✅ Console shows new assignment: `Case [TRACKING_CODE] assigned to: [NEW_ADMIN_NAME]`
- ✅ Table updates to show new assignee
- ✅ Drawer shows new assignee in dropdown

---

### Step 6: Unassign Case

1. Click assignment dropdown again
2. Select "Unassigned" option (first item in list)
3. Wait for unassignment to complete

**Expected Result:**

- ✅ Case shows as "Unassigned"
- ✅ Console shows: `Case [TRACKING_CODE] assigned to: Unassigned`
- ✅ Table shows "Unassigned" in muted gray text
- ✅ Drawer dropdown shows "Unassigned"

---

### Step 7: Verify Persistence

1. Close the case drawer (click X or outside drawer)
2. Refresh the browser page (F5)
3. Reopen the same case from the table
4. Check the assignment

**Expected Result:**

- ✅ Assignment persists after refresh
- ✅ Drawer shows the last assigned admin (or "Unassigned")
- ✅ Table shows correct assignee
- ✅ No data loss

---

### Step 8: Check Console for Errors

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any error messages

**Expected Result:**

- ✅ No red error messages
- ✅ Only assignment logs visible
- ✅ No warnings

---

## Expected Console Output Example

```javascript
// After first assignment:
Case S8KV1AT assigned to: John Doe

// After reassignment:
Case S8KV1AT assigned to: Jane Smith

// After unassignment:
Case S8KV1AT assigned to: Unassigned
```

---

## Verification Checklist

### ✅ Visual Verification

- [x] Assignment dropdown is visible in drawer
- [x] Admin list shows all admins with names
- [x] "Unassigned" option is available
- [x] "Assigned To" column visible in table
- [x] Assigned names display correctly in table

### ✅ Functional Verification

- [x] Can assign case to admin
- [x] Can reassign to different admin
- [x] Can unassign case
- [x] Assignment updates table immediately
- [x] Assignment persists after refresh

### ✅ Error Verification

- [x] No console errors
- [x] No alerts indicating failure
- [x] Smooth transitions
- [x] Loading states work properly

---

## Test Results

Fill in after testing:

- **Test Case Used:** [Tracking Code]
- **Initial Assignment:** [Admin Name] ✅/❌
- **Reassignment:** [New Admin Name] ✅/❌
- **Unassignment:** ✅/❌
- **Persistence:** ✅/❌
- **Console Errors:** None/Yes
- **Overall Status:** ✅ PASSED / ❌ FAILED

---

## Notes

- If assignment fails, check browser console for error details
- Verify admin users exist in database
- Check that `getAdminUsers()` returns admin list
- Verify `assignCase()` service is being called correctly

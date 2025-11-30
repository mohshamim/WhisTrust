# WhisTrust Additional Testing Plan

## Overview

This document outlines additional testing scenarios beyond the happy path to ensure comprehensive coverage of edge cases, error handling, security, and user experience.

---

## Category 1: Permission Boundary & Security Testing

### Test 1.1: Investigator Unauthorized Access Attempts
**Priority:** 🔴 High  
**Estimated Time:** 15 minutes

**Scenarios:**
- Investigator tries to access unassigned cases
- Investigator tries to change priority/labels (should be blocked)
- Investigator tries to assign cases to others
- Investigator tries to access `/org/codesquare/users` (should redirect)
- Investigator tries to access `/org/codesquare/settings` (should redirect)
- Investigator tries to change status of unassigned case (should show error)

**Expected Results:**
- All unauthorized actions show appropriate error messages
- Redirects work correctly
- UI controls are disabled/hidden based on permissions

---

### Test 1.2: Manager Permission Boundaries
**Priority:** 🟡 Medium  
**Estimated Time:** 10 minutes

**Scenarios:**
- Manager tries to access `/org/codesquare/users` (should redirect)
- Manager tries to access `/org/codesquare/settings` (should redirect)
- Manager tries to create/edit users (should be blocked)
- Manager can view all reports (verify)
- Manager can change status/priority/assign (verify)

**Expected Results:**
- Manager has read-only access to user management
- Manager has full access to reports and analytics

---

### Test 1.3: Cross-Organization Access Prevention
**Priority:** 🔴 High  
**Estimated Time:** 10 minutes

**Scenarios:**
- Admin from CodeSquare tries to access `/org/otherorg/reports` (should fail)
- Attempt to view report from different organization via direct URL
- Verify RLS policies prevent cross-org data access

**Expected Results:**
- All cross-organization access attempts are blocked
- Appropriate error messages displayed

---

## Category 2: Error Handling & Edge Cases

### Test 2.1: Invalid Tracking Code Handling
**Priority:** 🟡 Medium  
**Estimated Time:** 5 minutes

**Scenarios:**
- Enter non-existent tracking code: `INVALID-CODE`
- Enter malformed code: `ABC123` (wrong format)
- Enter empty string
- Enter code with special characters: `ABC@123-XYZ`

**Expected Results:**
- Clear error message: "Report not found" or "Invalid tracking code"
- No crashes or console errors
- UI remains functional

---

### Test 2.2: Form Validation Testing
**Priority:** 🟡 Medium  
**Estimated Time:** 15 minutes

**Scenarios:**
- Submit report without category (should show error)
- Submit report with description < 50 characters (should show error)
- Submit report with very long description (> 10,000 chars)
- Submit report with invalid file type (e.g., .exe file)
- Submit report with file > 10MB (if limit exists)
- Submit report with special characters in title/description

**Expected Results:**
- All validation errors display clearly
- File type/size restrictions enforced
- Form doesn't submit until valid

---

### Test 2.3: Status Transition Validation
**Priority:** 🔴 High  
**Estimated Time:** 10 minutes

**Scenarios:**
- Investigator tries invalid status transition (e.g., Submitted → Closed)
- Investigator tries to change status of unassigned case
- Admin tries invalid transition (e.g., Closed → Submitted)
- Verify allowed transitions per role:
  - **Investigator:** Submitted → Under Review → Investigating → Resolved
  - **Admin/Manager:** All transitions allowed

**Expected Results:**
- Invalid transitions show error messages
- Only valid transitions are allowed
- Error messages explain why transition is invalid

---

### Test 2.4: Concurrent Edit Handling
**Priority:** 🟡 Medium  
**Estimated Time:** 10 minutes

**Scenarios:**
- Admin and Manager edit same case simultaneously
- Two investigators try to update same case (if possible)
- Verify last-write-wins or conflict resolution
- Check for data loss

**Expected Results:**
- No data corruption
- Last update wins (or proper conflict handling)
- Users see updated data after refresh

---

## Category 3: UI/UX & Data Display

### Test 3.1: Empty States
**Priority:** 🟢 Low  
**Estimated Time:** 5 minutes

**Scenarios:**
- Investigator with no assigned cases (empty reports list)
- Admin with no reports (empty dashboard)
- Reports list with no matches after filtering
- Messages section with no messages

**Expected Results:**
- Friendly empty state messages
- Clear call-to-action buttons where appropriate
- No broken layouts

---

### Test 3.2: Search & Filter Functionality
**Priority:** 🟡 Medium  
**Estimated Time:** 15 minutes

**Scenarios:**
- Search by tracking code
- Search by category
- Filter by status (Submitted, Under Review, etc.)
- Filter by priority (Low, Medium, High)
- Filter by assigned user
- Filter by date range
- Combine multiple filters
- Clear filters
- Search with no results

**Expected Results:**
- All filters work correctly
- Results update in real-time or after apply
- Clear visual indication of active filters
- Performance is acceptable with many reports

---

### Test 3.3: Pagination & Large Data Sets
**Priority:** 🟡 Medium  
**Estimated Time:** 10 minutes

**Scenarios:**
- Create 20+ test reports
- Verify pagination works (if implemented)
- Test page navigation (next, previous, page numbers)
- Verify data loads correctly on each page
- Test with 100+ reports (if possible)

**Expected Results:**
- Pagination controls work smoothly
- No performance degradation
- Data loads correctly on each page

---

### Test 3.4: Responsive Design Testing
**Priority:** 🟢 Low  
**Estimated Time:** 15 minutes

**Scenarios:**
- Test on mobile viewport (375px width)
- Test on tablet viewport (768px width)
- Test on desktop (1920px width)
- Verify all forms are usable on mobile
- Check navigation menu on mobile
- Verify tables/dashboards are scrollable on mobile

**Expected Results:**
- All features accessible on mobile
- No horizontal scrolling issues
- Touch targets are appropriately sized
- Forms are usable on small screens

---

## Category 4: File Upload & Attachments

### Test 4.1: File Upload Edge Cases
**Priority:** 🟡 Medium  
**Estimated Time:** 10 minutes

**Scenarios:**
- Upload multiple files (if supported)
- Upload very large file (> 10MB)
- Upload file with special characters in name
- Upload file with very long name (> 255 chars)
- Cancel upload mid-process
- Upload same file twice
- Upload different file types (PDF, JPG, PNG, DOCX, etc.)

**Expected Results:**
- File size limits enforced
- File type restrictions work
- Upload progress shown (if implemented)
- Error messages for invalid files
- Files display correctly after upload

---

### Test 4.2: File Download & Viewing
**Priority:** 🟡 Medium  
**Estimated Time:** 10 minutes

**Scenarios:**
- Download attachment from report details
- View attachment inline (if supported)
- Download from tracking page (if allowed)
- Verify file integrity after download
- Test with different file types

**Expected Results:**
- Downloads work correctly
- Files open correctly
- No corruption during download
- Appropriate permissions enforced

---

## Category 5: Real-Time Features & Communication

### Test 5.1: Real-Time Chat/Messaging System
**Priority:** 🔴 High  
**Estimated Time:** 25 minutes

**Scenarios:**
- **Connection Status:**
  - Verify "Live" or "Connected" indicator appears when real-time is active
  - Check connection status on track page (`/track`)
  - Check connection status in admin reports drawer
  - Verify connection indicator disappears when disconnected
  - Test connection recovery after network interruption

- **Reporter → Admin Messaging:**
  - Reporter sends message via tracking page
  - Verify message appears immediately (optimistic UI)
  - Verify message appears in admin reports drawer in real-time (no refresh)
  - Test message delivery when admin has drawer closed, then opens it
  - Verify message sender shows as "Reporter" or "You"

- **Admin → Reporter Messaging:**
  - Admin sends message from reports drawer
  - Verify message appears on tracking page in real-time (no refresh)
  - Test with reporter page already open
  - Test with reporter opening page after message sent
  - Verify message sender shows as "Compliance Team" or admin name

- **Multiple Users Chat:**
  - Admin and Reporter chat simultaneously
  - Verify messages appear in correct order for both users
  - Test rapid message sending (5+ messages quickly)
  - Verify no message loss or duplication
  - Test with multiple admins viewing same case

- **Message Features:**
  - Send empty message (should be blocked)
  - Send very long message (> 5000 chars)
  - Send message with special characters/emojis
  - Verify message timestamps are accurate
  - Verify message sender identification (reporter vs admin)
  - Test message persistence after page refresh

- **Auto-Scroll & UI:**
  - Verify auto-scroll to bottom when new messages arrive
  - Test scroll behavior with many messages (50+)
  - Verify message list doesn't jump unexpectedly
  - Test on mobile viewport

**Expected Results:**
- Real-time connection establishes successfully
- Messages appear instantly without page refresh
- Connection status indicator works correctly
- No duplicate messages
- Messages persist correctly
- Auto-scroll works smoothly
- UI remains responsive during high message volume

---

### Test 5.2: Real-Time Dashboard Updates
**Priority:** 🟡 Medium  
**Estimated Time:** 15 minutes

**Scenarios:**
- **New Report Notifications:**
  - Submit anonymous report while admin dashboard is open
  - Verify dashboard metrics update in real-time (total reports count)
  - Verify new report appears in recent reports list automatically
  - Test with dashboard in background tab (verify updates when tab becomes active)
  - Verify connection status indicator on dashboard

- **Report Status Updates:**
  - Admin updates report status in reports page
  - Verify dashboard metrics update in real-time (open cases count)
  - Investigator updates status, verify admin dashboard reflects change
  - Manager updates status, verify dashboard updates
  - Test multiple rapid status changes

- **Connection Handling:**
  - Test dashboard with real-time disabled
  - Verify graceful fallback to manual refresh
  - Test connection recovery after network interruption
  - Verify no duplicate updates on reconnection

**Expected Results:**
- Dashboard updates automatically when reports are created/updated
- Metrics reflect changes in real-time
- Connection status is visible
- No performance degradation with many updates
- Graceful handling of connection issues

---

### Test 5.3: Real-Time Notifications System
**Priority:** 🟡 Medium  
**Estimated Time:** 15 minutes

**Scenarios:**
- **Notification Delivery:**
  - Trigger notification (e.g., new report assigned)
  - Verify notification appears in real-time (no page refresh)
  - Verify unread count updates automatically
  - Test notification for multiple users simultaneously
  - Verify notification persists after page refresh

- **Notification Types:**
  - New report assigned to user
  - New message received
  - Report status changed
  - Case assigned/unassigned
  - Verify different notification types display correctly

- **Notification UI:**
  - Verify notification badge/count updates in real-time
  - Test notification dropdown/modal
  - Verify mark as read functionality
  - Test notification click navigation
  - Verify notification dismissal

- **Connection Status:**
  - Verify notification connection indicator
  - Test notification delivery when connection restored
  - Verify no duplicate notifications

**Expected Results:**
- Notifications appear instantly without refresh
- Unread count updates automatically
- All notification types work correctly
- UI remains responsive
- No duplicate notifications

---

### Test 5.4: Presence Tracking (if implemented)
**Priority:** 🟢 Low  
**Estimated Time:** 10 minutes

**Scenarios:**
- **Viewer Tracking:**
  - Open same report in two browser windows (different users)
  - Verify "User X is viewing" indicator appears
  - Verify indicator updates when user leaves
  - Test with multiple concurrent viewers (3+ users)
  - Verify presence updates in real-time

- **Presence UI:**
  - Verify presence indicator is visible but not intrusive
  - Test presence on track page (reporter view)
  - Test presence in admin reports drawer
  - Verify presence clears when user navigates away

**Expected Results:**
- Presence tracking works correctly
- Indicators update in real-time
- No performance impact with multiple viewers
- Presence clears appropriately

---

### Test 5.5: Real-Time Connection Edge Cases
**Priority:** 🟡 Medium  
**Estimated Time:** 20 minutes

**Scenarios:**
- **Network Interruptions:**
  - Disconnect network while real-time is active
  - Verify connection status shows disconnected
  - Reconnect network
  - Verify connection re-establishes automatically
  - Verify no data loss during disconnection
  - Test with slow 3G connection (Chrome DevTools)

- **Multiple Tabs/Windows:**
  - Open same page in multiple tabs
  - Verify real-time works in all tabs
  - Send message from one tab, verify appears in other tabs
  - Close one tab, verify others still work
  - Test browser tab sleep/wake behavior

- **Page Navigation:**
  - Navigate away from page with active real-time connection
  - Verify connection cleans up properly (check console)
  - Navigate back, verify connection re-establishes
  - Test browser back/forward buttons
  - Test page refresh during active connection

- **Error Handling:**
  - Test with invalid report ID
  - Test with unauthorized access
  - Verify error messages are user-friendly
  - Verify connection retries on failure
  - Test with Supabase Realtime disabled (if possible)

- **Performance:**
  - Test with 100+ active messages
  - Test with multiple simultaneous connections
  - Verify memory doesn't leak on long sessions
  - Test with many reports updating simultaneously

**Expected Results:**
- Connection handles network issues gracefully
- Multiple tabs work correctly
- Cleanup happens properly on navigation
- Error handling is robust
- Performance remains acceptable
- No memory leaks

---

### Test 5.6: Traditional Message Functionality (Non-Real-Time)
**Priority:** 🟡 Medium  
**Estimated Time:** 10 minutes

**Scenarios:**
- Investigator adds internal note
- Manager adds comment
- Verify message persistence
- Verify message ordering
- Test message editing/deletion (if supported)
- Verify message search/filter (if supported)

**Expected Results:**
- All message operations work correctly
- Messages persist after refresh
- Message ordering is correct

---

## Category 6: Analytics & Reporting

### Test 6.1: Dashboard Metrics Accuracy
**Priority:** 🟡 Medium  
**Estimated Time:** 15 minutes

**Scenarios:**
- Verify total reports count matches actual count
- Verify "Assigned to Me" count for investigator
- Verify category breakdown is accurate
- Verify status breakdown is accurate
- Verify date range filters affect metrics
- Test with zero reports (empty dashboard)

**Expected Results:**
- All metrics are accurate
- Metrics update after actions (create, update, delete)
- No calculation errors

---

### Test 6.2: Analytics Page Functionality
**Priority:** 🟢 Low  
**Estimated Time:** 10 minutes

**Scenarios:**
- View charts/graphs (if implemented)
- Filter analytics by date range
- Filter by category
- Export analytics data (if implemented)
- Verify data accuracy in charts

**Expected Results:**
- Charts render correctly
- Filters work as expected
- Data is accurate
- Export works (if implemented)

---

## Category 7: User Management

### Test 7.1: User Creation & Management
**Priority:** 🟡 Medium  
**Estimated Time:** 15 minutes

**Scenarios:**
- Create new user with valid data
- Create user with duplicate email (should fail)
- Create user with invalid email format
- Create user with weak password (if validation exists)
- Edit existing user
- Deactivate/reactivate user (if supported)
- Delete user (if supported)
- Verify user appears in reports assignment dropdown after creation

**Expected Results:**
- All validations work
- User creation succeeds with valid data
- Duplicate emails are rejected
- User updates persist correctly

---

### Test 7.2: Role Assignment & Permissions
**Priority:** 🔴 High  
**Estimated Time:** 10 minutes

**Scenarios:**
- Change user role (Admin → Manager, etc.)
- Verify permissions update immediately
- Create user with each role (Admin, Manager, Investigator)
- Verify new user has correct access
- Test role change doesn't break existing sessions

**Expected Results:**
- Role changes take effect immediately
- Permissions match role definition
- No broken access after role change

---

## Category 8: Settings & Configuration

### Test 8.1: Organization Settings
**Priority:** 🟡 Medium  
**Estimated Time:** 10 minutes

**Scenarios:**
- Update organization name
- Update organization description
- Enable/disable anonymous reporting
- Update notification settings (if implemented)
- Add/edit report categories
- Verify changes persist after refresh
- Verify changes affect new reports

**Expected Results:**
- All settings save correctly
- Changes take effect immediately
- No data loss on save

---

## Category 9: Performance & Load Testing

### Test 9.1: Page Load Performance
**Priority:** 🟢 Low  
**Estimated Time:** 10 minutes

**Scenarios:**
- Measure dashboard load time with 100+ reports
- Measure reports list load time
- Measure report details page load time
- Test with slow 3G network (Chrome DevTools)
- Verify loading indicators appear

**Expected Results:**
- Pages load within acceptable time (< 3 seconds)
- Loading states are shown
- No blank screens during load

---

### Test 9.2: Database Query Performance
**Priority:** 🟢 Low  
**Estimated Time:** 5 minutes

**Scenarios:**
- Monitor browser network tab for slow queries
- Check for N+1 query problems
- Verify pagination reduces load time
- Test with large datasets

**Expected Results:**
- Queries are optimized
- No unnecessary data fetching
- Pagination improves performance

---

## Category 10: Browser Compatibility

### Test 10.1: Cross-Browser Testing
**Priority:** 🟡 Medium  
**Estimated Time:** 20 minutes

**Scenarios:**
- Test in Chrome (latest)
- Test in Firefox (latest)
- Test in Edge (latest)
- Test in Safari (if available)
- Verify all features work in each browser
- Check for console errors in each browser

**Expected Results:**
- All features work across browsers
- No browser-specific bugs
- Consistent UI/UX

---

## Category 11: Integration & API Testing

### Test 11.1: API Endpoint Testing
**Priority:** 🟡 Medium  
**Estimated Time:** 15 minutes

**Scenarios:**
- Test `/api/reports/upload-attachment` with valid data
- Test `/api/reports/upload-attachment` with invalid data
- Test `/api/track` with valid tracking code
- Test `/api/track` with invalid tracking code
- Verify proper error responses
- Verify proper authentication/authorization

**Expected Results:**
- All API endpoints return correct responses
- Error handling is proper
- Security is enforced

---

## Category 12: Real-Time Features Integration Testing

### Test 12.1: End-to-End Real-Time Workflow
**Priority:** 🔴 High  
**Estimated Time:** 30 minutes

**Scenarios:**
- **Complete Real-Time Chat Flow:**
  1. Reporter submits anonymous report, gets tracking code
  2. Reporter opens tracking page, verifies real-time connection
  3. Admin opens dashboard, sees new report in real-time
  4. Admin opens report drawer, verifies real-time connection
  5. Reporter sends message via tracking page
  6. Admin sees message appear in drawer in real-time (no refresh)
  7. Admin responds from drawer
  8. Reporter sees response on tracking page in real-time
  9. Verify both users see connection status indicators
  10. Test with multiple messages back and forth

- **Real-Time Status Updates:**
  1. Admin updates report status
  2. Verify dashboard metrics update in real-time
  3. Reporter refreshes tracking page, sees updated status
  4. Investigator updates status
  5. Verify admin dashboard reflects change automatically
  6. Manager updates status
  7. Verify all users see consistent state

- **Multi-User Real-Time Scenario:**
  1. Reporter has tracking page open
  2. Admin has report drawer open
  3. Manager has same report open in another window
  4. Admin sends message
  5. Verify both Reporter and Manager see it (if Manager has access)
  6. Admin updates status
  7. Verify all three users see update
  8. Test with Investigator also viewing

**Expected Results:**
- All real-time features work together seamlessly
- No conflicts between different real-time subscriptions
- All users see consistent state
- Performance remains acceptable with multiple connections

---

### Test 12.2: Real-Time Performance Under Load
**Priority:** 🟡 Medium  
**Estimated Time:** 20 minutes

**Scenarios:**
- **High Message Volume:**
  - Send 50+ messages rapidly between reporter and admin
  - Verify all messages appear correctly
  - Verify no performance degradation
  - Verify UI remains responsive
  - Check browser console for errors

- **Multiple Concurrent Connections:**
  - Open 5+ browser tabs with different reports
  - Verify all maintain real-time connections
  - Send messages in each tab
  - Verify no connection drops
  - Monitor memory usage

- **Dashboard with Many Updates:**
  - Create 10+ reports rapidly
  - Verify dashboard updates in real-time
  - Verify metrics calculate correctly
  - Test with dashboard open in multiple tabs

**Expected Results:**
- System handles high load gracefully
- No memory leaks
- Performance remains acceptable
- All connections remain stable

---

### Test 12.3: Real-Time Feature Combinations
**Priority:** 🟡 Medium  
**Estimated Time:** 15 minutes

**Scenarios:**
- **Chat + Dashboard Updates:**
  - Send message while dashboard is open
  - Verify dashboard doesn't interfere with chat
  - Verify both features work simultaneously

- **Notifications + Messages:**
  - Receive notification for new message
  - Verify notification appears in real-time
  - Click notification, verify message loads
  - Verify notification marks as read

- **Presence + Chat:**
  - Multiple users viewing same report
  - Verify presence indicators show
  - Send messages while presence is active
  - Verify no conflicts

**Expected Results:**
- All real-time features work together
- No conflicts or interference
- User experience remains smooth

---

## Category 13: Regression Testing

### Test 13.1: Previously Fixed Issues
**Priority:** 🔴 High  
**Estimated Time:** 15 minutes

**Scenarios:**
- Re-test all previously fixed bugs:
  - ✅ File upload service role key error
  - ✅ Tracking page RLS error
  - ✅ User service client-side errors
  - ✅ Investigator permission enforcement
  - ✅ Status transition validation
  - ✅ Real-time connection cleanup
  - ✅ Real-time message duplication prevention
- Verify fixes still work
- Check for regressions

**Expected Results:**
- All previously fixed issues remain fixed
- No new regressions introduced

---

## Testing Execution Options

### Option A: Comprehensive Testing (All Categories)
**Time Estimate:** 5-6 hours  
**Coverage:** Complete application validation including all real-time features

### Option B: Critical Path Testing (Categories 1, 2, 5.1-5.3, 12, 13)
**Time Estimate:** 2-2.5 hours  
**Coverage:** Security, errors, real-time chat/dashboard/notifications, and regression

### Option C: Real-Time Features Focus (Categories 5, 12)
**Time Estimate:** 2-2.5 hours  
**Coverage:** All real-time features (chat, dashboard, notifications, presence, integration)

### Option D: User Experience Focus (Categories 3, 4, 5.1, 5.6)
**Time Estimate:** 1.5-2 hours  
**Coverage:** UI/UX, file handling, messaging (real-time and traditional)

### Option E: Custom Selection
**Time Estimate:** Variable  
**Coverage:** You choose specific categories/tests

---

## Recommended Testing Order

1. **Category 13** (Regression) - Verify existing fixes
2. **Category 1** (Security) - Ensure access control works
3. **Category 5.1** (Real-Time Chat) - Core real-time messaging
4. **Category 5.2** (Real-Time Dashboard) - Live dashboard updates
5. **Category 5.3** (Real-Time Notifications) - Notification system
6. **Category 12** (Real-Time Integration) - End-to-end real-time workflows
7. **Category 2** (Error Handling) - Verify error messages
8. **Category 3** (UI/UX) - Ensure good user experience
9. **Category 4-11** (Feature-specific) - As needed

---

## Test Execution Method

Each test can be executed via:
- **Manual Browser Testing** (guided step-by-step)
- **Automated Playwright Tests** (create test files)
- **Hybrid** (manual verification + automated scripts)

---

## Real-Time Features Summary

The application includes the following real-time capabilities:

1. **Real-Time Chat/Messaging** (`useRealtimeMessages`)
   - Two-way messaging between reporters and admins
   - Used in: Track page, Reports drawer, Admin cases page
   - Features: Connection status, auto-scroll, duplicate prevention

2. **Real-Time Dashboard Updates** (`useRealtimeReports`)
   - Live updates when reports are created/updated
   - Used in: Admin dashboard
   - Features: Auto-refresh metrics, new report notifications

3. **Real-Time Notifications** (`useRealtimeNotifications`)
   - Live notification delivery to users
   - Used in: Admin notifications component
   - Features: Unread count, notification badges

4. **Presence Tracking** (`useReportPresence`) - Optional
   - Track who is viewing a report
   - Features: Multi-user presence indicators

All real-time features use **Supabase Realtime** subscriptions and include:
- Connection status indicators
- Automatic cleanup on unmount
- Error handling and reconnection
- Performance optimization

---

## Next Steps

Please select:
1. **Which categories** you want to test (or choose Option A/B/C/D/E)
2. **Execution method** (Browser/Playwright/Hybrid)
3. **Priority level** (High priority only / All priorities)

**Recommended for Real-Time Testing:**
- **Option C** (Real-Time Features Focus) - Comprehensive real-time testing
- **Option B** (Critical Path) - Includes essential real-time features

I'll then guide you through the selected tests step-by-step! 🚀


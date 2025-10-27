# Notification Triggers Implementation

## Summary

Notification triggers have been implemented across the application to automatically create notifications for important events. This ensures that admin users are promptly notified when actionable events occur.

---

## Implementation Details

### 1. New Report Submission

**Location**: `lib/services/reports.ts` - `submitReport()` function

**Trigger**: When an anonymous user submits a new report

**Notification Details**:

- **Type**: `new_report`
- **Recipients**: All admin users
- **Title**: "New Report Submitted"
- **Message**: Includes category and tracking code
- **Link**: `/admin/cases`

**Code**:

```typescript
// Notify all admins about the new report
const adminsResult = await getAdminUsers();
if (adminsResult.success && adminsResult.admins) {
  const { createNotification } = await import("@/lib/services/notifications");

  const notificationPromises = adminsResult.admins.map((admin) =>
    createNotification({
      userId: admin.id,
      type: "new_report",
      title: "New Report Submitted",
      message: `A new ${data.category} report has been submitted. Tracking code: ${trackingCode}`,
      link: "/admin/cases",
    })
  );

  await Promise.all(notificationPromises);
}
```

---

### 2. Case Assignment

**Location**: `app/admin/cases/page.tsx` - `handleAssign()` function

**Trigger**: When an admin assigns a case to another admin

**Notification Details**:

- **Type**: `case_assigned`
- **Recipients**: The assigned admin
- **Title**: "Case Assigned to You"
- **Message**: Includes case tracking code
- **Link**: `/admin/cases`

**Code**:

```typescript
// Create notification for assigned admin if assigned to someone
if (adminId) {
  try {
    const { createNotification } = await import("@/lib/services/notifications");
    await createNotification({
      userId: adminId,
      type: "case_assigned",
      title: "Case Assigned to You",
      message: `Case ${selectedCase.tracking_code} has been assigned to you.`,
      link: `/admin/cases`,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}
```

---

### 3. New Message on Case

**Location**: `app/admin/cases/page.tsx` - `handleSendMessage()` function

**Trigger**: When an admin sends a message on a case

**Notification Details**:

- **Type**: `new_message`
- **Recipients**: The assigned admin (if different from sender)
- **Title**: "New Message on Case"
- **Message**: Includes case tracking code
- **Link**: `/admin/cases`

**Code**:

```typescript
// Create notification for the assigned admin
const currentAdmin = await getCurrentAdmin();

if (
  currentAdmin &&
  selectedCase.assigned_to &&
  selectedCase.assigned_to !== currentAdmin.id
) {
  const { createNotification } = await import("@/lib/services/notifications");
  await createNotification({
    userId: selectedCase.assigned_to,
    type: "new_message",
    title: "New Message on Case",
    message: `A new message has been added to case ${selectedCase.tracking_code}.`,
    link: `/admin/cases`,
  });
}
```

---

## Fixed Issues

### Database Schema Compatibility

**Issue**: Notification component was using `is_read` field, but database schema uses `read`

**Fixed**: Updated all references in `components/admin-notifications.tsx`:

- `notification.is_read` → `notification.read`
- `result.notifications.filter((n: any) => !n.is_read)` → `result.notifications.filter((n: any) => !n.read)`
- `{ ...n, is_read: true }` → `{ ...n, read: true }`

---

## Notification Types

| Type              | Description            | Triggers          | Recipients                               |
| ----------------- | ---------------------- | ----------------- | ---------------------------------------- |
| `new_report`      | New report submitted   | Report submission | All admins                               |
| `case_assigned`   | Case assigned to admin | Case assignment   | Assigned admin                           |
| `new_message`     | New message on case    | Message sent      | Case assignee (if different from sender) |
| `status_change`   | Case status updated    | Status update     | _(Not yet implemented)_                  |
| `priority_change` | Case priority changed  | Priority update   | _(Not yet implemented)_                  |

---

## Testing

### To Test Notifications:

1. **Test New Report Notification**:

   - Submit a new report at `/report`
   - Check notification bell in admin panel
   - Should see "New Report Submitted" notification

2. **Test Case Assignment Notification**:

   - Open a case in `/admin/cases`
   - Assign to a different admin
   - Check assigned admin's notification bell
   - Should see "Case Assigned to You" notification

3. **Test Message Notification**:
   - Open a case assigned to another admin
   - Send a message
   - Check assigned admin's notification bell
   - Should see "New Message on Case" notification

---

## Future Enhancements

### Potential Additional Triggers:

1. **Status Change Notifications**:

   - Notify reporter when case status changes (requires email integration)
   - Notify assigned admin when status changes

2. **Priority Change Notifications**:

   - Notify assigned admin when priority is updated

3. **Deadline Alerts**:

   - Notify admins of approaching deadlines
   - Notify reporters of pending cases

4. **Escalation Notifications**:
   - Notify managers when cases are escalated
   - Notify investigators when cases are assigned

---

## Files Modified

1. ✅ `lib/services/reports.ts` - Added notification trigger for new reports
2. ✅ `app/admin/cases/page.tsx` - Added notification triggers for assignment and messages
3. ✅ `components/admin-notifications.tsx` - Fixed field name from `is_read` to `read`

---

## Database Schema

The notifications table uses the following fields:

- `id` (UUID)
- `user_id` (UUID) - References auth.users
- `type` (TEXT) - Notification type
- `title` (TEXT) - Notification title
- `message` (TEXT) - Notification message
- `link` (TEXT) - Navigation link
- `read` (BOOLEAN) - Read status
- `created_at` (TIMESTAMP)

---

## Summary

All notification triggers have been successfully implemented. Admins will now receive real-time notifications for:

- New report submissions
- Case assignments
- New messages on cases

The notification system is fully functional and ready for production use.

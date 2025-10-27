# WhisTrust RBAC, Audit Logging & Analytics Setup

This guide covers the implementation of role-based access control, audit logging, and analytics features in WhisTrust MVP 2.

## 📋 Overview

WhisTrust now includes:

- **Role-Based Access Control (RBAC)**: Four distinct roles (Admin, Manager, Investigator, HR)
- **Audit Logging**: Comprehensive tracking of all system actions
- **Analytics Dashboard**: Insights and performance metrics
- **Notifications**: Real-time updates for important events

## 🗄️ Database Setup

### Step 1: Run the Enhanced Schema

1. Go to your Supabase Dashboard → **SQL Editor**
2. Open and run `supabase/schema-rbac-audit.sql`
3. This will create:
   - `audit_logs` table
   - `notifications` table
   - Enhanced `admin_profiles` with roles
   - Analytics views (`report_statistics`, `category_statistics`, `activity_timeline`)
   - Audit logging functions and triggers
   - Role-based RLS policies

### Step 2: Update Existing Admin Users

If you already have admin users, update their roles:

```sql
-- Update existing admin profile with role
UPDATE admin_profiles
SET role = 'admin', is_active = true
WHERE id = 'YOUR_USER_UUID';
```

### Step 3: Create Role-Based Users

Create users with different roles for testing:

```sql
-- Create Manager
INSERT INTO admin_profiles (id, full_name, role, department, is_active)
VALUES (
  'manager-uuid-here',
  'Manager User',
  'manager',
  'Compliance',
  true
);

-- Create Investigator
INSERT INTO admin_profiles (id, full_name, role, department, is_active)
VALUES (
  'investigator-uuid-here',
  'Investigator User',
  'investigator',
  'Investigations',
  true
);

-- Create HR
INSERT INTO admin_profiles (id, full_name, role, department, is_active)
VALUES (
  'hr-uuid-here',
  'HR User',
  'hr',
  'Human Resources',
  true
);
```

## 🔐 Role Permissions

| Permission       | Admin | Manager | Investigator | HR  |
| ---------------- | ----- | ------- | ------------ | --- |
| View All Reports | ✅    | ✅      | ✅           | ✅  |
| Edit Reports     | ✅    | ✅      | ✅           | ❌  |
| Assign Cases     | ✅    | ✅      | ❌           | ❌  |
| View Analytics   | ✅    | ✅      | ❌           | ❌  |
| Manage Users     | ✅    | ❌      | ❌           | ❌  |
| View Audit Logs  | ✅    | ✅      | ❌           | ❌  |

## 📊 Audit Logging

### Automatic Logging

The system automatically logs:

- Report status changes
- Case assignments
- User logins (manual logging required)
- File uploads (manual logging required)

### Manual Logging

To log custom events in your code:

```typescript
import { logAuditEvent } from "@/lib/services/audit";

// Log an action
await logAuditEvent({
  action: "report_created",
  resourceType: "report",
  resourceId: reportId,
  details: {
    trackingCode: "ABC123",
    category: "Harassment",
  },
});
```

### Viewing Audit Logs

Audit logs are accessible via the database or through the admin interface (TODO: Create audit logs UI page).

```sql
-- Query recent audit logs
SELECT * FROM audit_logs
ORDER BY created_at DESC
LIMIT 50;
```

## 📈 Analytics

### Available Statistics

The analytics system provides:

1. **Report Statistics**: Total, pending, resolved reports
2. **Category Breakdown**: Reports by type
3. **Activity Timeline**: Reports over time
4. **Average Resolution Time**: Performance metric

### Accessing Analytics

Visit `/admin/analytics` to view the analytics dashboard.

### Using Analytics Service

```typescript
import {
  getReportStatistics,
  getCategoryStatistics,
} from "@/lib/services/analytics";

// Get comprehensive stats
const stats = await getReportStatistics();

// Get category breakdown
const categories = await getCategoryStatistics();
```

## 🔔 Notifications

### Creating Notifications

```typescript
import { createNotification } from "@/lib/services/notifications";

// Create a notification for a user
await createNotification({
  userId: "user-uuid",
  type: "new_report",
  title: "New Report Submitted",
  message: "A new report has been submitted and requires review.",
  link: "/admin/cases?id=report-uuid",
});
```

### Notification Types

- `new_report`: New report submitted
- `message_reply`: Reply to a case thread
- `status_change`: Report status updated
- `assignment`: Case assigned to user
- `deadline_approaching`: Case approaching deadline

## 🎯 Integrating RBAC in Your Code

### Check User Permissions

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Check if user has a specific permission
const { data: hasPermission } = await supabase.rpc("has_permission", {
  p_permission: "edit_reports",
});

if (hasPermission) {
  // User can edit reports
}
```

### Get User Role

```typescript
const { data: role } = await supabase.rpc("get_user_role");

console.log("Current user role:", role);
```

## 🗺️ Navigation Updates

Update your admin sidebar to include new pages:

1. **Analytics** (`/admin/analytics`)
2. **Audit Logs** (`/admin/audit-logs`) - TODO
3. **Settings** (`/admin/settings`) - TODO

## 📱 Frontend Integration

### Notification Bell

Add a notification bell to your header:

```typescript
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

const { unreadCount, notifications } = useRealtimeNotifications(userId);
```

### Role-Based UI Rendering

```typescript
const { role } = useCurrentUser();

// Only show for admins and managers
{
  (role === "admin" || role === "manager") && (
    <Link href="/admin/analytics">Analytics</Link>
  );
}

// Only show for admins
{
  role === "admin" && <Link href="/admin/users">Manage Users</Link>;
}
```

## 🔄 Migration Notes

### Moving to Self-Hosted PostgreSQL

All Supabase-specific code is isolated in:

- `lib/services/audit.ts` - Audit logging
- `lib/services/notifications.ts` - Notifications
- `lib/services/analytics.ts` - Analytics queries

To migrate:

1. Replace Supabase RPC calls with direct SQL queries
2. Update Row-Level Security policies to your auth system
3. Implement notification service (WebSockets, Server-Sent Events, etc.)

### External BI Integration

The analytics views can be connected to:

- **Power BI**: Direct PostgreSQL connection
- **Tableau**: Query `report_statistics`, `category_statistics` views
- **Looker Studio**: Connect via PostgreSQL connector

## 🧪 Testing

### Test Roles

1. Create test users with each role
2. Log in with different roles
3. Verify role-based access to features
4. Check audit logs for actions

### Test Audit Logging

1. Perform actions (create report, change status)
2. Query `audit_logs` table
3. Verify all actions are logged

### Test Analytics

1. Create multiple reports with different categories
2. Visit `/admin/analytics`
3. Verify statistics are correct

## 🔒 Security Considerations

1. **RLS Policies**: All tables have Row-Level Security enabled
2. **Audit Integrity**: Audit logs are append-only (cannot be deleted)
3. **Permission Checks**: Always check permissions on server-side
4. **API Security**: Validate user role in API routes

## 📝 Next Steps

1. ✅ Run `schema-rbac-audit.sql` in Supabase
2. ✅ Update existing admin users with roles
3. ⏳ Create Audit Logs UI page
4. ⏳ Implement real-time notifications
5. ⏳ Add role-based navigation
6. ⏳ Implement CSV/PDF export functionality
7. ⏳ Add chart library for visualizations

## 🆘 Troubleshooting

### "Permission denied" errors

- Ensure user exists in `admin_profiles` table
- Check that user has `is_active = true`
- Verify role is correct

### Audit logs not appearing

- Check RLS policies on `audit_logs` table
- Verify `log_audit_event` function permissions
- Check Supabase function logs

### Analytics not loading

- Verify views exist (`report_statistics`, `category_statistics`)
- Check RLS policies on base tables
- Ensure user has analytics permission

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/functions.html)
- [Recharts Documentation](https://recharts.org/) - Recommended chart library

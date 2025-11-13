# 📋 Day 13: Audit Logs Page - Implementation Plan

**Date:** November 13, 2025  
**Feature:** Comprehensive audit trail for compliance and security  
**Status:** Starting Implementation  

---

## 🎯 **OBJECTIVES**

Create a detailed audit log system for admins to:
- Track all system activities
- Monitor user actions
- Ensure compliance and accountability
- Investigate security incidents
- Export audit trails for reporting

---

## 📋 **FEATURES TO IMPLEMENT**

### **1. Audit Log Display**
- Chronological list of all actions
- User who performed action
- Action type (create, update, delete, login, etc.)
- Resource affected (report, user, settings)
- Timestamp (with relative time)
- IP address (if available)
- Details/metadata

### **2. Filters**
- Date range picker
- Action type filter
- User filter
- Resource type filter
- Search by details

### **3. Action Types to Track**
- **Report Actions:**
  - `create_report` (online submission)
  - `create_offline_case` (admin manual entry)
  - `update_report_status`
  - `update_report_priority`
  - `assign_case`
  - `add_label`
  - `remove_label`
- **Message Actions:**
  - `send_message_admin`
  - `send_message_reporter`
- **Attachment Actions:**
  - `upload_attachment`
  - `download_attachment`
  - `delete_attachment`
- **User Actions:**
  - `login`
  - `logout`
  - `create_user`
  - `update_user`
  - `delete_user`
- **Settings Actions:**
  - `update_organization_settings`
  - `update_branding`

### **4. Display Format**
- Table view with sortable columns
- Expandable row for detailed metadata
- Color-coded action types
- User avatars
- Resource links (click to view)

### **5. Export Options**
- Export filtered logs as CSV
- Export as PDF (optional)
- Date range selection for export

---

## 🗄️ **DATABASE SCHEMA**

The `audit_logs` table already exists from migration:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields We'll Use:**
- `id` - Unique identifier
- `organization_id` - Tenant isolation
- `user_id` - Who performed the action
- `action` - What was done
- `resource_type` - What type (report, user, etc.)
- `resource_id` - Which specific item
- `details` - Additional metadata (JSON)
- `created_at` - When it happened

---

## 📁 **FILES TO CREATE/MODIFY**

### **1. Audit Logs Page:**
```
app/org/[subdomain]/audit-logs/page.tsx
```

### **2. Audit Logs Service:**
```
lib/services/audit-logs.ts
```
- `getAuditLogs(organizationId, filters)`
- `getAuditLogById(id)`
- `exportAuditLogsCSV(logs)`

### **3. Audit Log Helper:**
```
lib/utils/audit-helpers.ts
```
- `getActionLabel(action)` - Human-readable action names
- `getActionIcon(action)` - Icon for each action type
- `getActionColor(action)` - Color coding
- `formatAuditDetails(details)` - Pretty-print JSON details

---

## 🔄 **IMPLEMENTATION STEPS**

### **Step 1: Create Audit Service** (15 min)
- Fetch audit logs with filters
- Join with admin_profiles for user info
- Date range filtering
- Pagination support

### **Step 2: Create Helper Utilities** (10 min)
- Action labels mapping
- Icon selection
- Color scheme
- Details formatter

### **Step 3: Build Audit Page** (30 min)
- Table layout
- Filter controls
- User display
- Action badges

### **Step 4: Add Details Drawer** (20 min)
- Expandable row details
- JSON viewer for metadata
- Resource links

### **Step 5: Add Export** (10 min)
- CSV export with all fields
- Include filtered results only

### **Step 6: Test** (15 min)
- Load audit data
- Test filters
- Verify sorting
- Test export

**Total Estimated Time:** 1.5 hours

---

## 🎨 **UI DESIGN**

### **Page Layout:**
```
/org/[subdomain]/audit-logs
├── Header (Title + Filters)
│   ├── Date Range Picker
│   ├── Action Type Filter
│   ├── User Filter
│   └── Export Button
├── Audit Logs Table
│   ├── Timestamp
│   ├── User (with avatar)
│   ├── Action (badge with icon)
│   ├── Resource Type
│   ├── Details (expandable)
│   └── View Details Button
└── Pagination (if needed)
```

### **Action Badge Colors:**
- 🟢 Create actions: Green
- 🔵 Update actions: Blue
- 🟠 Login/Logout: Orange
- 🔴 Delete actions: Red
- 🟡 Assignment: Yellow

---

## 🔒 **PERMISSIONS**

From `lib/permissions.ts`:
- ✅ Admin: Full access to all audit logs
- ✅ Manager: View audit logs (read-only)
- ❌ Investigator: No access to audit logs

Only users with `canViewAuditLogs` permission can access this page.

---

## 🎯 **SUCCESS CRITERIA**

- ✅ Page loads without errors
- ✅ All audit logs display
- ✅ Filters work correctly
- ✅ User names display (joined from admin_profiles)
- ✅ Action badges color-coded
- ✅ Details expand/collapse
- ✅ CSV export downloads
- ✅ Pagination works (if many logs)
- ✅ Permissions enforced
- ✅ Mobile-responsive

---

## 📊 **EXAMPLE AUDIT ENTRIES**

```json
{
  "action": "create_offline_case",
  "user": "AISAR Admin",
  "resource_type": "report",
  "resource_id": "abc-123",
  "details": {
    "case_number": "AIS-000013",
    "category": "safety",
    "source": "phone_call",
    "created_by": "AISAR Admin"
  },
  "created_at": "2025-11-13T16:30:00Z"
}
```

---

## 🚀 **READY TO START!**

Beginning with Step 1: Audit Logs Service...

---

*Starting Day 13 Implementation - November 13, 2025*


# 🚀 Complete Implementation Plan - 3 Weeks

**Start Date:** November 13, 2025  
**Target:** Implement ALL demo features + Multi-tenant adaptations + Planned enhancements  
**Timeline:** 3 weeks (21 days)

---

## 📋 **SCOPE:**

### **From Demo System:**
- ✅ Two-way messaging with real-time
- ✅ Case assignment
- ✅ Priority management
- ✅ Labels/tags system
- ✅ Notifications
- ✅ RBAC (Admin/Manager/Investigator/HR)
- ✅ File upload & storage
- ✅ Case details drawer
- ✅ Success page
- ✅ Analytics dashboard
- ✅ Audit logs
- ✅ Users management

### **Multi-Tenant Adaptations:**
- ✅ Organization-scoped data
- ✅ Organization-specific users
- ✅ Subdomain routing
- ✅ Organization branding

### **Planned Enhancements (From Earlier Discussions):**
- ✅ Branding management (colors, logos)
- ✅ Usage limits & plan defaults
- ✅ Default admin creation
- ✅ Rate limiting & security
- ✅ Offline case entry
- ✅ Email notifications (optional)

---

## 🗓️ **WEEK 1: Foundation & Core Features**

### **Day 1 (Monday) - Database Schema & File Storage**

#### **Morning: Database Schema Updates**
**Tasks:**
1. Update `supabase/migrations/001_organizations_schema.sql`:
   - Add `messages` table
   - Add `notifications` table
   - Add `report_attachments` table
   - Add `report_labels` table
   - Add columns to `reports`:
     - `assigned_to` (UUID, FK to admin_profiles)
     - `assigned_at` (TIMESTAMP)
     - `priority` (ENUM: low, medium, high, critical)
     - `source` (ENUM: online, offline, phone, email)
     - `submitted_by` (ENUM: anonymous, admin)
   - Add RLS policies for new tables

**SQL Schema:**
```sql
-- Messages table for two-way communication
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('reporter', 'admin')),
  content TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_profiles(id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_report', 'assignment', 'new_message', 'status_change')),
  resource_id UUID,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report attachments
CREATE TABLE report_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES admin_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report labels/tags
CREATE TABLE report_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  label_name TEXT NOT NULL,
  label_color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_profiles(id)
);

-- Add columns to reports table
ALTER TABLE reports 
  ADD COLUMN assigned_to UUID REFERENCES admin_profiles(id),
  ADD COLUMN assigned_at TIMESTAMPTZ,
  ADD COLUMN priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  ADD COLUMN source TEXT CHECK (source IN ('online', 'offline', 'phone', 'email')) DEFAULT 'online',
  ADD COLUMN submitted_by TEXT CHECK (submitted_by IN ('anonymous', 'admin')) DEFAULT 'anonymous';
```

#### **Afternoon: File Storage Service**
**Files to Create:**
1. `lib/services/storage.ts` - File upload/download service
2. Update `app/api/reports/submit/route.ts` - Handle file uploads
3. Update `app/org/[subdomain]/report/page.tsx` - Wire up file upload

**Features:**
- Upload to Supabase Storage
- Progress bar tracking
- Download files
- File size validation
- MIME type checking
- Organization-scoped buckets

---

### **Day 2 (Tuesday) - Messaging Service & Success Page**

#### **Morning: Messaging Service**
**Files to Create:**
1. `lib/services/messages.ts` - Message CRUD operations
   ```typescript
   - getReportMessages(reportId)
   - sendReporterMessage(reportId, content)
   - sendAdminMessage(reportId, content, userId)
   - markMessagesAsRead(reportId, userId)
   ```

2. `hooks/use-realtime-messages.ts` - Real-time Supabase hook
   ```typescript
   - useRealtimeMessages({ reportId, onNewMessage, enabled })
   - Returns: { isConnected }
   - Subscribes to Supabase Realtime channel
   ```

#### **Afternoon: Success Page**
**Files to Create:**
1. `app/org/[subdomain]/success/page.tsx` - Success page after submission
   - Display tracking code
   - Copy button with "Code Copied!" feedback
   - "What happens next?" info
   - "Track My Case" button
   - Session storage integration

2. Update `app/org/[subdomain]/report/page.tsx` - Redirect to success
3. Update `app/api/reports/submit/route.ts` - Store tracking code

---

### **Day 3 (Wednesday) - Track Page Messaging**

#### **Full Day: Track Page Two-Way Messaging**
**Files to Update:**
1. `app/org/[subdomain]/track/page.tsx` - Add messaging UI
   - Message list with history
   - Reporter message input
   - Send button
   - Real-time updates
   - Connection indicator
   - Auto-scroll to latest
   - Timestamp formatting
   - Different styling for reporter vs admin messages

**Features:**
- Load message history
- Send new messages
- Real-time message updates
- Connection status
- Empty state handling
- URL parameter support (`?code=ABC123`)

---

### **Day 4 (Thursday) - Case Details Drawer**

#### **Full Day: Admin Case Details Drawer**
**Files to Update:**
1. `app/org/[subdomain]/reports/page.tsx` - Add drawer
   - Sheet component (right side)
   - Full case details view
   - Status dropdown
   - Priority dropdown
   - Assignment dropdown (stub for now)
   - Internal notes textarea
   - Messages section (placeholder)
   - Attachments section (placeholder)
   - Update/Save buttons

**Layout:**
```
┌─────────────────────┐
│ Case #COD-000001    │
│ Status: [Dropdown]  │
│ Priority: [Dropdown]│
│ Assigned: [Select]  │
├─────────────────────┤
│ Description         │
│ ...                 │
├─────────────────────┤
│ Internal Notes      │
│ [Textarea]          │
├─────────────────────┤
│ Messages (3)        │
│ [Message list]      │
│ [Send input]        │
├─────────────────────┤
│ Attachments (2)     │
│ [File list]         │
└─────────────────────┘
```

---

### **Day 5 (Friday) - Admin Drawer Messaging & Files**

#### **Morning: Messaging in Drawer**
**Files to Update:**
1. `app/org/[subdomain]/reports/page.tsx` - Wire up messaging
   - Load messages when drawer opens
   - Display message history
   - Admin message input
   - Send as admin
   - Real-time updates
   - Auto-scroll

#### **Afternoon: File Attachments in Drawer**
**Files to Update:**
1. `app/org/[subdomain]/reports/page.tsx` - Wire up attachments
   - Load attachments list
   - Display file info (name, size, type)
   - Download button
   - Use `storage.ts` service

**Testing:**
- Submit report with file
- View in admin drawer
- Download file
- Send messages both ways
- Real-time message sync

---

## 🗓️ **WEEK 2: Assignment, Priority, Labels & Notifications**

### **Day 6 (Monday) - Case Assignment**

#### **Morning: Assignment Component**
**Files to Create:**
1. `components/ui/case-assignment-select.tsx` - Assignment dropdown
   - Load admin users from organization
   - Current assignment display
   - Unassign option
   - Update assignment
   - Audit log entry

2. `lib/services/assignments.ts` - Assignment operations
   ```typescript
   - getAdminUsers(organizationId)
   - assignCase(reportId, userId)
   - unassignCase(reportId)
   ```

#### **Afternoon: Integration**
**Files to Update:**
1. `app/org/[subdomain]/reports/page.tsx` - Add to drawer
2. `app/org/[subdomain]/reports/[id]/page.tsx` - Add to detail page
3. Update audit logs to track assignments

---

### **Day 7 (Tuesday) - Priority Management**

#### **Morning: Priority Component**
**Files to Create:**
1. `components/ui/priority-badge.tsx` - Priority badge display
   - Low: blue
   - Medium: yellow
   - High: orange
   - Critical: red
   - Icon + text

#### **Afternoon: Priority Integration**
**Files to Update:**
1. `app/org/[subdomain]/reports/page.tsx` - Priority filter & badges
2. `app/org/[subdomain]/reports/[id]/page.tsx` - Priority dropdown
3. `app/org/[subdomain]/dashboard/page.tsx` - Show priority in stats

---

### **Day 8 (Wednesday) - Labels/Tags System**

#### **Full Day: Labels Feature**
**Files to Create:**
1. `components/ui/labels-input.tsx` - Labels management
   - Popover with label list
   - Add new label
   - Remove label
   - Color picker
   - Command palette for search

2. `lib/services/labels.ts` - Labels operations
   ```typescript
   - getLabelsForReport(reportId)
   - addLabel(reportId, name, color)
   - removeLabel(labelId)
   - updateLabel(labelId, data)
   ```

**Files to Update:**
1. `app/org/[subdomain]/reports/page.tsx` - Add labels to drawer
2. Display labels in reports list

---

### **Day 9 (Thursday) - Notifications System**

#### **Morning: Notifications Service**
**Files to Create:**
1. `lib/services/notifications.ts` - Notification operations
   ```typescript
   - getUserNotifications(userId)
   - createNotification(data)
   - markAsRead(notificationId)
   - markAllAsRead(userId)
   - getUnreadCount(userId)
   ```

2. `components/admin-notifications.tsx` - Notification bell
   - Bell icon with badge count
   - Dropdown with notification list
   - Mark as read
   - Click to navigate to resource

#### **Afternoon: Real-time Notifications**
**Files to Create:**
1. `hooks/use-realtime-notifications.ts` - Real-time notification hook
   - Subscribe to user's notifications
   - Update count in real-time
   - Toast on new notification

**Files to Update:**
1. Add notification bell to header in all admin pages
2. Create notifications on:
   - New report submitted
   - Case assigned to user
   - New message received
   - Status changed

---

### **Day 10 (Friday) - RBAC & Permissions**

#### **Morning: User Role Hook**
**Files to Create:**
1. `hooks/use-user-role.ts` - Role management
   ```typescript
   - useUserRole()
   - Returns: { role, hasPermission, permissions }
   - Permissions enum: VIEW_CASES, UPDATE_CASES, DELETE_CASES, etc.
   ```

2. `lib/utils/permissions.ts` - Permission definitions
   ```typescript
   - ADMIN: all permissions
   - MANAGER: department cases, assign, update
   - INVESTIGATOR: assigned cases only, update
   - HR: harassment/discrimination cases, update
   ```

#### **Afternoon: RBAC Integration**
**Files to Update:**
1. `app/org/[subdomain]/reports/page.tsx` - Filter by role
   - Admin: all cases
   - Manager: department cases
   - Investigator: assigned cases
   - HR: specific categories

2. Update `admin_profiles` table to include `department` column
3. Add role-based UI hiding (buttons, dropdowns)

---

## 🗓️ **WEEK 3: Analytics, Audit Logs, Users & Enhancements**

### **Day 11 (Monday) - Offline Case Entry**

#### **Full Day: Admin Case Creation**
**Files to Create:**
1. `components/admin-create-case-form.tsx` - Offline case form
   - Category dropdown
   - Description textarea
   - Source selection (offline/phone/email)
   - Priority selection
   - Reporter name/email (optional)
   - Department selection
   - Auto-assign option

**Files to Update:**
1. `app/org/[subdomain]/reports/page.tsx` - Add "Create Report" button
2. `app/api/reports/create-admin/route.ts` - API for admin submission
3. Audit log: track admin-submitted reports

---

### **Day 12 (Tuesday) - Analytics Dashboard**

#### **Full Day: Analytics Page**
**Files to Create:**
1. `app/org/[subdomain]/analytics/page.tsx` - Analytics dashboard
   - Reports over time chart (line)
   - Category breakdown (pie)
   - Status distribution (bar)
   - Priority distribution (donut)
   - Resolution time metrics
   - Top categories table
   - Date range filter
   - Export to CSV/PDF

**Libraries:**
- Install: `recharts` for charts
- Install: `date-fns` for date handling
- Install: `jspdf` for PDF export (optional)

**Charts:**
1. Reports Trend (Last 30 days)
2. Category Breakdown
3. Status Pipeline
4. Average Resolution Time
5. Reports by Department (if RBAC)

---

### **Day 13 (Wednesday) - Audit Logs**

#### **Full Day: Audit Logs Page**
**Files to Create:**
1. `app/org/[subdomain]/audit-logs/page.tsx` - Audit log viewer
   - Table with all audit entries
   - Filters: date range, user, action type
   - Search by entity ID
   - Export to CSV
   - Pagination

**Files to Update:**
1. Ensure all actions create audit logs:
   - Report submitted
   - Status changed
   - Priority changed
   - Case assigned
   - Message sent
   - Label added/removed
   - User login/logout

**Columns:**
- Timestamp
- User (admin who performed action)
- Action type
- Entity type (report, user, etc.)
- Entity ID
- Details (JSON)

---

### **Day 14 (Thursday) - Users Management**

#### **Full Day: Users Page**
**Files to Create:**
1. `app/org/[subdomain]/users/page.tsx` - Users management
   - List all admin users in organization
   - Add new user
   - Edit user (name, role, department, status)
   - Deactivate user
   - Reset password
   - Role dropdown
   - Department dropdown

**Features:**
- Create new admin user
- Send invitation email (optional)
- Edit profile
- Change role
- Activate/deactivate
- View user activity stats

**Table Columns:**
- Name
- Email
- Role
- Department
- Status (Active/Inactive)
- Last login
- Actions

---

### **Day 15 (Friday) - Branding Management**

#### **Full Day: Organization Branding**
**Files to Create:**
1. `app/org/[subdomain]/settings/branding/page.tsx` - Branding settings
   - Primary color picker
   - Logo upload
   - Favicon upload
   - Preview before save
   - Reset to defaults

**Files to Update:**
1. `lib/services/branding.ts` - Branding operations
   ```typescript
   - updateOrgColors(orgId, colors)
   - uploadLogo(orgId, file)
   - uploadFavicon(orgId, file)
   - getBranding(orgId)
   ```

2. Update organizations table:
   - Add `branding_colors` (JSONB)
   - Add `logo_url` (TEXT)
   - Add `favicon_url` (TEXT)

3. Apply branding dynamically:
   - CSS variables for colors
   - Logo in header
   - Favicon in head

---

### **Day 16 (Monday) - Usage Limits & Plans**

#### **Morning: Plan Configuration**
**Files to Create:**
1. `app/superadmin/organizations/new/page.tsx` - Update form
   - Plan dropdown with defaults
   - Auto-populate usage limits on plan selection
   - Override option with warning

2. `lib/config/plans.ts` - Plan definitions
   ```typescript
   export const PLANS = {
     free: { reports: 50, users: 2, storage: 100 },
     starter: { reports: 500, users: 10, storage: 1000 },
     professional: { reports: 5000, users: 50, storage: 10000 },
     enterprise: { reports: -1, users: -1, storage: -1 }
   };
   ```

#### **Afternoon: Plan Features Matrix**
**Files to Create:**
1. `supabase/migrations/002_plan_features.sql` - Features table
   ```sql
   CREATE TABLE plan_features (
     id UUID PRIMARY KEY,
     plan_name TEXT NOT NULL,
     feature_key TEXT NOT NULL,
     is_enabled BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. Feature toggles:
   - `messaging` - Two-way messaging
   - `file_uploads` - File attachments
   - `analytics` - Analytics dashboard
   - `audit_logs` - Audit log access
   - `branding` - Custom branding
   - `rbac` - Role-based access
   - `notifications` - Real-time notifications

---

### **Day 17 (Tuesday) - Default Admin Creation**

#### **Full Day: Automated Admin Setup**
**Files to Update:**
1. `app/api/organizations/create/route.ts` - Create org + admin
   - When organization is created, auto-create first admin
   - Generate random secure password
   - Create auth.users entry
   - Create admin_profiles entry
   - Send email with credentials (optional)
   - Or show credentials in success modal

2. `app/superadmin/organizations/new/page.tsx` - Success modal
   - Show generated credentials
   - Copy credentials button
   - Print credentials option
   - Email to organization contact

**Flow:**
1. Super admin creates organization
2. System auto-generates first admin user
3. Email: `admin@{subdomain}.{domain}`
4. Password: Random secure (16 chars)
5. Show credentials to super admin
6. Send email to org contact (optional)

---

### **Day 18 (Wednesday) - Security Enhancements**

#### **Morning: Rate Limiting**
**Files to Create:**
1. `lib/middleware/rate-limiter.ts` - Rate limiting logic
   - Login attempts: 5 per 15 minutes
   - Report submissions: 10 per hour per IP
   - API calls: 100 per minute per user
   - Use Redis or Supabase for tracking

2. Update API routes with rate limiting:
   - `/api/auth/login`
   - `/api/reports/submit`
   - `/api/reports/track`

#### **Afternoon: Account Security**
**Files to Update:**
1. `app/org/[subdomain]/login/page.tsx` - Account lockout
   - Track failed attempts
   - Lock after 5 failures
   - Unlock after 15 minutes
   - Send email notification

2. `lib/services/auth-security.ts` - Security operations
   ```typescript
   - trackLoginAttempt(email, success)
   - isAccountLocked(email)
   - unlockAccount(email)
   - sendSecurityAlert(email, reason)
   ```

---

### **Day 19 (Thursday) - Subdomain Security (Optional)**

#### **Morning: Random Subdomain Suffix**
**Files to Update:**
1. `app/superadmin/organizations/new/page.tsx` - Add option
   - Checkbox: "Add security suffix"
   - Auto-append random 6-char string
   - Example: `aisar-x7k9q2`

#### **Afternoon: Two-Factor Authentication (Optional)**
**Files to Create:**
1. `app/org/[subdomain]/settings/security/page.tsx` - 2FA setup
   - Enable/disable 2FA
   - QR code for TOTP app
   - Backup codes
   - Verify setup

2. `lib/services/two-factor.ts` - 2FA operations
   - Generate secret
   - Generate QR code
   - Verify token
   - Generate backup codes

**Libraries:**
- Install: `speakeasy` for TOTP
- Install: `qrcode` for QR generation

---

### **Day 20 (Friday) - Email Notifications (Optional)**

#### **Full Day: Email Integration**
**Files to Create:**
1. `lib/services/email.ts` - Email service
   - Integration with SendGrid/Resend/Postmark
   - Email templates
   - Queue emails

2. Email templates:
   - Welcome email (new admin)
   - Report submitted confirmation
   - Assignment notification
   - New message notification
   - Status change notification
   - Password reset

**Files to Update:**
1. Send emails on:
   - Report submitted (to admins)
   - Case assigned (to assignee)
   - New message (to other party)
   - Status changed (to reporter if email provided)

**Environment Variables:**
- `EMAIL_SERVICE_API_KEY`
- `EMAIL_FROM_ADDRESS`
- `EMAIL_FROM_NAME`

---

### **Day 21 (Saturday) - Testing & Polish**

#### **Morning: End-to-End Testing**
**Test Flows:**
1. **Reporter Flow:**
   - Submit report with file
   - Get tracking code
   - Track report
   - Send message
   - Receive reply
   - Download file

2. **Admin Flow:**
   - Login as different roles
   - View dashboard
   - Filter reports
   - Assign case
   - Set priority
   - Add labels
   - Send message
   - Update status
   - View analytics
   - Check audit logs
   - Manage users

3. **Super Admin Flow:**
   - Create organization
   - Set branding
   - Configure plan
   - View all orgs

#### **Afternoon: Polish & Cleanup**
**Tasks:**
1. Fix any linting errors
2. Add loading states
3. Add error handling
4. Add empty states
5. Responsive design check
6. Dark mode check
7. Performance optimization
8. Remove console.logs
9. Update documentation
10. Create user guides

---

## 📊 **DELIVERABLES SUMMARY**

### **Database:**
- ✅ `messages` table
- ✅ `notifications` table
- ✅ `report_attachments` table
- ✅ `report_labels` table
- ✅ `plan_features` table (optional)
- ✅ Updated `reports` table
- ✅ Updated `organizations` table
- ✅ Updated `admin_profiles` table

### **Services:**
- ✅ `storage.ts` - File operations
- ✅ `messages.ts` - Messaging
- ✅ `notifications.ts` - Notifications
- ✅ `labels.ts` - Labels
- ✅ `assignments.ts` - Case assignment
- ✅ `branding.ts` - Branding
- ✅ `email.ts` - Email (optional)
- ✅ `two-factor.ts` - 2FA (optional)
- ✅ `auth-security.ts` - Security

### **Hooks:**
- ✅ `use-realtime-messages.ts`
- ✅ `use-realtime-notifications.ts`
- ✅ `use-user-role.ts`

### **Components:**
- ✅ `priority-badge.tsx`
- ✅ `case-assignment-select.tsx`
- ✅ `labels-input.tsx`
- ✅ `admin-notifications.tsx`
- ✅ `admin-create-case-form.tsx`

### **Pages (Tenant):**
- ✅ `/org/[subdomain]/report` - Enhanced with file upload
- ✅ `/org/[subdomain]/success` - NEW
- ✅ `/org/[subdomain]/track` - Enhanced with messaging
- ✅ `/org/[subdomain]/dashboard` - Enhanced with stats
- ✅ `/org/[subdomain]/reports` - Enhanced with drawer
- ✅ `/org/[subdomain]/reports/[id]` - Enhanced detail page
- ✅ `/org/[subdomain]/analytics` - NEW
- ✅ `/org/[subdomain]/audit-logs` - NEW
- ✅ `/org/[subdomain]/users` - NEW
- ✅ `/org/[subdomain]/settings/branding` - NEW
- ✅ `/org/[subdomain]/settings/security` - NEW (optional)

### **Pages (Super Admin):**
- ✅ Enhanced organization creation

### **Features:**
- ✅ Two-way messaging with real-time
- ✅ File upload & storage
- ✅ Case assignment
- ✅ Priority management
- ✅ Labels/tags
- ✅ Notifications
- ✅ RBAC
- ✅ Offline case entry
- ✅ Analytics dashboard
- ✅ Audit logs
- ✅ Users management
- ✅ Branding management
- ✅ Usage limits & plans
- ✅ Default admin creation
- ✅ Rate limiting
- ✅ Account lockout
- ✅ Random subdomain suffix (optional)
- ✅ 2FA (optional)
- ✅ Email notifications (optional)

---

## 🚀 **START IMMEDIATELY?**

**Which day should we start with?**

**Option A:** Day 1 (Database Schema + File Storage) ⭐ **RECOMMENDED**
**Option B:** Day 2 (Messaging Service + Success Page)
**Option C:** Day 6 (Case Assignment)
**Option D:** Other - tell me which feature you want first

---

**My recommendation:** Start with **Day 1** to build the foundation, then proceed sequentially! 💪

Ready to begin? Say "start Day 1" and I'll start implementing immediately! 🚀


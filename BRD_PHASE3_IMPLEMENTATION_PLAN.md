# BRD Phase 3 Implementation Plan - WhisTrust MVP 3.0

**Status**: Schema and encryption foundation complete ✅  
**Remaining**: Service updates, UI components, and integration

---

## ✅ Completed

1. **Database Schema** (`supabase/schema-phase3.sql`)

   - Extended `reports` table with: assigned_to, priority, source, submitted_by
   - Created `report_labels` table for custom tags
   - Added audit triggers for assignments and priority changes
   - Created notifications enriched view

2. **TypeScript Types** (`lib/types/database.ts`)

   - Updated Report interface with Phase 3 fields
   - Added ReportLabel interface
   - Added NewAdminReport type for offline submissions

3. **Encryption Utilities** (`lib/utils/encryption.ts`)

   - Client-side AES encryption/decryption functions
   - Report-specific encryption keys
   - Graceful handling of legacy unencrypted data

4. **Dependencies**
   - Installed crypto-js for encryption

---

## 🚧 Remaining Work

### 1. Message Encryption Integration

**File**: `lib/services/messages.ts`

**Changes needed**:

```typescript
import { encryptMessage, decryptMessage } from "@/lib/utils/encryption";

// When sending a message
export async function sendMessage(data: NewMessage): Promise<MessageResponse> {
  const supabase = createServerClient();

  // BRD Phase 3: Encrypt content before storing
  const encryptedContent = encryptMessage(data.content, data.report_id);

  const { data: message, error } = await supabase
    .from("messages")
    .insert({ ...data, content: encryptedContent })
    .select()
    .single();

  // ... rest of implementation
}

// When fetching messages
export async function getMessages(reportId: string): Promise<MessageResponse> {
  // ... fetch messages ...

  // BRD Phase 3: Decrypt messages for display
  const decryptedMessages =
    messages?.map((msg) => ({
      ...msg,
      content: decryptMessage(msg.content, reportId),
    })) || [];

  return { success: true, messages: decryptedMessages };
}
```

**Pages to update**:

- `app/track/page.tsx` - Decrypt messages on display
- `app/admin/cases/page.tsx` - Decrypt admin-view messages

---

### 2. Case Assignment Service

**File**: `lib/services/reports.ts`

**Add new function**:

```typescript
/**
 * BRD Phase 3: Assign a case to an admin user
 */
export async function assignCase(
  reportId: string,
  adminId: string
): Promise<ServiceResponse> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("reports")
    .update({
      assigned_to: adminId,
      assigned_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Trigger notification to assigned user
  await createNotification({
    user_id: adminId,
    type: "assignment",
    title: "Case Assigned",
    message: "You have been assigned to a new case",
    link: `/admin/cases?id=${reportId}`,
  });

  return { success: true };
}
```

**Get admin users for assignment dropdown**:

```typescript
export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("is_active", true);

  return data || [];
}
```

---

### 3. Offline Case Entry

**File**: `lib/services/reports.ts`

**Add function**:

```typescript
/**
 * BRD Phase 3: Create a report manually submitted by admin
 * Used for offline, phone, or email submissions
 */
export async function createAdminReport(
  data: NewAdminReport
): Promise<ReportResponse> {
  const supabase = createServerClient();

  const trackingCode = generateTrackingCode();

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      tracking_code: trackingCode,
      ...data,
      submitted_by: "admin",
      source: data.source,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Log audit event
  await logAuditEvent({
    action: "admin_report_created",
    resourceType: "report",
    resourceId: report.id,
    details: { source: data.source, tracking_code: trackingCode },
  });

  return { success: true, report };
}
```

**UI Component**: Create "Add Case" button in `app/admin/cases/page.tsx`

---

### 4. Labels Service

**File**: `lib/services/labels.ts` (NEW)

```typescript
import { createServerClient } from "@/lib/supabase/server";
import type { ReportLabel } from "@/lib/types/database";

export async function getLabelsForReport(
  reportId: string
): Promise<ReportLabel[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("report_labels")
    .select("*")
    .eq("report_id", reportId);

  return data || [];
}

export async function addLabel(
  reportId: string,
  label: string,
  color: string = "#9ca3af"
): Promise<void> {
  const supabase = createServerClient();
  await supabase
    .from("report_labels")
    .insert({ report_id: reportId, label, color });
}

export async function removeLabel(
  reportId: string,
  labelId: string
): Promise<void> {
  const supabase = createServerClient();
  await supabase.from("report_labels").delete().eq("id", labelId);
}
```

---

### 5. UI Components

#### A. Notification Bell (`components/admin-notifications.tsx`)

- Display unread count badge
- Dropdown with recent notifications
- Mark as read functionality
- Realtime updates via Supabase subscription

#### B. Case Assignment Dropdown

- Add to `app/admin/cases/page.tsx` case details drawer
- List of active admins for selection
- Update assignment on change

#### C. Priority Badge Component

- Color-coded priority display
- Add to cases table and details

#### D. Labels Input Component

- Multi-tag input for labels
- Color selection
- Add/remove labels

#### E. Offline Case Form

- Modal/drawer with report form
- Source selection (offline/phone/email)
- Submit to createAdminReport

---

## 📋 Testing Checklist

- [ ] Messages encrypt on send
- [ ] Messages decrypt on display
- [ ] Legacy unencrypted messages display correctly
- [ ] Case assignment works and triggers notification
- [ ] Offline case creation works
- [ ] Labels can be added/removed
- [ ] Priority updates reflect in UI
- [ ] Audit logs capture all Phase 3 actions
- [ ] Notifications display in realtime
- [ ] All filters (priority, labels, assignment) work

---

## 🚀 Deployment Steps

1. **Database Migration**

   ```sql
   -- Run in Supabase SQL Editor
   \i supabase/schema-phase3.sql
   ```

2. **Environment Variables**

   ```env
   NEXT_PUBLIC_ENCRYPTION_KEY=your-secure-key-here
   ```

3. **Build & Test**

   ```bash
   npm run build
   npm run dev
   ```

4. **Deploy to Vercel**
   - Push to GitHub
   - Vercel auto-deploys

---

## 📝 Notes

- All Phase 3 features are marked with `// BRD Phase 3` comments for traceability
- Backward compatible with existing data
- Encryption is transparent to users
- Audit trail captures all new actions
- UI follows existing design patterns

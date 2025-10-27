# Realtime Enhancements Guide

This document explains the realtime messaging and file upload security features added to WhisTrust MVP 1.

## 🎯 Overview

The platform now supports:

- **Realtime messaging** between reporters and admins
- **Secure file uploads** with metadata cleaning
- **Live dashboard updates** for admins

## 🔄 Realtime Messaging

### How It Works

Realtime messaging uses Supabase Realtime subscriptions to instantly update messages across all clients without manual refresh.

#### Architecture

```
Reporter Client                    Supabase Realtime               Admin Client
      |                                    |                           |
      |--- Send Message ---->              |                           |
      |                                    |-- Broadcast to all ------>
      |<--- New Message added ------------ |  subscribers              |
      |                                    | <--- New Message added ---|
```

### Implementation

1. **Custom Hook**: `hooks/use-realtime-messages.ts`

   - Subscribes to message inserts for a specific report
   - Automatically handles connection cleanup
   - Provides connection status

2. **Track Page** (`app/track/page.tsx`)

   - Uses the hook to listen for new messages
   - Auto-scrolls to bottom when new messages arrive
   - Shows "Live" indicator when connected

3. **Send Messages**
   - Sends message via API
   - Message appears automatically via realtime subscription
   - No manual refresh needed

### Usage Example

```typescript
// Enable realtime for a report
const { isConnected } = useRealtimeMessages({
  reportId: caseData.reportId,
  onNewMessage: (message) => {
    // Add new message to UI
    setMessages((prev) => [...prev, message]);
  },
  enabled: !!caseData.reportId,
});

// Send a message
await sendMessage({
  report_id: reportId,
  sender_type: "reporter",
  content: "My message text",
});
```

### Security

- **RLS (Row-Level Security)**: Only users with access to the report can subscribe
- **Filtered subscriptions**: Each client only receives messages for their specific report
- **Automatic cleanup**: Subscriptions are cleaned up on component unmount

## 📁 File Upload Security

### Storage Structure

Files are stored in a private bucket with this structure:

```
report-attachments/
  └── reports/
      └── {reportId}/
          └── attachments/
              └── {timestamp}_{filename}
```

### Implementation

#### Upload Service (`lib/services/storage.ts`)

```typescript
// Upload a file
const result = await uploadFile({
  reportId: "uuid-here",
  file: selectedFile,
  onProgress: (progress) => console.log(`${progress}% complete`),
});

if (result.success) {
  // File uploaded successfully
  console.log("File path:", result.filePath);
}
```

#### Access Control

1. **Private Bucket**: All files are stored in a private bucket (not public)
2. **Signed URLs**: Generate temporary signed URLs for viewing/downloading
3. **Expiration**: URLs expire after 1 hour for security

```typescript
// Get a temporary download URL
const urlResult = await getFileUrl(filePath, 3600); // 1 hour expiry
if (urlResult.success) {
  window.open(urlResult.url);
}
```

### Metadata Cleaning

All uploaded files are processed through an Edge Function to remove sensitive metadata.

#### Edge Function (`supabase/functions/clean-metadata/index.ts`)

**What gets removed:**

- EXIF data (GPS coordinates, camera settings, timestamps)
- Author information
- Document metadata
- Other potentially identifying information

**TODO**: Current implementation is a placeholder. For production:

1. **Images**: Use `sharp` library to strip EXIF data
2. **PDFs**: Use `pdf-lib` to remove metadata
3. **Excel/Word**: Use appropriate libraries to clean metadata

**Migration Note**: The Edge Function can be replaced with:

- Azure Functions (for Saudi Arabia hosting)
- AWS Lambda
- Self-hosted serverless function

## 📊 Live Dashboard Updates

### How It Works

The admin dashboard automatically updates when:

- New reports are submitted
- Report statuses change
- Cases are resolved

#### Implementation

```typescript
// In app/admin/dashboard/page.tsx
const { isConnected } = useRealtimeReports({
  onNewReport: (report) => {
    // Update stats
    setStats((prev) => ({
      ...prev,
      totalReports: prev.totalReports + 1,
      openCases: prev.openCases + 1,
    }));

    // Add to recent cases
    setRecentCases((prev) => [report, ...prev.slice(0, 4)]);
  },
  onReportUpdate: (report) => {
    // Update status counters
    // ...
  },
});
```

### Visual Indicators

- **"Live" badge**: Shows when connected to realtime
- **Animated pulse**: Green radio icon pulses when live
- **Automatic updates**: Stats and lists update without refresh

## 🔒 Security Considerations

### Realtime Subscriptions

1. **RLS Policies**: Ensure RLS is enabled on `messages` and `reports` tables
2. **Row-level filtering**: Only subscribe to rows the user has access to
3. **Authentication**: Verify user is authenticated before subscribing

### File Uploads

1. **Private bucket**: Never use public buckets for sensitive files
2. **Access control**: Use signed URLs with expiration
3. **File validation**: Check file type and size before upload
4. **Metadata cleaning**: Always clean metadata before storing

### Example RLS Policy

```sql
-- Messages table
CREATE POLICY "Users can view messages for their reports"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE reports.id = messages.report_id
    -- Add your access logic here
  )
);
```

## 🧪 Testing

### Test Realtime Messaging

1. Open reporter tracking page with a valid tracking code
2. Open admin dashboard in another tab
3. Send a message from reporter
4. Message should appear instantly in admin view

### Test File Uploads

1. Upload a file through the report form
2. Check Supabase Storage for the file
3. Verify file is in `reports/{reportId}/attachments/` path
4. Generate signed URL and verify access

### Test Dashboard Updates

1. Open admin dashboard
2. Check "Live" badge is visible
3. Submit a new report from another tab
4. Dashboard should update automatically

## 🚀 Performance Optimization

### Debouncing

To prevent excessive updates, consider debouncing rapid changes:

```typescript
import { useDebouncedCallback } from "use-debounce";

const debouncedUpdate = useDebouncedCallback((data) => {
  setState(data);
}, 300);
```

### Memory Management

- Subscriptions are automatically cleaned up on unmount
- Use `enabled` flag to pause subscriptions when not needed
- Filter subscriptions to only relevant data

## 🔄 Migration Notes

### If Moving to Self-Hosted PostgreSQL

1. **Realtime**: Replace Supabase Realtime with:

   - Socket.io
   - WebSockets
   - Server-Sent Events (SSE)

2. **File Storage**: Replace Supabase Storage with:

   - Azure Blob Storage
   - AWS S3
   - Local filesystem

3. **Edge Functions**: Replace with:
   - Azure Functions
   - AWS Lambda
   - Self-hosted API

### Code Changes Required

All Supabase-specific code is isolated in:

- `lib/services/storage.ts` (file uploads)
- `hooks/use-realtime-messages.ts` (realtime messages)
- `hooks/use-realtime-reports.ts` (realtime reports)

Only these files need to be updated for migration.

## 📝 Additional Notes

- Realtime connections automatically reconnect if dropped
- Messages are persisted in the database before broadcast
- File uploads support progress tracking
- All async operations have proper error handling

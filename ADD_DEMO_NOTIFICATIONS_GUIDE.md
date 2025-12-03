# 🔔 Add Demo Notifications Guide

## 🎯 Purpose

Add sample notifications to the demo organization so the notifications dropdown shows data instead of "No notifications".

---

## 🚀 Quick Steps

### **Step 1: Run SQL in Supabase**

1. Go to: **Supabase SQL Editor**
   - https://supabase.com/dashboard/project/lyboxkxohvxkcolgrumw/sql/new

2. **Copy and paste this SQL:**

```sql
-- Add demo notifications
INSERT INTO notifications (user_id, organization_id, type, title, message, link, is_read, created_at)
SELECT 
  ap.id as user_id,
  o.id as organization_id,
  'new_report' as type,
  'New Report Submitted' as title,
  'A new fraud report has been submitted and requires your attention.' as message,
  '/org/demo/reports' as link,
  false as is_read,
  NOW() - INTERVAL '5 minutes' as created_at
FROM organizations o
CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin'
LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, title, message, link, is_read, created_at)
SELECT ap.id, o.id, 'assignment', 'Case Assigned to You',
  'You have been assigned to investigate Report #WTR-2024-0042.',
  '/org/demo/reports', false, NOW() - INTERVAL '2 hours'
FROM organizations o CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin' LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, title, message, link, is_read, created_at)
SELECT ap.id, o.id, 'message', 'New Message from Reporter',
  'Anonymous reporter has sent a new message on Report #WTR-2024-0041.',
  '/org/demo/reports', false, NOW() - INTERVAL '30 minutes'
FROM organizations o CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin' LIMIT 1;

INSERT INTO notifications (user_id, organization_id, type, title, message, link, is_read, created_at)
SELECT ap.id, o.id, 'alert', 'High Priority Report',
  'A critical report requires immediate attention.',
  '/org/demo/reports', false, NOW() - INTERVAL '15 minutes'
FROM organizations o CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin' LIMIT 1;

-- Verify
SELECT COUNT(*) as total, SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) as unread
FROM notifications n
JOIN organizations o ON n.organization_id = o.id
WHERE o.subdomain = 'demo';
```

3. **Click "Run"**

4. **Expected Result:**
   - Total: 4
   - Unread: 4

---

### **Step 2: Refresh the Demo Dashboard**

1. Go to: **http://localhost:3000/org/demo/dashboard**
2. Click the **bell icon** in top-right corner
3. **You should now see:**
   - 🔴 Badge showing "4" unread
   - 📋 "New Report Submitted" (5 min ago)
   - 💬 "New Message from Reporter" (30 min ago)
   - 📌 "Case Assigned to You" (2 hours ago)
   - 🚨 "High Priority Report" (15 min ago)

---

## 📋 Sample Notifications Added

| Icon | Type | Title | Status | Time |
|------|------|-------|--------|------|
| 📋 | New Report | New Report Submitted | Unread | 5 min ago |
| 💬 | Message | New Message from Reporter | Unread | 30 min ago |
| 📌 | Assignment | Case Assigned to You | Unread | 2 hours ago |
| 🚨 | Alert | High Priority Report | Unread | 15 min ago |

---

## 🎨 Notification Types

The component supports these notification types with different icons:

- **`new_report`** → 📌 (New submission)
- **`assignment`** → 📋 (Case assigned)
- **`message`** → 💬 (New message)
- **`status_change`** → 🔄 (Status updated)
- **`alert`** → 🚨 (High priority)
- **`system`** → 📌 (System updates)

---

## ✅ Features Demonstrated

After adding notifications, you can demo:

1. ✅ **Unread Badge** - Shows count (e.g., "4")
2. ✅ **Notification List** - Scrollable dropdown
3. ✅ **Click to Mark Read** - Click unread notification
4. ✅ **Mark All Read** - Button at top
5. ✅ **Auto-Refresh** - Polls every 30 seconds
6. ✅ **Timestamps** - Shows relative time
7. ✅ **Visual Indicators** - Blue dot for unread

---

## 🔄 To Add More Notifications

Copy this template and modify:

```sql
INSERT INTO notifications (user_id, organization_id, type, title, message, link, is_read, created_at)
SELECT ap.id, o.id, 
  'TYPE_HERE',  -- new_report, message, assignment, alert, system, status_change
  'TITLE HERE',
  'MESSAGE HERE',
  '/org/demo/reports',
  false,  -- or true for read
  NOW() - INTERVAL 'TIME'  -- '5 minutes', '2 hours', '1 day'
FROM organizations o CROSS JOIN admin_profiles ap
WHERE o.subdomain = 'demo' AND ap.organization_id = o.id AND ap.role = 'admin' LIMIT 1;
```

---

## 🗑️ To Clear Demo Notifications

```sql
-- Delete all demo notifications
DELETE FROM notifications n
USING organizations o
WHERE n.organization_id = o.id AND o.subdomain = 'demo';
```

---

## 📁 Files Created

1. **`supabase/ADD_DEMO_NOTIFICATIONS.sql`** - Automated script with DO block
2. **`supabase/ADD_DEMO_NOTIFICATIONS_SIMPLE.sql`** - Simple INSERT statements
3. **`ADD_DEMO_NOTIFICATIONS_GUIDE.md`** - This guide

---

## 🐛 Troubleshooting

### "No notifications" still showing:

1. ✅ Check SQL ran successfully (no errors)
2. ✅ Verify demo org exists: `SELECT * FROM organizations WHERE subdomain = 'demo'`
3. ✅ Verify demo admin exists: `SELECT * FROM admin_profiles WHERE organization_id = [demo_org_id]`
4. ✅ Hard refresh page (Ctrl+Shift+R)
5. ✅ Check browser console for errors

### Wrong user seeing notifications:

- Make sure you're logged in as the demo admin user
- Notifications are user-specific

---

**Ready to add notifications?** Run the SQL and refresh the page! 🚀


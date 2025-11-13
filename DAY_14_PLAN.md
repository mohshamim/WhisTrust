# 👥 Day 14: Users Management - Implementation Plan

**Date:** November 13, 2025  
**Feature:** Complete user/admin management system  
**Status:** Starting Implementation  

---

## 🎯 **OBJECTIVES**

Create a full-featured user management system for tenant admins to:
- View all organization users
- Create new admin accounts
- Edit user roles and departments
- Deactivate/Delete users
- Manage permissions
- Track user activity

---

## 📋 **FEATURES TO IMPLEMENT**

### **1. Users List Page**
- Table view of all users
- Display: Name, Email, Role, Department, Status, Last Login
- Search by name/email
- Filter by role
- Filter by status (active/inactive)
- Sort by name, role, last login

### **2. Create User**
- Modal/Form to add new user
- Fields:
  - Full Name
  - Email
  - Role (Admin, Manager, Investigator)
  - Department
  - Password (auto-generated or manual)
- Send invitation email (optional)
- Create in `auth.users` + `admin_profiles`

### **3. Edit User**
- Update name, role, department
- Change status (active/inactive)
- Reset password
- Update permissions

### **4. Delete User**
- Soft delete (mark as inactive)
- Hard delete (remove from database)
- Confirmation modal
- Create audit log entry

### **5. User Details**
- View full profile
- Activity history
- Cases assigned
- Recent actions
- Last login info

### **6. Bulk Actions** (Optional)
- Select multiple users
- Bulk role change
- Bulk department change
- Bulk deactivate

---

## 🗄️ **DATABASE TABLES**

### **Existing Schema:**

```sql
-- auth.users (Supabase Auth)
-- Managed by Supabase

-- admin_profiles
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'investigator')),
  department VARCHAR(100),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📁 **FILES TO CREATE/MODIFY**

### **1. Users Management Page:**
```
app/org/[subdomain]/users/page.tsx
```

### **2. Users Service:**
```
lib/services/users.ts
```
- `getOrganizationUsers(organizationId)`
- `createUser(organizationId, userData)`
- `updateUser(userId, userData)`
- `deleteUser(userId)`
- `toggleUserStatus(userId, isActive)`
- `resetUserPassword(userId)`

### **3. API Routes:**
```
app/api/users/create/route.ts
app/api/users/[id]/update/route.ts
app/api/users/[id]/delete/route.ts
```

---

## 🔄 **IMPLEMENTATION STEPS**

### **Step 1: Create Users Service** (20 min)
- CRUD operations for admin_profiles
- Create auth.users entries
- Update operations
- Soft/hard delete

### **Step 2: Create API Routes** (25 min)
- POST /api/users/create
- PUT /api/users/[id]/update
- DELETE /api/users/[id]/delete
- Validation and error handling

### **Step 3: Build Users List Page** (30 min)
- Table layout
- Filters and search
- Role badges
- Status indicators

### **Step 4: Create User Modal** (20 min)
- Form with validation
- Role selection
- Department input
- Submit handler

### **Step 5: Edit User Modal** (20 min)
- Load existing data
- Update form
- Save changes

### **Step 6: Delete Confirmation** (10 min)
- Confirmation dialog
- Soft vs hard delete option
- Audit log creation

### **Step 7: Test** (15 min)
- Create test user
- Update user
- Deactivate user
- Delete user
- Verify audit logs

**Total Estimated Time:** 2.5 hours

---

## 🎨 **UI DESIGN**

### **Page Layout:**
```
/org/[subdomain]/users
├── Header (Title + Actions)
│   ├── Search Bar
│   ├── Filter by Role
│   ├── Filter by Status
│   └── "Add User" Button
├── Users Table
│   ├── Avatar
│   ├── Name & Email
│   ├── Role (badge)
│   ├── Department
│   ├── Status (active/inactive)
│   ├── Last Login
│   └── Actions (Edit, Delete)
└── Modals
    ├── Create User Modal
    ├── Edit User Modal
    └── Delete Confirmation
```

### **Role Badges:**
- 🔵 Admin: Blue badge
- 🟢 Manager: Green badge
- 🟡 Investigator: Yellow badge

### **Status Indicators:**
- ✅ Active: Green dot
- ❌ Inactive: Gray dot

---

## 🔒 **PERMISSIONS**

From `lib/permissions.ts`:
- ✅ Admin: Full user management (create, edit, delete)
- ❌ Manager: View only (no create/edit/delete)
- ❌ Investigator: No access

Only users with `canManageUsers` permission can:
- Create new users
- Edit existing users
- Delete/deactivate users

---

## ⚠️ **VALIDATION RULES**

### **Email:**
- Must be valid email format
- Must be unique within organization
- Cannot be changed after creation

### **Role:**
- Must be one of: admin, manager, investigator
- Cannot change own role (prevent lock-out)

### **Password:**
- Minimum 8 characters
- At least 1 uppercase
- At least 1 number
- At least 1 special character

### **Delete:**
- Cannot delete self
- Cannot delete if user has active cases assigned
- Show warning if user has audit trail

---

## 🎯 **SUCCESS CRITERIA**

- ✅ Page loads without errors
- ✅ All users display in table
- ✅ Search and filters work
- ✅ Create user modal opens
- ✅ New user appears in table
- ✅ Edit user updates data
- ✅ Delete confirmation works
- ✅ Permissions enforced
- ✅ Audit logs created for all actions
- ✅ Mobile-responsive

---

## 📊 **EXAMPLE USER ENTRY**

```typescript
{
  id: "user-123",
  email: "manager@aisar.com",
  full_name: "John Doe",
  role: "manager",
  department: "Operations",
  is_active: true,
  last_login_at: "2025-11-13T10:30:00Z",
  created_at: "2025-11-01T09:00:00Z"
}
```

---

## 🚀 **READY TO START!**

Beginning with Step 1: Users Service...

---

*Starting Day 14 Implementation - November 13, 2025*


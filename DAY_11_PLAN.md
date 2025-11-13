# 📝 Day 11: Offline Case Entry - Implementation Plan

**Date:** November 13, 2025  
**Status:** Starting Implementation  
**Estimated Time:** 2-3 hours

---

## 🎯 **Feature Overview:**

Allow admins to manually create cases when they receive reports through:
- Phone calls ☎️
- In-person meetings 🤝
- Email submissions 📧
- Walk-ins 🚶
- Written complaints 📄

---

## 🏗️ **What We're Building:**

### **1. Backend: Create Case API**
**File:** `app/api/reports/create/route.ts`

**Endpoint:** `POST /api/reports/create`

**Features:**
- Authenticate admin user
- Validate organization access
- Generate case number & tracking code
- Set `source` to "offline"
- Set `submitted_by` to admin ID
- Create case with all fields
- Return case details

**Fields:**
- category ✅
- title ✅
- description ✅
- priority (default: medium)
- reporter_email (optional)
- reporter_phone (optional)
- source: "offline"
- submitted_by: admin_id
- is_anonymous: true/false

---

### **2. Frontend: Create Case Page**
**File:** `app/org/[subdomain]/reports/create/page.tsx`

**UI Components:**
1. **Header:**
   - Shield icon
   - "Create New Case"
   - "Manually record a report from offline sources"

2. **Form Card:**
   - Category dropdown (7 options)
   - Title input
   - Description textarea
   - Priority dropdown (4 levels)
   - Source dropdown (phone, in-person, email, walk-in, written)
   - Reporter Information section:
     - Checkbox: "Reporter provided contact info"
     - Email input (conditional)
     - Phone input (conditional)
   - Internal Notes textarea

3. **Action Buttons:**
   - "Create Case" (primary)
   - "Cancel" (secondary)

**Design:**
- Match exact design from demo system
- Card-based layout
- Proper validation
- Loading states
- Success feedback

---

### **3. Navigation Update**
**File:** `components/client-sidebar.tsx`

Add "Create Case" link under Reports section:
```typescript
{
  title: "Create Case",
  url: "/org/[subdomain]/reports/create",
  icon: PlusCircle,
  isActive: pathname === `/org/${subdomain}/reports/create`,
}
```

---

## 📋 **Implementation Steps:**

### **Step 1: Create API Route** ⏳
- [ ] Create `app/api/reports/create/route.ts`
- [ ] Implement authentication
- [ ] Add validation
- [ ] Generate case number & tracking code
- [ ] Insert into database
- [ ] Return response

### **Step 2: Create Frontend Page** ⏳
- [ ] Create `app/org/[subdomain]/reports/create/page.tsx`
- [ ] Build form with all fields
- [ ] Add validation logic
- [ ] Implement submit handler
- [ ] Add success/error handling
- [ ] Style to match demo

### **Step 3: Update Navigation** ⏳
- [ ] Add "Create Case" link to sidebar
- [ ] Add PlusCircle icon import
- [ ] Test navigation

### **Step 4: Testing** ⏳
- [ ] Test form validation
- [ ] Test case creation
- [ ] Test with contact info
- [ ] Test without contact info
- [ ] Verify case appears in reports list
- [ ] Verify tracking code works

---

## 🎨 **Design Requirements:**

**Match Demo System:**
- Card-based layout ✅
- Proper spacing ✅
- Clean typography ✅
- Validation messages ✅
- Loading states ✅

**Form Fields:**
- Required: Category, Title, Description
- Optional: Reporter email, Reporter phone, Internal notes
- Auto-filled: Priority (medium), Source (selectable)

---

## ✅ **Success Criteria:**

1. ✅ Admin can create cases manually
2. ✅ All fields save correctly
3. ✅ Case number auto-generates
4. ✅ Tracking code auto-generates
5. ✅ Case appears in reports list
6. ✅ Source is marked as "offline"
7. ✅ submitted_by links to admin
8. ✅ Form validation works
9. ✅ Success feedback shows
10. ✅ Redirects after creation

---

**Let's build this! 🚀**


# Quick Role-Based Testing Checklist
**All Demo Users Ready - Start Testing Now!**

---

## ✅ **Your Demo Users (Confirmed in Database):**

| Email | Name | Role | Department |
|-------|------|------|------------|
| ahmed.admin@whistrust.com | Ahmed Al-Rashid | admin | - |
| hassan.hr@whistrust.com | Hassan Al-Khalifa | manager | HR |
| omar.finance@whistrust.com | Omar Abdullah | manager | Finance |
| yusuf.investigator@whistrust.com | Yusuf Ibrahim | investigator | Compliance |
| faisal.it@whistrust.com | Faisal Al-Shehri | manager | IT |

**All passwords:** Follow pattern `[Role]@WhistTrust2025`

---

## 🚀 **START TESTING - Follow This Order:**

---

### **TEST 1: Admin Login (2 minutes)**

1. Go to: `http://localhost:3000/admin/login`
2. Login:
   - Email: `ahmed.admin@whistrust.com`
   - Password: `Admin@WhistTrust2025`
3. **Check:**
   - [ ] ✅ Logged in successfully
   - [ ] ✅ Redirected to dashboard
   - [ ] ✅ See "Welcome back, Admin" or similar
   - [ ] ✅ See all sidebar options (Dashboard, Cases, Analytics, Audit, Users)

---

### **TEST 2: Admin - View All Cases (1 minute)**

1. Click "All Cases" in sidebar
2. **Check:**
   - [ ] ✅ Can see ALL cases (any department)
   - [ ] ✅ Table loads with data
   - [ ] ✅ Can click to open case details

---

### **TEST 3: Admin - User Management (1 minute)**

1. Click "Users" in sidebar
2. **Check:**
   - [ ] ✅ Page loads (no "Access Denied")
   - [ ] ✅ See all 5 demo users listed
   - [ ] ✅ **CRITICAL:** Only Admin should access this page

---

### **TEST 4: Manager (HR) Login (2 minutes)**

1. **Logout** from Admin
2. Go to: `http://localhost:3000/admin/login`
3. Login:
   - Email: `hassan.hr@whistrust.com`
   - Password: `Manager@WhistTrust2025`
4. **Check:**
   - [ ] ✅ Logged in successfully
   - [ ] ✅ Redirected to dashboard
   - [ ] ✅ See Manager name in sidebar

---

### **TEST 5: Manager (HR) - Department Filtering (CRITICAL - 3 minutes)**

1. Click "All Cases" in sidebar
2. **Check:**
   - [ ] ✅ See ONLY HR department cases
   - [ ] ❌ Should NOT see Finance, IT, or Compliance cases
   
**To fully test:**
   - Login as Admin
   - Create a test case and assign to Finance department
   - Logout, login as Hassan (HR Manager)
   - **Finance case should NOT be visible** ✅

**This is the most critical RBAC test!**

---

### **TEST 6: Manager (HR) - User Management Blocked (1 minute)**

1. Still logged in as Hassan (HR Manager)
2. Try to go to: `http://localhost:3000/admin/users`
3. **Check:**
   - [ ] ✅ Shows "Access Denied" page
   - [ ] ✅ Cannot access user management
   - [ ] **CRITICAL:** Managers cannot manage users

---

### **TEST 7: Manager (HR) - Can Assign Within Department (2 minutes)**

1. Click on any HR case
2. Open assignment dropdown
3. **Check:**
   - [ ] ✅ Can see users from HR department
   - [ ] ❌ Should NOT see users from other departments
   - [ ] ✅ Can assign case to HR team member

---

### **TEST 8: Manager (Finance) - Different Department (2 minutes)**

1. **Logout** from HR Manager
2. Login:
   - Email: `omar.finance@whistrust.com`
   - Password: `Manager@WhistTrust2025`
3. Click "All Cases"
4. **Check:**
   - [ ] ✅ See ONLY Finance cases
   - [ ] ❌ Should NOT see HR, IT cases
   - [ ] ✅ Different cases than HR manager saw

---

### **TEST 9: Investigator - Limited Access (2 minutes)**

1. **Logout** from Finance Manager
2. Login:
   - Email: `yusuf.investigator@whistrust.com`
   - Password: `Investigator@WhistTrust2025`
3. **Check Sidebar:**
   - [ ] ✅ See: Dashboard, Cases, Settings
   - [ ] ❌ Should NOT see: Analytics, Audit Logs, Users
4. Click "All Cases"
5. **Check:**
   - [ ] ✅ See ONLY assigned cases
   - [ ] ❌ Empty if no cases assigned yet

---

### **TEST 10: Investigator - Cannot Assign Cases (1 minute)**

1. Have Admin assign a case to Yusuf
2. Login as Yusuf, open the assigned case
3. **Check Assignment Section:**
   - [ ] ✅ Assignment dropdown is disabled OR hidden
   - [ ] ❌ Cannot reassign case
   - [ ] **CRITICAL:** Investigator cannot assign cases

---

### **TEST 11: Investigator - Restricted Pages (1 minute)**

Try accessing:
1. `http://localhost:3000/admin/analytics`
2. `http://localhost:3000/admin/audit-logs`
3. `http://localhost:3000/admin/users`

**All should show:**
- [ ] ✅ "Access Denied" page

---

### **TEST 12: Manager (IT) - Third Department Check (1 minute)**

1. **Logout** from Investigator
2. Login:
   - Email: `faisal.it@whistrust.com`
   - Password: `Manager@WhistTrust2025`
3. Click "All Cases"
4. **Check:**
   - [ ] ✅ See ONLY IT cases
   - [ ] ❌ Should NOT see HR, Finance, Compliance cases

---

## 🎯 **CRITICAL RBAC TESTS SUMMARY:**

| Test | What to Verify | Expected Result |
|------|----------------|-----------------|
| **Admin** | View all cases | ✅ Sees ALL departments |
| **Admin** | User management | ✅ Has access |
| **Manager (HR)** | View cases | ✅ ONLY HR cases |
| **Manager (HR)** | User management | ❌ Access Denied |
| **Manager (Finance)** | View cases | ✅ ONLY Finance cases |
| **Manager (IT)** | View cases | ✅ ONLY IT cases |
| **Investigator** | View cases | ✅ ONLY assigned |
| **Investigator** | Analytics | ❌ Access Denied |
| **Investigator** | Assign cases | ❌ Cannot assign |

---

## ⏱️ **Estimated Time: 15-20 minutes**

---

## 📊 **Results Template:**

After testing, fill this out:

```
✅ Admin - Full Access: [PASS/FAIL]
✅ Manager (HR) - Department Filter: [PASS/FAIL]
✅ Manager (Finance) - Department Filter: [PASS/FAIL]
✅ Manager (IT) - Department Filter: [PASS/FAIL]
✅ Investigator - Limited Access: [PASS/FAIL]
✅ RBAC Restrictions: [PASS/FAIL]
✅ Cross-department Isolation: [PASS/FAIL]

Critical Issues Found: [List any issues]
```

---

## 🐛 **If You Find Issues:**

Let me know:
1. Which test failed
2. What happened vs what was expected
3. Any error messages

I'll help fix immediately!

---

**Start with TEST 1 now!** Go to `http://localhost:3000/admin/login` and login as Ahmed (Admin)! 🚀


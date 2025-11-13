# 🔑 WhisTrust - Quick Credentials Reference

## 📋 **All Login Credentials**

| Portal          | URL                                                                 | Email                         | Password             | Role         | Notes              |
| --------------- | ------------------------------------------------------------------- | ----------------------------- | -------------------- | ------------ | ------------------ |
| **Super Admin** | [/superadmin/login](http://localhost:3000/superadmin/login)         | `sup-adm@whistrust.com`       | `sup-pass-adm!1@3#5` | Super Admin  | Full system access |
| **CodeSquare**  | [/org/codesquare/login](http://localhost:3000/org/codesquare/login) | `admin@codesquare.com`        | _[Ask admin]_        | Admin        | Professional plan  |
| **CodeSquare**  | [/org/codesquare/login](http://localhost:3000/org/codesquare/login) | `investigator@codesquare.com` | _[Ask admin]_        | Investigator | Limited access     |
| **AISAR**       | [/org/aisar/login](http://localhost:3000/org/aisar/login)           | `admin@aisar.com`             | _[Ask admin]_        | Admin        | Enterprise plan    |
| **AISAR**       | [/org/aisar/login](http://localhost:3000/org/aisar/login)           | `manager@aisar.com`           | _[Ask admin]_        | Manager      | User management    |
| **AISAR**       | [/org/aisar/login](http://localhost:3000/org/aisar/login)           | `hr@aisar.com`                | _[Ask admin]_        | HR           | Reports access     |

---

## 🎯 **Quick Start Testing**

### **Step 1: Test Super Admin**

```
URL:      http://localhost:3000/superadmin/login
Email:    sup-adm@whistrust.com
Password: sup-pass-adm!1@3#5
```

✅ Should see 2 organizations, 5 users

### **Step 2: Test AISAR Portal**

```
URL:      http://localhost:3000/org/aisar/login
Email:    admin@aisar.com
Password: [Your password]
```

✅ Should see 3 users, Enterprise plan, 50 max users

### **Step 3: Test CodeSquare Portal**

```
URL:      http://localhost:3000/org/codesquare/login
Email:    admin@codesquare.com
Password: [Your password]
```

✅ Should see 2 users, Professional plan, 15 max users

### **Step 4: Check Diagnostic**

```
URL: http://localhost:3000/diagnostic
```

✅ Should show 2 organizations: AISAR & CodeSquare

---

## ⚠️ **Important Testing Notes**

1. **Client Passwords:** CodeSquare and AISAR user passwords were set during user creation in Supabase. Ask the administrator for these passwords.

2. **Incognito Mode:** Use incognito/private mode when testing multiple users to avoid session conflicts.

3. **Known Limitations:**

   - ❌ Reports functionality NOT yet implemented (Phase 3)
   - ❌ Cannot add users from UI yet
   - ❌ Analytics shows placeholder
   - ✅ Everything else should work!

4. **Browser Cache:** If you see errors, clear browser cache (Ctrl+Shift+Delete)

---

## 📊 **What to Test**

### ✅ **Must Test:**

- [ ] All 3 login portals work
- [ ] Super Admin can see all organizations
- [ ] AISAR portal shows only AISAR data (3 users)
- [ ] CodeSquare portal shows only CodeSquare data (2 users)
- [ ] Dashboards show correct metrics
- [ ] Navigation works in all portals
- [ ] Logout works
- [ ] Cannot access other organization's data

### ⚠️ **Expected to NOT Work:**

- Reports submission/management
- User creation from UI
- Analytics charts
- Notifications
- File uploads

---

## 🐛 **Report Bugs To:**

Include:

- Steps to reproduce
- Expected vs actual behavior
- Screenshots
- Browser & OS version

---

## 📁 **Detailed Testing Guide**

For comprehensive testing scenarios and detailed instructions, see:

- **`TESTER_GUIDE.md`** - Full testing guide with 15 test scenarios
- **`CREDENTIALS_FOR_TESTER.txt`** - Plain text credentials

---

## 🚀 **Support**

If stuck:

1. Check `PROJECT_STATUS_AND_NEXT_STEPS.md` for what's implemented
2. Try diagnostic page: http://localhost:3000/diagnostic
3. Clear browser cache and try again

**Happy Testing!** 🧪

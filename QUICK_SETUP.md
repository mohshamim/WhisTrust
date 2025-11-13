# 🚀 Quick Setup Guide - CodeSquare & Al-Bawani

**Fixed SQL script ready to run!**

---

## ✅ **STEP 1: Run the SQL Script**

1. Open your **Production Supabase** project
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open `reset_and_setup_organizations.sql`
5. Copy **ALL** the SQL code
6. Paste into Supabase SQL Editor
7. Click **Run** (or `Ctrl+Enter`)

---

## ✅ **STEP 2: Verify Success**

After running, you should see in the Results:

```
Success. No rows returned
```

This is NORMAL! The script deletes old data and creates new organizations.

---

## ✅ **STEP 3: Check Organizations Created**

Run this query separately to verify:

```sql
SELECT 
    id,
    name,
    slug,
    subdomain,
    status,
    plan,
    primary_contact_email
FROM organizations
ORDER BY name;
```

**Expected Result:**
```
2 rows:
- Al-Bawani    | al-bawani  | al-bawani  | active | enterprise   | admin@al-bawani.com
- CodeSquare   | codesquare | codesquare | active | professional | admin@codesquare.com
```

---

## ✅ **STEP 4: Check Users Created**

Run this query:

```sql
SELECT 
    ap.email,
    ap.full_name,
    ap.role,
    o.name as organization
FROM admin_profiles ap
JOIN organizations o ON ap.organization_id = o.id
WHERE ap.is_super_admin = false
ORDER BY o.name, ap.role;
```

**Expected Result:**
```
5 rows:
- admin@al-bawani.com        | Al-Bawani Administrator | admin        | Al-Bawani
- hr@al-bawani.com           | Fatima Al-Rashid        | hr           | Al-Bawani
- manager@al-bawani.com      | Ahmed Al-Mahmoud        | manager      | Al-Bawani
- admin@codesquare.com       | CodeSquare Administrator| admin        | CodeSquare
- investigator@codesquare.com| Sarah Johnson           | investigator | CodeSquare
```

---

## 🧪 **STEP 5: Test Logins**

### **Test 1: CodeSquare Admin**
```
URL: http://localhost:3000/org/codesquare/login
Email: admin@codesquare.com
Password: CodeSquare@2024
```

### **Test 2: Al-Bawani Admin**
```
URL: http://localhost:3000/org/al-bawani/login
Email: admin@al-bawani.com
Password: AlBawani@2024
```

### **Test 3: Super Admin (Check Both Orgs)**
```
URL: http://localhost:3000/superadmin/login
Email: sup-adm@whistrust.com
Password: sup-pass-adm!1@3#5
```

**Expected:** Super Admin should see both organizations in the dashboard!

---

## 📋 **ALL CREDENTIALS**

### **CodeSquare**
- **Admin:** `admin@codesquare.com` / `CodeSquare@2024`
- **Investigator:** `investigator@codesquare.com` / `Investigator@2024`

### **Al-Bawani**
- **Admin:** `admin@al-bawani.com` / `AlBawani@2024`
- **Manager:** `manager@al-bawani.com` / `Manager@2024`
- **HR:** `hr@al-bawani.com` / `HR@2024`

### **Super Admin**
- **Super Admin:** `sup-adm@whistrust.com` / `sup-pass-adm!1@3#5`

---

## 🎯 **What to Test**

1. ✅ Super Admin → Should see 2 organizations
2. ✅ CodeSquare login → Works
3. ✅ Al-Bawani login → Works
4. ✅ Each org sees ONLY their data (tenant isolation)
5. ✅ All pages load without errors
6. ✅ User management works
7. ✅ Settings page shows correct org info

---

## ❌ **If Something Goes Wrong**

### **Error: "No organization found"**
- Wait 5 seconds and refresh
- Check if organizations were created (run Step 3 query)

### **Error: "Invalid credentials"**
- Double-check email/password (case-sensitive!)
- Verify users were created (run Step 4 query)

### **Error: "Cannot read properties of null"**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Try incognito mode

---

## 💡 **Pro Tips**

1. **Save credentials** - Keep `CREDENTIALS.md` handy
2. **Test in order** - Super Admin first, then client portals
3. **Check console** - Open DevTools for any errors
4. **Verify isolation** - Login to both orgs, confirm separate data

---

**Ready? Run the SQL script now!** 🚀

**Total Time: 5 minutes** ⏱️


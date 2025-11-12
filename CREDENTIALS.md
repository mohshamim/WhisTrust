# 🔑 WhisTrust - Login Credentials

**Quick reference for all test accounts**

---

## 🏢 **CODESQUARE ORGANIZATION**

**Portal:** `http://localhost:3000/org/codesquare/login`  
**Production:** `codesquare.whistrust.app`  
**Plan:** Professional (15 users, 100 reports/month)

### Users:

| Role | Email | Password | Name |
|------|-------|----------|------|
| **Admin** | `admin@codesquare.com` | `CodeSquare@2024` | CodeSquare Administrator |
| **Investigator** | `investigator@codesquare.com` | `Investigator@2024` | Sarah Johnson |

---

## 🏢 **AL-BAWANI ORGANIZATION**

**Portal:** `http://localhost:3000/org/al-bawani/login`  
**Production:** `al-bawani.whistrust.app`  
**Plan:** Enterprise (50 users, 500 reports/month)

### Users:

| Role | Email | Password | Name |
|------|-------|----------|------|
| **Admin** | `admin@al-bawani.com` | `AlBawani@2024` | Al-Bawani Administrator |
| **Manager** | `manager@al-bawani.com` | `Manager@2024` | Ahmed Al-Mahmoud |
| **HR** | `hr@al-bawani.com` | `HR@2024` | Fatima Al-Rashid |

---

## 👑 **SUPER ADMIN**

**Portal:** `http://localhost:3000/superadmin/login`  
**Production:** `superadmin.whistrust.app`

| Email | Password |
|-------|----------|
| `sup-adm@whistrust.com` | `sup-pass-adm!1@3#5` |

---

## 🧪 **QUICK TEST GUIDE**

### Test 1: Super Admin
```
1. Go to: /superadmin/login
2. Login with super admin credentials
3. View both organizations in dashboard
4. ✅ Should see CodeSquare and Al-Bawani
```

### Test 2: CodeSquare Admin
```
1. Go to: /org/codesquare/login
2. Login: admin@codesquare.com / CodeSquare@2024
3. Navigate: Dashboard → Reports → Users → Settings
4. ✅ Should see CodeSquare data only
```

### Test 3: Al-Bawani Admin
```
1. Go to: /org/al-bawani/login
2. Login: admin@al-bawani.com / AlBawani@2024
3. Navigate: Dashboard → Reports → Users → Settings
4. ✅ Should see Al-Bawani data only
```

### Test 4: Tenant Isolation
```
1. Login to CodeSquare as admin
2. Note the data you see
3. Logout
4. Login to Al-Bawani as admin
5. ✅ Should see completely different data
6. ✅ No cross-contamination!
```

---

## 📝 **ROLE CAPABILITIES**

### Admin
- ✅ Full access to organization
- ✅ Manage all reports
- ✅ Manage users
- ✅ Change settings
- ✅ View analytics

### Manager
- ✅ View reports
- ✅ Update report status
- ✅ View analytics
- ❌ Cannot manage users
- ❌ Cannot change settings

### Investigator
- ✅ View reports
- ✅ Update report status
- ✅ Add comments/notes
- ❌ Cannot see analytics
- ❌ Cannot manage users

### HR
- ✅ View reports (HR-related)
- ✅ Limited report access
- ❌ Cannot see all analytics
- ❌ Cannot manage users

---

## 🔒 **SECURITY NOTES**

- All passwords use bcrypt encryption
- RLS enforces tenant isolation
- Each user can only see their organization's data
- Super Admin has cross-org visibility
- Session-based authentication
- Automatic logout on session expiry

---

## 📞 **SUPPORT CONTACTS**

### CodeSquare
- Email: support@codesquare.com
- Phone: +1 (555) 100-1000

### Al-Bawani
- Email: support@al-bawani.com
- Phone: +966 (11) 234-5678

---

**Last Updated:** Phase 2 Complete  
**Status:** Ready for Testing


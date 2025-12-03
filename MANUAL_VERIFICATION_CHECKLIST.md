# 📋 Manual Verification Checklist

## ✅ Quick Verification Steps

Please manually test these to confirm nothing was impacted by the `.env.local` changes:

---

## 1. 🟢 **Contact Form** (PRIMARY FIX)

**URL:** http://localhost:3000/contact

**Steps:**
1. Open the contact page
2. Fill in:
   - Name: `Mohammed Shamim`
   - Email: `codesquare01@gmail.com`
   - Subject: Select `Request a Demo`
   - Message: `Testing after environment fix`
3. Click **"Send Message"**
4. ✅ **Expected:** Success message appears
5. ✅ **Verify in Supabase:** Check `contact_submissions` table for new entry

---

## 2. 🟢 **AISAR Organization** (Multi-Tenant)

**URL:** http://localhost:3000/org/aisar/report

**Steps:**
1. Open AISAR report submission page
2. Fill in:
   - Title: `Test Report - AISAR`
   - Description: `Testing multi-tenant functionality`
   - Category: Select `fraud`
3. Click **"Submit Report"**
4. ✅ **Expected:** Success page with tracking code
5. ✅ **Verify:** Tracking code displayed

**Try Tracking:**
- URL: http://localhost:3000/org/aisar/track
- Enter the tracking code
- ✅ **Expected:** Report details shown

---

## 3. 🟢 **CodeSquare Organization** (Multi-Tenant)

**URL:** http://localhost:3000/org/codesquare/report

**Steps:**
1. Open CodeSquare report submission page
2. Fill in:
   - Title: `Test Report - CodeSquare`
   - Description: `Testing multi-tenant functionality`
   - Category: Select `harassment`
3. Click **"Submit Report"**
4. ✅ **Expected:** Success page with tracking code
5. ✅ **Verify:** Tracking code displayed

---

## 4. 🟢 **Organization Isolation** (Critical)

**Verify AISAR cannot see CodeSquare data:**

1. Go to Supabase Table Editor
2. Open `reports` table
3. Check `organization_id` column
4. ✅ **Expected:** AISAR reports have AISAR org_id, CodeSquare has different org_id

---

## 5. 🟢 **Homepage & Navigation**

**URL:** http://localhost:3000

**Steps:**
1. Homepage loads
2. Click navigation links:
   - Documentation
   - Privacy Policy
   - Terms of Service
   - Contact
3. ✅ **Expected:** All pages load without errors

---

## 6. 🟢 **Diagnostic Page**

**URL:** http://localhost:3000/diagnostic

**Steps:**
1. Open diagnostic page
2. ✅ **Expected:** Shows 2 organizations:
   - AISAR
   - CodeSquare
3. ✅ **Expected:** Shows correct Supabase URL: `lyboxkxohvxkcolgrumw`

---

## 7. 🟢 **Admin Login Pages**

### AISAR Admin:
- **URL:** http://localhost:3000/org/aisar/login
- ✅ **Expected:** Login page loads with AISAR branding

### CodeSquare Admin:
- **URL:** http://localhost:3000/org/codesquare/login
- ✅ **Expected:** Login page loads with CodeSquare branding

### Super Admin:
- **URL:** http://localhost:3000/superadmin/login
- ✅ **Expected:** Super admin login page loads

---

## 📊 Summary Checklist

Check off as you verify:

- [ ] ✅ Contact form submits successfully
- [ ] ✅ AISAR report submission works
- [ ] ✅ CodeSquare report submission works
- [ ] ✅ Report tracking works
- [ ] ✅ Organizations are isolated (different org_ids)
- [ ] ✅ Homepage and navigation work
- [ ] ✅ Diagnostic shows correct Supabase instance
- [ ] ✅ All login pages load correctly

---

## 🐛 If You Find Issues

If any of these fail:

1. **Check terminal logs** (terminal 11)
2. **Check browser console** (F12)
3. **Verify Supabase connection:**
   ```bash
   node scripts/check-supabase-connection.js
   ```
4. **Check environment variables** are loaded:
   - Dev server should show: `Environments: .env.local`

---

## ✅ Expected Results

**All tests should PASS** ✅

The `.env.local` changes should NOT have impacted:
- ✅ Multi-tenant functionality
- ✅ Report submissions
- ✅ Organization isolation
- ✅ Navigation and pages
- ✅ Admin portals

**Only the contact form was fixed!**

---

## 📝 Notes

- **Contact form** now uses production Supabase (`lyboxkxohvxkcolgrumw`)
- **Multi-tenant** already used production via `NEXT_PUBLIC_PROD_*` variables
- **RLS is currently DISABLED** on `contact_submissions` (needs proper policy later)
- **Email notifications** won't work (Resend domain verification needed)

---

**Ready to test?** Go through each section and check them off! 🚀


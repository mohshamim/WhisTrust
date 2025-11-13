# ✅ SCHEMA FIX APPLIED

## 🔧 **What Was Fixed:**

The database schema uses `title` and `internal_notes`, not `subject` and `resolution_notes`.

### **Fixed Files:**
1. ✅ `supabase/CREATE_TEST_REPORTS.sql` - Changed `subject` → `title`
2. ✅ `app/org/[subdomain]/report/page.tsx` - Changed `subject` → `title`
3. ✅ `app/api/reports/submit/route.ts` - Changed `subject` → `title`
4. ✅ `app/org/[subdomain]/track/page.tsx` - Changed `subject` → `title`
5. ✅ `app/api/reports/track/route.ts` - Changed `subject` → `title`
6. ✅ `app/org/[subdomain]/reports/page.tsx` - Changed `subject` → `title`
7. ✅ `app/org/[subdomain]/reports/[id]/page.tsx` - Changed `subject` → `title` and `resolution_notes` → `internal_notes`

---

## ✅ **NOW THE SQL SCRIPT WILL WORK!**

**Run this in Supabase SQL Editor:**
`supabase/CREATE_TEST_REPORTS.sql`

It will create:
- 3 reports for AISAR
- 2 reports for CodeSquare

Then test in browser!



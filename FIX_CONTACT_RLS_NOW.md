# 🔧 Fix Contact Form RLS Policy

## ✅ Good News!
- ✅ Connection to Supabase is working!
- ✅ Table `contact_submissions` exists!

## ❌ Current Issue
**Error:** `new row violates row-level security policy for table "contact_submissions"`

**What this means:** The table exists, but the RLS (Row-Level Security) policy is blocking anonymous submissions.

---

## 🚀 Quick Fix (2 Minutes)

### Step 1: Run SQL in Supabase

1. Go to: **https://supabase.com/dashboard/project/lyboxkxohvxkcolgrumw/sql/new**
2. Copy the contents of: `supabase/FIX_CONTACT_RLS.sql`
3. Paste into SQL Editor
4. Click **"Run"**
5. You should see: `✅ Contact form RLS policies fixed!`

---

## 📋 What the SQL Does

The script will:
1. ✅ Drop any existing wrong policies
2. ✅ Create correct policy allowing **anonymous (anon) users** to INSERT
3. ✅ Allow **authenticated admins** to read and update
4. ✅ Verify RLS is enabled
5. ✅ Show you the final policies

---

## 🧪 After Running SQL

**Test the contact form again:**

1. Make sure your dev server is running (`npm run dev`)
2. Go to: **http://localhost:3000/contact**
3. Fill out the form with test data:
   - Name: Test User
   - Email: test@example.com
   - Subject: Request a Demo
   - Message: This is a test submission
4. Click **"Send Message"**
5. Should see: **✅ Success message!**

---

## 🔍 Verify It Worked

Check the database:
1. Go to Supabase Dashboard
2. Navigate to: **Table Editor** → `contact_submissions`
3. You should see your test submission!

---

## 💡 Why This Happened

The `contact_submissions` table was created, but the RLS policy wasn't set up correctly to allow **anonymous (anon role)** inserts. 

The contact form submits as **anonymous** (no auth required), so we need an RLS policy that allows the `anon` role to INSERT.

---

## ✅ Success Checklist

- [ ] Run `supabase/FIX_CONTACT_RLS.sql` in Supabase SQL Editor
- [ ] See success message: `✅ Contact form RLS policies fixed!`
- [ ] Test form at http://localhost:3000/contact
- [ ] Submit test message
- [ ] See success message
- [ ] Verify submission in Supabase table

---

**Ready to fix it?** Just run the SQL and test! 🚀


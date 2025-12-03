# 🔧 Contact Form 500 Error - Quick Fix

## Problem

The contact form is failing with a **500 error** because the `contact_submissions` table doesn't exist in your Supabase database yet.

---

## ✅ Solution (2 Steps)

### **Step 1: Run the Database Migration**

You have **2 options**:

#### **Option A: Use the Setup Page (Easiest)** ⭐

1. Go to: **http://localhost:3000/admin/setup-contact**
2. The page will automatically diagnose the issue
3. Click **"Copy SQL to Clipboard"**
4. Follow the on-screen instructions
5. Click **"Refresh Diagnostics"** to verify

#### **Option B: Manual SQL File**

1. Open file: `supabase/RUN_CONTACT_MIGRATION.sql`
2. Copy all contents
3. Go to: https://supabase.com/dashboard
4. Open your project
5. Go to **SQL Editor** (left sidebar)
6. Click **"New Query"**
7. Paste the SQL
8. Click **"Run"**

---

### **Step 2: Add Resend API Key (Optional - For Emails)**

If you want email notifications:

1. Go to Vercel: https://vercel.com/mohshamim/whistrust/settings/environment-variables
2. Add variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_dMQzp6wC_JRQYuWvL6WpwAKVSbaqTaeka`
3. **Redeploy** the site

**Note:** The form will work without this, but won't send emails. Submissions will still be saved to the database.

---

## 🎯 What I Changed

### 1. **Enhanced Error Messages** (`app/api/contact/route.ts`)
   - Now detects missing table errors (code `42P01`)
   - Provides helpful setup instructions
   - Shows migration file name
   - Better console logging

### 2. **Created Diagnostic Page** (`app/admin/setup-contact/page.tsx`)
   - Visual dashboard showing setup status
   - Checks environment variables
   - Checks database table existence
   - One-click SQL copy
   - Step-by-step instructions
   - Real-time status updates

### 3. **Created Test Endpoint** (`app/api/contact/test/route.ts`)
   - Checks all environment variables
   - Verifies table exists
   - Tests RLS policies
   - Returns detailed diagnostics

---

## 🧪 How to Test

### After running the migration:

1. Go to: **http://localhost:3000/admin/setup-contact**
2. Verify all checks are green ✅
3. Click **"Test Contact Form"** button
4. Fill out the form
5. Submit
6. Should see success message!

---

## 📊 What the Setup Page Shows

✅ **Green** = Working correctly
❌ **Red** = Needs attention
⚠️ **Yellow** = Optional (email notifications)

### Checks:
- ✅ Supabase URL configured
- ✅ Supabase Anon Key configured
- ⚠️ Resend API Key (optional)
- ✅ contact_submissions table exists
- ✅ RLS policies working

---

## 🗄️ Database Table Created

The migration creates:

**Table:** `contact_submissions`

**Columns:**
- `id` - UUID (auto-generated)
- `name` - Submitter name (required)
- `email` - Submitter email (required)
- `company` - Company name (optional)
- `phone` - Phone number (optional)
- `company_size` - Company size (optional)
- `subject` - Inquiry type (required)
- `message` - Message content (optional)
- `status` - new, in_progress, resolved, archived
- `notes` - Internal admin notes
- `created_at` - Submission timestamp
- `updated_at` - Last update timestamp

**Security (RLS):**
- ✅ Public can INSERT (anonymous submissions)
- ✅ Authenticated admins can SELECT (read)
- ✅ Authenticated admins can UPDATE (manage)

---

## 🔍 Troubleshooting

### Still getting 500 error?

1. Check browser console for new error message
2. Go to `/admin/setup-contact` to see diagnostics
3. Verify migration ran successfully in Supabase
4. Check Supabase logs for RLS policy issues

### Table exists but still failing?

- Check RLS policies are created
- Verify anon key has INSERT permission
- Test with diagnostic endpoint: `/api/contact/test`

### Email not sending?

- This is OK! Form still works, just no email notifications
- Add `RESEND_API_KEY` to fix
- Submissions are still saved to database

---

## 📁 Files Changed/Created

1. ✏️ **Modified:** `app/api/contact/route.ts` - Better error handling
2. ✨ **Created:** `app/api/contact/test/route.ts` - Diagnostic endpoint
3. ✨ **Created:** `app/admin/setup-contact/page.tsx` - Setup dashboard
4. 📝 **Created:** `CONTACT_FORM_FIX.md` - This file

---

## 🚀 Next Steps

1. **Run the migration** (Step 1 above)
2. **Verify setup** at `/admin/setup-contact`
3. **Test form** at `/contact`
4. **(Optional)** Add Resend API key for emails

---

## ✅ Success Checklist

- [ ] Migration SQL executed in Supabase
- [ ] Setup page shows all green checks
- [ ] Test form submission works
- [ ] Submission appears in Supabase `contact_submissions` table
- [ ] (Optional) Email received at info@aisar.sa

---

**Need help?** The setup page at `/admin/setup-contact` will guide you through everything! 🎉


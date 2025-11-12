# 🚀 WhisTrust Multi-Tenant Setup Guide

This guide walks you through setting up the dual Supabase environment for WhisTrust's multi-tenant transformation.

## 📋 Overview

**What we're building:**

- **Demo Environment**: Keep existing demo at `demo.whistrust.com` or `/demo` path
- **Production Environment**: New multi-tenant system at `*.whistrust.app` with separate Supabase

**Why separate Supabase projects:**

- Complete data isolation between demo and production
- Different database schemas can evolve independently
- Demo data never affects production
- Safer testing and development

---

## 🎯 Phase 0: Environment Setup & Testing

### Step 1: Create Production Supabase Project

1. **Go to Supabase Dashboard**

   - Visit: https://supabase.com/dashboard
   - Sign in with the account you want for production

2. **Create New Project**

   - Click "New Project"
   - **Name**: `whistrust-production` (or your preferred name)
   - **Database Password**: Use a strong password (save it securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start
   - Click "Create new project"
   - ⏳ Wait 2-3 minutes for setup to complete

3. **Get API Credentials**
   - Once setup is complete, go to: **Settings** → **API**
   - Copy these values:
     - **Project URL** (looks like: `https://abcdefghij.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)
   - 📝 Save these for the next step!

---

### Step 2: Configure Environment Variables

#### For Local Development (.env.local)

Create a `.env.local` file in your project root with:

```bash
# =============================================================================
# DEMO SUPABASE (Your Existing Supabase Project)
# =============================================================================
NEXT_PUBLIC_DEMO_SUPABASE_URL=https://your-demo-project.supabase.co
NEXT_PUBLIC_DEMO_SUPABASE_ANON_KEY=your_demo_anon_key_here

# =============================================================================
# PRODUCTION SUPABASE (Your NEW Supabase Project)
# =============================================================================
NEXT_PUBLIC_PROD_SUPABASE_URL=https://your-new-prod-project.supabase.co
NEXT_PUBLIC_PROD_SUPABASE_ANON_KEY=your_new_prod_anon_key_here

# =============================================================================
# FALLBACK (Optional - keeps existing demo working)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-demo-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_demo_anon_key_here
```

**Where to get Demo credentials:**

1. Go to your EXISTING Supabase project (the one currently in use)
2. Settings → API
3. Copy URL and anon key

**Where to get Production credentials:**

1. Use the values from Step 1 (your NEW production project)

#### For Vercel Deployment

1. **Go to Vercel Dashboard**

   - Your Project → Settings → Environment Variables

2. **Add Each Variable**

   For each variable below:

   - Click "Add New"
   - Enter the Key name
   - Enter the Value
   - Select: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   ```
   NEXT_PUBLIC_DEMO_SUPABASE_URL
   NEXT_PUBLIC_DEMO_SUPABASE_ANON_KEY
   NEXT_PUBLIC_PROD_SUPABASE_URL
   NEXT_PUBLIC_PROD_SUPABASE_ANON_KEY
   NEXT_PUBLIC_SUPABASE_URL (fallback)
   NEXT_PUBLIC_SUPABASE_ANON_KEY (fallback)
   ```

3. **Redeploy**
   - Go to Deployments tab
   - Click "..." on latest deployment → "Redeploy"
   - Or push a new commit to trigger auto-deploy

---

### Step 3: Test the Setup

#### Local Testing

1. **Restart Dev Server**

   ```bash
   npm run dev
   ```

2. **Visit Test Page**

   - Open: http://localhost:3000/test/connection
   - You should see:
     - ✅ Environment Detection working
     - ✅ Supabase credentials loaded
     - ✅ All 4 environment variables detected

3. **Test Demo Path**

   - Visit: http://localhost:3000/demo
   - Should connect to DEMO Supabase
   - Check browser console for any errors

4. **Test Production Path**
   - Visit: http://localhost:3000/test/connection
   - Should show "Production Environment" (since not on /demo path)
   - Should connect to PROD Supabase

#### Vercel Testing

1. **Deploy to Vercel**

   - Push code to GitHub
   - Wait for Vercel deployment to complete

2. **Visit Test Page on Production**

   - Go to: `https://your-app.vercel.app/test/connection`
   - Verify all checks pass

3. **Test Demo URL**
   - If using custom domain: `demo.whistrust.com/test/connection`
   - Should show "Demo Environment"

---

## 🔍 Troubleshooting

### Problem: "Missing environment variables" error

**Solution:**

- Make sure you created `.env.local` file
- Check that all 4 variables are set (DEMO and PROD for both URL and KEY)
- Restart dev server after adding variables
- Check for typos in variable names

### Problem: Test page shows wrong environment

**Solution:**

- Check your current URL/path
- Environment detection rules:
  - `/demo` path → Demo
  - `demo.whistrust.com` → Demo
  - Everything else → Production

### Problem: Can't connect to Supabase

**Solution:**

- Verify Supabase project is fully set up (not still initializing)
- Check that you copied the correct anon/public key (not service_role key)
- Verify URL format: `https://projectid.supabase.co` (no trailing slash)
- Check browser console for specific error messages

### Problem: Vercel deployment fails

**Solution:**

- Make sure all environment variables are added in Vercel
- Check that you selected all environments (Production, Preview, Development)
- Redeploy after adding variables
- Check Vercel deployment logs for specific errors

---

## ✅ Verification Checklist

Before proceeding to Phase 1 implementation:

- [ ] Created new Production Supabase project
- [ ] Added all 4 environment variables to `.env.local`
- [ ] Restarted dev server
- [ ] Test page shows correct environment (Demo vs Production)
- [ ] Both Supabase connections work locally
- [ ] Added all environment variables to Vercel
- [ ] Deployed to Vercel successfully
- [ ] Test page works on Vercel deployment
- [ ] Existing `/demo` still works (unchanged)

---

## 🎯 What's Next?

Once all checks pass, we'll proceed to:

**Phase 1: Database Schema (Production Supabase)**

- Organizations table
- Multi-tenant user management
- RLS policies for tenant isolation

**Phase 2: Super Admin Portal**

- Create organizations manually
- Configure features per org
- Monitor usage

**Phase 3: Client Subdomain System**

- Dynamic subdomain routing
- Per-tenant branding
- Custom configurations

**Phase 4: Advanced Features**

- Custom report columns
- PDF export
- Usage limits enforcement

---

## 📞 Need Help?

If you encounter issues:

1. Check the test page at `/test/connection` for diagnostics
2. Review browser console for errors
3. Check Vercel deployment logs
4. Verify all environment variables are set correctly
5. Ask for help with specific error messages

---

## 🔐 Security Reminders

- ✅ `.env.local` is in `.gitignore` - never commit it
- ✅ Only use anon/public keys in frontend code
- ✅ Keep service_role keys only in Vercel (encrypted)
- ✅ Use Row Level Security (RLS) in Supabase for data protection
- ✅ Demo and Production databases are completely separate

---

**Ready to start?** Follow the steps above and let me know when you've:

1. Created the production Supabase project
2. Added credentials to `.env.local`
3. Verified the test page shows correct information

Then we'll proceed with Phase 1! 🚀

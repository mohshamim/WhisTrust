# WhisTrust Deployment Guide

Complete guide for deploying WhisTrust to production on Vercel with Supabase.

## 📋 Prerequisites

- [x] GitHub account
- [x] Vercel account (free tier works)
- [x] Supabase account (free tier works)
- [x] Node.js 18+ installed locally

## 🗄️ Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: WhisTrust
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### 1.2 Get Your Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key

### 1.3 Set Up Database Schema

1. Go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase/schema.sql`
4. Paste and click "Run" (or Cmd/Ctrl + Enter)
5. Wait for "Success" message

### 1.4 Set Up RBAC & Audit Logs

1. Still in **SQL Editor**, click "New query"
2. Copy the contents of `supabase/schema-rbac-audit.sql`
3. Paste and click "Run"
4. Wait for "Success" message

### 1.5 Create Storage Bucket

1. Go to **Storage**
2. Click "Create bucket"
3. Name: `report-attachments`
4. Leave "Public bucket" **unchecked** (private)
5. Click "Create bucket"

### 1.6 Create Admin User

1. Go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Enter:
   - **Email**: `admin@whistrust.com` (your email)
   - **Password**: (choose a strong password)
   - Uncheck "Auto confirm user"
4. Click "Create user"
5. Copy the user's **UUID** (not email)

6. Go to **SQL Editor** → "New query"
7. Run this SQL (replace `YOUR_UUID_HERE` with the actual UUID):

```sql
INSERT INTO admin_profiles (id, full_name, role, is_active)
VALUES (
  'YOUR_UUID_HERE',
  'Admin User',
  'admin',
  true
);
```

8. Click "Run"

### 1.7 Enable Realtime (if not enabled)

1. Go to **Database** → **Replication**
2. Enable replication for:
   - `messages` table
   - `reports` table

## 🚀 Step 2: Deploy to Vercel

### 2.1 Push to GitHub

```bash
# If you haven't already
git init
git add .
git commit -m "Initial commit: WhisTrust MVP 2"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/whistle-blowing.git
git push -u origin main
```

### 2.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2.3 Add Environment Variables

In Vercel project settings, go to **Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Click "Save" and redeploy.

## ✅ Step 3: Verify Deployment

### 3.1 Test Public Pages

1. Visit your Vercel URL
2. Check `/report` page loads
3. Check `/track` page loads

### 3.2 Test Admin Login

1. Visit `/admin/login`
2. Log in with your admin credentials
3. Should redirect to `/admin/dashboard`

### 3.3 Test Functionality

1. **Submit a test report**
   - Go to `/report`
   - Fill out form
   - Submit
   - Copy tracking code
   - Go to `/success` and verify tracking code shown

2. **Track the report**
   - Go to `/track`
   - Enter tracking code
   - Should see report details

3. **Admin dashboard**
   - Log in at `/admin/login`
   - Should see dashboard with statistics
   - Go to "Cases" and see your test report
   - Try updating status

## 🔧 Troubleshooting

### Issue: "Missing environment variables"

**Solution**: Double-check environment variables in Vercel settings are exactly:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue: "Row-level security policy violation"

**Solution**: Check that RLS policies are set in Supabase. Run schema files again.

### Issue: "User not found in admin_profiles"

**Solution**: Make sure you inserted the UUID into `admin_profiles` table after creating the user.

### Issue: "Realtime not working"

**Solution**: Enable replication for `messages` and `reports` tables in Supabase.

### Issue: "File upload fails"

**Solution**: 
1. Check storage bucket exists
2. Check bucket name is `report-attachments`
3. Check bucket is private (not public)

## 📝 Post-Deployment Checklist

- [ ] Test anonymous report submission
- [ ] Test tracking with code
- [ ] Test admin login
- [ ] Test realtime messaging
- [ ] Test file upload (if enabled)
- [ ] Verify SSL certificate (automatic on Vercel)
- [ ] Set up custom domain (optional)
- [ ] Enable analytics (optional)

## 🔒 Security Best Practices

1. **Never commit** `.env.local` to Git
2. **Use environment variables** in Vercel
3. **Enable RLS** on all Supabase tables
4. **Rotate API keys** if compromised
5. **Monitor** Supabase usage/dashboard
6. **Back up** database regularly
7. **Use strong passwords** for admin accounts

## 🎉 Success!

Your WhisTrust application is now live! Share your Vercel URL with stakeholders.

---

## 📞 Support

For issues or questions:
- Check documentation in this repository
- Review Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Review Vercel docs: [vercel.com/docs](https://vercel.com/docs)

# 🚀 WhisTrust Deployment Guide

Complete guide for deploying WhisTrust to production environments.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Alternative Platforms](#alternative-platforms)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

### Required Resources

- ✅ **Supabase Project**: Production Supabase project created
- ✅ **Database Migrations**: All migrations applied to production database
- ✅ **Environment Variables**: Production credentials ready
- ✅ **Git Repository**: Code pushed to GitHub/GitLab
- ✅ **Domain Name**: Custom domain (optional but recommended)

### Code Readiness

```bash
# 1. Build locally to test
npm run build

# 2. Run linter
npm run lint

# 3. Test production build locally
npm run start
```

### Database Preparation

1. **Create Production Supabase Project**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create new project <WHISTRUST_ADMIN_PASSWORD> appropriate region)
   - Save credentials securely

2. **Apply Migrations**
   ```sql
   -- Run migrations in order from supabase/migrations/
   -- 001_initial_schema.sql
   -- 002_add_organizations.sql
   -- 003_add_audit_logs.sql
   -- ... (run all in order)
   ```

3. **Create Super Admin**
   ```sql
   -- Run after migrations to create initial super admin
   -- See supabase/CREATE_SUPER_ADMIN.sql
   ```

---

## Vercel Deployment (Recommended)

Vercel provides the best experience for Next.js applications with automatic deployments, edge functions, and global CDN.

### Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### Step 2: Connect Repository

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Select the repository (GitHub, GitLab, or Bitbucket)
5. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (leave default)
   - **Output Directory**: `.next` (leave default)

**Option B: Via CLI**

```bash
# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Or deploy to production directly
vercel --prod
```

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

#### Required Variables

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your production Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your production anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your production service role key | Production only |

**How to get these values:**
1. Go to Supabase Dashboard → Project Settings → API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

#### Optional Variables (for future features)

| Variable Name | Description |
|--------------|-------------|
| `NEXT_PUBLIC_APP_URL` | Your production URL (e.g., https://www.whistrust.com) |
| `SMTP_HOST` | Email server host (for notifications) |
| `SMTP_PORT` | Email server port |
| `SMTP_USER` | Email username |
| `SMTP_PASSWORD` | Email password |

### Step 4: Deploy

After adding environment variables:

1. Vercel will automatically deploy on every push to `main` branch
2. Or manually trigger deployment:
   - Vercel Dashboard → Deployments → Redeploy
   - Or via CLI: `vercel --prod`

### Step 5: Custom Domain (Optional)

1. **Add Domain in Vercel:**
   - Project Settings → Domains
   - Add your custom domain (e.g., `www.whistrust.com`)
   - Click "Add"

2. **Configure DNS:**
   Vercel will show DNS records to add:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Wait for Propagation:**
   - DNS changes can take 24-48 hours
   - Check status in Vercel dashboard

### Step 6: Enable Analytics (Optional)

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Environment Variables

### Complete Reference

```bash
# =============================================================================
# SUPABASE CONFIGURATION (Required)
# =============================================================================

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase anonymous/public key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase service role key (server-side only, keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =============================================================================
# APPLICATION CONFIGURATION (Optional)
# =============================================================================

# Your production URL
NEXT_PUBLIC_APP_URL=https://www.whistrust.com

# Node environment
NODE_ENV=production

# =============================================================================
# EMAIL CONFIGURATION (Optional - for future notifications)
# =============================================================================

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
SMTP_FROM=noreply@whistrust.com

# =============================================================================
# ANALYTICS (Optional)
# =============================================================================

NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Database Setup

### 1. Create Production Supabase Project

```
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - Name: whistrust-production
   - Database Password: [strong password]
   - Region: [closest to your users]
4. Wait 2-3 minutes for provisioning
```

### 2. Apply Database Migrations

**Option A: Using Supabase Dashboard (Recommended)**

```
1. Go to SQL Editor
2. Run each migration file in order:
   - 001_initial_schema.sql
   - 002_add_organizations.sql
   - 003_add_audit_logs.sql
   - 004_add_analytics_views.sql
   - 005_add_realtime_messaging.sql
   - 006_add_avatar_system.sql
   - 007_add_avatar_style_column.sql
3. Verify each runs successfully before proceeding
```

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3. Configure Storage Buckets

```sql
-- Run in SQL Editor to create storage buckets

-- Create attachments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false);

-- Create avatars bucket (if using custom avatars)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', avatars', true);

-- Set up storage policies
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "Users can view their organization's attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'attachments');
```

### 4. Create Super Admin User

```sql
-- See supabase/CREATE_SUPER_ADMIN.sql for complete script
-- This creates the initial super admin account
```

### 5. Enable Realtime (Optional)

```sql
-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

---

## Post-Deployment Verification

### Automated Checks

```bash
# Test production build locally
npm run build && npm run start

# Check for build errors
npm run lint
```

### Manual Testing Checklist

#### 1. Super Admin Portal

- [ ] Can access `/superadmin/login`
- [ ] Can login with super admin credentials
- [ ] Dashboard loads with correct data
- [ ] Can create new organization
- [ ] Can edit organization details
- [ ] Can view all organizations

#### 2. Organization Portal (Test with one org)

- [ ] Can access `/org/[subdomain]/login`
- [ ] Can login with admin credentials
- [ ] Dashboard displays metrics correctly
- [ ] Can view reports
- [ ] Can create/assign/update cases
- [ ] Can access analytics
- [ ] Can manage users
- [ ] Can view audit logs
- [ ] Can access settings
- [ ] Avatar system works

#### 3. Public Pages

- [ ] Anonymous report submission works
- [ ] File uploads function correctly
- [ ] Tracking code generated successfully
- [ ] Case tracking page works
- [ ] Can view case status and timeline
- [ ] Can send messages anonymously

#### 4. Performance & Security

- [ ] Page load times < 3 seconds
- [ ] No console errors in browser
- [ ] RLS policies working (users see only their org data)
- [ ] File uploads are secure (private buckets)
- [ ] Session management works correctly
- [ ] Logout functions properly

### Monitoring

**Set up monitoring in Vercel:**

1. Go to Project → Analytics
2. Enable Web Vitals monitoring
3. Set up deployment notifications

**Monitor Supabase:**

1. Go to Supabase Dashboard → Database → Statistics
2. Check query performance
3. Monitor storage usage
4. Review auth logs

---

## Alternative Platforms

### AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

**Configure Build Settings:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**netlify.toml:**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Self-Hosted (Docker)

**Dockerfile:**

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

---

## Troubleshooting

### Common Issues

#### 1. Build Fails

**Error:** `Module not found` or `Cannot find module`

```bash
# Solution: Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

#### 2. Environment Variables Not Working

**Issue:** App can't connect to Supabase

```bash
# Verify variables are set
vercel env ls

# Pull environment variables locally
vercel env pull .env.local

# Redeploy after adding variables
vercel --prod
```

#### 3. Database Connection Errors

**Error:** `relation "organizations" does not exist`

```sql
-- Verify migrations ran successfully
SELECT * FROM _prisma_migrations; -- if using Prisma

-- Or check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

#### 4. RLS Policy Errors

**Error:** `new row violates row-level security policy`

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Review policies
SELECT * FROM pg_policies
WHERE tablename = 'your_table_name';
```

#### 5. File Upload Failures

**Error:** `Storage bucket not found`

```sql
-- Create missing bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false);

-- Check bucket policies
SELECT * FROM storage.policies
WHERE bucket_id = 'attachments';
```

### Performance Issues

#### Slow Page Loads

```bash
# Analyze bundle size
npm run build
# Look for large chunks in output

# Optimize images (if applicable)
npm install sharp

# Enable caching in Vercel
# Add to vercel.json:
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### High Database Load

```sql
-- Add indexes for common queries
CREATE INDEX idx_reports_org_status 
ON reports(organization_id, status);

CREATE INDEX idx_messages_report 
ON messages(report_id, created_at DESC);

CREATE INDEX idx_audit_logs_org_time 
ON audit_logs(organization_id, created_at DESC);
```

---

## Maintenance

### Regular Tasks

#### Daily
- [ ] Monitor error logs (Vercel + Supabase)
- [ ] Check system health dashboard
- [ ] Review new report submissions

#### Weekly
- [ ] Review analytics and usage metrics
- [ ] Check database performance
- [ ] Verify backup status (Supabase automatic)
- [ ] Monitor storage usage

#### Monthly
- [ ] Update dependencies (`npm update`)
- [ ] Review and optimize database queries
- [ ] Audit user access and permissions
- [ ] Review security logs

### Backup Strategy

**Supabase Automatic Backups:**
- Daily backups retained for 7 days (Free tier)
- Point-in-time recovery available (Paid plans)

**Manual Backup:**

```bash
# Export database
pg_dump -h db.your-project.supabase.co \
  -U postgres -d postgres > backup.sql

# Restore if needed
psql -h db.your-project.supabase.co \
  -U postgres -d postgres < backup.sql
```

### Updating Production

```bash
# 1. Test locally
git pull origin main
npm install
npm run build
npm run start

# 2. Push to main (triggers auto-deploy on Vercel)
git push origin main

# 3. Monitor deployment
vercel --logs

# 4. Verify deployment
curl https://www.whistrust.com/api/health
```

### Rollback Procedure

**In Vercel Dashboard:**

1. Go to Deployments
2. Find last working deployment
3. Click three dots → "Promote to Production"
4. Confirm rollback

**Via CLI:**

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

---

## Security Best Practices

### Environment Variables

- ✅ Never commit `.env.local` to Git
- ✅ Use different credentials for dev/staging/prod
- ✅ Rotate service role keys regularly
- ✅ Limit service role key usage to server-side only

### Database

- ✅ Keep RLS policies enabled on all tables
- ✅ Regular security audits
- ✅ Monitor for unusual query patterns
- ✅ Implement rate limiting

### Application

- ✅ Keep dependencies updated (`npm audit`)
- ✅ Enable HTTPS only (forced by Vercel)
- ✅ Implement CSP headers
- ✅ Regular penetration testing

---

## Support

### Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs

### Getting Help

1. Check deployment logs in Vercel
2. Review Supabase logs and metrics
3. Check browser console for errors
4. Review this guide's troubleshooting section

---

**Deployment Checklist Complete! 🎉**

Your WhisTrust platform should now be live and ready for production use.

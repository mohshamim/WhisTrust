# WhisTrust - Supabase Integration Setup Guide

This guide will help you set up Supabase as the backend for the WhisTrust application.

## 📋 Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js 18+ installed
- Git repository cloned locally

## 🚀 Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: WhisTrust (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users (e.g., Middle East - Bahrain)
4. Click "Create new project"
5. Wait for project provisioning (2-3 minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

### 3. Configure Environment Variables

1. Create a file named `.env.local` in the project root:

```bash
cp .env.local.example .env.local
```

2. Open `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" message

### 5. Set Up Storage for Attachments

1. In Supabase dashboard, go to **Storage**
2. Click "Create bucket"
3. Configure:
   - **Name**: `report-attachments`
   - **Public bucket**: Leave unchecked (private)
4. Click "Create bucket"

### 6. Create an Admin User

**IMPORTANT**: Follow these steps carefully. The `id` must be the **UUID** of the user, not their email.

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: your-admin-email@example.com (e.g., `admin@whistrust.com`)
   - **Password**: (choose a secure password - you'll need this to log in)
4. Click **"Create user"**
5. **Copy the UUID** that appears - it looks like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

   - This is the **User UID** you need for the next step

6. Go to **SQL Editor** again and run this query:

```sql
INSERT INTO admin_profiles (id, full_name, role)
VALUES ('PASTE_YOUR_UUID_HERE', 'Admin User', 'admin');
```

**Replace `PASTE_YOUR_UUID_HERE`** with the actual UUID you copied from step 5.

**Example** (use your own UUID, not this one):

```sql
INSERT INTO admin_profiles (id, full_name, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Admin User', 'admin');
```

7. Click **"Run"** - you should see "Success" message

### 7. Install Dependencies and Run

```bash
npm install
npm run dev
```

The application should now be running at http://localhost:3000

## 🧪 Testing the Integration

### Test Anonymous Report Submission

1. Visit http://localhost:3000/report
2. Fill out the form and submit
3. You should receive a tracking code
4. Go to http://localhost:3000/track
5. Enter the tracking code to view your report

### Test Admin Login

1. Visit http://localhost:3000/admin/login (create this page if needed)
2. Log in with your admin credentials
3. Access the admin dashboard

## 🔒 Security Notes

- The `anon` key is safe to use in client-side code
- Row Level Security (RLS) policies protect your data
- Anonymous users can only access reports with a valid tracking code
- Admin routes should be protected with authentication middleware

## 🗄️ Database Schema Overview

- **reports**: Stores all submitted reports
- **messages**: Stores messages between reporters and admins
- **admin_profiles**: Extends auth.users with admin metadata
- **report_attachments**: Metadata for file attachments

## 🔄 Migration Notes

This architecture is designed to be migration-friendly. To switch to a different backend:

1. Replace `/lib/supabase/client.ts` with your new client
2. Keep the service layer (`/lib/services/*`) - only update database calls inside
3. Maintain the same interface types in `/lib/types/database.ts`

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## ❓ Troubleshooting

### Environment variables not loading

- Ensure `.env.local` is in the project root
- Restart your development server after changing `.env.local`

### "Missing Supabase environment variables" error

- Double-check your `.env.local` file has the correct variable names
- Ensure there are no extra spaces or quotes

### RLS policies blocking access

- Check the Supabase logs in the dashboard
- Verify your policies in the SQL Editor

### Can't sign in as admin

- Ensure the user exists in Supabase Authentication
- Check that admin_profiles table has an entry for your user ID

### Error: "invalid input syntax for type uuid"

- You're trying to insert an email into the `id` field
- The `id` field requires the User UID (UUID format like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
- Get the UUID from Authentication → Users → click on your user → copy the UID
- Make sure you're using the UUID, not the email address

## 🎉 Next Steps

- Customize the UI to match your brand
- Add more admin features
- Set up email notifications
- Configure backup and monitoring

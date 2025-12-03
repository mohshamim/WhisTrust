# Quick Fix: Update .env.local

## The Problem

Your `.env.local` has an invalid Supabase URL:
```
❌ https://donvjkpagavquxbeqgzt.supabase.co (Does not exist!)
```

## The Solution

You need to update `.env.local` with correct credentials.

---

## Option 1: Get From Supabase Dashboard ⭐

1. **Go to:** https://supabase.com/dashboard
2. **Open** your WhisTrust project
3. **Navigate:** Settings → API
4. **Copy** these two values:
   - **Project URL** (starts with https://)
   - **anon public** key (long string)

5. **Open file:** `D:\Personal\Learnings\whistle-blwoing\.env.local`

6. **Replace lines:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_HERE.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

7. **Save** and **restart** dev server:
   ```bash
   # Press Ctrl+C to stop server
   npm run dev
   ```

---

## Option 2: Copy From Vercel

Since Vercel is working, you can use those credentials:

1. From your Vercel dashboard screenshot, you have:
   - `NEXT_PUBLIC_PROD_SUPABASE_URL`
   - `NEXT_PUBLIC_PROD_SUPABASE_ANON_KEY`

2. Click the "..." menu next to each variable
3. Select "Edit" or "Reveal" to see the full value
4. Copy them to your `.env.local`

---

## ✅ Verify It Works

After updating `.env.local`:

```bash
# Test connection
node scripts/check-supabase-connection.js

# Should show: ✅ Connection successful!
```

Then test the contact form:
http://localhost:3000/contact

---

## 📝 Sample .env.local Format

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...

# Resend (Optional - for emails)
RESEND_API_KEY=re_dMQzp6wC_JRQYuWvL6WpwAKVSbaqTaeka

# Production Supabase (if different)
NEXT_PUBLIC_PROD_SUPABASE_URL=https://yyyyyyyyyy.supabase.co
NEXT_PUBLIC_PROD_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

---

**Need Help?** Let me know which option you prefer and I can guide you through it!


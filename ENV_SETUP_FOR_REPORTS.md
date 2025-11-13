# 🔧 Environment Setup for Reports API

## ⚠️ **REQUIRED: Add Service Role Key**

To enable anonymous report submissions, you need to add the **Supabase Service Role Key** to your `.env.local` file.

---

## 📝 **STEPS:**

### **1. Get Your Service Role Key**

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/lyboxkxohvxkcolgrumw/settings/api
2. Scroll to **Project API keys**
3. Copy the **`service_role`** key (⚠️ This is sensitive - never commit to git!)

### **2. Add to `.env.local`**

Open your `.env.local` file and add this line:

```env
# Existing keys (already there)
NEXT_PUBLIC_SUPABASE_URL=https://lyboxkxohvxkcolgrumw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# ADD THIS NEW LINE:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Replace `your_service_role_key_here` with the actual service role key from Supabase.**

### **3. Restart Dev Server**

After adding the key:
```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

---

## 🔐 **Why Do We Need This?**

The **Service Role Key** allows the API to:
- ✅ Create reports from anonymous users (who aren't authenticated)
- ✅ Bypass RLS policies for report submission
- ✅ Generate tracking codes
- ✅ Create audit logs

**Security Note:** This key has full database access, so:
- ⚠️ NEVER expose it to client-side code
- ⚠️ NEVER commit it to Git
- ✅ Only use it in API routes (server-side)

---

## ✅ **After Setup:**

Once you add the key and restart, test:
1. Submit anonymous report: http://localhost:3000/org/aisar/report
2. Get tracking code
3. Track report: http://localhost:3000/org/aisar/track
4. View as admin: http://localhost:3000/org/aisar/reports

---

## 🌐 **For Production Deployment:**

Also add this environment variable to your production deployment platform (Vercel/Netlify):
- Variable name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Your service role key



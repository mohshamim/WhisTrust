# 🔑 ADD SERVICE ROLE KEY - Quick Fix

## ⚠️ **Why You're Getting "Organization not found" Error:**

The anonymous report submission API needs the **Supabase Service Role Key** to create reports for users who aren't logged in.

---

## ✅ **QUICK FIX (2 Minutes):**

### **Step 1: Get Your Service Role Key**

1. Go to: https://supabase.com/dashboard/project/lyboxkxohvxkcolgrumw/settings/api
2. Scroll to **"Project API keys"** section
3. Find **`service_role`** key (⚠️ This is secret!)
4. Click the **copy icon** to copy it

---

### **Step 2: Add to Your `.env.local` File**

1. Open `.env.local` in your project root
2. Add this line at the bottom:

```env
# Service Role Key (Secret - for server-side API only)
SUPABASE_SERVICE_ROLE_KEY=paste_your_key_here
```

**Replace `paste_your_key_here` with the actual key you copied.**

Your `.env.local` should now look like this:

```env
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lyboxkxohvxkcolgrumw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Demo Supabase (if you have it)
NEXT_PUBLIC_DEMO_SUPABASE_URL=your_demo_url
NEXT_PUBLIC_DEMO_SUPABASE_ANON_KEY=your_demo_key

# Service Role Key (NEW - Add this)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

### **Step 3: Restart Dev Server**

1. Stop the server (press `Ctrl+C` in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

---

### **Step 4: Test Report Submission**

1. Go to: http://localhost:3000/org/aisar/report
2. Fill out the form:
   - Category: Any category
   - Title: "Test report"
   - Description: "This is a test report"
3. Click "Submit Anonymous Report"
4. **Should see:** Success page with tracking code! ✅

---

## 🔐 **SECURITY NOTE:**

⚠️ **NEVER commit the service role key to Git!**
- It's already in `.gitignore` (`.env.local` is ignored)
- This key has full database access
- Only use it in server-side API routes (not client code)

---

## ✅ **AFTER ADDING THE KEY:**

Everything will work:
- ✅ Anonymous report submission
- ✅ Tracking code generation
- ✅ Report tracking by code
- ✅ All admin features (already working)

---

## 🚀 **FOR PRODUCTION:**

Also add this environment variable to Vercel/Netlify:
- Variable name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Your service role key




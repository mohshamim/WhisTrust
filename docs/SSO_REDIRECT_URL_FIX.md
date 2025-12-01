# Fix: SSO Redirecting to localhost in Production

## 🔍 Problem

Google OAuth is redirecting to `localhost:3000` instead of your production domain. This happens when the redirect URL is misconfigured.

## ✅ Solution: Update 3 Places

### 1. Organization SSO Settings (Database)

**Option A: Update via Settings Page (Recommended)**

1. Log in to your production site as admin
2. Go to: `https://your-domain.com/org/codesquare/settings`
3. Scroll to "Single Sign-On (SSO)" section
4. Update **Redirect URL** to:
   ```
   https://www.whistrust.com/org/codesquare/sso/callback
   ```
   (Replace with your actual production domain)
5. Click "Save Changes"

**Option B: Update via Database Directly**

If you have database access:

```sql
UPDATE organizations 
SET sso_redirect_url = 'https://www.whistrust.com/org/codesquare/sso/callback'
WHERE subdomain = 'codesquare';
```

### 2. Supabase Dashboard Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **production** Supabase project
3. Navigate to: **Authentication** → **URL Configuration**
4. Check **Site URL** is set to your production domain:
   ```
   https://www.whistrust.com
   ```
5. Check **Redirect URLs** includes:
   ```
   https://www.whistrust.com/org/*/sso/callback
   ```
   Or specifically:
   ```
   https://www.whistrust.com/org/codesquare/sso/callback
   ```
6. Click **Save**

### 3. Google Cloud Console (OAuth Credentials)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID (the one used for SSO)
4. Click to edit it
5. Under **Authorized redirect URIs**, ensure you have:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
   (This is Supabase's callback URL - **this is the most important one**)
6. **Optional:** Also add your app's callback URL:
   ```
   https://www.whistrust.com/org/codesquare/sso/callback
   ```
7. Click **Save**

## 🔄 How OAuth Flow Works

```
User clicks "Sign in with Google"
  ↓
Google authenticates user
  ↓
Google redirects to: https://your-project.supabase.co/auth/v1/callback
  ↓
Supabase exchanges code for session
  ↓
Supabase redirects to: https://www.whistrust.com/org/codesquare/sso/callback
  ↓
Your app processes the callback
```

**Important:** Google redirects to **Supabase first**, then Supabase redirects to **your app**. So:
- Google Cloud Console needs: Supabase callback URL ✅
- Supabase Dashboard needs: Your app callback URL ✅
- Your database needs: Your app callback URL ✅

## 🧪 Testing After Fix

1. Clear browser cache and cookies
2. Go to: `https://www.whistrust.com/org/codesquare/login`
3. Click "Sign in with Google"
4. Complete OAuth flow
5. Should redirect to: `https://www.whistrust.com/org/codesquare/dashboard`

## 🐛 If Still Not Working

Check browser console for:
```
[SSO] Redirect URL: https://www.whistrust.com/org/codesquare/sso/callback
```

If it shows `localhost:3000`, then:
1. Check organization settings in database: `SELECT sso_redirect_url FROM organizations WHERE subdomain = 'codesquare';`
2. Make sure it's set to production URL, not localhost
3. Clear browser cache and try again

## 📝 Quick Checklist

- [ ] Organization SSO settings: Redirect URL = production domain
- [ ] Supabase Dashboard: Site URL = production domain
- [ ] Supabase Dashboard: Redirect URLs includes production callback
- [ ] Google Cloud Console: Authorized redirect URIs includes Supabase callback
- [ ] Cleared browser cache
- [ ] Tested SSO login


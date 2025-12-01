# SSO Production Deployment Checklist

## ✅ Code Changes (Already Done)

- ✅ Removed manual OAuth state override (fixes "bad_oauth_state" error)
- ✅ Uses `window.location.origin` for automatic URL detection
- ✅ Organization subdomain extraction from URL path
- ✅ Fallback mechanisms (query params, localStorage, cookies)

## 🔧 Production Configuration Required

### 1. Vercel Environment Variables (Optional but Recommended)

Set in Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

**Note:** This is optional because the code uses `window.location.origin` in the browser, which works automatically. However, setting it helps with server-side rendering.

### 2. Organization SSO Settings

For each organization using SSO, update the **Redirect URL** in Settings:

1. Log in as organization admin
2. Go to Settings → Single Sign-On (SSO)
3. Update **Redirect URL** to production URL:
   ```
   https://your-production-domain.com/org/[subdomain]/sso/callback
   ```
   
   Example:
   ```
   https://whistrust.com/org/codesquare/sso/callback
   ```

**OR** leave it empty - the code will auto-generate it from `window.location.origin`.

### 3. Google Cloud Console (If using Google SSO)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID
4. Add **Authorized redirect URIs**:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
   (This is Supabase's callback URL - it should already be there)

5. **IMPORTANT:** Also add your production app callback URL (if you want direct redirects):
   ```
   https://your-production-domain.com/org/[subdomain]/sso/callback
   ```

**Note:** Supabase handles the OAuth flow, so the Supabase callback URL is the primary one needed.

### 4. Supabase Dashboard

Verify in Supabase Dashboard → Authentication → Providers:

- ✅ Google provider is enabled
- ✅ Client ID and Client Secret are correct
- ✅ Redirect URL is set to: `https://your-project-ref.supabase.co/auth/v1/callback`

## 🧪 Testing in Production

1. Navigate to: `https://your-production-domain.com/org/[subdomain]/login`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Should redirect to: `https://your-production-domain.com/org/[subdomain]/dashboard`

## 🐛 Troubleshooting

### Issue: "bad_oauth_state" error
- **Solution:** Already fixed in code - ensure you've deployed the latest changes

### Issue: Redirects to homepage instead of callback
- **Check:** Organization SSO settings → Redirect URL is set correctly
- **Check:** `NEXT_PUBLIC_APP_URL` is set in Vercel (optional)

### Issue: "Organization not found" in callback
- **Check:** URL path contains organization subdomain: `/org/[subdomain]/sso/callback`
- **Check:** Organization subdomain matches database

### Issue: "Unable to exchange external code"
- **Check:** Google Cloud Console → OAuth credentials → Redirect URI includes Supabase callback
- **Check:** Supabase Dashboard → Google provider → Client ID and Secret are correct

## 📝 Quick Verification

After deployment, check browser console for:
```
[SSO] Redirect URL: https://your-production-domain.com/org/codesquare/sso/callback
[SSO] Provider: google
[SSO] Organization: codesquare
```

If you see these logs, the configuration is correct!


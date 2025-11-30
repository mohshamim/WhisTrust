# SSO Troubleshooting Guide

## Error: "Unable to exchange external code"

This error occurs when the redirect URI configured in Google Cloud Console doesn't match what Supabase expects.

### ✅ **Correct Configuration**

#### In Google Cloud Console:
1. Go to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, you MUST have:
   ```
   https://lyboxkxohvxkcolgrumw.supabase.co/auth/v1/callback
   ```
   ⚠️ **This is Supabase's callback URL, NOT your app's callback URL!**

#### In Supabase Dashboard:
1. Go to **Authentication** → **Providers** → **Google**
2. Make sure:
   - **Client ID (for OAuth)**: Matches your Google Cloud Console Client ID
   - **Client Secret (for OAuth)**: Matches your Google Cloud Console Client Secret

### ❌ **Common Mistakes**

1. **Wrong redirect URI in Google Cloud Console:**
   - ❌ `http://localhost:3000/org/codesquare/sso/callback` (WRONG!)
   - ✅ `https://lyboxkxohvxkcolgrumw.supabase.co/auth/v1/callback` (CORRECT!)

2. **Mismatched Client ID/Secret:**
   - Make sure the Client ID and Secret in Supabase Dashboard match exactly what's in Google Cloud Console

3. **Missing redirect URI:**
   - The redirect URI must be added in Google Cloud Console before it will work

### 🔧 **How to Fix**

1. **Update Google Cloud Console:**
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Click your OAuth Client ID
   - Under "Authorized redirect URIs", add:
     ```
     https://lyboxkxohvxkcolgrumw.supabase.co/auth/v1/callback
     ```
   - Click **Save**

2. **Verify Supabase Configuration:**
   - Go to Supabase Dashboard → Authentication → Providers → Google
   - Verify Client ID and Secret match Google Cloud Console
   - Make sure Google provider is **Enabled**

3. **Test Again:**
   - Clear browser cache/cookies
   - Try SSO login again

### 📝 **OAuth Flow Explanation**

The OAuth flow works like this:

1. User clicks "Google Login" → Redirects to Google
2. User authenticates with Google
3. Google redirects to: `https://lyboxkxohvxkcolgrumw.supabase.co/auth/v1/callback` (Supabase's URL)
4. Supabase exchanges the code for tokens
5. Supabase redirects to: `http://localhost:3000/org/codesquare/sso/callback` (Your app's URL)
6. Your app creates/updates user profile and redirects to dashboard

**Key Point:** Google must redirect to Supabase first, then Supabase redirects to your app!

### 🔍 **Finding Your Supabase Project Reference**

Your Supabase project reference is in your Supabase URL:
- URL: `https://lyboxkxohvxkcolgrumw.supabase.co`
- Project Reference: `lyboxkxohvxkcolgrumw`
- Callback URL: `https://lyboxkxohvxkcolgrumw.supabase.co/auth/v1/callback`

### ✅ **Verification Checklist**

- [ ] Google Cloud Console has redirect URI: `https://[your-project-ref].supabase.co/auth/v1/callback`
- [ ] Supabase Dashboard has correct Client ID from Google
- [ ] Supabase Dashboard has correct Client Secret from Google
- [ ] Google provider is enabled in Supabase Dashboard
- [ ] SSO is enabled in your organization settings
- [ ] Organization SSO provider is set to "google"

### 🆘 **Still Having Issues?**

1. Check browser console for detailed error messages
2. Check Supabase logs: Dashboard → Logs → Auth
3. Verify the redirect URI matches exactly (no trailing slashes, correct protocol)
4. Make sure you're using the correct Supabase project (not demo project)


# SSO Configuration Verification Checklist

## ⚠️ Error: "Unable to exchange external code"

This error means Supabase cannot exchange the Google authorization code for a session. This is **always** a configuration mismatch issue.

## ✅ **Step-by-Step Verification**

### 1. **Verify Google Cloud Console Configuration**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. **Check "Authorized redirect URIs":**
   - ✅ Must have: `https://lyboxkxohvxkcolgrumw.supabase.co/auth/v1/callback`
   - ❌ Should NOT have: `http://localhost:3000/org/codesquare/sso/callback`

### 2. **Verify Supabase Dashboard Configuration**

1. Go to: Supabase Dashboard → Authentication → Providers → Google
2. **Check Client ID:**
   - Must match EXACTLY: `167613501959-rdhl9gbvloc32ttbne02509eehkjht8c.apps.googleusercontent.com`
   - Copy from Google Cloud Console and paste here
   - No extra spaces, no trailing characters

3. **Check Client Secret:**
   - Must match EXACTLY the secret from Google Cloud Console
   - If you lost it, create a new one in Google Cloud Console
   - Copy the VALUE (not the ID) immediately - it's only shown once

4. **Verify Provider is Enabled:**
   - Toggle should be ON (green)

### 3. **Common Mistakes**

#### ❌ **Mistake 1: Wrong Redirect URI in Google Cloud Console**
- **Wrong:** `http://localhost:3000/org/codesquare/sso/callback`
- **Correct:** `https://lyboxkxohvxkcolgrumw.supabase.co/auth/v1/callback`

#### ❌ **Mistake 2: Client ID Mismatch**
- Supabase has: `167613501959-xxxxx`
- Google Cloud Console has: `167613501959-yyyyy`
- **Fix:** Copy exact Client ID from Google Cloud Console to Supabase

#### ❌ **Mistake 3: Client Secret Mismatch**
- Old secret expired or was regenerated
- **Fix:** Create new secret in Google Cloud Console and update Supabase

#### ❌ **Mistake 4: Extra Spaces/Characters**
- Client ID has trailing space: `167613501959-xxxxx ` (wrong!)
- **Fix:** Copy-paste exactly, no manual typing

### 4. **How to Fix**

1. **Get Fresh Credentials from Google Cloud Console:**
   ```
   Client ID: 167613501959-rdhl9gbvloc32ttbne02509eehkjht8c.apps.googleusercontent.com
   Client Secret: [Copy the VALUE, not the ID]
   ```

2. **Update Supabase Dashboard:**
   - Go to: Authentication → Providers → Google
   - Paste Client ID exactly
   - Paste Client Secret exactly
   - Click "Save"

3. **Wait 2-3 minutes** for changes to propagate

4. **Clear browser cache and cookies**

5. **Test again**

### 5. **Verification Test**

After updating, test the flow:

1. Go to: `http://localhost:3000/org/codesquare/login`
2. Click "Google Login"
3. Complete Google authentication
4. Should redirect to dashboard (not error page)

### 6. **Still Not Working?**

Check server logs (terminal where `npm run dev` is running):
- Look for: "SSO Callback: Failed to exchange code"
- Check the error details

Check browser console (F12):
- Look for any JavaScript errors
- Check Network tab for failed requests

### 7. **Quick Verification Command**

You can verify your Supabase configuration matches by checking:
- Supabase Dashboard → Authentication → Providers → Google
- Compare Client ID character-by-character with Google Cloud Console
- Make sure there are no differences

## 📝 **Summary**

The error "Unable to exchange external code" means:
- ✅ Google OAuth is working (code is being generated)
- ✅ Redirect to Supabase is working
- ❌ Supabase can't exchange the code (Client ID/Secret mismatch)

**Solution:** Ensure Client ID and Secret in Supabase match Google Cloud Console EXACTLY.


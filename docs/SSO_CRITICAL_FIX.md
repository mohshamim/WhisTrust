# 🚨 CRITICAL SSO FIX REQUIRED

## ❌ **ISSUE FOUND**

In your **Supabase Dashboard** → Authentication → Providers → Google:

**Client Secret field contains the Client ID instead of the actual secret!**

- **Current (WRONG):** `167613501959-rdhl9gbvloc32ttbne02509eehkjht8c.apps.googleuserconte`
- **Should be:** A completely different secret string (like `GOCSPX-xxxxxxxxxxxxx`)

## ✅ **HOW TO FIX**

### Step 1: Get the Real Client Secret

1. Go to: **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID: `167613501959-rdhl9gbvloc32ttbne02509eehkjht8c`
3. Scroll to **"Client secrets"** section
4. You'll see a masked secret: `****7UKS`
5. **If you can see the full value:**
   - Click the eye icon to reveal it
   - Copy the **entire value** (it will look like `GOCSPX-xxxxxxxxxxxxx` or similar)
6. **If you can't see it (most likely):**
   - Click **"+ Add secret"**
   - Give it a name (e.g., "WhisTrust SSO Secret")
   - Click **"Add"**
   - **IMMEDIATELY copy the VALUE** (you won't see it again!)
   - It will look like: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Update Supabase Dashboard

1. Go to: **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. **Client IDs field:** Should be: `167613501959-rdhl9gbvloc32ttbne02509eehkjht8c.apps.googleusercontent.com`
   - ✅ This looks correct
3. **Client Secret (for OAuth) field:** 
   - ❌ **DELETE the current value** (which is the Client ID)
   - ✅ **Paste the REAL secret** you copied from Google Cloud Console
   - It should look like: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. Click **"Save"**

### Step 3: Verify Configuration

**Google Cloud Console:**
- ✅ Client ID: `167613501959-rdhl9gbvloc32ttbne02509eehkjht8c.apps.googleusercontent.com`
- ✅ Redirect URI: `https://lyboxkxohvxkcolgrumw.supabase.co/auth/v1/callback`
- ✅ Client Secret: `GOCSPX-xxxxxxxxxxxxx` (the VALUE, not the ID)

**Supabase Dashboard:**
- ✅ Client IDs: `167613501959-rdhl9gbvloc32ttbne02509eehkjht8c.apps.googleusercontent.com`
- ✅ Client Secret: `GOCSPX-xxxxxxxxxxxxx` (SAME as Google Cloud Console)
- ✅ Provider Enabled: ON

### Step 4: Test

1. Wait 2-3 minutes for changes to propagate
2. Clear browser cache/cookies
3. Go to: `http://localhost:3000/org/codesquare/login`
4. Click "Google Login"
5. Should work now! ✅

## 🔍 **How to Identify the Issue**

**Client ID format:**
- Looks like: `167613501959-rdhl9gbvloc32ttbne02509eehkjht8c.apps.googleusercontent.com`
- Ends with: `.apps.googleusercontent.com`

**Client Secret format:**
- Looks like: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Starts with: `GOCSPX-`
- Much shorter than Client ID
- Completely different string

**If your Client Secret looks like the Client ID, that's the problem!**

## ⚠️ **Important Notes**

1. **Client Secret is only shown once** when created in Google Cloud Console
2. If you lost it, you **must create a new one**
3. The old secret will stop working after you create a new one
4. Make sure to update Supabase immediately after creating a new secret


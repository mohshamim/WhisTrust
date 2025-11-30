# SSO Test Cases

## Test Suite for Single Sign-On Implementation

### Prerequisites

1. Database migration `004_add_sso_fields.sql` applied
2. Supabase OAuth providers configured (Azure AD, Google, OIDC)
3. Test organization created with admin user
4. Test OAuth accounts available

---

## Test Case 1: SSO Configuration - Enable SSO

**Objective:** Verify SSO can be enabled and configured

**Steps:**
1. Log in as organization admin
2. Navigate to Settings → Single Sign-On (SSO)
3. Toggle "Enable SSO" to ON
4. Select provider: "Azure AD"
5. Enter Client ID: `test-azure-client-id`
6. Enter Client Secret: `test-azure-secret`
7. Enter Redirect URL: `https://example.com/org/test/sso/callback`
8. Click "Save SSO Configuration"

**Expected Results:**
- ✅ Success toast: "SSO configuration updated successfully"
- ✅ Configuration saved to database
- ✅ Audit log entry created: `action = 'update_sso_config'`
- ✅ SSO section shows saved values

**Database Verification:**
```sql
SELECT sso_enabled, sso_provider, sso_client_id 
FROM organizations 
WHERE subdomain = 'test';
-- Should show: true, 'azure', 'test-azure-client-id'
```

---

## Test Case 2: SSO Login - Successful Flow

**Objective:** Verify SSO login works end-to-end

**Prerequisites:**
- SSO enabled for organization
- User profile exists in `admin_profiles` with matching email
- OAuth provider configured in Supabase

**Steps:**
1. Navigate to `/org/[subdomain]/login`
2. Verify "Azure AD Login" button is visible
3. Click "Azure AD Login" button
4. Complete OAuth flow with Azure AD
5. Redirected back to application

**Expected Results:**
- ✅ SSO button visible on login page
- ✅ Redirects to Azure AD login
- ✅ After OAuth, redirects to `/org/[subdomain]/dashboard`
- ✅ User logged in successfully
- ✅ Profile `last_login_at` updated
- ✅ Audit log entry: `action = 'sso_login_success'`

**Database Verification:**
```sql
SELECT last_login_at FROM admin_profiles WHERE email = 'user@example.com';
-- Should show recent timestamp

SELECT action, user_email FROM audit_logs 
WHERE action = 'sso_login_success' 
ORDER BY created_at DESC LIMIT 1;
-- Should show successful login
```

---

## Test Case 3: SSO Login - Domain Restriction

**Objective:** Verify domain restriction works

**Prerequisites:**
- SSO enabled with domain restriction: `example.com`
- User with email `user@example.com` exists
- User with email `user@other.com` exists

**Steps:**
1. Configure SSO with domain restriction: `example.com`
2. Attempt SSO login with `user@example.com`
3. Attempt SSO login with `user@other.com`

**Expected Results:**
- ✅ `user@example.com` - Login succeeds
- ✅ `user@other.com` - Login fails with error: "Email domain other.com is not allowed. Only example.com emails can access this organization."
- ✅ Failed attempt logged: `action = 'sso_login_failed'`

---

## Test Case 4: SSO Login - User Not Found

**Objective:** Verify handling of users without profiles

**Prerequisites:**
- SSO enabled
- No profile exists for test user email
- Domain restriction not set (or doesn't match)

**Steps:**
1. Complete OAuth flow with email that has no profile
2. System processes callback

**Expected Results:**
- ✅ Login fails with error: "User not found. Please contact your administrator to be added to this organization."
- ✅ User signed out from Supabase
- ✅ Failed attempt logged: `action = 'sso_login_failed'`
- ✅ Redirected to login page with error message

---

## Test Case 5: SSO Login - Auto-Create Profile (Domain Match)

**Objective:** Verify auto-creation of profiles for matching domains

**Prerequisites:**
- SSO enabled with domain restriction: `example.com`
- No profile exists for `newuser@example.com`

**Steps:**
1. Complete OAuth flow with `newuser@example.com`
2. System processes callback

**Expected Results:**
- ✅ Profile auto-created in `admin_profiles`
- ✅ `organization_id` set correctly
- ✅ `role` set to `'viewer'` (default)
- ✅ `is_active` set to `true`
- ✅ Login succeeds
- ✅ Audit log: `action = 'sso_login_success'`

**Database Verification:**
```sql
SELECT id, email, organization_id, role, is_active 
FROM admin_profiles 
WHERE email = 'newuser@example.com';
-- Should show new profile with correct org_id and role='viewer'
```

---

## Test Case 6: SSO Disabled

**Objective:** Verify SSO button hidden when disabled

**Prerequisites:**
- SSO disabled for organization

**Steps:**
1. Navigate to `/org/[subdomain]/login`
2. Check for SSO button

**Expected Results:**
- ✅ SSO button NOT visible
- ✅ Only email/password form shown
- ✅ Regular login works normally

---

## Test Case 7: SSO Provider Selection

**Objective:** Verify different providers work

**Test 7a: Azure AD**
- Configure provider: `azure`
- Button text: "Azure AD Login"
- OAuth flow uses Azure AD

**Test 7b: Google Workspace**
- Configure provider: `google`
- Button text: "Google Login"
- OAuth flow uses Google

**Test 7c: Generic OIDC**
- Configure provider: `oidc`
- Button text: "Corporate Login"
- OAuth flow uses OIDC provider
- Issuer URL required and used

---

## Test Case 8: SSO Configuration - Validation

**Objective:** Verify validation of SSO configuration

**Steps:**
1. Enable SSO without selecting provider
2. Enable SSO without Client ID
3. Enable OIDC without Issuer URL

**Expected Results:**
- ✅ Database constraint prevents invalid configuration
- ✅ Error message shown if validation fails
- ✅ Configuration not saved if invalid

---

## Test Case 9: SSO Callback - Error Handling

**Objective:** Verify error handling in callback

**Test 9a: Missing Authorization Code**
- Navigate to callback URL without `code` parameter

**Expected Results:**
- ✅ Error logged: `action = 'sso_login_failed'`
- ✅ Redirected to login with error message

**Test 9b: Invalid Authorization Code**
- Navigate to callback with invalid `code`

**Expected Results:**
- ✅ Supabase rejects code
- ✅ Error logged
- ✅ Redirected to login with error

**Test 9c: OAuth Provider Error**
- OAuth provider returns error

**Expected Results:**
- ✅ Error parameter captured from URL
- ✅ Error logged with description
- ✅ Redirected to login with error message

---

## Test Case 10: SSO Configuration - Admin Only

**Objective:** Verify only admins can configure SSO

**Prerequisites:**
- User with role `manager` or `investigator`

**Steps:**
1. Log in as non-admin user
2. Navigate to Settings page

**Expected Results:**
- ✅ SSO configuration section NOT visible
- ✅ Only admin role can see/configure SSO

---

## Test Case 11: SSO - Organization Status Check

**Objective:** Verify SSO blocked for suspended/cancelled orgs

**Prerequisites:**
- Organization status: `suspended` or `cancelled`
- SSO enabled

**Steps:**
1. Attempt SSO login

**Expected Results:**
- ✅ Login fails with error: "This organization is currently suspended/cancelled"
- ✅ User signed out
- ✅ Error logged

---

## Test Case 12: SSO - RLS Policy Verification

**Objective:** Verify RLS policies work with SSO users

**Prerequisites:**
- SSO user logged in
- User has profile with `organization_id`

**Steps:**
1. Query `reports` table
2. Query `admin_profiles` table
3. Query `organizations` table

**Expected Results:**
- ✅ User can only see data from their organization
- ✅ RLS policies enforce tenant isolation
- ✅ `auth.uid()` works correctly for SSO users

---

## Test Case 13: SSO - Concurrent Logins

**Objective:** Verify multiple users can use SSO simultaneously

**Steps:**
1. User A logs in via SSO
2. User B logs in via SSO (same organization)
3. Both users active

**Expected Results:**
- ✅ Both users logged in successfully
- ✅ Each user sees only their organization's data
- ✅ No conflicts or errors

---

## Test Case 14: SSO - Secret Management

**Objective:** Verify client secret is never exposed

**Steps:**
1. Configure SSO with client secret
2. Call `GET /api/org/sso`
3. Check response

**Expected Results:**
- ✅ Client secret NOT in response
- ✅ Secret only used server-side
- ✅ Empty string shown in UI (placeholder)

---

## Test Case 15: SSO - Redirect URL Auto-Generation

**Objective:** Verify redirect URL auto-generated if not provided

**Steps:**
1. Enable SSO without providing redirect URL
2. Save configuration

**Expected Results:**
- ✅ Redirect URL auto-generated: `{baseUrl}/org/{subdomain}/sso/callback`
- ✅ URL saved to database
- ✅ URL shown in UI

---

## Test Case 16: SSO - Update Existing Configuration

**Objective:** Verify SSO config can be updated

**Steps:**
1. Configure SSO with Azure AD
2. Update provider to Google
3. Update Client ID
4. Leave Client Secret empty

**Expected Results:**
- ✅ Configuration updated successfully
- ✅ Old Client Secret preserved (not overwritten with empty)
- ✅ New values saved
- ✅ Audit log created

---

## Test Case 17: SSO - Profile Update on Login

**Objective:** Verify profile metadata updated from OAuth

**Prerequisites:**
- Profile exists for user
- OAuth provider returns updated name/avatar

**Steps:**
1. Complete SSO login
2. Check profile after login

**Expected Results:**
- ✅ `full_name` updated from OAuth metadata
- ✅ `avatar_url` updated from OAuth metadata
- ✅ `last_login_at` updated
- ✅ `updated_at` updated

---

## Test Case 18: SSO - Inactive User

**Objective:** Verify inactive users cannot login via SSO

**Prerequisites:**
- User profile exists with `is_active = false`
- SSO enabled

**Steps:**
1. Complete SSO login with inactive user

**Expected Results:**
- ✅ Login fails: "Your account is inactive. Please contact your administrator."
- ✅ User signed out
- ✅ Error logged

---

## Test Execution Checklist

- [ ] Test Case 1: SSO Configuration - Enable SSO
- [ ] Test Case 2: SSO Login - Successful Flow
- [ ] Test Case 3: SSO Login - Domain Restriction
- [ ] Test Case 4: SSO Login - User Not Found
- [ ] Test Case 5: SSO Login - Auto-Create Profile
- [ ] Test Case 6: SSO Disabled
- [ ] Test Case 7: SSO Provider Selection (Azure, Google, OIDC)
- [ ] Test Case 8: SSO Configuration - Validation
- [ ] Test Case 9: SSO Callback - Error Handling
- [ ] Test Case 10: SSO Configuration - Admin Only
- [ ] Test Case 11: SSO - Organization Status Check
- [ ] Test Case 12: SSO - RLS Policy Verification
- [ ] Test Case 13: SSO - Concurrent Logins
- [ ] Test Case 14: SSO - Secret Management
- [ ] Test Case 15: SSO - Redirect URL Auto-Generation
- [ ] Test Case 16: SSO - Update Existing Configuration
- [ ] Test Case 17: SSO - Profile Update on Login
- [ ] Test Case 18: SSO - Inactive User

---

## Notes

- All test cases should be run in a test environment
- Use test OAuth applications, not production
- Verify audit logs after each test
- Check database state between tests
- Test with different user roles and organization statuses


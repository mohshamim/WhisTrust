# SSO (Single Sign-On) Implementation Guide

## Overview

This document describes the SSO implementation for WhisTrust client organizations. SSO allows users to authenticate using Azure AD, Google Workspace, or Generic OIDC providers instead of username/password.

## Architecture

### Components

1. **Database Schema** (`supabase/migrations/004_add_sso_fields.sql`)

   - Adds SSO configuration fields to `organizations` table
   - Fields: `sso_enabled`, `sso_provider`, `sso_client_id`, `sso_client_secret`, `sso_issuer_url`, `sso_redirect_url`, `sso_domain_restriction`

2. **SSO Service** (`lib/services/sso-auth.ts`)

   - `getSSOConfig()` - Get SSO configuration for organization
   - `initiateSSOLogin()` - Start OAuth flow
   - `handleSSOCallback()` - Process OAuth callback and create/update user
   - `logFailedSSOAttempt()` - Log failed SSO attempts

3. **SSO Callback Route** (`app/org/[subdomain]/sso/callback/route.ts`)

   - Handles OAuth redirect from provider
   - Exchanges code for session
   - Maps user to organization
   - Redirects to dashboard

4. **Login Page** (`app/org/[subdomain]/login/page.tsx`)

   - Shows SSO button when enabled
   - Button text varies by provider (Azure AD Login, Google Login, Corporate Login)

5. **Settings Page** (`app/org/[subdomain]/settings/page.tsx`)

   - SSO configuration UI (admin only)
   - Toggle SSO on/off
   - Configure provider, client ID, secret, issuer URL, redirect URL, domain restriction

6. **API Routes**
   - `GET /api/org/sso` - Get SSO configuration
   - `PUT /api/org/sso` - Update SSO configuration

## Setup Instructions

### 1. Run Database Migration

```sql
-- Run the migration
psql -d your_database -f supabase/migrations/004_add_sso_fields.sql
```

Or apply via Supabase dashboard SQL editor.

### 2. Configure Supabase OAuth Providers

#### Azure AD Setup

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Azure" provider
3. Configure:

   - **Application (client) ID**: From Azure AD app registration
   - **Client secret value**: From Azure AD app registration
   - **Redirect URL**: `https://your-project.supabase.co/auth/v1/callback`

4. In Azure AD:
   - Register new app in Azure Portal
   - Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Application (client) ID and create client secret
   - Grant API permissions if needed

#### Google Workspace Setup

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Google" provider
3. Configure:

   - **Client ID (for OAuth)**: From Google Cloud Console
   - **Client secret (for OAuth)**: From Google Cloud Console

4. In Google Cloud Console:
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret

#### Generic OIDC Setup

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "OIDC" provider
3. Configure:

   - **Issuer URL**: Your OIDC provider's issuer URL (e.g., `https://accounts.example.com`)
   - **Client ID**: From OIDC provider
   - **Client Secret**: From OIDC provider

4. In your OIDC provider:
   - Register application
   - Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID, Client Secret, and Issuer URL

### 3. Configure Organization SSO

1. Log in as organization admin
2. Navigate to Settings → Single Sign-On (SSO)
3. Enable SSO toggle
4. Select provider (Azure AD, Google Workspace, or Generic OIDC)
5. Enter configuration:

   - **Client ID**: OAuth client ID (for reference/documentation)
   - **Client Secret**: OAuth client secret (stored encrypted)
   - **Issuer URL**: Required for OIDC only
   - **Redirect URL**: Auto-generated, can be customized
   - **Domain Restriction**: Optional - restrict to specific email domain

6. Click "Save SSO Configuration"

### 4. Test SSO Flow

1. Navigate to organization login page: `/org/[subdomain]/login`
2. Click SSO button (e.g., "Azure AD Login")
3. Complete OAuth flow with provider
4. Should redirect to dashboard on success

## Security Considerations

### Tenant Isolation

- SSO users are mapped to organizations via email domain or explicit profile creation
- Domain restriction enforces email domain matching
- Users without profiles are rejected (unless auto-create is enabled for matching domains)
- RLS policies ensure users can only access their organization's data

### Audit Logging

- All SSO login attempts are logged to `audit_logs` table
- Successful logins: `action = 'sso_login_success'`
- Failed logins: `action = 'sso_login_failed'` with reason
- SSO configuration changes are logged: `action = 'update_sso_config'`

### Client Secret Storage

- Client secrets are stored in database but never returned to client
- Secrets should be encrypted at rest (Supabase handles this)
- Secrets are only used server-side in OAuth flow

## Multi-Tenant Considerations

### Important Note

Supabase OAuth providers are configured at the **project level**, not per-organization. This means:

- All organizations using Azure AD will use the same Azure AD app
- All organizations using Google will use the same Google OAuth app
- For true multi-tenant SSO with different client IDs per organization, you'd need:
  - Custom OAuth implementation
  - Or multiple Supabase projects (one per organization)

### Current Implementation

The current implementation:

- Stores organization-specific SSO config for reference/documentation
- Uses Supabase's project-level OAuth configuration
- Maps users to organizations via email domain or explicit profile
- Works well for organizations sharing the same OAuth provider

### Future Enhancements

For true multi-tenant SSO:

1. Implement custom OAuth flow using organization's client ID/secret
2. Use Supabase's `exchangeCodeForSession` with custom tokens
3. Or use separate Supabase projects per organization

## Testing

### Test Cases

1. **SSO Enabled - Successful Login**

   - Enable SSO for organization
   - User clicks SSO button
   - Completes OAuth flow
   - User redirected to dashboard
   - Profile created/updated
   - Audit log created

2. **SSO Enabled - Domain Restriction**

   - Configure domain restriction (e.g., `example.com`)
   - User with `user@example.com` - ✅ Allowed
   - User with `user@other.com` - ❌ Rejected

3. **SSO Enabled - User Not in Organization**

   - User completes OAuth with valid email
   - No profile exists for user
   - Domain doesn't match restriction
   - ❌ Login rejected with error message

4. **SSO Disabled**

   - SSO button not shown on login page
   - Only email/password login available

5. **SSO Configuration Update**

   - Admin updates SSO config
   - Changes saved to database
   - Audit log created
   - Login page reflects new config

6. **Failed SSO Attempt**
   - User cancels OAuth flow
   - Error logged to audit_logs
   - User redirected to login with error message

## Troubleshooting

### SSO Button Not Showing

- Check `sso_enabled = true` in database
- Check `sso_provider` is set (azure, google, or oidc)
- Check organization status is 'active' or 'trial'

### OAuth Redirect Fails

- Verify redirect URL matches Supabase callback URL
- Check redirect URL is added to OAuth provider's allowed redirect URIs
- Verify Supabase OAuth provider is enabled in dashboard

### User Not Found Error

- Check user has profile in `admin_profiles` table
- Check `organization_id` matches
- Check `is_active = true`
- If domain restriction enabled, verify email domain matches

### RLS Policy Issues

- Ensure RLS policies allow SSO users to access their organization's data
- Check `auth.uid()` works correctly for SSO users
- Verify `organization_id` is set correctly in profile

## API Reference

### GET /api/org/sso

Get SSO configuration for current organization.

**Response:**

```json
{
  "success": true,
  "config": {
    "sso_enabled": true,
    "sso_provider": "azure",
    "sso_client_id": "...",
    "sso_issuer_url": null,
    "sso_redirect_url": "https://...",
    "sso_domain_restriction": "example.com"
  }
}
```

### PUT /api/org/sso

Update SSO configuration.

**Request:**

```json
{
  "sso_enabled": true,
  "sso_provider": "azure",
  "sso_client_id": "...",
  "sso_client_secret": "...",
  "sso_issuer_url": null,
  "sso_redirect_url": "https://...",
  "sso_domain_restriction": "example.com"
}
```

**Response:**

```json
{
  "success": true,
  "organization": {
    "id": "...",
    "name": "...",
    "subdomain": "...",
    "sso_enabled": true,
    "sso_provider": "azure"
  }
}
```

## Code Diff Summary

### New Files

- `supabase/migrations/004_add_sso_fields.sql` - Database migration
- `lib/services/sso-auth.ts` - SSO service functions
- `app/org/[subdomain]/sso/callback/route.ts` - OAuth callback handler
- `app/api/org/sso/route.ts` - SSO configuration API
- `docs/SSO_IMPLEMENTATION_GUIDE.md` - This document

### Modified Files

- `app/org/[subdomain]/login/page.tsx` - Added SSO button
- `app/org/[subdomain]/settings/page.tsx` - Added SSO configuration UI

## Next Steps

1. Run database migration
2. Configure OAuth providers in Supabase dashboard
3. Test SSO flow with each provider
4. Configure SSO for organizations via Settings page
5. Monitor audit logs for SSO events

## Support

For issues or questions:

1. Check audit logs for failed SSO attempts
2. Verify Supabase OAuth provider configuration
3. Check organization SSO configuration in database
4. Review browser console for OAuth errors

# QA & Polish Checklist

This document summarizes the key checks to run before production:

## Functional
- Anonymous public submit: success and error paths (near/at limit, feature off).
- Offline case create: success and error paths (rate limit, at limit).
- Messaging: reporter and admin; throttles applied; email notifications fire.
- Users: create, role change, activate/deactivate; usage quota handling.
- Branding: logo variants, favicon, theme color live preview; persistence.
- Notification preferences: toggles save and affect emails.
- Super Admin: global analytics loads; bootstrap admin flow works.

## Accessibility
- Icon-only buttons have `aria-label`.
- Forms have labels; error messages are announced (alert role).
- Focus states visible (Tailwind outline ring).

## Performance
- Apply indexes in `docs/performance-indexes.sql`.
- Verify common filters on reports/users are snappy.

## Reliability
- SMTP envs set: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`.
- Rate limits configured and observed in logs.
- Error and empty states display friendly messages.

## Security
- Admin-only endpoints require session and RLS.
- Public endpoints rate-limited and validate inputs.
- Audit logs created for critical actions.

## Exports
- Org analytics CSV exports.
- Super Admin analytics CSV (global) if required.



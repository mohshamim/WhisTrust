# WhisTrust Credentials Summary

Consolidated reference of known test/demo credentials with URLs, roles, and organizations found in this repository.

> Note: These are demo/test credentials from files already present in the repo (see sources listed below). Rotate or replace before production use.

## Super Admin (Platform-wide)

- Portal: Super Admin
- URL: `http://localhost:3000/superadmin/login`
- Organization: Platform
- Role: Super Admin
- Email: `sup-adm@whistrust.com`
- Password: `sup-pass-adm!1@3#5`

Source: `CREDENTIALS_FOR_TESTER.txt`

---

## Multi‑Tenant Organizations

### AISAR (Enterprise)

- Portal: AISAR Tenant Admin
- URL: `http://localhost:3000/org/aisar/login`
- Organization: `aisar`
- Role: Admin
- Email: `admin@aisar.com`
- Password: `Aisar@123!`

Additional roles (if created):

- Manager: `manager@aisar.com` (password set during user creation)
- HR: `hr@aisar.com` (password set during user creation)

Source: `CREDENTIALS_FOR_TESTER.txt` and session-provided credentials

### CodeSquare (Professional)

- Portal: CodeSquare Tenant Admin
- URL: `http://localhost:3000/org/codesquare/login`
- Organization: `codesquare`
- Roles: Admin (`admin@codesquare.com`), Investigator (`investigator@codesquare.com`)
- Passwords: Set during user creation in Supabase Auth

Source: `CREDENTIALS_FOR_TESTER.txt`

---

## Single‑Tenant Demo (UI-exposed)

- Portal: Demo Admin
- URL: `http://localhost:3000/admin/login`
- Organization: Demo
- Role: Admin
- Email: `ahmed.admin@whistrust.com`
- Password: `Admin@WhistTrust2025`

Additional demo roles (examples):

- Manager (HR): `hassan.hr@whistrust.com` / `Manager@WhistTrust2025`
- Manager (Finance): `omar.finance@whistrust.com` / `Manager@WhistTrust2025`
- Investigator: `yusuf.investigator@whistrust.com` / `Investigator@WhistTrust2025`

Source: `DEMO_CREDENTIALS.md`

---

## Useful Endpoints

- Demo Reporter Submit: `http://localhost:3000/report`
- Demo Track Case: `http://localhost:3000/track?code=...`
- Tenant Reporter Submit (AISAR): `http://localhost:3000/org/aisar/report`
- Tenant Track Case (AISAR): `http://localhost:3000/org/aisar/track?code=...`

---

## Sources in Repo

- `DEMO_CREDENTIALS.md` (demo roles and passwords)
- `CREDENTIALS_FOR_TESTER.txt` (superadmin, AISAR, CodeSquare)
- `README_MULTI_TENANT.md`, `MULTI_TENANT_SETUP_GUIDE.md` (environment/URLs)

If you need this in CSV or a redacted/exportable format, let me know and I’ll generate it.

# Glacier email-link verification setup

Glacier sends its own branded confirmation email through Resend. Supabase's built-in **Confirm signup email template is not edited or customized**. Supabase creates the signup token server-side; Glacier places its hashed token in a one-time callback URL, and the original browser consumes it after the user explicitly confirms.

## What this flow does

1. The user enters an email and password on Glacier.
2. The Edge Function creates a pending Supabase Auth user with `auth.admin.generateLink({ type: "signup" })`.
3. Glacier sends a confirmation email through Resend, using its own HTML. No Supabase email-template changes are needed.
4. The email link opens Glacier's confirmation page on any device.
5. The user clicks **Confirm my email**. The confirmation token is published to the original browser's short-lived handoff.
6. The original browser calls `verifyOtp` with the signup token and receives its Supabase session.

## Required one-time setup

### 1. Apply the database migration

Run `supabase/migrations/202611170001_glacier_email_handoff.sql` in the Supabase SQL Editor. It creates a private table for short-lived handoffs and a database-backed rate limit. Anonymous and authenticated clients have no direct table access; the Edge Function uses the platform service role.

### 2. Set up email delivery

Create a Resend account, verify a sender domain you control, and create an API key. The sender address must belong to that verified domain. Resend's shared test sender is not suitable for sending to arbitrary users.

### 3. Add GitHub Actions secrets (no local terminal needed)

In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret** and add:

- `SUPABASE_ACCESS_TOKEN`: a Supabase personal access token.
- `SUPABASE_PROJECT_REF`: the project reference from the Supabase project URL.
- `RESEND_API_KEY`: the Resend API key.
- `RESEND_FROM_EMAIL`: the verified sender, e.g. `Glacier <accounts@your-verified-domain.com>`.
- `TURNSTILE_SECRET_KEY` (optional): set this if the public Turnstile site key is enabled in Vercel.

The repository workflow `.github/workflows/deploy-email-verification-handoff.yml` deploys the Edge Function and sets the Resend secrets automatically when this feature branch is updated. This avoids installing the Supabase CLI or running commands on your computer.

### 4. Enable email confirmation

In Supabase Dashboard, open **Authentication → Providers → Email** and enable **Confirm email**.

### 5. Allow the callback URL

In **Authentication → URL Configuration**, add:

`https://glacier-beta-coral.vercel.app/auth/confirm`

Set the Site URL to `https://glacier-beta-coral.vercel.app`. Add an exact Vercel preview callback URL only if you intend to test from that preview.

**Do not edit Authentication → Email Templates → Confirm signup.** This implementation does not depend on that template.

## Test

1. Open Glacier in Browser A and register with an email address you control.
2. Leave the confirmation popup open in Browser A.
3. Open the email link on another device or browser.
4. Click **Confirm my email** on Glacier's confirmation page.
5. Browser A should automatically verify the signup and sign in.
6. Repeat with the email opened in the same browser.

The handoff expires after 30 minutes. The browser secret is random and stored only in the original browser's local storage; only its hash is stored server-side. The confirmation page requires an explicit click so automated email-link scanners do not consume the confirmation token.

## Security and operational notes

- The Supabase service-role key is never exposed to the browser or committed to GitHub.
- Passwords are sent only over HTTPS to the Edge Function and passed directly to Supabase Auth Admin; they are not stored by Glacier.
- The Edge Function verifies the optional Cloudflare Turnstile token server-side when `TURNSTILE_SECRET_KEY` is configured.
- Signup handoff creation is rate-limited to five attempts per IP per ten-minute window.
- Supabase still creates a pending, unconfirmed row in `auth.users` before the user clicks the email link. This flow cannot defer that Auth row.
- A verified Resend sender domain and API key are required before signup email delivery can work.
- If email delivery fails after Supabase creates the pending user, do not repeatedly register the same address. Check the Edge Function logs and email-provider status first.

## References

- [Supabase Admin generateLink](https://supabase.com/docs/reference/javascript/auth-admin-generatelink)
- [Supabase verifyOtp](https://supabase.com/docs/reference/javascript/auth-verifyotp)
- [Supabase send emails from Edge Functions](https://supabase.com/docs/guides/functions/examples/send-emails)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)

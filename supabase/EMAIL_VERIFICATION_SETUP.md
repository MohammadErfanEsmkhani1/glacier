# Glacier email confirmation and original-browser sign-in

Glacier now uses Supabase Auth's native signup confirmation email. No Resend account, custom SMTP provider, sender domain, or email-template editing is needed for a limited test.

## Important email-delivery limitation

Supabase's built-in email sender is intended for development/testing. It sends only to email addresses belonging to members of the Supabase organization and is limited to 2 emails per hour per project. It will not deliver to arbitrary public signup addresses. A public launch that sends confirmation emails to all users requires a custom SMTP provider or a supported email hook/provider. This limitation cannot be bypassed in application code.

## Flow

1. The user enters an email and password on Glacier.
2. Glacier creates a short-lived private handoff challenge, bound to the signup email.
3. Supabase Auth's native `signUp()` sends its default confirmation email. Its redirect URL includes the handoff ID and random secret.
4. After the email link is verified, Supabase redirects to Glacier's confirmation page with the confirmed session.
5. The user clicks **Continue to Glacier**. The confirmation page sends the session to the private handoff endpoint and signs out locally on that confirmation device.
6. The original browser polls the handoff, verifies the returned session with `setSession()`, and signs in automatically.

## One-time setup

### 1. Apply migrations

Run these SQL files in the Supabase SQL Editor, in order:

- `supabase/migrations/202611170001_glacier_email_handoff.sql`
- `supabase/migrations/202611170002_glacier_session_handoff.sql`

They create a private handoff table, IP rate limit, and short-lived session-token fields. Anonymous and authenticated clients have no direct table access; the Edge Function uses the platform service role.

### 2. GitHub Actions secrets

In GitHub, open **Settings → Secrets and variables → Actions** and add only:

- `SUPABASE_ACCESS_TOKEN`: your Supabase personal access token, scoped to this project with Edge Functions read/write.
- `SUPABASE_PROJECT_REF`: the project reference from the Supabase project URL.

There are no Resend secrets or sender-domain requirements.

After adding the secrets, open **Actions → Deploy Glacier email verification → Run workflow**. The workflow deploys the handoff Edge Function. Future changes to that function on this branch deploy automatically. No local terminal is needed.

### 3. Supabase Auth settings

In Supabase Dashboard:

- **Authentication → Providers → Email:** enable Email provider and **Confirm email**.
- **Authentication → URL Configuration:** set Site URL to `https://glacier-beta-coral.vercel.app`.
- Add `https://glacier-beta-coral.vercel.app/auth/confirm` to the redirect URL allow list.

Do not edit the Confirm signup email template.

## Test

Use an email address belonging to a member of your Supabase organization. The built-in sender will reject other addresses.

1. Open Glacier in Browser A and register.
2. Leave the verification popup open in Browser A.
3. Open the confirmation email link in another browser/device.
4. On Glacier's confirmation page, click **Continue to Glacier**.
5. Browser A should receive the session and sign in automatically.

The handoff expires after 30 minutes and can be published only once. Its secret is random, stored in the original browser, and hashed in the database. Session tokens are kept only in the private service-role table until the original browser acknowledges them or the handoff expires.

## Security notes

- The Edge Function verifies the access token with Supabase Auth and checks that the confirmed account email matches the email bound to the handoff.
- The session handoff is protected by a random per-registration secret, expiry, single-use publication, RLS, and service-role-only database access.
- The Supabase service-role key is never exposed to the browser or committed to GitHub.
- The password is sent directly to Supabase Auth through the official client and is not stored by Glacier.
- Supabase's confirmation endpoint may be visited by email-security scanners before the user opens the email. The explicit **Continue to Glacier** step protects the handoff, but cannot prevent a provider from consuming a confirmation link during prefetch.
- Supabase still creates a pending Auth user at signup. The application cannot avoid that row while using Supabase Auth.

## References

- [Supabase email SMTP restrictions](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase email confirmation and redirects](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)

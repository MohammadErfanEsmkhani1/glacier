# Glacier email verification setup

The registration screen now uses a six-digit email code. The code is entered in the same Glacier browser session that submitted the email and password, so the browser that opens an email link does not determine where the user is signed in.

## 1. Require email confirmation

In the Supabase Dashboard, open **Authentication → Providers → Email** and make sure **Confirm email** is enabled.

Glacier checks for this setting indirectly: if sign-up returns an authenticated session immediately, the app signs that session out and displays a setup message instead of continuing.

## 2. Change the Confirm signup email template to a code

Open **Authentication → Email Templates → Confirm signup**.

Set the subject to:

`Your Glacier code is here`

Replace the body with this HTML. The important part is `{{ .Token }}`; do not include `{{ .ConfirmationURL }}` in this template, because Glacier expects the user to enter the code in the original browser.

```html
<div style="margin:0;padding:40px 16px;background:#100d12;color:#f4eff5;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:36px 30px;border:1px solid #39313d;border-radius:20px;background:#1b1620;">
    <p style="margin:0 0 22px;color:#c5a8e8;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">GLACIER</p>
    <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:30px;font-weight:400;">One small step before you settle in.</h1>
    <p style="margin:0 0 24px;color:#c8c0cc;font-size:15px;line-height:1.7;">We're glad you're here. Use this code to confirm your email address and finish creating your Glacier account.</p>
    <div style="margin:0 0 24px;padding:18px;border:1px solid #51465a;border-radius:14px;background:#120f15;text-align:center;color:#f4eff5;font-family:monospace;font-size:32px;font-weight:700;letter-spacing:10px;">{{ .Token }}</div>
    <p style="margin:0;color:#a99eae;font-size:13px;line-height:1.7;">This code is for your Glacier sign-up and can only be used once. If you didn't ask to create an account, you can safely ignore this email.</p>
  </div>
</div>
```

Save the template. Supabase's `{{ .Token }}` variable is the six-digit OTP used by Glacier's `verifyOtp` call.

## 3. Turn on bot protection (recommended)

Glacier includes optional Cloudflare Turnstile support on both the registration and sign-in screens, so enabling Supabase's Auth CAPTCHA does not block legitimate password sign-ins. To activate it:

1. Create a Turnstile widget for your Glacier website in Cloudflare. Include the production domain and any preview domains you intend to test.
2. In Supabase, open **Authentication → Settings → Bot and Abuse Protection**, enable CAPTCHA, select **Cloudflare Turnstile**, and paste the Turnstile **Secret key**.
3. In Vercel, add the Turnstile **Site key** as `VITE_TURNSTILE_SITE_KEY` for the Preview and Production environments (and locally in `.env.local`, if needed).
4. Redeploy Glacier so Vite exposes the site key to the registration screen.

The site key is public and belongs in the Vercel environment. The Turnstile secret belongs only in Supabase; never put it in Vite variables or browser code. If you do not configure Turnstile, Supabase's built-in Auth rate limits still apply, but the CAPTCHA widget will not appear.

## 4. Email delivery for production

Supabase's built-in email provider is intended for testing and has a very low sending allowance. Configure a trusted custom SMTP provider in **Authentication → SMTP Settings** before opening registration to the public. Also review the project's Auth rate limits and keep confirmation-code resending throttled.

## Important database detail

Supabase's standard `signUp()` operation creates a pending, unconfirmed row in `auth.users` before the OTP is entered. The standard flow cannot postpone that Auth row until after confirmation. Glacier does not establish a session or write a user profile/favorites/watch-history data to the app's public tables until the code is verified. The current schema does not have a separate public user-profile table.

## References

- [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase verifyOtp](https://supabase.com/docs/reference/javascript/auth-verifyotp)
- [Supabase CAPTCHA protection](https://supabase.com/docs/guides/auth/auth-captcha)
- [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)

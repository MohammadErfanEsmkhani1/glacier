import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const productionOrigin = "https://glacier-beta-coral.vercel.app";
const allowedOrigin = (origin: string) => {
  try {
    const host = new URL(origin).hostname;
    return host === "glacier-beta-coral.vercel.app" || (host.startsWith("glacier-") && host.endsWith(".vercel.app")) || host === "localhost" || host === "127.0.0.1";
  } catch { return false; }
};
const hashSecret = async (secret: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char] ?? char));

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const corsOrigin = allowedOrigin(origin) ? origin : productionOrigin;
  const headers = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers });
  if (!allowedOrigin(origin)) return Response.json({ error: "Origin not allowed" }, { status: 403, headers });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return Response.json({ error: "Authentication service is not configured" }, { status: 500, headers });
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const body = await req.json();
    const { action, handoff_id: id, secret } = body ?? {};
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return Response.json({ error: "Invalid handoff" }, { status: 400, headers });
    }

    if (action === "create") {
      if (typeof secret !== "string" || !/^[0-9a-f]{64}$/i.test(secret)) return Response.json({ error: "Invalid challenge secret" }, { status: 400, headers });
      const clientIp = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown").trim();
      const ipDigest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(clientIp));
      const ipHash = Array.from(new Uint8Array(ipDigest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const { data: allowed, error: rateError } = await admin.rpc("consume_auth_email_handoff_rate_limit", { p_ip_hash: ipHash });
      if (rateError) throw rateError;
      if (allowed !== true) return Response.json({ error: "Too many sign-up attempts from this connection. Please wait a few minutes and try again." }, { status: 429, headers });
      await admin.from("auth_email_handoffs").delete().lt("expires_at", new Date().toISOString());
      const { error } = await admin.from("auth_email_handoffs").insert({
        handoff_id: id,
        secret_hash: await hashSecret(secret),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });
      if (error) throw error;
      return Response.json({ ok: true }, { headers });
    }

    if (action === "signup") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const password = typeof body.password === "string" ? body.password : "";
      const redirectOrigin = typeof body.redirect_origin === "string" && allowedOrigin(body.redirect_origin)
        ? body.redirect_origin
        : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 8 || password.length > 128 || !redirectOrigin) {
        return Response.json({ error: "Please check your email, password, and Glacier address, then try again." }, { status: 400, headers });
      }
      if (typeof secret !== "string" || !/^[0-9a-f]{64}$/i.test(secret)) return Response.json({ error: "Invalid registration request" }, { status: 400, headers });
      const secretHash = await hashSecret(secret);
      const { data: challenge, error: challengeError } = await admin.from("auth_email_handoffs")
        .select("handoff_id")
        .eq("handoff_id", id)
        .eq("secret_hash", secretHash)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (challengeError) throw challengeError;
      if (!challenge) return Response.json({ error: "Your registration request expired. Please start again." }, { status: 410, headers });

      const resendKey = Deno.env.get("RESEND_API_KEY");
      const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
      if (!resendKey || !fromEmail) return Response.json({ error: "Glacier email delivery is not configured yet." }, { status: 503, headers });

      const captchaSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
      if (captchaSecret) {
        const captchaToken = typeof body.captcha_token === "string" ? body.captcha_token : "";
        if (!captchaToken) return Response.json({ error: "Please complete the security check and try again." }, { status: 400, headers });
        const form = new FormData();
        form.set("secret", captchaSecret);
        form.set("response", captchaToken);
        const remoteIp = req.headers.get("cf-connecting-ip");
        if (remoteIp) form.set("remoteip", remoteIp);
        const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
        const captchaResult = await verification.json();
        if (!verification.ok || captchaResult.success !== true) return Response.json({ error: "The security check expired. Please try again." }, { status: 400, headers });
      }

      const callback = new URL("/auth/confirm", redirectOrigin);
      callback.searchParams.set("handoff_id", id);
      const { data: generated, error: generateError } = await admin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: { redirectTo: callback.toString() },
      });
      if (generateError) {
        const message = generateError.message.toLowerCase().includes("already")
          ? "An account request already exists for this email. Try signing in, or contact Glacier support if you never received its confirmation email."
          : "We couldn't create your account right now. Please check the details and try again.";
        return Response.json({ error: message }, { status: 400, headers });
      }
      const tokenHash = generated.properties?.hashed_token;
      if (!tokenHash) throw new Error("Supabase did not return a signup confirmation token");

      const confirmationUrl = new URL("/auth/confirm", redirectOrigin);
      confirmationUrl.searchParams.set("handoff_id", id);
      confirmationUrl.searchParams.set("token_hash", tokenHash);
      confirmationUrl.searchParams.set("type", "signup");
      const safeEmail = escapeHtml(email);
      const html = `<!doctype html><html><body style="margin:0;padding:40px 16px;background:#100d12;color:#f4eff5;font-family:Arial,sans-serif"><div style="max-width:480px;margin:0 auto;padding:36px 30px;border:1px solid #39313d;border-radius:20px;background:#1b1620"><p style="margin:0 0 22px;color:#c5a8e8;font-size:11px;font-weight:700;letter-spacing:3px">GLACIER</p><h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:30px;font-weight:400">One small step before you settle in.</h1><p style="margin:0 0 24px;color:#c8c0cc;font-size:15px;line-height:1.7">We're glad you're here. Confirm your email address and your Glacier account will be ready.</p><a href="${confirmationUrl.toString()}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#c5a8e8;color:#17111d;text-decoration:none;font-weight:700">Confirm my email</a><p style="margin:24px 0 0;color:#a99eae;font-size:13px;line-height:1.7">If you didn't ask to create a Glacier account, you can safely ignore this email.</p><p style="margin:18px 0 0;color:#7f7484;font-size:11px">Sent to ${safeEmail}</p></div></body></html>`;
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: "Confirm your Glacier account",
          html,
        }),
      });
      if (!emailResponse.ok) {
        const providerError = await emailResponse.text();
        console.error("Glacier confirmation email delivery failed", providerError);
        return Response.json({ error: "Your account request was created, but the confirmation email could not be sent. Please contact Glacier support before trying again." }, { status: 502, headers });
      }
      return Response.json({ ok: true }, { headers });
    }

    if (action === "publish") {
      const tokenHash = body?.token_hash;
      if (typeof tokenHash !== "string" || tokenHash.length < 20 || tokenHash.length > 512) return Response.json({ error: "Invalid confirmation link" }, { status: 400, headers });
      const { data, error } = await admin.from("auth_email_handoffs")
        .update({ token_hash: tokenHash })
        .eq("handoff_id", id)
        .gt("expires_at", new Date().toISOString())
        .is("token_hash", null)
        .select("handoff_id")
        .maybeSingle();
      if (error) throw error;
      if (!data) return Response.json({ error: "This sign-up link has expired or has already been used. Request a fresh link from Glacier." }, { status: 410, headers });
      return Response.json({ ok: true }, { headers });
    }

    if (action === "poll" || action === "ack") {
      if (typeof secret !== "string" || !/^[0-9a-f]{64}$/i.test(secret)) return Response.json({ error: "Invalid challenge secret" }, { status: 400, headers });
      const secretHash = await hashSecret(secret);
      if (action === "poll") {
        const { data, error } = await admin.from("auth_email_handoffs")
          .select("token_hash")
          .eq("handoff_id", id)
          .eq("secret_hash", secretHash)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();
        if (error) throw error;
        return Response.json({ token_hash: data?.token_hash ?? null }, { headers });
      }
      const { error } = await admin.from("auth_email_handoffs").delete()
        .eq("handoff_id", id)
        .eq("secret_hash", secretHash);
      if (error) throw error;
      return Response.json({ ok: true }, { headers });
    }

    return Response.json({ error: "Unknown action" }, { status: 400, headers });
  } catch (error) {
    console.error("Email verification handoff failed", error);
    return Response.json({ error: "Could not process this email confirmation. Please try again." }, { status: 500, headers });
  }
});

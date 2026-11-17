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
    if (typeof secret !== "string" || !/^[0-9a-f]{64}$/i.test(secret)) {
      return Response.json({ error: "Invalid handoff secret" }, { status: 400, headers });
    }
    const secretHash = await hashSecret(secret);

    if (action === "create") {
      const clientIp = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown").trim();
      const ipDigest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(clientIp));
      const ipHash = Array.from(new Uint8Array(ipDigest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const { data: allowed, error: rateError } = await admin.rpc("consume_auth_email_handoff_rate_limit", { p_ip_hash: ipHash });
      if (rateError) throw rateError;
      if (allowed !== true) return Response.json({ error: "Too many sign-up attempts. Please wait a few minutes and try again." }, { status: 429, headers });
      await admin.from("auth_email_handoffs").delete().lt("expires_at", new Date().toISOString());
      const { error } = await admin.from("auth_email_handoffs").insert({
        handoff_id: id,
        secret_hash: secretHash,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });
      if (error) throw error;
      return Response.json({ ok: true }, { headers });
    }

    if (action === "publish") {
      const accessToken = body.access_token;
      const refreshToken = body.refresh_token;
      if (typeof accessToken !== "string" || accessToken.length < 40 || accessToken.length > 8192 ||
          typeof refreshToken !== "string" || refreshToken.length < 20 || refreshToken.length > 2048) {
        return Response.json({ error: "Invalid confirmation session" }, { status: 400, headers });
      }
      const { data, error } = await admin.from("auth_email_handoffs")
        .update({
          session_access_token: accessToken,
          session_refresh_token: refreshToken,
          published_at: new Date().toISOString(),
        })
        .eq("handoff_id", id)
        .eq("secret_hash", secretHash)
        .gt("expires_at", new Date().toISOString())
        .is("session_refresh_token", null)
        .select("handoff_id")
        .maybeSingle();
      if (error) throw error;
      if (!data) return Response.json({ error: "This sign-in handoff has expired or has already been used. Return to Glacier and start again." }, { status: 410, headers });
      return Response.json({ ok: true }, { headers });
    }

    if (action === "poll") {
      const { data, error } = await admin.from("auth_email_handoffs")
        .select("session_access_token, session_refresh_token")
        .eq("handoff_id", id)
        .eq("secret_hash", secretHash)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (error) throw error;
      return Response.json({
        access_token: data?.session_access_token ?? null,
        refresh_token: data?.session_refresh_token ?? null,
      }, { headers });
    }

    if (action === "ack") {
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

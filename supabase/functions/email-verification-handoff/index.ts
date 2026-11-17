import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigin = (origin: string) => {
  try {
    const url = new URL(origin);
    return url.hostname === "glacier-beta-coral.vercel.app"
      || url.hostname.endsWith(".vercel.app")
      || url.hostname === "localhost"
      || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const corsOrigin = allowedOrigin(origin) ? origin : "https://glacier-beta-coral.vercel.app";
  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  if (!allowedOrigin(origin)) return Response.json({ error: "Origin not allowed" }, { status: 403, headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: "Handoff service is not configured" }, { status: 500, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = await req.json();
    const action = body?.action;
    const handoffId = body?.handoff_id;
    if (typeof handoffId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(handoffId)) {
      return Response.json({ error: "Invalid handoff" }, { status: 400, headers: corsHeaders });
    }

    if (action === "publish") {
      const tokenHash = body?.token_hash;
      if (typeof tokenHash !== "string" || tokenHash.length < 20 || tokenHash.length > 512) {
        return Response.json({ error: "Invalid confirmation link" }, { status: 400, headers: corsHeaders });
      }
      const { error } = await admin.from("auth_email_handoffs").upsert({
        handoff_id: handoffId,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
      if (error) throw error;
      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    if (action === "poll") {
      const { data, error } = await admin
        .from("auth_email_handoffs")
        .select("token_hash, expires_at")
        .eq("handoff_id", handoffId)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (error) throw error;
      return Response.json({ token_hash: data?.token_hash ?? null }, { headers: corsHeaders });
    }

    if (action === "ack") {
      const { error } = await admin.from("auth_email_handoffs").delete().eq("handoff_id", handoffId);
      if (error) throw error;
      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    return Response.json({ error: "Unknown action" }, { status: 400, headers: corsHeaders });
  } catch (error) {
    console.error("Email handoff request failed", error);
    return Response.json({ error: "Could not process the confirmation handoff" }, { status: 500, headers: corsHeaders });
  }
});

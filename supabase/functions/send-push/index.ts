import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { z } from "npm:zod@3.23.8";

const Body = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().max(500).default(""),
  url: z.string().max(300).optional(),
  // "self" = test push to the caller only (any signed-in user); "all" = admins only.
  target: z.enum(["self", "all"]).default("self"),
});

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const pub = Deno.env.get("VAPID_PUBLIC_KEY");
    const priv = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!pub || !priv) return json({ error: "Push keys are not configured" }, 500);

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);
    const admin = createClient(url, service);
    const { data: u, error: ue } = await admin.auth.getUser(token);
    if (ue || !u.user) return json({ error: "Unauthorized" }, 401);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { title, body, url: link, target } = parsed.data;

    if (target === "all") {
      const { data: roles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .in("role", ["admin", "super_admin"]);
      if (!roles?.length) return json({ error: "Admins only" }, 403);
    }

    let q = admin.from("push_subscriptions").select("id, endpoint, p256dh, auth_key");
    if (target === "self") q = q.eq("user_id", u.user.id);
    const { data: subs, error } = await q;
    if (error) return json({ error: error.message }, 500);

    webpush.setVapidDetails("mailto:support@fitxfusion.app", pub, priv);
    const payload = JSON.stringify({ title, body, url: link && link.startsWith("/") ? link : "/notifications" });
    let sent = 0;
    const stale: string[] = [];
    await Promise.all(
      (subs ?? []).map(async (s) => {
        if (!s.p256dh || !s.auth_key) return;
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } }, payload, { TTL: 86400 });
          sent++;
        } catch (e: any) {
          if (e?.statusCode === 404 || e?.statusCode === 410) stale.push(s.id);
          else console.error("push failed", e?.statusCode, e?.body);
        }
      }),
    );
    if (stale.length) await admin.from("push_subscriptions").delete().in("id", stale);
    return json({ sent, removed: stale.length, devices: subs?.length ?? 0 });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

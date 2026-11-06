import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { getPaddleClient, type PaddleEnv } from '../_shared/paddle.ts';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

// Returns a temporary Paddle customer-portal link (cancel, change card, invoices) for the signed-in user.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') ?? '';
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u.user) return json({ error: 'Sign in required' }, 401);
    const { environment } = await req.json().catch(() => ({}));
    const env: PaddleEnv = environment === 'live' ? 'live' : 'sandbox';
    const { data: sub } = await userClient.from('user_subscriptions')
      .select('paddle_customer_id, paddle_subscription_id')
      .eq('user_id', u.user.id).eq('environment', env).not('paddle_customer_id', 'is', null)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!sub?.paddle_customer_id) return json({ error: 'No paid subscription found' }, 404);
    const session = await getPaddleClient(env).customerPortalSessions.create(sub.paddle_customer_id, [sub.paddle_subscription_id!]);
    return json({ url: session.urls.general.overview });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

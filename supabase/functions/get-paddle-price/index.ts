import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { gatewayFetch, type PaddleEnv } from '../_shared/paddle.ts';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { priceId, environment } = await req.json();
    if (typeof priceId !== 'string' || !/^[a-z0-9_]{1,64}$/.test(priceId)) return json({ error: 'Invalid priceId' }, 400);
    const env: PaddleEnv = environment === 'live' ? 'live' : 'sandbox';
    const res = await gatewayFetch(env, `/prices?external_id=${encodeURIComponent(priceId)}`);
    if (!res.ok) return json({ error: 'Price lookup failed', status: res.status, details: await res.text() }, res.status);
    const data = await res.json();
    if (!data.data?.length) return json({ error: 'Price not found' }, 404);
    return json({ paddleId: data.data[0].id });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

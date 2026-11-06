import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

let _sb: ReturnType<typeof createClient> | null = null;
const sb = () => (_sb ??= createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!));

const PLAN_NAMES: Record<string, string> = { starter: 'Starter', pro: 'Pro', elite: 'Elite', ultimate: 'Ultimate' };

// Map Paddle status to the app's entitlement status.
const mapStatus = (s: string) => (['active', 'trialing', 'past_due'].includes(s) ? 'active' : s === 'canceled' ? 'cancelled' : 'expired');

async function upsertSubscription(data: any, env: PaddleEnv) {
  const userId = data.customData?.userId;
  const item = data.items?.[0];
  const priceId: string | undefined = item?.price?.importMeta?.externalId;
  if (!userId || !priceId) {
    console.warn('Skipping subscription: missing userId or externalId', data.id);
    return;
  }
  const [plan, cycle] = priceId.split('_');
  const amount = Number(item.price.unitPrice?.amount ?? 0) / 100;
  const end = data.currentBillingPeriod?.endsAt ?? data.nextBilledAt ?? new Date(Date.now() + 30 * 864e5).toISOString();
  const { error } = await sb().from('user_subscriptions').upsert({
    user_id: userId,
    paddle_subscription_id: data.id,
    paddle_customer_id: data.customerId,
    plan_id: plan,
    plan_name: PLAN_NAMES[plan] ?? plan,
    billing_cycle: cycle === 'yearly' ? 'yearly' : 'monthly',
    price_inr: amount,
    currency: item.price.unitPrice?.currencyCode ?? 'INR',
    status: mapStatus(data.status),
    payment_method: 'Paddle',
    transaction_id: data.transactionId ?? null,
    started_at: data.startedAt ?? data.createdAt ?? new Date().toISOString(),
    expires_at: end,
    auto_renew: data.scheduledChange?.action !== 'cancel' && data.status !== 'canceled',
    cancelled_at: data.canceledAt ?? null,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'paddle_subscription_id' });
  if (error) throw new Error(error.message);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const env = (new URL(req.url).searchParams.get('env') === 'live' ? 'live' : 'sandbox') as PaddleEnv;
  try {
    const event = await verifyWebhook(req, env);
    switch (event.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
      case EventName.SubscriptionCanceled:
        await upsertSubscription(event.data, env);
        break;
      default:
        console.log('Unhandled event:', event.eventType);
    }
    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});

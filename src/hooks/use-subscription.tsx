import { useEffect, useState } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment, isPaymentsConfigured, openBillingPortal } from "@/lib/paddle";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { activePlan, hasMemberTool, isPlanId, type PlanId, type BillingCycle, type MemberTool } from "@/lib/premium-access";
export type { PlanId, BillingCycle } from "@/lib/premium-access";
export type SubStatus = "active" | "cancelled" | "expired";
export interface Subscription {
  id: string; user_id: string; plan_id: PlanId; plan_name: string;
  billing_cycle: BillingCycle; price_inr: number; status: SubStatus;
  payment_method: string | null; transaction_id: string | null;
  started_at: string; expires_at: string; auto_renew: boolean;
  cancelled_at: string | null; environment: string;
}

// Share one filtered realtime subscription across all consumers of the same account.
const channels = new Map<string, { count: number; channel: ReturnType<typeof supabase.channel> }>();
function watchAccount(uid: string, environment: string, client: QueryClient) {
  const key = `${uid}:${environment}`;
  const existing = channels.get(key);
  if (existing) existing.count++;
  else {
    const channel = supabase.channel(`membership:${key}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_subscriptions", filter: `user_id=eq.${uid}` }, () => {
        void client.invalidateQueries({ queryKey: ["membership", uid, environment] });
      }).subscribe(status => {
        if (status === "SUBSCRIBED") void client.invalidateQueries({ queryKey: ["membership", uid, environment] });
      });
    channels.set(key, { count: 1, channel });
  }
  return () => {
    const entry = channels.get(key);
    if (!entry) return;
    entry.count--;
    if (entry.count === 0) { void supabase.removeChannel(entry.channel); channels.delete(key); }
  };
}

export function useSubscription() {
  const { user, loading: authLoading } = useEnhancedAuth();
  const userId = user?.id ?? null;
  const environment = getPaddleEnvironment();
  const client = useQueryClient();
  const [now, setNow] = useState(Date.now());
  const query = useQuery({
    queryKey: ["membership", userId, environment],
    enabled: Boolean(userId) && !authLoading,
    queryFn: async ({ signal }) => {
      if (!userId) return null;
      const { data, error } = await supabase.from("user_subscriptions").select("*")
        .eq("user_id", userId).eq("environment", environment)
        .order("expires_at", { ascending: false }).limit(1).abortSignal(signal).maybeSingle();
      if (error) throw error;
      if (!data || !isPlanId(data.plan_id)) return null;
      return data as Subscription;
    },
    staleTime: 15_000, gcTime: 60_000, retry: 1,
    refetchInterval: 60_000, refetchOnWindowFocus: true, refetchOnReconnect: true,
  });
  useEffect(() => {
    // Retire the old unscoped, client-editable entitlement cache.
    try { localStorage.removeItem("fitfusion-premium-sub"); } catch { /* storage optional */ }
    if (userId) return watchAccount(userId, environment, client);
  }, [userId, environment, client]);
  const subscription = !query.isError && userId && query.data?.user_id === userId ? query.data : null;
  useEffect(() => {
    setNow(Date.now());
    const expiry = subscription ? Date.parse(subscription.expires_at) : NaN;
    if (!Number.isFinite(expiry)) return;
    const timer = window.setTimeout(() => setNow(Date.now()), Math.max(0, Math.min(60_000, expiry - Date.now() + 1)));
    return () => window.clearTimeout(timer);
  }, [subscription, now]);
  const plan = activePlan(subscription, userId, environment, now);
  const manageBilling = async () => {
    if (!isPaymentsConfigured()) throw new Error("Billing is unavailable because the payment service is disconnected.");
    await openBillingPortal();
  };
  return {
    subscription, userId, plan, isPremium: plan !== null,
    loading: authLoading || (Boolean(userId) && query.isPending),
    syncing: query.isFetching, error: query.isError ? "Unable to verify your membership. Reconnect and try again." : null,
    refresh: query.refetch, cancel: manageBilling, toggleAutoRenew: manageBilling,
    hasFeature: (tool: MemberTool) => hasMemberTool(plan, tool),
  };
}

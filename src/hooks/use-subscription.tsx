import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment, openBillingPortal } from "@/lib/paddle";

export type PlanId = "starter" | "pro" | "elite" | "ultimate";
export type BillingCycle = "monthly" | "yearly";
export type SubStatus = "active" | "cancelled" | "expired";

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: PlanId;
  plan_name: string;
  billing_cycle: BillingCycle;
  price_inr: number;
  status: SubStatus;
  payment_method: string | null;
  transaction_id: string | null;
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
  cancelled_at: string | null;
}

const LS_KEY = "fitfusion-premium-sub";

function readCache(): Subscription | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeCache(s: Subscription | null) {
  if (s) localStorage.setItem(LS_KEY, JSON.stringify(s));
  else localStorage.removeItem(LS_KEY);
}

export function isActive(sub: Subscription | null): boolean {
  if (!sub) return false;
  if (sub.status !== "active") return false;
  return new Date(sub.expires_at).getTime() > Date.now();
}

export function useSubscription() {
  const [sub, setSub] = useState<Subscription | null>(readCache());
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id ?? null;
    setUserId(uid);
    if (!uid) {
      setSub(null);
      writeCache(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", uid)
      .eq("environment", getPaddleEnvironment())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("subscription fetch", error);
      setLoading(false);
      return;
    }
    let s = (data as Subscription | null) ?? null;
    // Expiry is evaluated by isActive(); writes come only from the payment webhook.
    setSub(s);
    writeCache(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const { data: authSub } = supabase.auth.onAuthStateChange(() => refresh());
    // Periodic re-check for expiry
    const t = setInterval(refresh, 60_000);
    const ch = supabase
      .channel(`user-subs-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_subscriptions" }, () => refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
      authSub.subscription.unsubscribe();
      clearInterval(t);
    };
  }, [refresh]);

  // Billing changes (cancel, auto-renew, card) happen in the secure billing portal.
  const cancel = useCallback(async () => { await openBillingPortal(); }, []);
  const toggleAutoRenew = cancel;

  return {
    subscription: sub,
    loading,
    isPremium: isActive(sub),
    userId,
    refresh,
    cancel,
    toggleAutoRenew,
  };
}

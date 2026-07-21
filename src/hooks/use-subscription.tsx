import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("subscription fetch", error);
      setLoading(false);
      return;
    }
    let s = (data as Subscription | null) ?? null;
    // Auto-expire
    if (s && s.status === "active" && new Date(s.expires_at).getTime() <= Date.now()) {
      await supabase
        .from("user_subscriptions")
        .update({ status: "expired" })
        .eq("id", s.id);
      s = { ...s, status: "expired" };
    }
    setSub(s);
    writeCache(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const { data: authSub } = supabase.auth.onAuthStateChange(() => refresh());
    // Periodic re-check for expiry
    const t = setInterval(refresh, 60_000);
    return () => {
      authSub.subscription.unsubscribe();
      clearInterval(t);
    };
  }, [refresh]);

  const subscribe = useCallback(
    async (params: {
      plan_id: PlanId;
      plan_name: string;
      billing_cycle: BillingCycle;
      price_inr: number;
      payment_method: string;
    }) => {
      if (!userId) throw new Error("Sign in to subscribe");
      const now = new Date();
      const expires = new Date(now);
      if (params.billing_cycle === "monthly") expires.setMonth(expires.getMonth() + 1);
      else expires.setFullYear(expires.getFullYear() + 1);
      const txn = `FX-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      // Mark previous active subs as replaced
      await supabase
        .from("user_subscriptions")
        .update({ status: "cancelled", cancelled_at: now.toISOString() })
        .eq("user_id", userId)
        .eq("status", "active");

      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          plan_id: params.plan_id,
          plan_name: params.plan_name,
          billing_cycle: params.billing_cycle,
          price_inr: params.price_inr,
          status: "active",
          payment_method: params.payment_method,
          transaction_id: txn,
          started_at: now.toISOString(),
          expires_at: expires.toISOString(),
          auto_renew: true,
        })
        .select()
        .single();
      if (error) throw error;
      setSub(data as Subscription);
      writeCache(data as Subscription);
      return data as Subscription;
    },
    [userId],
  );

  const cancel = useCallback(async () => {
    if (!sub) return;
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ auto_renew: false, status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", sub.id);
    if (error) throw error;
    await refresh();
  }, [sub, refresh]);

  const toggleAutoRenew = useCallback(async () => {
    if (!sub) return;
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ auto_renew: !sub.auto_renew })
      .eq("id", sub.id);
    if (error) throw error;
    await refresh();
  }, [sub, refresh]);

  return {
    subscription: sub,
    loading,
    isPremium: isActive(sub),
    userId,
    refresh,
    subscribe,
    cancel,
    toggleAutoRenew,
  };
}

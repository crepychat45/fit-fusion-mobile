import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type CloudGroupState = "loading" | "saving" | "saved" | "error" | "signed-out";
export type SettingsCategory = "privacy_settings" | "notification_settings" | "account_settings" | "security_settings";

/** Write only changed live fields; the database merges under the caller's RLS. */
export function useCloudSettingsGroup<T extends Record<string, unknown>>(category: SettingsCategory, defaults: T) {
  const [value, setValue] = useState<T>(defaults);
  const [sync, setSync] = useState<CloudGroupState>("loading");
  const [remoteAt, setRemoteAt] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const defaultsRef = useRef(defaults);
  const uidRef = useRef<string | null>(null);
  const pending = useRef<Partial<T>>({});
  const inFlight = useRef<Partial<T>>({});
  const saving = useRef(false);
  const retryRef = useRef<() => Promise<void>>(async () => {});
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    let epoch = 0;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const apply = (row: Record<string, unknown>) => {
      const column = row[category];
      const live = column && typeof column === "object" ? (column as Record<string, unknown>).live : {};
      const validated: Record<string, unknown> = {};
      if (live && typeof live === "object") {
        for (const [key, fallback] of Object.entries(defaultsRef.current)) {
          const saved = (live as Record<string, unknown>)[key];
          if (typeof saved === typeof fallback) validated[key] = saved;
        }
      }
      setValue({ ...defaultsRef.current, ...validated, ...inFlight.current, ...pending.current });
    };
    const load = async (uid: string | null) => {
      const generation = ++epoch;
      uidRef.current = uid;
      pending.current = {};
      inFlight.current = {};
      setReady(false);
      if (channel) { void supabase.removeChannel(channel); channel = null; }
      if (!uid) { setValue(defaultsRef.current); setSync("signed-out"); return; }
      setSync("loading");
      const { data, error } = await supabase.from("user_settings").select(category).eq("user_id", uid).maybeSingle();
      if (!mounted.current || generation !== epoch) return;
      if (error) { setSync("error"); return; }
      apply((data ?? {}) as Record<string, unknown>);
      setReady(true);
      setSync("saved");
      channel = supabase.channel(`settings-live-${category}-${crypto.randomUUID()}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "user_settings", filter: `user_id=eq.${uid}` }, event => {
          if (!mounted.current || generation !== epoch) return;
          apply(event.new as Record<string, unknown>);
          setRemoteAt(Date.now());
        }).subscribe(status => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setSync("error");
        });
    };
    void supabase.auth.getSession().then(({ data }) => load(data.session?.user.id ?? null));
    const { data: auth } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "TOKEN_REFRESHED" && (session?.user.id ?? null) !== uidRef.current) void Promise.resolve().then(() => load(session?.user.id ?? null));
    });
    const online = () => { if (Object.keys(pending.current).length) void retryRef.current(); else if (!channel) void load(uidRef.current); };
    window.addEventListener("online", online);
    return () => {
      mounted.current = false; epoch++; uidRef.current = null;
      auth.subscription.unsubscribe(); window.removeEventListener("online", online);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [category]);

  const retry = async () => {
    const uid = uidRef.current;
    if (!uid || saving.current || !mounted.current) return;
    saving.current = true;
    while (mounted.current && uidRef.current === uid && Object.keys(pending.current).length) {
      const patch = pending.current;
      pending.current = {};
      inFlight.current = patch;
      setSync("saving");
      try {
        const { error } = await supabase.rpc("merge_settings_preferences", { p_patch: { [category]: { live: patch } } as Json });
        if (error) throw error;
        if (!mounted.current || uidRef.current !== uid) break;
        inFlight.current = {};
        setSync("saved");
      } catch {
        if (mounted.current && uidRef.current === uid) {
          pending.current = { ...patch, ...pending.current };
          inFlight.current = {};
          setSync("error");
        }
        break;
      }
    }
    saving.current = false;
  };
  retryRef.current = retry;
  const update = async (patch: Partial<T>) => {
    if (!ready) return;
    pending.current = { ...pending.current, ...patch };
    setValue(previous => ({ ...previous, ...patch }));
    await retry();
  };
  return { value, update, reset: () => update(defaultsRef.current), retry, sync, remoteAt, signedIn: ready };
}
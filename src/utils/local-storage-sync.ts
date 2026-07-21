// Transparent cloud mirror for every `fitfusion-*` localStorage key.
// Any settings component that writes to localStorage is automatically synced
// to public.user_settings.local_kv (JSONB) and restored on sign-in, so toggles
// survive refresh, logout, force-close, and follow the account across devices.

import { supabase } from "@/integrations/supabase/client";

const PREFIXES = ["fitfusion-", "fitfusion."] as const;
const matchesPrefix = (k: string) => PREFIXES.some((p) => k.startsWith(p));
const DEBOUNCE_MS = 900;

let currentUserId: string | null = null;
let hydrated = false;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let installed = false;

function collectLocalKv(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PREFIX)) continue;
      const v = localStorage.getItem(k);
      if (v !== null) out[k] = v;
    }
  } catch {
    /* private mode / quota — safe to ignore */
  }
  return out;
}

async function pushNow() {
  if (!currentUserId) return;
  const kv = collectLocalKv();
  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: currentUserId, local_kv: kv },
      { onConflict: "user_id" },
    );
  if (error && navigator.onLine) {
    // one retry on transient failure
    setTimeout(() => {
      supabase
        .from("user_settings")
        .upsert(
          { user_id: currentUserId!, local_kv: kv },
          { onConflict: "user_id" },
        );
    }, 2500);
  }
}

function schedulePush() {
  if (!currentUserId || !hydrated) return;
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(pushNow, DEBOUNCE_MS);
}

async function hydrateFromCloud(uid: string) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("local_kv")
    .eq("user_id", uid)
    .maybeSingle();
  if (error || !data) {
    hydrated = true;
    return;
  }
  const kv = (data.local_kv ?? {}) as Record<string, string>;
  let changed = false;
  try {
    for (const [k, v] of Object.entries(kv)) {
      if (typeof v !== "string") continue;
      if (localStorage.getItem(k) !== v) {
        localStorage.setItem(k, v);
        changed = true;
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: k,
            newValue: v,
            storageArea: localStorage,
          }),
        );
      }
    }
  } catch {
    /* ignore */
  }
  hydrated = true;
  if (changed) {
    window.dispatchEvent(new Event("fitfusion-settings-hydrated"));
  }
}

function installStorageProxy() {
  if (installed) return;
  installed = true;
  const origSet = localStorage.setItem.bind(localStorage);
  const origRemove = localStorage.removeItem.bind(localStorage);

  localStorage.setItem = function (key: string, value: string) {
    origSet(key, value);
    if (key.startsWith(PREFIX)) schedulePush();
  };
  localStorage.removeItem = function (key: string) {
    origRemove(key);
    if (key.startsWith(PREFIX)) schedulePush();
  };

  window.addEventListener("online", () => {
    if (currentUserId && hydrated) schedulePush();
  });

  // Sync across tabs on the same device too.
  window.addEventListener("storage", (e) => {
    if (e.key && e.key.startsWith(PREFIX)) schedulePush();
  });
}

export function initSettingsCloudMirror() {
  if (typeof window === "undefined") return;
  installStorageProxy();

  supabase.auth.getSession().then(({ data }) => {
    const uid = data.session?.user?.id ?? null;
    currentUserId = uid;
    if (uid) hydrateFromCloud(uid);
    else hydrated = true;
  });

  supabase.auth.onAuthStateChange((event, session) => {
    const uid = session?.user?.id ?? null;
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      currentUserId = uid;
      hydrated = false;
      if (uid) hydrateFromCloud(uid);
    } else if (event === "SIGNED_OUT") {
      currentUserId = null;
      hydrated = false;
    }
  });
}

// Transparent cloud mirror for every `fitfusion-*` localStorage key.
// Any settings component that writes to localStorage is automatically synced
// to public.user_settings.local_kv (JSONB) and restored on sign-in, so toggles
// survive refresh, logout, force-close, and follow the account across devices.

import { supabase } from "@/integrations/supabase/client";

const PREFIXES = ["fitfusion-", "fitfusion."] as const;
// SettingsProvider owns these keys; the legacy mirror must never hydrate them.
const PROVIDER_KEYS = new Set(["sound-enabled", "sound-volume", "sound-pack", "haptic-enabled", "haptic-feedback", "export-format", "export-anonymized", "export-categories", "font-size", "language", "auto-sync", "cloud-backup", "notifications", "code-editor-enabled", "subscription-plan", "payment-method", "developer-options", "display-options", "unit-system", "compact-view", "show-calories", "show-heart-rate", "programming-languages", "theme"].map(key => `fitfusion-${key}`));
export const isLegacyMirrorKey = (k: string) => PREFIXES.some((p) => k.startsWith(p)) && !PROVIDER_KEYS.has(k) && !/(token|secret|password|recovery|pin|biometric|profile|custom-sounds|backup)/i.test(k);
const matchesPrefix = isLegacyMirrorKey;
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
      if (!k || !matchesPrefix(k)) continue;
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
  const uid = currentUserId;
  const kv = collectLocalKv();
  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: uid, local_kv: kv },
      { onConflict: "user_id" },
    );
  if (error && navigator.onLine) {
    // one retry on transient failure
    setTimeout(() => {
      if (currentUserId !== uid) return;
      supabase
        .from("user_settings")
        .upsert(
          { user_id: uid, local_kv: kv },
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

async function hydrateFromCloud(uid: string, start = collectLocalKv()) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("local_kv")
    .eq("user_id", uid)
    .maybeSingle();
  if (currentUserId !== uid) return;
  if (error || !data) {
    hydrated = !error;
    return;
  }
  const kv = (data.local_kv ?? {}) as Record<string, string>;
  let changed = false;
  try {
    for (const [k, v] of Object.entries(kv)) {
      if (!matchesPrefix(k) || typeof v !== "string") continue;
      // Preserve edits made while the account read was in flight.
      if (localStorage.getItem(k) !== (start[k] ?? null)) continue;
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
  schedulePush();
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
    if (matchesPrefix(key)) schedulePush();
  };
  localStorage.removeItem = function (key: string) {
    origRemove(key);
    if (matchesPrefix(key)) schedulePush();
  };

  window.addEventListener("online", () => {
    if (currentUserId && hydrated) schedulePush();
  });

  // Sync across tabs on the same device too.
  window.addEventListener("storage", (e) => {
    if (e.key && matchesPrefix(e.key)) schedulePush();
  });
}

export function initSettingsCloudMirror() {
  if (typeof window === "undefined") return;
  installStorageProxy();
  const start = collectLocalKv();

  supabase.auth.getSession().then(({ data }) => {
    const uid = data.session?.user?.id ?? null;
    currentUserId = uid;
    if (uid) { hydrated = false; void hydrateFromCloud(uid, start); }
    else hydrated = true;
  });

  supabase.auth.onAuthStateChange((event, session) => {
    const uid = session?.user?.id ?? null;
    if (event === "SIGNED_IN") {
      // Only hydrate on true sign-in transitions; skip TOKEN_REFRESHED so
      // that in-flight local toggles are never overwritten by a stale cloud row.
      if (uid && uid !== currentUserId) {
        currentUserId = uid;
        hydrated = false;
        hydrateFromCloud(uid);
      } else {
        currentUserId = uid;
      }
    } else if (event === "TOKEN_REFRESHED") {
      currentUserId = uid;
    } else if (event === "SIGNED_OUT") {
      currentUserId = null;
      hydrated = false;
      if (pendingTimer) clearTimeout(pendingTimer);
    }
  });
}

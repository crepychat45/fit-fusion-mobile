// Cloud sync layer for user settings.
// Persists a snapshot of all settings to public.user_settings so they survive
// logout, app restart, and follow the user across devices.

import { supabase } from "@/integrations/supabase/client";

export type SettingsSnapshot = {
  theme: string;
  fontSize: string;
  language: string;
  unitSystem: string;
  autoSync: boolean;
  cloudBackup: boolean;
  notifications: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  soundPack: string;
  hapticEnabled: boolean;
  hapticFeedback: boolean;
  compactView: boolean;
  showCalories: boolean;
  showHeartRate: boolean;
  exportFormat: string;
  exportAnonymized: boolean;
  exportCategories: string[];
  displayOptions: Record<string, boolean>;
  developerOptions: Record<string, boolean>;
  codeEditorEnabled: boolean;
  programmingLanguages: string[];
  customSounds: Record<string, string>;
  subscriptionPlan: string;
  paymentMethod: string;
};

// Categorised for the DB columns. Category → keys.
const CATEGORY_MAP = {
  display_settings: [
    "theme",
    "fontSize",
    "compactView",
    "showCalories",
    "showHeartRate",
    "displayOptions",
  ],
  sound_settings: [
    "soundEnabled",
    "soundVolume",
    "soundPack",
    "hapticEnabled",
    "hapticFeedback",
    "customSounds",
  ],
  notification_settings: ["notifications"],
  privacy_settings: ["exportAnonymized", "exportCategories", "exportFormat"],
  account_settings: [
    "language",
    "unitSystem",
    "subscriptionPlan",
    "paymentMethod",
  ],
  update_settings: ["autoSync", "cloudBackup"],
  developer_settings: [
    "developerOptions",
    "codeEditorEnabled",
    "programmingLanguages",
  ],
} as const;

type Category = keyof typeof CATEGORY_MAP;

function packSnapshot(snapshot: SettingsSnapshot): Record<Category, any> {
  const out = {} as Record<Category, any>;
  (Object.keys(CATEGORY_MAP) as Category[]).forEach((cat) => {
    const bucket: Record<string, unknown> = {};
    (CATEGORY_MAP[cat] as readonly string[]).forEach((k) => {
      bucket[k] = (snapshot as any)[k];
    });
    out[cat] = bucket;
  });
  return out;
}

function unpackRow(row: Record<string, any>): Partial<SettingsSnapshot> {
  const merged: Record<string, unknown> = {};
  (Object.keys(CATEGORY_MAP) as Category[]).forEach((cat) => {
    const bucket = row?.[cat];
    if (bucket && typeof bucket === "object") Object.assign(merged, bucket);
  });
  return merged as Partial<SettingsSnapshot>;
}

export async function fetchRemoteSettings(
  userId: string,
): Promise<Partial<SettingsSnapshot> | null> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("[settings-sync] fetch failed", error.message);
    return null;
  }
  if (!data) return null;
  return unpackRow(data as any);
}

export async function pushRemoteSettings(
  userId: string,
  snapshot: SettingsSnapshot,
): Promise<boolean> {
  const payload = { user_id: userId, ...packSnapshot(snapshot) };
  const { error } = await supabase
    .from("user_settings")
    .upsert(payload, { onConflict: "user_id" });
  if (error) {
    console.warn("[settings-sync] push failed", error.message);
    return false;
  }
  return true;
}

/** Debounce helper scoped per user to coalesce burst writes. */
export function createDebouncedPush(delay = 800) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: { userId: string; snapshot: SettingsSnapshot } | null = null;
  return function schedule(userId: string, snapshot: SettingsSnapshot) {
    pending = { userId, snapshot };
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      if (!pending) return;
      const p = pending;
      pending = null;
      // Retry once on transient failures — helps offline→online transitions.
      const ok = await pushRemoteSettings(p.userId, p.snapshot);
      if (!ok && navigator.onLine) {
        setTimeout(() => pushRemoteSettings(p.userId, p.snapshot), 2000);
      }
    }, delay);
  };
}

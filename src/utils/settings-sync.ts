// Cloud sync layer for user settings.
// Persists a snapshot of all settings to public.user_settings so they survive
// logout, app restart, and follow the user across devices.

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

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

export function packSnapshot(snapshot: Partial<SettingsSnapshot>): Record<Category, any> {
  const out = {} as Record<Category, any>;
  (Object.keys(CATEGORY_MAP) as Category[]).forEach((cat) => {
    const bucket: Record<string, unknown> = {};
    (CATEGORY_MAP[cat] as readonly string[]).forEach((k) => {
      if (k in snapshot) bucket[k] = (snapshot as any)[k];
    });
    out[cat] = bucket;
  });
  return out;
}

export function unpackRow(row: Record<string, any>): Partial<SettingsSnapshot> {
  const merged: Record<string, unknown> = {};
  (Object.keys(CATEGORY_MAP) as Category[]).forEach((cat) => {
    const bucket = row?.[cat];
    if (bucket && typeof bucket === "object") {
      for (const key of CATEGORY_MAP[cat]) if (key in bucket) merged[key] = bucket[key];
    }
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
    logger.warn("[settings-sync] fetch failed", error.message);
    throw error;
  }
  if (!data) return null;
  return unpackRow(data as any);
}

export async function pushRemoteSettings(
  userId: string,
  snapshot: Partial<SettingsSnapshot>,
): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user.id !== userId) return false;
  const { error } = await supabase.rpc("merge_settings_preferences", { p_patch: packSnapshot(snapshot) as Json });
  if (error) {
    logger.warn("[settings-sync] push failed", error.message);
    return false;
  }
  return true;
}

export type SettingsSyncStatus = "loading" | "saving" | "saved" | "error" | "offline" | "paused" | "signed-out";

export function changedSettings(previous: Partial<SettingsSnapshot>, next: SettingsSnapshot): Partial<SettingsSnapshot> {
  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(next) as (keyof SettingsSnapshot)[]) {
    if (JSON.stringify(previous[key]) !== JSON.stringify(next[key])) patch[key] = next[key];
  }
  return patch;
}

/** Retain failed patches and serialize writes; cancellation prevents cross-account retries. */
export function createDebouncedPush(delay = 800, report: (state: SettingsSyncStatus) => void = () => {}, write = pushRemoteSettings) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: { userId: string; snapshot: Partial<SettingsSnapshot> } | null = null;
  let generation = 0;
  let running = false;
  const flush = async () => {
    if (running || !pending) return;
    const p = pending;
    const epoch = generation;
    pending = null;
    running = true;
    report("saving");
    let ok = false;
    try { ok = await write(p.userId, p.snapshot); } catch { ok = false; }
    running = false;
    if (epoch !== generation) { if (pending) void flush(); return; }
    if (!ok) {
      pending = { userId: p.userId, snapshot: { ...p.snapshot, ...pending?.snapshot } };
      report(navigator.onLine ? "error" : "offline");
      timer = setTimeout(flush, 5000);
    } else if (pending) { void flush(); }
    else report("saved");
  };
  const schedule = (userId: string, snapshot: Partial<SettingsSnapshot>) => {
    pending = { userId, snapshot: { ...(pending?.userId === userId ? pending.snapshot : {}), ...snapshot } };
    if (timer) clearTimeout(timer);
    report(navigator.onLine ? "saving" : "offline");
    timer = setTimeout(flush, delay);
  };
  schedule.cancel = () => { generation++; pending = null; if (timer) clearTimeout(timer); };
  schedule.flush = flush;
  schedule.pending = () => pending?.snapshot ?? {};
  return schedule;
}

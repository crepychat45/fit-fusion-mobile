import type { SettingsSnapshot } from "@/utils/settings-sync";

/** Only shared preferences with a real persistence path are offered for reset. */
export const RESET_GROUPS: { id: string; label: string; values: Partial<SettingsSnapshot> }[] = [
  { id: "display", label: "Appearance", values: { theme: "light", fontSize: "medium", compactView: false, showCalories: true, showHeartRate: true, displayOptions: { animations: true, highContrast: false, compactView: false, showTips: true, darkModeSchedule: false, customFonts: false } } },
  { id: "sound", label: "Sound & Haptics", values: { soundEnabled: true, soundVolume: 80, hapticEnabled: true, hapticFeedback: true, soundPack: "default" } },
  { id: "units", label: "Units", values: { unitSystem: "metric" } },
  { id: "export", label: "Export Preferences", values: { exportFormat: "json", exportAnonymized: false, exportCategories: ["workouts"] } },
];

export function resetPatch(ids: string[]): Partial<SettingsSnapshot> {
  return Object.assign({}, ...RESET_GROUPS.filter(group => ids.includes(group.id)).map(group => group.values));
}

export function validSettingsBackup(value: unknown): value is { version: string; preferences: Partial<SettingsSnapshot> } {
  if (!value || typeof value !== "object") return false;
  const backup = value as Record<string, unknown>;
  if (typeof backup.version !== "string" || !backup.preferences || typeof backup.preferences !== "object" || Array.isArray(backup.preferences)) return false;
  const p = backup.preferences as Record<string, unknown>;
  return (!('theme' in p) || ["light", "dark", "system"].includes(String(p.theme))) &&
    (!('soundVolume' in p) || typeof p.soundVolume === "number" && Number.isFinite(p.soundVolume) && p.soundVolume >= 0 && p.soundVolume <= 100);
}
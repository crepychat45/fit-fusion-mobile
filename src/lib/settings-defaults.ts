import type { SettingsSnapshot } from "@/utils/settings-sync";
import { z } from "zod";

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

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]), fontSize: z.enum(["small", "medium", "large"]),
  language: z.string().max(40), unitSystem: z.enum(["metric", "imperial"]),
  autoSync: z.boolean(), cloudBackup: z.boolean(), notifications: z.boolean(),
  soundEnabled: z.boolean(), soundVolume: z.number().min(0).max(100), soundPack: z.string().max(100),
  hapticEnabled: z.boolean(), hapticFeedback: z.boolean(), compactView: z.boolean(),
  showCalories: z.boolean(), showHeartRate: z.boolean(),
  exportFormat: z.enum(["json", "csv", "pdf", "html"]), exportAnonymized: z.boolean(),
  exportCategories: z.array(z.string()), displayOptions: z.record(z.string(), z.boolean()),
  developerOptions: z.record(z.string(), z.boolean()), codeEditorEnabled: z.boolean(),
  programmingLanguages: z.array(z.string()), customSounds: z.record(z.string(), z.string()),
  subscriptionPlan: z.string(), paymentMethod: z.string(),
}).partial().strict();

export function validSettingsBackup(value: unknown): value is { version: string; preferences: Partial<SettingsSnapshot> } {
  return z.object({ version: z.string(), preferences: preferencesSchema }).safeParse(value).success;
}
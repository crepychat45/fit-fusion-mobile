export const SETTINGS_SECTIONS = ["account", "security", "display", "privacy", "notifications", "chat", "data", "about"] as const;
const aliases: Record<string, string> = { units: "display", updates: "about", developer: "about", enhanced: "data" };
export function resolveSettingsTab(tab: string | null): string {
  const resolved = tab ? aliases[tab] ?? tab : "account";
  return resolved === "search" || SETTINGS_SECTIONS.some(id => id === resolved) ? resolved : "account";
}

/** Clear only this app's device data; never delete another application's or auth storage. */
export function localAppDataKeys(storage: Storage): string[] {
  return Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter((key): key is string =>
    key !== null && (/^fit(?:x)?fusion[-:]/i.test(key) || key === "completedWorkouts" || key === "workout-data") && key !== "fitfusion-app-version",
  );
}
export const SETTINGS_SECTIONS = ["account", "security", "display", "privacy", "notifications", "chat", "data", "about"] as const;
const aliases: Record<string, string> = { units: "display", updates: "about", developer: "about", enhanced: "data" };
export function resolveSettingsTab(tab: string | null): string {
  const resolved = tab ? aliases[tab] ?? tab : "account";
  return resolved === "search" || SETTINGS_SECTIONS.some(id => id === resolved) ? resolved : "account";
}
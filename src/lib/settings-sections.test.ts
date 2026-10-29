import { beforeEach, describe, expect, it } from "vitest";
import { localAppDataKeys, resolveSettingsTab, SETTINGS_SECTIONS } from "./settings-sections";
describe("Settings organization", () => {
  beforeEach(() => localStorage.clear());
  it("keeps eight sections and redirects previous deep links", () => {
    expect(SETTINGS_SECTIONS).toHaveLength(8);
    expect(resolveSettingsTab("units")).toBe("display");
    expect(resolveSettingsTab("updates")).toBe("about");
    expect(resolveSettingsTab("developer")).toBe("about");
    expect(resolveSettingsTab("invalid")).toBe("account");
    expect(resolveSettingsTab("search")).toBe("search");
  });
  it("clears only app data, preserving auth and unrelated origin storage", () => {
    ["fitfusion-workout-history-v1", "fitxfusion-cache", "workout-data", "sb-project-auth-token", "unrelated", "theme", "fitfusion-app-version"].forEach(key => localStorage.setItem(key, "value"));
    expect(localAppDataKeys(localStorage).sort()).toEqual(["fitfusion-workout-history-v1", "fitxfusion-cache", "workout-data"]);
  });
});
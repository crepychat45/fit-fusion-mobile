import { describe, expect, it } from "vitest";
import { resetPatch, validSettingsBackup } from "./settings-defaults";
describe("Real preference restore and reset", () => {
  it("resets only the selected group and preserves account/security data", () => {
    expect(resetPatch(["units"])).toEqual({ unitSystem: "metric" });
    expect(resetPatch(["invalid"])).toEqual({});
    expect(resetPatch(["display"]).theme).toBe("light");
  });
  it("rejects corrupt imports, secret keys and wrong value types", () => {
    expect(validSettingsBackup({ version: "8.5.0", preferences: { theme: "dark", soundVolume: 0 } })).toBe(true);
    expect(validSettingsBackup({ version: "8.5.0", preferences: { notifications: "true" } })).toBe(false);
    expect(validSettingsBackup({ version: "8.5.0", preferences: { soundVolume: 101 } })).toBe(false);
    expect(validSettingsBackup({ version: "8.5.0", preferences: { access_token: "excluded" } })).toBe(false);
    expect(validSettingsBackup(null)).toBe(false);
  });
});
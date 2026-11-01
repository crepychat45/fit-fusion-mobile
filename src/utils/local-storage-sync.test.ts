import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { isLegacyMirrorKey } from "./local-storage-sync";
describe("Preference ownership", () => {
  it("never hydrates shared Settings toggles through the legacy mirror", () => {
    for (const key of ["fitfusion-compact-view", "fitfusion-display-options", "fitfusion-notifications", "fitfusion-auto-sync", "fitfusion-sound-enabled"]) expect(isLegacyMirrorKey(key)).toBe(false);
    expect(isLegacyMirrorKey("fitfusion-reading-ruler")).toBe(true);
  });
});
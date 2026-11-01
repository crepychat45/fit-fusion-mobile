import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadAndInstall, fetchDeployedBuild } from "./live-updater";

afterEach(() => vi.unstubAllGlobals());
describe("Real app updates", () => {
  it("does not claim installation without a registered update service", async () => {
    vi.stubGlobal("navigator", { serviceWorker: { getRegistration: vi.fn().mockResolvedValue(undefined) } });
    const step = vi.fn();
    await expect(downloadAndInstall(step)).rejects.toThrow("published app");
    expect(step).not.toHaveBeenCalled();
  });
  it("does not restart without a waiting deployed worker", async () => {
    vi.stubGlobal("navigator", { serviceWorker: { getRegistration: vi.fn().mockResolvedValue({ update: vi.fn().mockResolvedValue(undefined), waiting: null, installing: null }) } });
    const step = vi.fn();
    await expect(downloadAndInstall(step)).rejects.toThrow("No deployed update");
    expect(step.mock.calls).toEqual([["downloading"]]);
  });
  it("rejects incomplete release metadata", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ buildId: "next" }) }));
    expect(await fetchDeployedBuild()).toBeNull();
  });
});
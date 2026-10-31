import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { changedSettings, createDebouncedPush, packSnapshot, unpackRow, type SettingsSnapshot } from "./settings-sync";

afterEach(() => vi.useRealTimers());
describe("Settings patch persistence", () => {
  it("writes only changed fields without overwriting live preferences", () => {
    expect(packSnapshot({ theme: "dark" }).display_settings).toEqual({ theme: "dark" });
    expect(packSnapshot({ theme: "dark" }).account_settings).toEqual({});
    expect(unpackRow({ display_settings: { theme: "dark", live: { custom: true }, token: "excluded" } })).toEqual({ theme: "dark" });
    expect(changedSettings({ theme: "light", soundVolume: 0 }, { theme: "dark", soundVolume: 0 } as SettingsSnapshot)).toEqual({ theme: "dark" });
  });
  it("retains failed writes until recovery without another edit", async () => {
    vi.useFakeTimers();
    const write = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValue(true);
    const report = vi.fn();
    const queue = createDebouncedPush(10, report, write);
    queue("user-a", { soundVolume: 0 });
    await vi.advanceTimersByTimeAsync(10010);
    expect(write).toHaveBeenCalledTimes(3);
    expect(write).toHaveBeenLastCalledWith("user-a", { soundVolume: 0 });
    expect(report).toHaveBeenLastCalledWith("saved");
    queue.cancel();
  });
  it("cancels retries when the signed-in account changes", async () => {
    vi.useFakeTimers();
    const write = vi.fn().mockResolvedValue(false);
    const queue = createDebouncedPush(10, () => {}, write);
    queue("user-a", { theme: "dark" });
    await vi.advanceTimersByTimeAsync(10);
    queue.cancel();
    await vi.advanceTimersByTimeAsync(10000);
    expect(write).toHaveBeenCalledTimes(1);
  });
  it("coalesces rapid edits and retains the newest same-field value", async () => {
    vi.useFakeTimers();
    const write = vi.fn().mockResolvedValue(true);
    const queue = createDebouncedPush(10, () => {}, write);
    queue("user-a", { theme: "dark" });
    queue("user-a", { soundVolume: 0 });
    queue("user-a", { theme: "light" });
    await vi.advanceTimersByTimeAsync(10);
    expect(write).toHaveBeenCalledExactlyOnceWith("user-a", { theme: "light", soundVolume: 0 });
    queue.cancel();
  });
});
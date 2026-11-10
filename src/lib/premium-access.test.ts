import { describe, expect, it } from "vitest";
import { activePlan, hasMemberTool } from "./premium-access";
const now = Date.parse("2026-11-10T12:00:00Z");
const paid = { user_id: "member", plan_id: "pro", status: "active", environment: "live", expires_at: "2026-12-10T12:00:00Z" };
describe("verified member access", () => {
  it("never grants another account's membership", () => expect(activePlan(paid, "other", "live", now)).toBeNull());
  it("never grants test membership in live", () => expect(activePlan({ ...paid, environment: "sandbox" }, "member", "live", now)).toBeNull());
  it("does not grant access from a missing environment or unknown plan", () => {
    expect(activePlan({ ...paid, environment: undefined }, "member", "live", now)).toBeNull();
    expect(activePlan({ ...paid, plan_id: "made-up" }, "member", "live", now)).toBeNull();
  });
  it("expires access at the exact expiry time", () => expect(activePlan({ ...paid, expires_at: "2026-11-10T12:00:00Z" }, "member", "live", now)).toBeNull());
  it("does not grant refunded membership", () => expect(activePlan({ ...paid, status: "refunded" }, "member", "live", now)).toBeNull());
  it("keeps cancelled renewal access until the paid period expires", () => expect(activePlan({ ...paid, status: "cancelled" }, "member", "live", now)).toBe("pro"));
  it("hides all member tools from normal users", () => expect(hasMemberTool(null, "activitySummary")).toBe(false));
  it("Starter does not receive Pro reports", () => expect(hasMemberTool("starter", "csvReport")).toBe(false));
  it("Pro receives CSV reports but not Elite timeline", () => {
    expect(hasMemberTool("pro", "csvReport")).toBe(true);
    expect(hasMemberTool("pro", "recordTimeline")).toBe(false);
  });
  it("Ultimate receives every lower-tier and annual tool", () => {
    expect(hasMemberTool("ultimate", "activitySummary")).toBe(true);
    expect(hasMemberTool("ultimate", "annualRange")).toBe(true);
  });
});
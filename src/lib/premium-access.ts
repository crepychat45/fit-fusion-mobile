export const PLAN_IDS = ["starter", "pro", "elite", "ultimate"] as const;
export type PlanId = typeof PLAN_IDS[number];
export type BillingCycle = "monthly" | "yearly";
export const MEMBER_TOOLS = {
  activitySummary: { label: "Member activity summary", tier: "starter" },
  workoutMix: { label: "Workout variety breakdown", tier: "starter" },
  historySearch: { label: "Searchable member history", tier: "starter" },
  periodComparison: { label: "Previous-period comparison", tier: "pro" },
  weeklyTarget: { label: "Weekly goal calculator", tier: "pro" },
  csvReport: { label: "CSV training report", tier: "pro" },
  recordTimeline: { label: "Personal-best timeline", tier: "elite" },
  extendedRange: { label: "180-day training review", tier: "elite" },
  annualRange: { label: "365-day training review", tier: "ultimate" },
  jsonReport: { label: "Structured training report", tier: "ultimate" },
} as const;
export type MemberTool = keyof typeof MEMBER_TOOLS;
export interface PaidAccessRecord {
  user_id: string;
  plan_id: string;
  status: string;
  expires_at: string;
  environment?: string;
}
export function isPlanId(value: unknown): value is PlanId {
  return PLAN_IDS.some(plan => plan === value);
}
export function activePlan(record: PaidAccessRecord | null, userId: string | null, environment: string, now = Date.now()): PlanId | null {
  if (!record || !userId || record.user_id !== userId || record.environment !== environment || !isPlanId(record.plan_id)) return null;
  // A cancelled renewal keeps access for the already-paid period. Refunds/expired/past-due do not.
  if (record.status !== "active" && record.status !== "cancelled") return null;
  return Date.parse(record.expires_at) > now ? record.plan_id : null;
}
export function hasMemberTool(plan: PlanId | null, tool: MemberTool): boolean {
  return plan !== null && PLAN_IDS.indexOf(plan) >= PLAN_IDS.indexOf(MEMBER_TOOLS[tool].tier);
}
export function planBenefits(plan: PlanId): string[] {
  return (Object.keys(MEMBER_TOOLS) as MemberTool[]).filter(tool => hasMemberTool(plan, tool)).map(tool => MEMBER_TOOLS[tool].label);
}
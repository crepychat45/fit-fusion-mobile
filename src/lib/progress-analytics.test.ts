import { describe, expect, it } from "vitest";
import { normalizeWeeklyGoal, personalRecords, rangeAnalytics } from "./progress-analytics";
import type { WorkoutSessionRecord } from "./workout-history";
const record = (id: string, date: Date, durationSec = 600): WorkoutSessionRecord => ({ id, workoutId: "w1", workoutTitle: "Workout", startedAt: date.toISOString(), completedAt: date.toISOString(), durationSec, exercisesCompleted: [], totalExercises: 1, status: "completed" });

describe("recorded progress", () => {
  it.each([7, 30, 90] as const)("includes exactly %i local dates, excludes future and abandoned sessions", days => {
    const now = new Date(2026, 9, 28, 12);
    const start = new Date(2026, 9, 28 - days + 1);
    const previous = new Date(start.getTime() - 1);
    const rows = [record("start", start), record("today", now), record("old", previous), record("future", new Date(now.getTime() + 1000)), { ...record("abandoned", now), status: "abandoned" as const }];
    const result = rangeAnalytics(rows, days, now);
    expect(result.sessions.map(s => s.id)).toEqual(["today", "start"]);
    expect(result.minutes).toBe(20);
    expect(result.buckets.reduce((sum, b) => sum + b.count, 0)).toBe(2);
  });
  it("groups records by local day and Monday calendar week", () => {
    const rows = [record("sun", new Date(2026, 9, 25, 23, 55)), record("mon", new Date(2026, 9, 26, 0, 5)), record("mon2", new Date(2026, 9, 26, 23, 50), 1200)];
    expect(personalRecords(rows)).toEqual({ longestSessionMin: 20, bestDayMin: 30, bestWeekCount: 2 });
  });
  it("clamps the weekly goal to 1–14 and defaults invalid stored values to 5", () => {
    expect(normalizeWeeklyGoal(0)).toBe(1);
    expect(normalizeWeeklyGoal(20)).toBe(14);
    expect(normalizeWeeklyGoal("bad")).toBe(5);
    expect(normalizeWeeklyGoal(Number.NaN)).toBe(5);
  });
});
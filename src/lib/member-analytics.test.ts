import { describe, expect, it } from "vitest";
import { memberCsv, memberReview } from "./member-analytics";
import type { WorkoutSessionRecord } from "./workout-history";
const now = new Date(2026, 10, 10, 12);
const session = (id: string, date: Date, durationSec: number, status: "completed" | "abandoned" = "completed"): WorkoutSessionRecord => ({ id, workoutId: "w", workoutTitle: "Strength", startedAt: date.toISOString(), completedAt: date.toISOString(), durationSec, exercisesCompleted: ["a"], totalExercises: 1, status });
describe("recorded member analytics", () => {
  it("counts only completed, non-future recorded sessions", () => {
    const review = memberReview([session("1", now, 600), session("2", now, 600, "abandoned"), session("3", new Date(2026, 10, 11), 600)], 7, now);
    expect(review.sessions).toHaveLength(1); expect(review.minutes).toBe(10);
  });
  it("compares distinct adjacent periods using local dates", () => {
    const review = memberReview([session("1", new Date(2026, 10, 4), 600), session("2", new Date(2026, 10, 3), 1200)], 7, now);
    expect(review.sessions).toHaveLength(1); expect(review.previousCount).toBe(1); expect(review.previousMinutes).toBe(20);
  });
  it("records improvements only, not invented personal bests", () => {
    const review = memberReview([session("1", new Date(2026, 10, 4), 600), session("2", new Date(2026, 10, 5), 300), session("3", now, 1200)], 7, now);
    expect(review.timeline.map(s => s.minutes)).toEqual([10, 20]);
    expect(review.mix[0].count).toBe(3);
  });
  it("escapes spreadsheet formulas and embedded quotes in exports", () => {
    expect(memberCsv([{ ...session("1", now, 600), workoutTitle: '=HYPERLINK("bad")' }])).toContain('"\'=HYPERLINK(""bad"")"');
  });
});
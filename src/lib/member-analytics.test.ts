import { describe, expect, it } from "vitest";
import { filterMemberHistory, memberCsv, memberReview } from "./member-analytics";
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
  it("does not call a shorter session a personal best after an older record", () => {
    const review = memberReview([session("old", new Date(2026, 9, 1), 3600), session("new", now, 1800)], 7, now);
    expect(review.timeline).toEqual([]);
  });
  it("calculates average, longest and weekday counts from completed records", () => {
    const review = memberReview([session("1", now, 600), session("2", now, 1800), session("3", now, 600, "abandoned")], 7, now);
    expect(review.averageMinutes).toBe(20);
    expect(review.longestMinutes).toBe(30);
    expect(review.weekdays[1].sessions).toBe(2);
    expect(review.weekdays[1].seconds).toBe(2400);
  });
  it("filters the 30-minute boundary and searches notes without changing source order", () => {
    const records = [session("short", now, 1799), { ...session("long", now, 1800), notes: "Morning" }];
    expect(filterMemberHistory(records, "", "short", "newest").map(s => s.id)).toEqual(["short"]);
    expect(filterMemberHistory(records, " morning ", "long", "longest").map(s => s.id)).toEqual(["long"]);
    expect(records[0].id).toBe("short");
  });
  it("sorts history by date and duration", () => {
    const records = [session("old", new Date(2026, 10, 9), 1800), session("new", now, 600)];
    expect(filterMemberHistory(records, "", "all", "newest")[0].id).toBe("new");
    expect(filterMemberHistory(records, "", "all", "oldest")[0].id).toBe("old");
    expect(filterMemberHistory(records, "", "all", "longest")[0].id).toBe("old");
  });
});
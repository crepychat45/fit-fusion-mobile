import { describe, it, expect, beforeEach } from "vitest";
import { addSession, computeStats, computeStreaks, getSessions, type WorkoutSessionRecord } from "./workout-history";

const rec = (id: string, iso: string, workoutId = "w1"): WorkoutSessionRecord => ({
  id, workoutId, workoutTitle: workoutId, startedAt: iso, completedAt: iso, durationSec: 600,
  exercisesCompleted: [], totalExercises: 3, status: "completed",
});

describe("workout history", () => {
  beforeEach(() => localStorage.clear());

  it("migrates legacy completedWorkouts once", () => {
    localStorage.setItem("completedWorkouts", JSON.stringify([{ id: "w1", title: "A", completedAt: "2026-10-01T10:00:00Z" }]));
    expect(getSessions()).toHaveLength(1);
  });

  it("never double-counts the same session", () => {
    expect(addSession(rec("s1", new Date().toISOString()))).toBe(true);
    expect(addSession(rec("s1", new Date().toISOString()))).toBe(false);
    expect(getSessions()).toHaveLength(1);
  });

  it("survives corrupted storage", () => {
    localStorage.setItem("fitfusion-workout-history-v1", "{bad");
    expect(getSessions()).toEqual([]);
  });

  it("computes streaks from local days, tolerating no workout yet today", () => {
    const now = new Date(2026, 9, 10, 23, 59);
    const s = [new Date(2026, 9, 9, 0, 1), new Date(2026, 9, 8, 12), new Date(2026, 9, 5, 9)].map((d, i) => rec(`s${i}`, d.toISOString()));
    expect(computeStreaks(s, now)).toEqual({ current: 2, longest: 2 });
  });

  it("separates sessions from unique workouts", () => {
    const t = new Date().toISOString();
    const st = computeStats([rec("a", t, "w1"), rec("b", t, "w1"), rec("c", t, "w2")]);
    expect(st.totalSessions).toBe(3);
    expect(st.uniqueWorkouts).toBe(2);
  });
});

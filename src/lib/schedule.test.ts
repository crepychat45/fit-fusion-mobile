import { describe, it, expect, beforeEach } from "vitest";
import { getSchedule, addToSchedule, removeFromSchedule, localDateKey } from "./schedule";

const entry = (workoutId: string, date: string, time?: string) => ({
  workoutId,
  workoutTitle: workoutId,
  date,
  time,
});

describe("workout schedule", () => {
  beforeEach(() => localStorage.clear());

  it("adds and reads back a scheduled workout", () => {
    addToSchedule(entry("w1", "2026-10-20", "07:30"));
    const all = getSchedule();
    expect(all).toHaveLength(1);
    expect(all[0].workoutId).toBe("w1");
    expect(all[0].time).toBe("07:30");
  });

  it("sorts by date then time", () => {
    addToSchedule(entry("late", "2026-10-20", "18:00"));
    addToSchedule(entry("early", "2026-10-20", "06:00"));
    addToSchedule(entry("prev", "2026-10-19"));
    expect(getSchedule().map((s) => s.workoutId)).toEqual(["prev", "early", "late"]);
  });

  it("removes an entry by id", () => {
    const a = addToSchedule(entry("w1", "2026-10-20"));
    addToSchedule(entry("w2", "2026-10-21"));
    removeFromSchedule(a.id);
    expect(getSchedule().map((s) => s.workoutId)).toEqual(["w2"]);
  });

  it("caps the schedule at 200 entries", () => {
    for (let i = 0; i < 205; i++) addToSchedule(entry(`w${i}`, "2026-10-20"));
    expect(getSchedule()).toHaveLength(200);
  });

  it("survives corrupted storage", () => {
    localStorage.setItem("fitfusion-schedule-v1", "{bad");
    expect(getSchedule()).toEqual([]);
  });

  it("drops entries with invalid dates", () => {
    localStorage.setItem(
      "fitfusion-schedule-v1",
      JSON.stringify([
        { id: "ok", workoutId: "w1", workoutTitle: "w1", date: "2026-10-20", createdAt: 1 },
        { id: "bad", workoutId: "w2", workoutTitle: "w2", date: "20/10/2026", createdAt: 1 },
      ]),
    );
    expect(getSchedule().map((s) => s.id)).toEqual(["ok"]);
  });

  it("formats local dates as YYYY-MM-DD", () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(localDateKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { getCustomWorkouts, saveCustomWorkout, deleteCustomWorkout } from "./custom-workouts";
import type { Workout } from "@/data/workouts";

const mk = (id: string, title = "My Workout"): Workout => ({
  id,
  title,
  description: "test",
  category: "strength",
  level: "beginner",
  duration: 20,
  exercises: [{ id: "e1", name: "Push-up", sets: 3, reps: 10, instructions: "", muscles: ["chest"] }],
  popularity: 0,
  createdAt: new Date().toISOString(),
});

describe("custom workouts", () => {
  beforeEach(() => localStorage.clear());

  it("saves and reads back a workout", () => {
    expect(saveCustomWorkout(mk("c1"))).toBe(true);
    const all = getCustomWorkouts();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe("c1");
  });

  it("replaces a workout with the same id instead of duplicating", () => {
    saveCustomWorkout(mk("c1", "Old"));
    saveCustomWorkout(mk("c1", "New"));
    const all = getCustomWorkouts();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe("New");
  });

  it("caps the library at 50 workouts, newest first", () => {
    for (let i = 0; i < 55; i++) saveCustomWorkout(mk(`c${i}`));
    const all = getCustomWorkouts();
    expect(all).toHaveLength(50);
    expect(all[0].id).toBe("c54");
  });

  it("deletes a workout by id", () => {
    saveCustomWorkout(mk("c1"));
    saveCustomWorkout(mk("c2"));
    deleteCustomWorkout("c1");
    expect(getCustomWorkouts().map((w) => w.id)).toEqual(["c2"]);
  });

  it("survives corrupted storage", () => {
    localStorage.setItem("fitfusion-custom-workouts-v1", "{bad");
    expect(getCustomWorkouts()).toEqual([]);
  });

  it("drops malformed entries from storage", () => {
    localStorage.setItem(
      "fitfusion-custom-workouts-v1",
      JSON.stringify([mk("good"), { id: 42 }, null, { title: "no id" }]),
    );
    expect(getCustomWorkouts().map((w) => w.id)).toEqual(["good"]);
  });
});

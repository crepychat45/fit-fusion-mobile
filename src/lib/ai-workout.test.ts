import { describe, expect, it } from "vitest";
import { aiWorkoutSchema, durationSeconds, toLibraryWorkout } from "./ai-workout";
const plan = () => aiWorkoutSchema.parse({ name: "Test routine", summary: "Recorded AI response", duration_minutes: 10, difficulty: "beginner", focus: "cardio", warmup: [{ name: "March", duration: "1 minute 30 seconds" }], exercises: [{ name: "Squats", sets: 3, reps: "12", rest: "30 seconds", instructions: "Keep knees aligned." }], cooldown: [{ name: "Stretch", duration: "00:45" }] });
describe("AI plan conversion", () => {
  it("preserves section order, durations, sets, reps and rest instructions", () => {
    const workout = toLibraryWorkout(plan(), "bodyweight");
    expect(workout.exercises.map(e => e.name)).toEqual(["March", "Squats", "Stretch"]);
    expect(workout.exercises[0].duration).toBe(90);
    expect(workout.exercises[2].duration).toBe(45);
    expect(workout.exercises[1]).toMatchObject({ sets: 3, reps: 12, instructions: "Keep knees aligned. Rest: 30 seconds." });
    expect(workout.category).toBe("cardio");
    expect(workout.calories).toBeUndefined();
  });
  it("uses unique IDs across sections and separately generated plans", () => {
    const a = toLibraryWorkout(plan(), "bodyweight");
    const b = toLibraryWorkout(plan(), "bodyweight");
    expect(a.id).not.toBe(b.id);
    expect(new Set([...a.exercises, ...b.exercises].map(e => e.id)).size).toBe(6);
  });
  it("rejects incomplete or unsafe response structures", () => {
    expect(aiWorkoutSchema.safeParse({ name: "Empty", exercises: [] }).success).toBe(false);
    expect(aiWorkoutSchema.safeParse({ ...plan(), exercises: [{ name: "Bad", sets: -1 }] }).success).toBe(false);
  });
  it("converts minute and second units without inventing unreadable durations", () => {
    expect(durationSeconds("2 min")).toBe(120);
    expect(durationSeconds("30 sec")).toBe(30);
    expect(durationSeconds("as needed")).toBeUndefined();
  });
});
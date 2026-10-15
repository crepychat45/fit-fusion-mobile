import type { Exercise, Workout } from "@/data/workouts";

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: Workout["category"];
  level: Workout["level"];
  exercises: Exercise[];
}

const ex = (
  name: string,
  sets: number,
  reps: number,
  muscles: string[],
  instructions: string,
  duration?: number,
): Exercise => ({ id: `tpl-${name.toLowerCase().replace(/\s+/g, "-")}`, name, sets, reps, duration, instructions, muscles });

/** Built-in starting points for the custom workout builder. */
export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "tpl-full-body",
    name: "Full Body Basics",
    description: "A balanced beginner session hitting every major muscle group.",
    category: "strength",
    level: "beginner",
    exercises: [
      ex("Bodyweight Squats", 3, 12, ["quads", "glutes"], "Stand tall, lower until thighs are parallel, drive back up."),
      ex("Push-Ups", 3, 10, ["chest", "triceps"], "Keep a straight line from head to heels; lower chest to the floor."),
      ex("Glute Bridges", 3, 15, ["glutes", "hamstrings"], "Lie on your back, lift hips until body forms a straight line."),
      ex("Plank", 3, 1, ["core"], "Hold a straight line on forearms and toes.", 30),
    ],
  },
  {
    id: "tpl-quick-hiit",
    name: "Quick HIIT Blast",
    description: "Ten minutes of high-intensity intervals for busy days.",
    category: "hiit",
    level: "intermediate",
    exercises: [
      ex("Jumping Jacks", 3, 1, ["full body"], "Move fast and stay light on your feet.", 40),
      ex("High Knees", 3, 1, ["cardio", "core"], "Drive knees to hip height at a sprint pace.", 30),
      ex("Burpees", 3, 8, ["full body"], "Squat down, jump back to plank, return and jump up."),
      ex("Mountain Climbers", 3, 1, ["core", "shoulders"], "From plank, alternate driving knees to chest quickly.", 30),
    ],
  },
  {
    id: "tpl-upper-body",
    name: "Upper Body Strength",
    description: "Chest, back, shoulders and arms with minimal equipment.",
    category: "strength",
    level: "intermediate",
    exercises: [
      ex("Push-Ups", 4, 12, ["chest", "triceps"], "Full range of motion, controlled tempo."),
      ex("Pike Push-Ups", 3, 8, ["shoulders"], "Hips high, lower head toward the floor."),
      ex("Tricep Dips", 3, 10, ["triceps"], "Use a chair or step; keep elbows tracking back."),
      ex("Superman Holds", 3, 1, ["back"], "Lie face down, lift arms and legs, hold.", 20),
    ],
  },
  {
    id: "tpl-mobility",
    name: "Mobility & Recovery",
    description: "Gentle stretching flow for rest days and cool-downs.",
    category: "flexibility",
    level: "beginner",
    exercises: [
      ex("Cat-Cow Stretch", 2, 10, ["spine"], "Move slowly with your breath."),
      ex("World's Greatest Stretch", 2, 5, ["hips", "hamstrings"], "Lunge, rotate, and reach each side."),
      ex("Downward Dog", 3, 1, ["hamstrings", "shoulders"], "Press heels toward the floor.", 30),
      ex("Child's Pose", 2, 1, ["back", "hips"], "Sit back on heels and reach forward.", 45),
    ],
  },
];

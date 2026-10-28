import { z } from "zod";
import type { Workout } from "@/data/workouts";

const exerciseSchema = z.object({
  name: z.string().trim().min(1), sets: z.number().int().positive().optional(),
  reps: z.union([z.string(), z.number().nonnegative()]).optional(),
  rest: z.string().optional(), duration: z.string().optional(), instructions: z.string().optional(),
  muscle_groups: z.array(z.string()).optional(),
});
export const aiWorkoutSchema = z.object({
  name: z.string().trim().min(1), summary: z.string(), duration_minutes: z.number().positive().max(120),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]), focus: z.string(),
  warmup: z.array(exerciseSchema).default([]), exercises: z.array(exerciseSchema).min(1),
  cooldown: z.array(exerciseSchema).default([]), tips: z.array(z.string()).default([]),
  estimated_calories: z.number().nonnegative().optional(),
});
export type AIWorkout = z.infer<typeof aiWorkoutSchema>;
export type AIExercise = z.infer<typeof exerciseSchema>;

export function durationSeconds(value?: string): number | undefined {
  if (!value) return undefined;
  const text = value.trim().toLowerCase();
  const clock = text.match(/^(\d+):(\d{2})$/);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(minutes?|mins?|m|seconds?|secs?|s)\b/g)];
  const seconds = matches.reduce((sum, match) => sum + Number(match[1]) * (match[2].startsWith("m") ? 60 : 1), 0);
  return seconds > 0 ? Math.round(seconds) : undefined;
}

export function toLibraryWorkout(w: AIWorkout, equipment: string, id = `ai-${crypto.randomUUID()}`): Workout {
  const focus = w.focus.toLowerCase();
  return {
    id, title: w.name, description: w.summary, category: focus.includes("cardio") ? "cardio" : focus.includes("mobility") || focus.includes("flexibility") ? "flexibility" : focus.includes("hiit") ? "hiit" : "strength",
    level: w.difficulty, duration: w.duration_minutes, popularity: 0, createdAt: Date.now(),
    calories: w.estimated_calories, equipment: [equipment], tags: ["ai", "custom"],
    exercises: [...w.warmup, ...w.exercises, ...w.cooldown].map((ex, i) => ({
      id: `${id}-ex-${i}`, name: ex.name, sets: ex.sets ?? 1,
      reps: Math.max(0, parseInt(String(ex.reps ?? 0), 10) || 0), duration: durationSeconds(ex.duration) ?? (typeof ex.reps === "string" && /sec|min/.test(ex.reps) ? durationSeconds(ex.reps) : undefined),
      instructions: [ex.instructions, ex.rest ? `Rest: ${ex.rest}.` : ""].filter(Boolean).join(" "), muscles: ex.muscle_groups ?? [],
    })),
  };
}
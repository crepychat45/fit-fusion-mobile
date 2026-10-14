/**
 * User-built custom workouts, stored on this device and merged into the
 * shared workout library so detail/session pages can play them.
 */
import { readJson, writeJson } from "@/lib/safe-storage";
import type { Workout } from "@/data/workouts";

const KEY = "fitfusion-custom-workouts-v1";
export const CUSTOM_EVENT = "fitfusion:custom-workouts";

function isWorkout(v: unknown): v is Workout {
  const w = v as Workout;
  return !!w && typeof w.id === "string" && typeof w.title === "string" && Array.isArray(w.exercises);
}

export function getCustomWorkouts(): Workout[] {
  const raw = readJson<unknown>(KEY, []);
  return Array.isArray(raw) ? raw.filter(isWorkout) : [];
}

export function saveCustomWorkout(w: Workout): boolean {
  const all = getCustomWorkouts().filter((x) => x.id !== w.id);
  const ok = writeJson(KEY, [w, ...all].slice(0, 50));
  if (ok) {
    try { window.dispatchEvent(new Event(CUSTOM_EVENT)); } catch { /* noop */ }
  }
  return ok;
}

export function deleteCustomWorkout(id: string): boolean {
  const ok = writeJson(KEY, getCustomWorkouts().filter((x) => x.id !== id));
  if (ok) {
    try { window.dispatchEvent(new Event(CUSTOM_EVENT)); } catch { /* noop */ }
  }
  return ok;
}

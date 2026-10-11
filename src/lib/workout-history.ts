/**
 * Single source of truth for workout sessions, favorites and queue on this device.
 * Migrates legacy `completedWorkouts` and `workout-data` keys once.
 */
import { readJson, writeJson } from "@/lib/safe-storage";

export type SessionStatus = "completed" | "abandoned";

export interface WorkoutSessionRecord {
  id: string;
  workoutId: string;
  workoutTitle: string;
  userId?: string | null;
  startedAt: string;
  completedAt: string;
  durationSec: number;
  exercisesCompleted: string[];
  totalExercises: number;
  estimatedCalories?: number;
  status: SessionStatus;
  notes?: string;
}

export interface WorkoutLibraryState {
  favorites: string[];
  queue: string[];
  recentlyViewed: string[];
}

export const HISTORY_KEY = "fitfusion-workout-history-v1";
export const LIBRARY_KEY = "fitfusion-workout-library-v1";
const MAX_SESSIONS = 500;
export const HISTORY_EVENT = "fitfusion:workout-history";

const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

function isRecord(v: unknown): v is WorkoutSessionRecord {
  const r = v as WorkoutSessionRecord;
  return !!r && typeof r.id === "string" && typeof r.workoutId === "string" && typeof r.completedAt === "string" && !Number.isNaN(Date.parse(r.completedAt));
}

function migrateLegacy(): WorkoutSessionRecord[] {
  const legacy = readJson<unknown[]>("completedWorkouts", []);
  if (!Array.isArray(legacy)) return [];
  return legacy
    .filter((l): l is { id: string; title?: string; completedAt: string } => !!l && typeof (l as any).id === "string" && typeof (l as any).completedAt === "string")
    .map((l, i) => ({
      id: `legacy-${i}-${l.completedAt}`,
      workoutId: l.id,
      workoutTitle: l.title ?? l.id,
      startedAt: l.completedAt,
      completedAt: l.completedAt,
      durationSec: 0,
      exercisesCompleted: [],
      totalExercises: 0,
      status: "completed" as const,
    }));
}

export function getSessions(): WorkoutSessionRecord[] {
  const raw = readJson<unknown>(HISTORY_KEY, null);
  if (raw === null) {
    const migrated = migrateLegacy();
    writeJson(HISTORY_KEY, migrated);
    return migrated;
  }
  return Array.isArray(raw) ? raw.filter(isRecord) : [];
}

export function addSession(rec: WorkoutSessionRecord): boolean {
  const all = getSessions();
  if (all.some((s) => s.id === rec.id)) return false; // idempotent: never double count
  const next = [rec, ...all].slice(0, MAX_SESSIONS);
  const ok = writeJson(HISTORY_KEY, next);
  if (ok) {
    // keep legacy readers working
    const legacy = next.filter((s) => s.status === "completed").map((s) => ({ id: s.workoutId, title: s.workoutTitle, completedAt: s.completedAt }));
    writeJson("completedWorkouts", legacy);
    try { window.dispatchEvent(new Event(HISTORY_EVENT)); } catch { /* noop */ }
  }
  return ok;
}

export function getLibrary(): WorkoutLibraryState {
  const raw = readJson<any>(LIBRARY_KEY, null);
  if (raw) return { favorites: strArr(raw.favorites), queue: strArr(raw.queue).slice(0, 12), recentlyViewed: strArr(raw.recentlyViewed).slice(0, 10) };
  const old = readJson<any>("workout-data", {});
  const state = { favorites: strArr(old?.favorites), queue: strArr(old?.queue).slice(0, 12), recentlyViewed: [] };
  writeJson(LIBRARY_KEY, state);
  return state;
}

export function saveLibrary(state: WorkoutLibraryState) {
  writeJson(LIBRARY_KEY, state);
  try { window.dispatchEvent(new Event(HISTORY_EVENT)); } catch { /* noop */ }
}

/** Local calendar-day key (user's time zone). */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Streak = consecutive local calendar days with ≥1 completed session.
 * Current streak counts back from today, or from yesterday if nothing logged today yet.
 */
export function computeStreaks(sessions: WorkoutSessionRecord[], now = new Date()) {
  const days = new Set(sessions.filter((s) => s.status === "completed").map((s) => dayKey(new Date(s.completedAt))));
  const step = (d: Date, n: number) => { const c = new Date(d); c.setDate(c.getDate() + n); return c; };
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dayKey(cursor))) cursor = step(cursor, -1);
  let current = 0;
  while (days.has(dayKey(cursor))) { current++; cursor = step(cursor, -1); }
  const sorted = [...days].sort();
  let longest = 0, run = 0, prev: Date | null = null;
  for (const k of sorted) {
    const [y, m, dd] = k.split("-").map(Number);
    const d = new Date(y, m - 1, dd);
    run = prev && dayKey(step(prev, 1)) === k ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest };
}

export function computeStats(sessions: WorkoutSessionRecord[], now = new Date()) {
  const done = sessions.filter((s) => s.status === "completed");
  const weekAgo = now.getTime() - 7 * 86400000;
  const monthAgo = now.getTime() - 30 * 86400000;
  const { current, longest } = computeStreaks(sessions, now);
  return {
    totalSessions: done.length,
    uniqueWorkouts: new Set(done.map((s) => s.workoutId)).size,
    totalMinutes: Math.round(done.reduce((a, s) => a + s.durationSec, 0) / 60),
    thisWeek: done.filter((s) => Date.parse(s.completedAt) >= weekAgo).length,
    thisMonth: done.filter((s) => Date.parse(s.completedAt) >= monthAgo).length,
    estimatedCalories: done.reduce((a, s) => a + (s.estimatedCalories ?? 0), 0),
    completionRate: sessions.length ? Math.round((done.length / sessions.length) * 100) : 0,
    currentStreak: current,
    longestStreak: longest,
  };
}

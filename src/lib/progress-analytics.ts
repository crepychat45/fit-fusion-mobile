import { dayKey, type WorkoutSessionRecord } from "./workout-history";

export type ProgressRange = 7 | 30 | 90;

export function rangeAnalytics(sessions: WorkoutSessionRecord[], days: ProgressRange, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - days + 1);
  const selected = sessions.filter(s => {
    const time = Date.parse(s.completedAt);
    return s.status === "completed" && time >= start.getTime() && time <= now.getTime();
  }).sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  const bucketDays = days === 7 ? 1 : days === 30 ? 5 : 15;
  const buckets = Array.from({ length: Math.ceil(days / bucketDays) }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index * bucketDays);
    const end = new Date(date);
    end.setDate(end.getDate() + bucketDays);
    const records = selected.filter(s => Date.parse(s.completedAt) >= date.getTime() && Date.parse(s.completedAt) < end.getTime());
    return { name: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }), minutes: Math.round(records.reduce((sum, s) => sum + s.durationSec, 0) / 60), count: records.length };
  });
  return {
    sessions: selected,
    count: selected.length,
    minutes: Math.round(selected.reduce((sum, s) => sum + s.durationSec, 0) / 60),
    calories: selected.reduce((sum, s) => sum + (s.estimatedCalories ?? 0), 0),
    buckets,
  };
}

export function personalRecords(sessions: WorkoutSessionRecord[]) {
  const done = sessions.filter(s => s.status === "completed" && Number.isFinite(Date.parse(s.completedAt)));
  if (!done.length) return null;
  const perDay = new Map<string, number>();
  const perWeek = new Map<string, number>();
  for (const s of done) {
    const date = new Date(s.completedAt);
    const day = dayKey(date);
    perDay.set(day, (perDay.get(day) ?? 0) + s.durationSec);
    date.setDate(date.getDate() - (date.getDay() + 6) % 7);
    const week = dayKey(date);
    perWeek.set(week, (perWeek.get(week) ?? 0) + 1);
  }
  return {
    longestSessionMin: Math.round(Math.max(...done.map(s => s.durationSec)) / 60),
    bestDayMin: Math.round(Math.max(...perDay.values()) / 60),
    bestWeekCount: Math.max(...perWeek.values()),
  };
}

export function normalizeWeeklyGoal(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(14, Math.max(1, Math.round(value))) : 5;
}
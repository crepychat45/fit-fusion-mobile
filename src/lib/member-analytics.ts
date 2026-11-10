import { dayKey, type WorkoutSessionRecord } from "./workout-history";

export function memberReview(records: WorkoutSessionRecord[], days: number, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - days + 1);
  const previous = new Date(start);
  previous.setDate(previous.getDate() - days);
  const valid = records.filter(s => s.status === "completed" && Number.isFinite(s.durationSec) && s.durationSec >= 0 && Date.parse(s.completedAt) <= now.getTime());
  const current = valid.filter(s => Date.parse(s.completedAt) >= start.getTime()).sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  const before = valid.filter(s => Date.parse(s.completedAt) >= previous.getTime() && Date.parse(s.completedAt) < start.getTime());
  const minutes = (sessions: WorkoutSessionRecord[]) => Math.round(sessions.reduce((sum, s) => sum + s.durationSec, 0) / 60);
  const mix = new Map<string, { title: string; count: number; seconds: number }>();
  const timeline: { id: string; title: string; minutes: number; date: string }[] = [];
  let best = 0;
  for (const session of [...current].reverse()) {
    if (session.durationSec > best) {
      best = session.durationSec;
      timeline.push({ id: session.id, title: session.workoutTitle, minutes: Math.round(best / 60), date: session.completedAt });
    }
    const entry = mix.get(session.workoutId) ?? { title: session.workoutTitle, count: 0, seconds: 0 };
    entry.count++;
    entry.seconds += session.durationSec;
    mix.set(session.workoutId, entry);
  }
  const week = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  week.setDate(week.getDate() - (week.getDay() + 6) % 7);
  return {
    sessions: current, minutes: minutes(current), previousCount: before.length, previousMinutes: minutes(before),
    activeDays: new Set(current.map(s => dayKey(new Date(s.completedAt)))).size,
    thisWeek: valid.filter(s => Date.parse(s.completedAt) >= week.getTime()).length,
    mix: [...mix.values()].sort((a, b) => b.count - a.count), timeline,
  };
}

const csvCell = (value: string | number) => {
  const text = String(value);
  // Prevent spreadsheet formula execution from user-created workout names/notes.
  const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};
export function memberCsv(sessions: WorkoutSessionRecord[]): string {
  return ["Date,Workout,Minutes,Exercises completed,Notes", ...sessions.map(s => [s.completedAt, s.workoutTitle, Math.round(s.durationSec / 60), s.exercisesCompleted.length, s.notes ?? ""].map(csvCell).join(","))].join("\r\n");
}
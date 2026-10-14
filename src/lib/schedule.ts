import { readJson, writeJson } from "@/lib/safe-storage";

export interface ScheduledWorkout {
  id: string;
  workoutId: string;
  workoutTitle: string;
  /** Local date, YYYY-MM-DD */
  date: string;
  /** Optional local time, HH:MM */
  time?: string;
  createdAt: number;
}

const KEY = "fitfusion-schedule-v1";
export const SCHEDULE_EVENT = "fitfusion:schedule";
const MAX_ENTRIES = 200;

function isScheduled(v: unknown): v is ScheduledWorkout {
  if (!v || typeof v !== "object") return false;
  const s = v as Partial<ScheduledWorkout>;
  return (
    typeof s.id === "string" &&
    typeof s.workoutId === "string" &&
    typeof s.workoutTitle === "string" &&
    typeof s.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(s.date)
  );
}

export function getSchedule(): ScheduledWorkout[] {
  const raw = readJson<unknown>(KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isScheduled).sort((a, b) =>
    (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")),
  );
}

function persist(items: ScheduledWorkout[]): void {
  writeJson(KEY, items.slice(0, MAX_ENTRIES));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SCHEDULE_EVENT));
  }
}

export function addToSchedule(
  entry: Omit<ScheduledWorkout, "id" | "createdAt">,
): ScheduledWorkout {
  const item: ScheduledWorkout = {
    ...entry,
    id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  persist([item, ...getSchedule()]);
  return item;
}

export function removeFromSchedule(id: string): void {
  persist(getSchedule().filter((s) => s.id !== id));
}

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

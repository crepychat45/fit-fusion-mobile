import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HISTORY_EVENT, addSession, computeStats, getLibrary, getSessions, saveLibrary,
  type WorkoutLibraryState, type WorkoutSessionRecord,
} from "@/lib/workout-history";

/** Shared hook: every workout page reads sessions, favorites and queue from here. */
export function useWorkoutHistory() {
  const [sessions, setSessions] = useState<WorkoutSessionRecord[]>(() => getSessions());
  const [library, setLibrary] = useState<WorkoutLibraryState>(() => getLibrary());

  useEffect(() => {
    const sync = () => { setSessions(getSessions()); setLibrary(getLibrary()); };
    window.addEventListener(HISTORY_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(HISTORY_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);

  const update = useCallback((fn: (s: WorkoutLibraryState) => WorkoutLibraryState) => {
    const next = fn(getLibrary());
    setLibrary(next);
    saveLibrary(next);
  }, []);

  const toggleFavorite = useCallback((id: string) => update((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id] })), [update]);
  const setQueue = useCallback((q: string[]) => update((s) => ({ ...s, queue: [...new Set(q)].slice(0, 12) })), [update]);
  const markViewed = useCallback((id: string) => update((s) => ({ ...s, recentlyViewed: [id, ...s.recentlyViewed.filter((v) => v !== id)].slice(0, 10) })), [update]);

  const stats = useMemo(() => computeStats(sessions), [sessions]);
  const completedIds = useMemo(() => new Set(sessions.filter((s) => s.status === "completed").map((s) => s.workoutId)), [sessions]);

  return { sessions, stats, completedIds, ...library, toggleFavorite, setQueue, markViewed, addSession };
}

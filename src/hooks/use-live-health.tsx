import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sensorHub, loadState, EVT, type SensorReading } from "@/lib/smartwatch";

/**
 * Real health data only: watch sensor readings (Bluetooth), recorded workout
 * sessions (database, live), and hydration the user logs themselves.
 */
export type LiveHealth = {
  reading: SensorReading;
  watchConnected: boolean;
  watchBattery: number | null;
  todayMinutes: number;
  todayCalories: number;
  todaySessions: number;
  weekSessions: number;
  weeklyGoal: number;
  streakDays: number;
  waterMl: number;
  waterGoalMl: number;
  loading: boolean;
  signedIn: boolean;
};

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const WATER_KEY = "fitfusion.water";
const GOAL_KEY = "fitfusion.weeklyGoal";

const readWater = () => {
  try {
    const v = JSON.parse(localStorage.getItem(WATER_KEY) || "{}");
    return v[dayKey()] ?? 0;
  } catch {
    return 0;
  }
};

export function useLiveHealth() {
  const [reading, setReading] = useState<SensorReading>(sensorHub.current);
  const [watch, setWatch] = useState(loadState());
  const [sessions, setSessions] = useState<{ completed_at: string; duration_minutes: number | null; calories_burned: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [waterMl, setWaterMl] = useState<number>(readWater());
  const [weeklyGoal, setWeeklyGoalState] = useState<number>(() => Number(localStorage.getItem(GOAL_KEY)) || 4);

  useEffect(() => sensorHub.subscribe(setReading) as unknown as () => void, []);
  useEffect(() => {
    const on = () => setWatch(loadState());
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, []);

  const load = useCallback(async (uid: string) => {
    const since = new Date(Date.now() - 60 * 86400000).toISOString();
    const { data } = await supabase
      .from("workout_sessions")
      .select("completed_at,duration_minutes,calories_burned")
      .eq("user_id", uid)
      .gte("completed_at", since)
      .order("completed_at", { ascending: false });
    setSessions(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) return setLoading(false);
      load(uid);
      channel = supabase
        .channel(`live-health-${uid}-${crypto.randomUUID()}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "workout_sessions", filter: `user_id=eq.${uid}` }, () => load(uid))
        .subscribe();
    });
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [load]);

  const addWater = (ml: number) => {
    try {
      const v = JSON.parse(localStorage.getItem(WATER_KEY) || "{}");
      v[dayKey()] = Math.max(0, (v[dayKey()] ?? 0) + ml);
      localStorage.setItem(WATER_KEY, JSON.stringify(v));
      setWaterMl(v[dayKey()]);
    } catch {
      /* storage unavailable */
    }
  };

  const setWeeklyGoal = (n: number) => {
    localStorage.setItem(GOAL_KEY, String(n));
    setWeeklyGoalState(n);
  };

  const today = dayKey();
  const todays = sessions.filter((s) => s.completed_at.slice(0, 10) === today);
  const weekStart = Date.now() - 7 * 86400000;
  const days = new Set(sessions.map((s) => s.completed_at.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const health: LiveHealth = {
    reading,
    watchConnected: watch.connected,
    watchBattery: watch.connected ? watch.battery : null,
    todayMinutes: todays.reduce((a, s) => a + (s.duration_minutes ?? 0), 0),
    todayCalories: todays.reduce((a, s) => a + (s.calories_burned ?? 0), 0),
    todaySessions: todays.length,
    weekSessions: sessions.filter((s) => new Date(s.completed_at).getTime() >= weekStart).length,
    weeklyGoal,
    streakDays: streak,
    waterMl,
    waterGoalMl: 2500,
    loading,
    signedIn: Boolean(userId),
  };

  return { ...health, addWater, setWeeklyGoal };
}

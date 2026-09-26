import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";

export function TodayActivityStrip() {
  const { user } = useEnhancedAuth();
  const [today, setToday] = useState({ sessions: 0, minutes: 0 });
  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    const beginning = new Date();
    beginning.setHours(0, 0, 0, 0);
    supabase.from("workout_sessions").select("duration_minutes").eq("user_id", user.id)
      .gte("completed_at", beginning.toISOString()).then(({ data }) => {
        if (mounted) setToday({ sessions: data?.length ?? 0, minutes: data?.reduce((sum, row) => sum + (row.duration_minutes ?? 0), 0) ?? 0 });
      });
    return () => { mounted = false; };
  }, [user?.id]);
  if (!user) return null;
  return <div className="mx-4 flex items-center gap-3 border-y border-border/40 py-3 text-sm text-foreground">
    <Activity className="h-5 w-5 shrink-0 text-primary" />
    <span className="font-semibold">Today</span>
    <span className="text-muted-foreground">{today.sessions} {today.sessions === 1 ? "session" : "sessions"}</span>
    <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{today.minutes}m</span>
    <Link to={today.sessions ? "/progress" : "/workouts"} className="ml-auto flex items-center gap-1 font-medium text-primary">{today.sessions ? "Progress" : "Start"}<ArrowRight className="h-4 w-4" /></Link>
  </div>;
}
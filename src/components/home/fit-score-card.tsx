import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Dumbbell, Flame, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveHealth } from "@/hooks/use-live-health";

type Part = { label: string; value: number; detail: string };

/** FitScore: built only from recorded workouts, streak and logged water. Every part is explained. */
export function FitScoreCard() {
  const live = useLiveHealth();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  if (live.loading) {
    return <div className="h-48 rounded-3xl bg-muted/50 animate-pulse" aria-label="Loading FitScore" />;
  }

  if (!live.signedIn || live.totalWorkouts === 0) {
    return (
      <section className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-5 text-center">
        <Dumbbell className="h-8 w-8 mx-auto text-primary" aria-hidden />
        <h2 className="mt-2 font-semibold">No FitScore yet</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {live.signedIn ? "Finish your first workout and your score will appear here." : "Sign in and record a workout to get your score."}
        </p>
        <Button className="mt-4 rounded-xl" onClick={() => navigate(live.signedIn ? "/workouts" : "/auth")}>
          {live.signedIn ? "Start Workout" : "Sign in"}
        </Button>
      </section>
    );
  }

  const pct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const parts: Part[] = [
    { label: "Consistency", value: pct((live.weekSessions / Math.max(1, live.weeklyGoal)) * 100), detail: `${live.weekSessions} of ${live.weeklyGoal} weekly workouts` },
    { label: "Activity", value: pct((live.todayMinutes / 30) * 100), detail: `${live.todayMinutes} of 30 min today` },
    { label: "Streak", value: pct((Math.min(live.streakDays, 7) / 7) * 100), detail: `${live.streakDays} day streak (7 = full marks)` },
    { label: "Hydration", value: pct((live.waterMl / Math.max(1, live.waterGoalMl)) * 100), detail: `${live.waterMl} of ${live.waterGoalMl} ml logged` },
  ];
  const score = Math.round(parts.reduce((a, p) => a + p.value, 0) / parts.length);
  const circ = 2 * Math.PI * 42;

  return (
    <section aria-labelledby="fitscore-title" className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-5 shadow-sm">
      <div className="flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r="42" className="stroke-muted" strokeWidth="9" fill="none" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none" strokeWidth="9" strokeLinecap="round"
              className="stroke-primary"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: reduce ? circ * (1 - score / 100) : circ }}
              animate={{ strokeDashoffset: circ * (1 - score / 100) }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums">{score}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">FitScore</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="fitscore-title" className="font-semibold">Your Fitness Score</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
            <Flame className="h-4 w-4 text-secondary" aria-hidden /> {live.streakDays} day streak · best {live.bestStreak}
          </p>
          <ul className="mt-3 space-y-1.5">
            {parts.map((p) => (
              <li key={p.label} title={p.detail}>
                <div className="flex justify-between text-xs"><span>{p.label}</span><span className="tabular-nums text-muted-foreground">{p.value}</span></div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${p.value}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-muted/40 p-3">
        <h3 className="text-sm font-semibold">Your Week</h3>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div><dt className="text-[11px] text-muted-foreground">Workouts</dt><dd className="font-bold tabular-nums">{live.weekSessions}/{live.weeklyGoal}</dd></div>
          <div><dt className="text-[11px] text-muted-foreground">Streak</dt><dd className="font-bold tabular-nums">{live.streakDays}d</dd></div>
          <div><dt className="text-[11px] text-muted-foreground">Last 60 days</dt><dd className="font-bold tabular-nums">{live.totalWorkouts}</dd></div>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground flex gap-1">
          <Info className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden />
          {live.weekSessions >= live.weeklyGoal
            ? "Weekly goal reached. A lighter recovery session fits well today."
            : `${live.weeklyGoal - live.weekSessions} more workout${live.weeklyGoal - live.weekSessions === 1 ? "" : "s"} to hit this week's goal.`}
        </p>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Score = average of the four parts above, from your recorded workouts and logged water only.</p>
    </section>
  );
}

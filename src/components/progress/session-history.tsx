import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Flame, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useWorkoutHistory } from "@/hooks/use-workout-history";
import { rangeAnalytics, type ProgressRange } from "@/lib/progress-analytics";
import { getAllWorkouts } from "@/data/workouts";
import { useNavigate } from "react-router-dom";

export function SessionHistory({ range = 30 }: { range?: ProgressRange }) {
  const { sessions } = useWorkoutHistory();
  const navigate = useNavigate();
  const totals = useMemo(() => rangeAnalytics(sessions, range), [sessions, range]);
  const available = new Set(getAllWorkouts().map(w => w.id));
  const exportRange = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ rangeDays: range, ...totals }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `fitxfusion-progress-${range}-days.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-primary" />Recent Sessions</CardTitle>
          <Button size="sm" variant="ghost" onClick={exportRange} disabled={!totals.count}><Download className="mr-1 h-3 w-3" />Export</Button>
        </div>
        <CardDescription>Recorded workouts · last {range} days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[{ value: totals.count, label: "Sessions" }, { value: `${totals.minutes}m`, label: "Time" }, { value: totals.calories, label: "Est. calories" }].map(item => (
            <div key={item.label} className="rounded-lg bg-muted/30 p-2 text-center"><div className="text-lg font-bold">{item.value}</div><div className="text-[10px] text-muted-foreground uppercase">{item.label}</div></div>
          ))}
        </div>
        {!totals.count ? <p className="text-xs text-muted-foreground text-center py-4">No sessions in this range — complete a workout to see it here.</p> : (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {totals.sessions.map(s => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/10">
                <div className="min-w-0 flex-1"><p className="text-sm font-medium break-words">{s.workoutTitle}</p><p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(s.completedAt), { addSuffix: true })}</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{Math.round(s.durationSec / 60)}m</Badge>
                  {s.estimatedCalories != null && <Badge variant="outline"><Flame className="h-3 w-3 mr-1" />~{s.estimatedCalories}</Badge>}
                  {available.has(s.workoutId) && <Button size="icon" variant="ghost" aria-label={`Repeat ${s.workoutTitle}`} title="Repeat workout" onClick={() => navigate(`/workout-session/${s.workoutId}`)}><Play className="h-4 w-4" /></Button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
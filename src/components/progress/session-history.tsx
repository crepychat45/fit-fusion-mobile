import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { Activity, Clock, Flame, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface Session {
  id: string;
  completed_at: string;
  duration_minutes: number | null;
  calories_burned: number | null;
  notes: string | null;
}

export function SessionHistory() {
  const { user } = useEnhancedAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ count: 0, minutes: 0, calories: 0 });
  const [range, setRange] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("workout_sessions")
        .select("id, completed_at, duration_minutes, calories_burned, notes")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .gte("completed_at", new Date(Date.now() - range * 86400000).toISOString())
        .limit(1000);
      const rows = (data as Session[]) || [];
      setSessions(rows);
      setTotals(
        rows.reduce(
          (acc, s) => ({
            count: acc.count + 1,
            minutes: acc.minutes + (s.duration_minutes || 0),
            calories: acc.calories + (s.calories_burned || 0),
          }),
          { count: 0, minutes: 0, calories: 0 }
        )
      );
      setLoading(false);
    })();
  }, [user?.id, range]);

  const exportRange = () => {
    const blob = new Blob([JSON.stringify({ rangeDays: range, totals, sessions }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fitxfusion-progress-${range}-days.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />Recent Sessions
        </CardTitle>
         <CardDescription className="text-sm">Synced from your account</CardDescription>
         <div className="flex flex-wrap gap-1 pt-2">
           {[7, 30, 90].map((days) => <Button key={days} size="sm" variant={range === days ? "default" : "outline"} className="h-7 px-2 text-xs" onClick={() => setRange(days as 7 | 30 | 90)}>{days} days</Button>)}
           <Button size="sm" variant="ghost" className="ml-auto h-7 px-2 text-xs" onClick={exportRange} disabled={!sessions.length}><Download className="mr-1 h-3 w-3" />Export</Button>
         </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <div className="text-lg font-bold">{totals.count}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Sessions</div>
          </div>
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <div className="text-lg font-bold">{totals.minutes}m</div>
            <div className="text-[10px] text-muted-foreground uppercase">Time</div>
          </div>
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <div className="text-lg font-bold">{totals.calories}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Cal</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading…
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No sessions yet — complete a workout to see it here.
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/10">
                <div>
                  <p className="text-sm font-medium">
                    {formatDistanceToNow(new Date(s.completed_at), { addSuffix: true })}
                  </p>
                  {s.notes && <p className="text-[11px] text-muted-foreground line-clamp-1">{s.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {s.duration_minutes != null && (
                    <Badge variant="outline" className="text-[10px]">
                      <Clock className="h-3 w-3 mr-1" />{s.duration_minutes}m
                    </Badge>
                  )}
                  {s.calories_burned != null && (
                    <Badge variant="outline" className="text-[10px]">
                      <Flame className="h-3 w-3 mr-1" />{s.calories_burned}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

const WEEKS = 18;
const DAYS = 7;

/**
 * Deterministic pseudo-random based on day index so the heatmap is stable
 * per session without depending on backend data.
 */
const intensityFor = (day: number): number => {
  const x = Math.sin(day * 9301 + 49297) * 233280;
  const v = x - Math.floor(x);
  // weight toward more recent activity
  const recencyBoost = day > WEEKS * DAYS - 30 ? 0.25 : 0;
  return Math.min(1, v + recencyBoost);
};

const cellColor = (v: number) => {
  if (v < 0.15) return "bg-muted/30";
  if (v < 0.35) return "bg-primary/20";
  if (v < 0.6) return "bg-primary/45";
  if (v < 0.85) return "bg-primary/70";
  return "bg-primary";
};

export const ActivityHeatmap: React.FC = () => {
  const grid = useMemo(
    () => Array.from({ length: WEEKS }, (_, w) => Array.from({ length: DAYS }, (_, d) => intensityFor(w * DAYS + d))),
    [],
  );

  const total = useMemo(() => grid.flat().filter((v) => v > 0.35).length, [grid]);
  const bestStreak = useMemo(() => {
    let best = 0;
    let cur = 0;
    grid.flat().forEach((v) => {
      if (v > 0.35) {
        cur += 1;
        best = Math.max(best, cur);
      } else cur = 0;
    });
    return best;
  }, [grid]);

  return (
    <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-primary" />
          Activity Heatmap
        </CardTitle>
        <CardDescription className="text-sm">Last {WEEKS} weeks of training</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((v, di) => (
                <motion.div
                  key={`${wi}-${di}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (wi * DAYS + di) * 0.004, duration: 0.2 }}
                  className={`w-3 h-3 rounded-sm ${cellColor(v)}`}
                  title={`Intensity ${(v * 100).toFixed(0)}%`}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{total}</span> active days
          </span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-muted/30" />
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/20" />
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/45" />
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/70" />
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <span>More</span>
          </div>
          <span>
            Best streak <span className="font-semibold text-foreground">{bestStreak}d</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;

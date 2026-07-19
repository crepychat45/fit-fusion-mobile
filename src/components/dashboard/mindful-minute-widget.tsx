import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Phase = "inhale" | "hold" | "exhale" | "rest";

const PATTERN: { phase: Phase; label: string; secs: number }[] = [
  { phase: "inhale", label: "Breathe in", secs: 4 },
  { phase: "hold", label: "Hold", secs: 4 },
  { phase: "exhale", label: "Breathe out", secs: 6 },
  { phase: "rest", label: "Rest", secs: 2 },
];

const TOTAL_CYCLES = 4;
const STORAGE_KEY = "fitfusion:mindful-sessions";

export function MindfulMinuteWidget() {
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [remaining, setRemaining] = useState(PATTERN[0].secs);
  const [cycle, setCycle] = useState(1);
  const [sessions, setSessions] = useState<number>(() => {
    try { return Number(localStorage.getItem(STORAGE_KEY) || 0); } catch { return 0; }
  });
  const timer = useRef<number | null>(null);

  const current = PATTERN[stepIdx];

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        // advance
        setStepIdx((i) => {
          const next = (i + 1) % PATTERN.length;
          if (next === 0) {
            setCycle((c) => {
              const nc = c + 1;
              if (nc > TOTAL_CYCLES) {
                // Session complete
                setRunning(false);
                setSessions((s) => {
                  const v = s + 1;
                  try { localStorage.setItem(STORAGE_KEY, String(v)); } catch {}
                  return v;
                });
                return 1;
              }
              return nc;
            });
          }
          return next;
        });
        return PATTERN[(stepIdx + 1) % PATTERN.length].secs;
      });
    }, 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [running, stepIdx]);

  const reset = () => {
    setRunning(false);
    setStepIdx(0);
    setRemaining(PATTERN[0].secs);
    setCycle(1);
  };

  const scale =
    current.phase === "inhale" ? 1.15 :
    current.phase === "exhale" ? 0.85 :
    current.phase === "hold" ? 1.15 : 0.85;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border/20 bg-card/40 backdrop-blur-xl p-5 shadow-lg">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wind className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Mindful Minute</h3>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">4-4-6 Breath</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Guided breathing to lower stress & focus</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-foreground leading-none">{sessions}</div>
          <div className="text-[10px] text-muted-foreground">sessions</div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3 py-2">
        <motion.div
          animate={{ scale }}
          transition={{ duration: current.secs, ease: "easeInOut" }}
          className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 backdrop-blur-md border border-primary/30 flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.25)]"
        >
          <div className="absolute inset-2 rounded-full border border-white/20" />
          <AnimatePresence mode="wait">
            <motion.div
              key={current.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-center"
            >
              <div className="text-sm font-medium text-foreground">{current.label}</div>
              <div className="text-2xl font-bold text-foreground tabular-nums">{remaining}</div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="text-[11px] text-muted-foreground">
          Cycle <span className="text-foreground font-semibold">{cycle}</span> / {TOTAL_CYCLES}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setRunning((r) => !r)}
            className="rounded-full px-4"
          >
            {running ? <Pause className="h-4 w-4 mr-1.5" /> : <Play className="h-4 w-4 mr-1.5" />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="rounded-full">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MindfulMinuteWidget;

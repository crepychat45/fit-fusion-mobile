import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoPlayer } from "./video-player";
import { Play, Pause, SkipForward, SkipBack, CheckCircle, Clock, Flame, Trophy, X } from "lucide-react";
import { readJson, writeJson } from "@/lib/safe-storage";

interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  instructions?: string;
  caloriesBurned?: number;
}

export interface PlayerResult {
  sessionId: string;
  startedAt: string;
  durationSec: number;
  exercisesCompleted: string[];
  estimatedCalories: number;
}

interface EnhancedWorkoutPlayerProps {
  exercises: Exercise[];
  workoutName: string;
  workoutId?: string;
  totalDuration?: number;
  onComplete?: (result: PlayerResult) => void;
  onExit?: () => void;
}

interface Draft {
  sessionId: string;
  startedAt: string;
  index: number;
  completed: string[];
  accumulatedSec: number;
}

const draftKey = (id: string) => `fitfusion-active-session-${id}`;
const newId = () => (crypto?.randomUUID ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export function EnhancedWorkoutPlayer({ exercises, workoutName, workoutId = workoutName, onComplete, onExit }: EnhancedWorkoutPlayerProps) {
  const saved = readJson<Draft | null>(draftKey(workoutId), null);
  const initial: Draft = saved && typeof saved.sessionId === "string"
    ? { ...saved, index: Math.min(Math.max(0, saved.index | 0), Math.max(0, exercises.length - 1)), completed: Array.isArray(saved.completed) ? saved.completed : [] }
    : { sessionId: newId(), startedAt: new Date().toISOString(), index: 0, completed: [], accumulatedSec: 0 };

  const [index, setIndex] = useState(initial.index);
  const [completed, setCompleted] = useState<string[]>(initial.completed);
  const [isPlaying, setIsPlaying] = useState(false);
  const [accumulated, setAccumulated] = useState(initial.accumulatedSec);
  const [runStart, setRunStart] = useState<number | null>(null);
  const [, tick] = useState(0);
  const finishedRef = useRef(false);
  const meta = useRef({ sessionId: initial.sessionId, startedAt: initial.startedAt });

  // Wall-clock timer: accurate across background tabs/sleep.
  const elapsed = accumulated + (runStart ? Math.floor((Date.now() - runStart) / 1000) : 0);
  useEffect(() => {
    if (!runStart) return;
    const t = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [runStart]);

  const setPlaying = (play: boolean) => {
    if (play && !runStart) setRunStart(Date.now());
    if (!play && runStart) { setAccumulated((a) => a + Math.floor((Date.now() - runStart) / 1000)); setRunStart(null); }
    setIsPlaying(play);
  };

  // Persist progress so a refresh/interruption can resume.
  useEffect(() => {
    if (finishedRef.current) return;
    writeJson(draftKey(workoutId), { ...meta.current, index, completed, accumulatedSec: elapsed } satisfies Draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, completed, isPlaying, workoutId, elapsed]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (!finishedRef.current && completed.length) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [completed.length]);

  const calories = exercises.filter((e) => completed.includes(e.id)).reduce((a, e) => a + (e.caloriesBurned ?? 0), 0);

  const finish = useCallback((done: string[]) => {
    if (finishedRef.current) return; // prevent double submission
    finishedRef.current = true;
    try { localStorage.removeItem(draftKey(workoutId)); } catch { /* noop */ }
    onComplete?.({
      sessionId: meta.current.sessionId,
      startedAt: meta.current.startedAt,
      durationSec: elapsed,
      exercisesCompleted: done,
      estimatedCalories: exercises.filter((e) => done.includes(e.id)).reduce((a, e) => a + (e.caloriesBurned ?? 0), 0),
    });
  }, [elapsed, exercises, onComplete, workoutId]);

  if (!exercises.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold">This workout has no exercises</h2>
          <Button className="mt-4" onClick={onExit}>Back to workouts</Button>
        </div>
      </div>
    );
  }

  const current = exercises[index];
  const progress = (completed.length / exercises.length) * 100;
  const isLast = index === exercises.length - 1;

  const markComplete = () => {
    const next = completed.includes(current.id) ? completed : [...completed, current.id];
    setCompleted(next);
    return next;
  };
  const handleNext = () => {
    const next = markComplete();
    if (isLast) finish(next);
    else setIndex((i) => i + 1);
  };
  const handleSkip = () => { if (isLast) finish(completed); else setIndex((i) => i + 1); };
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const exit = () => {
    setPlaying(false);
    onExit?.();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary p-4 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{workoutName}</h1>
            <p className="opacity-80 text-sm">Exercise {index + 1} of {exercises.length}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={exit} aria-label="Exit workout" className="text-primary-foreground hover:bg-primary-foreground/20">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <Progress value={progress} className="h-2 bg-primary-foreground/20" aria-label={`${completed.length} of ${exercises.length} exercises done`} />
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{fmt(elapsed)}{!isPlaying && " (paused)"}</span>
          <span className="flex items-center gap-2"><Flame className="h-4 w-4" />~{calories} kcal est.</span>
          <span className="flex items-center gap-2"><Trophy className="h-4 w-4" />{completed.length} done</span>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-28">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{current.name}</CardTitle>
              {completed.includes(current.id) && <Badge><CheckCircle className="h-4 w-4 mr-1" />Complete</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {current.videoUrl && <VideoPlayer videoUrl={current.videoUrl} thumbnailUrl={current.thumbnailUrl} title={current.name} autoPlay={isPlaying} />}
            <div className="grid grid-cols-3 gap-4">
              {!!current.sets && <Stat v={current.sets} l="Sets" />}
              {!!current.reps && <Stat v={current.reps} l="Reps" />}
              {!!current.duration && <Stat v={`${current.duration}s`} l="Duration" />}
            </div>
            {(current.instructions || current.description) && <p className="text-muted-foreground">{current.instructions || current.description}</p>}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="icon" aria-label="Previous exercise" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}><SkipBack className="h-5 w-5" /></Button>
              <Button size="lg" aria-label={isPlaying ? "Pause" : "Start"} onClick={() => setPlaying(!isPlaying)} className="h-14 w-14 rounded-full">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button variant="outline" size="icon" aria-label="Skip exercise" onClick={handleSkip}><SkipForward className="h-5 w-5" /></Button>
            </div>
            <Button onClick={handleNext} className="w-full">
              {isLast ? "Complete & finish workout" : "Done — next exercise"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Exercise list</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {exercises.map((ex, i) => (
                  <button key={ex.id} type="button" onClick={() => setIndex(i)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${i === index ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{i + 1}. {ex.name}</div>
                        <div className="text-xs opacity-80">{ex.sets ? `${ex.sets} sets` : ""}{ex.reps ? ` × ${ex.reps} reps` : ""}{ex.duration ? ` ${ex.duration}s` : ""}</div>
                      </div>
                      {completed.includes(ex.id) && <CheckCircle className="h-5 w-5 text-accent" />}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ v, l }: { v: React.ReactNode; l: string }) {
  return (
    <div className="text-center p-3 bg-muted rounded-lg">
      <div className="text-2xl font-bold text-primary">{v}</div>
      <div className="text-sm text-muted-foreground">{l}</div>
    </div>
  );
}

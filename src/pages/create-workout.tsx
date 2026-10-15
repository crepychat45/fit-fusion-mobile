import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ChevronLeft, Plus, Trash2, ArrowUp, ArrowDown, Save, Dumbbell, Play } from "lucide-react";
import { getAllWorkouts, type Exercise, type Workout } from "@/data/workouts";
import { saveCustomWorkout } from "@/lib/custom-workouts";
import { WORKOUT_TEMPLATES, type WorkoutTemplate } from "@/lib/workout-templates";

interface DraftExercise extends Exercise {
  key: string;
}

/** Pool of known exercises from the built-in library for quick adding. */
function useExercisePool() {
  return useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const w of getAllWorkouts()) {
      for (const e of w.exercises) {
        if (!map.has(e.name)) map.set(e.name, e);
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, []);
}

let keyCounter = 0;
const nextKey = () => `ex-${Date.now()}-${keyCounter++}`;

export default function CreateWorkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const pool = useExercisePool();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Workout["category"]>("strength");
  const [level, setLevel] = useState<Workout["level"]>("beginner");
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [poolPick, setPoolPick] = useState("");

  const estimatedMinutes = useMemo(() => {
    // ~45s per set (work + rest) plus 30s per timed exercise minute
    const secs = exercises.reduce((a, e) => a + e.sets * (e.duration ? e.duration + 20 : 45), 0);
    return Math.max(1, Math.round(secs / 60));
  }, [exercises]);

  const applyTemplate = (tpl: WorkoutTemplate) => {
    setTitle(tpl.name);
    setDescription(tpl.description);
    setCategory(tpl.category);
    setLevel(tpl.level);
    setExercises(tpl.exercises.map((e) => ({ ...e, key: nextKey() })));
    toast({ title: "Template loaded", description: `"${tpl.name}" is ready to edit below.` });
  };

  const addFromPool = () => {
    const e = pool.find((p) => p.name === poolPick);
    if (!e) return;
    setExercises((xs) => [...xs, { ...e, key: nextKey() }]);
    setPoolPick("");
  };

  const addCustom = () => {
    setExercises((xs) => [
      ...xs,
      { key: nextKey(), id: nextKey(), name: "", sets: 3, reps: 10, instructions: "", muscles: [] },
    ]);
  };

  const update = (key: string, patch: Partial<DraftExercise>) =>
    setExercises((xs) => xs.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  const move = (i: number, dir: -1 | 1) =>
    setExercises((xs) => {
      const j = i + dir;
      if (j < 0 || j >= xs.length) return xs;
      const next = [...xs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const remove = (key: string) => setExercises((xs) => xs.filter((x) => x.key !== key));

  const save = (startAfter: boolean) => {
    if (!title.trim()) {
      toast({ title: "Name required", description: "Give your workout a title first.", variant: "destructive" });
      return;
    }
    const valid = exercises.filter((e) => e.name.trim());
    if (valid.length === 0) {
      toast({ title: "No exercises", description: "Add at least one exercise before saving.", variant: "destructive" });
      return;
    }
    const workout: Workout = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || "Custom workout",
      category,
      level,
      duration: estimatedMinutes,
      popularity: 0,
      createdAt: Date.now(),
      tags: ["custom"],
      exercises: valid.map(({ key: _k, ...e }, i) => ({ ...e, id: e.id || `ce-${i}` })),
    };
    if (!saveCustomWorkout(workout)) {
      toast({ title: "Save failed", description: "Could not store the workout on this device.", variant: "destructive" });
      return;
    }
    toast({ title: "💾 Workout saved", description: `"${workout.title}" is now in your library.` });
    navigate(startAfter ? `/workout-session/${workout.id}` : "/workouts");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent-foreground" />
        <div className="relative pt-12 pb-6 px-4 text-primary-foreground">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} aria-label="Go back" className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2"><Dumbbell className="h-5 w-5" />Create Workout</h1>
              <p className="text-xs opacity-80">Build your own routine, exercise by exercise</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto">
        <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Start from a template</CardTitle>
            <CardDescription className="text-xs">Loads a ready-made routine you can edit before saving.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WORKOUT_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => applyTemplate(tpl)}
                className="rounded-xl border border-border/30 p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <p className="text-sm font-semibold">{tpl.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{tpl.description}</p>
                <div className="mt-1.5 flex gap-1">
                  <Badge variant="secondary" className="text-[10px] capitalize">{tpl.category}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{tpl.level}</Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Workout title (e.g. Morning Burn)" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} />
            <Textarea placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={category} onValueChange={(v) => setCategory(v as Workout["category"])}>
                <SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                </SelectContent>
              </Select>
              <Select value={level} onValueChange={(v) => setLevel(v as Workout["level"])}>
                <SelectTrigger aria-label="Level"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Exercises</CardTitle>
                <CardDescription className="text-xs">{exercises.length} added · ~{estimatedMinutes} min estimated</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">{exercises.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Select value={poolPick} onValueChange={setPoolPick}>
                <SelectTrigger aria-label="Pick an exercise" className="flex-1"><SelectValue placeholder="Add from exercise library…" /></SelectTrigger>
                <SelectContent>
                  {pool.map((e) => (
                    <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addFromPool} disabled={!poolPick} size="sm" className="rounded-xl"><Plus className="h-4 w-4" /></Button>
            </div>
            <Button onClick={addCustom} variant="outline" size="sm" className="w-full rounded-xl border-border/30">
              <Plus className="h-4 w-4 mr-1" />Add custom exercise
            </Button>

            {exercises.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No exercises yet — add from the library or create your own.</p>
            )}

            {exercises.map((e, i) => (
              <motion.div key={e.key} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-muted/20 border border-border/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Exercise name"
                    value={e.name}
                    onChange={(ev) => update(e.key, { name: ev.target.value })}
                    className="h-8 text-sm"
                    maxLength={50}
                  />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => move(i, 1)} disabled={i === exercises.length - 1} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => remove(e.key)} aria-label="Remove exercise"><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-[10px] text-muted-foreground">
                    Sets
                    <Input type="number" min={1} max={20} value={e.sets} onChange={(ev) => update(e.key, { sets: Math.max(1, Math.min(20, Number(ev.target.value) || 1)) })} className="h-8 text-sm mt-0.5" />
                  </label>
                  <label className="text-[10px] text-muted-foreground">
                    Reps
                    <Input type="number" min={1} max={200} value={e.reps} onChange={(ev) => update(e.key, { reps: Math.max(1, Math.min(200, Number(ev.target.value) || 1)) })} className="h-8 text-sm mt-0.5" />
                  </label>
                  <label className="text-[10px] text-muted-foreground">
                    Secs (timed)
                    <Input type="number" min={0} max={600} value={e.duration ?? 0} onChange={(ev) => update(e.key, { duration: Math.max(0, Math.min(600, Number(ev.target.value) || 0)) || undefined })} className="h-8 text-sm mt-0.5" />
                  </label>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => save(false)} variant="outline" className="flex-1 rounded-xl h-11 border-border/30">
            <Save className="h-4 w-4 mr-2" />Save
          </Button>
          <Button onClick={() => save(true)} className="flex-1 rounded-xl h-11">
            <Play className="h-4 w-4 mr-2" />Save & Start
          </Button>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}

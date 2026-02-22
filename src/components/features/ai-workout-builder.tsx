import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, Dumbbell, Clock, Flame, Target, Zap, ChevronRight, Loader2, RotateCcw,
} from "lucide-react";

interface GeneratedExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  instructions: string;
  muscle_groups: string[];
}

interface GeneratedWorkout {
  name: string;
  description: string;
  duration_minutes: number;
  difficulty: string;
  warmup: { name: string; duration: string; instructions: string }[];
  exercises: GeneratedExercise[];
  cooldown: { name: string; duration: string; instructions: string }[];
  tips: string[];
  estimated_calories: number;
}

export function AIWorkoutBuilder() {
  const { toast } = useToast();
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("30");
  const [equipment, setEquipment] = useState("none");
  const [level, setLevel] = useState("intermediate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);

  const quickGoals = [
    "Build muscle with no equipment",
    "Burn fat in 20 minutes",
    "Full body strength training",
    "Core and abs workout",
    "Upper body hypertrophy",
    "HIIT cardio blast",
  ];

  const handleGenerate = async () => {
    if (!goal.trim()) {
      toast({ title: "Enter a goal", description: "Tell the AI what you want to achieve.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setWorkout(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-workout-builder", {
        body: { goal, duration, equipment, level },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setWorkout(data.workout);
      toast({ title: "🏋️ Workout Generated!", description: data.workout.name });
    } catch (err: any) {
      toast({ title: "Generation Failed", description: err.message || "Try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Builder Form */}
      <Card className="overflow-hidden border-2 border-primary/20">
        <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Workout Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">What's your goal?</label>
            <Input
              placeholder='e.g. "Build muscle in 30 mins with no equipment"'
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {quickGoals.map((g) => (
                <Badge key={g} variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setGoal(g)}>
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Equipment</label>
              <Select value={equipment} onValueChange={setEquipment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Equipment</SelectItem>
                  <SelectItem value="dumbbells">Dumbbells</SelectItem>
                  <SelectItem value="barbell">Barbell</SelectItem>
                  <SelectItem value="full-gym">Full Gym</SelectItem>
                  <SelectItem value="resistance-bands">Bands</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Level</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700" size="lg">
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating with AI...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Generate Workout</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Workout */}
      <AnimatePresence>
        {workout && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-2 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    {workout.name}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => { setWorkout(null); setGoal(""); }}>
                    <RotateCcw className="h-4 w-4 mr-1" />New
                  </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{workout.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge><Clock className="h-3 w-3 mr-1" />{workout.duration_minutes} min</Badge>
                  <Badge variant="outline"><Flame className="h-3 w-3 mr-1" />~{workout.estimated_calories} cal</Badge>
                  <Badge variant="secondary"><Target className="h-3 w-3 mr-1" />{workout.difficulty}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-6">
                    {/* Warmup */}
                    {workout.warmup?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-orange-600 mb-2 flex items-center gap-1"><Zap className="h-4 w-4" />Warm-Up</h4>
                        {workout.warmup.map((w, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded mb-1">
                            <ChevronRight className="h-3 w-3 text-orange-500" />
                            <span className="text-sm font-medium">{w.name}</span>
                            <Badge variant="outline" className="text-xs ml-auto">{w.duration}</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Main Exercises */}
                    <div>
                      <h4 className="font-semibold text-sm text-primary mb-2 flex items-center gap-1"><Dumbbell className="h-4 w-4" />Exercises</h4>
                      {workout.exercises?.map((ex, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="p-3 border rounded-lg mb-2 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{ex.name}</span>
                            <span className="text-sm text-muted-foreground">{ex.sets} × {ex.reps}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{ex.instructions}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {ex.muscle_groups?.map((mg) => (
                              <Badge key={mg} variant="outline" className="text-xs">{mg}</Badge>
                            ))}
                            <Badge variant="secondary" className="text-xs">Rest: {ex.rest}</Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Cooldown */}
                    {workout.cooldown?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-blue-600 mb-2">Cool-Down</h4>
                        {workout.cooldown.map((c, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded mb-1">
                            <ChevronRight className="h-3 w-3 text-blue-500" />
                            <span className="text-sm">{c.name}</span>
                            <Badge variant="outline" className="text-xs ml-auto">{c.duration}</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tips */}
                    {workout.tips?.length > 0 && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">💡 Pro Tips</h4>
                        <ul className="space-y-1">
                          {workout.tips.map((tip, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                              <span className="text-primary mt-0.5">•</span>{tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

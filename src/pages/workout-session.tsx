import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EnhancedWorkoutPlayer, type PlayerResult } from "@/components/workout/enhanced-workout-player";
import { getAllWorkouts } from "@/data/workouts";
import { useToast } from "@/hooks/use-toast";
import { addSession } from "@/lib/workout-history";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function WorkoutSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirmExit, setConfirmExit] = useState(false);
  const [summary, setSummary] = useState<PlayerResult | null>(null);

  const workout = getAllWorkouts().find((w) => w.id === id);

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Workout not found</h2>
          <Button onClick={() => navigate("/workouts")}>Back to workouts</Button>
        </div>
      </div>
    );
  }

  const handleComplete = async (r: PlayerResult) => {
    const { data } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const userId = data?.user?.id ?? null;
    const ok = addSession({
      id: r.sessionId,
      workoutId: workout.id,
      workoutTitle: workout.title,
      userId,
      startedAt: r.startedAt,
      completedAt: new Date().toISOString(),
      durationSec: r.durationSec,
      exercisesCompleted: r.exercisesCompleted,
      totalExercises: workout.exercises.length,
      estimatedCalories: r.estimatedCalories || undefined,
      status: "completed",
    });
    if (userId) {
      const { error } = await supabase.from("workout_sessions").insert({
        user_id: userId,
        completed_at: new Date().toISOString(),
        duration_minutes: Math.max(1, Math.round(r.durationSec / 60)),
        calories_burned: r.estimatedCalories || null,
        notes: workout.title,
      });
      if (error) toast({ title: "Saved on this device", description: "Couldn't sync to your account yet. It's safe here." });
    }
    if (!ok) toast({ title: "Could not save workout", description: "Device storage is full or blocked.", variant: "destructive" });
    setSummary(r);
  };

  if (summary) {
    const mins = Math.floor(summary.durationSec / 60);
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border bg-card p-6 text-center space-y-3">
          <h1 className="text-2xl font-bold">Workout complete</h1>
          <p className="text-muted-foreground">{workout.title}</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><div className="text-xl font-bold">{mins}m {summary.durationSec % 60}s</div>Time</div>
            <div><div className="text-xl font-bold">{summary.exercisesCompleted.length}/{workout.exercises.length}</div>Exercises</div>
            <div><div className="text-xl font-bold">~{summary.estimatedCalories}</div>kcal est.</div>
          </div>
          <Button className="w-full" onClick={() => navigate("/progress")}>See progress</Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/workouts")}>Back to workouts</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <EnhancedWorkoutPlayer
        exercises={workout.exercises}
        workoutName={workout.title}
        workoutId={workout.id}
        totalDuration={workout.duration}
        onComplete={handleComplete}
        onExit={() => setConfirmExit(true)}
      />
      <AlertDialog open={confirmExit} onOpenChange={setConfirmExit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this workout?</AlertDialogTitle>
            <AlertDialogDescription>Your progress is kept on this device so you can resume later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/workouts")}>Save & exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Play,
  Pause,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  X,
  Timer,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RestTimer } from "./rest-timer";
import { ExerciseInstructionModal } from "./exercise-instruction-modal";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  instructions: string;
  muscles: string[];
}

interface ActiveWorkoutSessionProps {
  workoutId: string;
  workoutTitle: string;
  exercises: Exercise[];
  onComplete: () => void;
  onExit: () => void;
}

export function ActiveWorkoutSession({
  workoutId,
  workoutTitle,
  exercises,
  onComplete,
  onExit,
}: ActiveWorkoutSessionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const progress = ((currentExerciseIndex + 1) / totalExercises) * 100;

  // Initialize completed sets tracking
  useEffect(() => {
    const initial: Record<string, boolean[]> = {};
    exercises.forEach((ex) => {
      initial[ex.id] = Array(ex.sets).fill(false);
    });
    setCompletedSets(initial);
  }, [exercises]);

  // Timer for workout duration
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSetComplete = (setIndex: number) => {
    setCompletedSets((prev) => ({
      ...prev,
      [currentExercise.id]: prev[currentExercise.id].map((completed, i) =>
        i === setIndex ? !completed : completed
      ),
    }));

    // Show rest timer after completing a set
    if (!completedSets[currentExercise.id][setIndex]) {
      setShowRestTimer(true);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setShowRestTimer(false);
    } else {
      onComplete();
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      setShowRestTimer(false);
    }
  };

  const allSetsCompleted = completedSets[currentExercise?.id]?.every((s) => s);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onExit}>
                <X className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{workoutTitle}</h1>
                <p className="text-sm text-muted-foreground">
                  Exercise {currentExerciseIndex + 1} of {totalExercises}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Current Exercise */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{currentExercise.name}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {currentExercise.muscles.map((muscle) => (
                    <Badge key={muscle} variant="secondary">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowInstructions(true)}
              >
                View Instructions
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exercise Info */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-3xl font-bold">{currentExercise.sets}</p>
                <p className="text-sm text-muted-foreground">Sets</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-3xl font-bold">
                  {currentExercise.duration ? `${currentExercise.duration}s` : currentExercise.reps}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentExercise.duration ? "Duration" : "Reps"}
                </p>
              </div>
            </div>

            {/* Sets Checklist */}
            <div className="space-y-3">
              <h3 className="font-semibold">Track Your Sets</h3>
              {Array.from({ length: currentExercise.sets }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                    completedSets[currentExercise.id]?.[index]
                      ? "border-green-500 bg-green-500/10"
                      : "border-border bg-card"
                  )}
                >
                  <Checkbox
                    checked={completedSets[currentExercise.id]?.[index] || false}
                    onCheckedChange={() => handleSetComplete(index)}
                    id={`set-${index}`}
                  />
                  <label
                    htmlFor={`set-${index}`}
                    className="flex-1 cursor-pointer font-medium"
                  >
                    Set {index + 1}
                  </label>
                  {completedSets[currentExercise.id]?.[index] && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNextExercise}
            disabled={!allSetsCompleted}
            className="flex-1"
          >
            {currentExerciseIndex === exercises.length - 1 ? "Complete Workout" : "Next Exercise"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="ghost"
            onClick={handleNextExercise}
            className="px-4"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Next Exercise Preview */}
        {currentExerciseIndex < exercises.length - 1 && (
          <Card className="mt-6 bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Next Exercise</p>
              <p className="font-semibold">{exercises[currentExerciseIndex + 1].name}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rest Timer Modal */}
      {showRestTimer && (
        <RestTimer
          duration={60}
          onComplete={() => setShowRestTimer(false)}
          onSkip={() => setShowRestTimer(false)}
        />
      )}

      {/* Exercise Instructions Modal */}
      {showInstructions && currentExercise && (
        <ExerciseInstructionModal
          exercise={currentExercise}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </div>
  );
}

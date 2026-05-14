import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoPlayer } from "./video-player";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle,
  Clock,
  Flame,
  Heart,
  Trophy,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  caloriesBurned?: number;
}

interface EnhancedWorkoutPlayerProps {
  exercises: Exercise[];
  workoutName: string;
  totalDuration?: number;
  onComplete?: () => void;
  onExit?: () => void;
}

export function EnhancedWorkoutPlayer({
  exercises,
  workoutName,
  totalDuration = 45,
  onComplete,
  onExit,
}: EnhancedWorkoutPlayerProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const { toast } = useToast();

  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      markExerciseComplete();
      setCurrentExerciseIndex((prev) => prev + 1);
      setIsPlaying(false);
    } else {
      handleWorkoutComplete();
    }
  };

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      setIsPlaying(false);
    }
  };

  const markExerciseComplete = () => {
    const exerciseId = currentExercise.id;
    if (!completedExercises.includes(exerciseId)) {
      setCompletedExercises((prev) => [...prev, exerciseId]);
      if (currentExercise.caloriesBurned) {
        setTotalCalories((prev) => prev + currentExercise.caloriesBurned!);
      }
      toast({
        title: "Exercise Complete! 🎯",
        description: `Great job on ${currentExercise.name}!`,
      });
    }
  };

  const handleWorkoutComplete = () => {
    toast({
      title: "Workout Complete! 🎉",
      description: `Amazing work! You burned ${totalCalories} calories.`,
    });
    onComplete?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fitness-gradient p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{workoutName}</h1>
            <p className="text-white/80 text-sm">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Progress value={progress} className="h-2 bg-white/20" />

        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            <span>{totalCalories} cal</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>{completedExercises.length} completed</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Current Exercise */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{currentExercise.name}</CardTitle>
              {completedExercises.includes(currentExercise.id) && (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Player */}
            {currentExercise.videoUrl && (
              <VideoPlayer
                videoUrl={currentExercise.videoUrl}
                thumbnailUrl={currentExercise.thumbnailUrl}
                title={currentExercise.name}
                autoPlay={isPlaying}
              />
            )}

            {/* Exercise Details */}
            <div className="grid grid-cols-3 gap-4">
              {currentExercise.sets && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {currentExercise.sets}
                  </div>
                  <div className="text-sm text-muted-foreground">Sets</div>
                </div>
              )}
              {currentExercise.reps && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {currentExercise.reps}
                  </div>
                  <div className="text-sm text-muted-foreground">Reps</div>
                </div>
              )}
              {currentExercise.duration && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {currentExercise.duration}s
                  </div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
              )}
            </div>

            {/* Description */}
            {currentExercise.description && (
              <p className="text-muted-foreground">{currentExercise.description}</p>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                disabled={currentExerciseIndex === 0}
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-14 w-14 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <Button
              onClick={markExerciseComplete}
              className="w-full"
              disabled={completedExercises.includes(currentExercise.id)}
            >
              {completedExercises.includes(currentExercise.id)
                ? "Exercise Complete"
                : "Mark as Complete"}
            </Button>
          </CardContent>
        </Card>

        {/* Exercise List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exercise List</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {exercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setCurrentExerciseIndex(index);
                      setIsPlaying(false);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      index === currentExerciseIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">
                          {index + 1}.
                        </div>
                        <div>
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-xs opacity-80">
                            {exercise.sets && `${exercise.sets} sets`}
                            {exercise.reps && ` × ${exercise.reps} reps`}
                            {exercise.duration && ` ${exercise.duration}s`}
                          </div>
                        </div>
                      </div>
                      {completedExercises.includes(exercise.id) && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

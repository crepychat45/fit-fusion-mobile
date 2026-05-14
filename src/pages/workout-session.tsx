import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EnhancedWorkoutPlayer } from "@/components/workout/enhanced-workout-player";
import { workouts } from "@/data/workouts";
import { useToast } from "@/hooks/use-toast";

export default function WorkoutSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const workout = workouts.find((w) => w.id === id);

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Workout Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The workout you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/workouts")}
            className="text-primary hover:underline"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    // Save workout completion to localStorage
    const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
    completedWorkouts.push({
      id: workout.id,
      title: workout.title,
      completedAt: new Date().toISOString(),
    });
    localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));

    toast({
      title: "Workout Complete! 🎉",
      description: `Great job completing ${workout.title}! Keep up the amazing work.`,
    });
    navigate("/progress");
  };

  const handleExit = () => {
    if (confirm("Are you sure you want to exit? Your progress won't be saved.")) {
      navigate("/workouts");
    }
  };

  return (
    <EnhancedWorkoutPlayer
      exercises={workout.exercises}
      workoutName={workout.title}
      totalDuration={workout.duration}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}

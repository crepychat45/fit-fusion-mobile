import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ActiveWorkoutSession } from "@/components/workout/active-workout-session";
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
    <ActiveWorkoutSession
      workoutId={workout.id}
      workoutTitle={workout.title}
      exercises={workout.exercises}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}

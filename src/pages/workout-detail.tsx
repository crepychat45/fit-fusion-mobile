
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/exercise-card";
import { ArrowLeft, Dumbbell, Clock, ChevronRight, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { workouts } from "@/data/workouts";

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const workout = workouts.find((w) => w.id === id);
  
  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Workout not found</p>
          <Button onClick={() => navigate("/workouts")}>
            Go back to workouts
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="relative h-48 fitness-gradient">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 left-4 z-10 bg-white/20 text-white hover:bg-white/30 hover:text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <Dumbbell className="h-16 w-16 text-white" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent h-24" />
      </div>
      
      {/* Workout Details */}
      <div className="px-4 -mt-12 relative z-10">
        <Badge className="mb-2">{workout.category}</Badge>
        <h1 className="text-2xl font-bold">{workout.title}</h1>
        
        <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{workout.duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4" />
            <span>{workout.exercises.length} exercises</span>
          </div>
        </div>
        
        <p className="mt-4 text-sm text-muted-foreground">
          {workout.description}
        </p>
        
        <Button className="w-full mt-6" size="lg">
          <Play className="h-4 w-4 mr-2" />
          Start Workout
        </Button>
      </div>
      
      {/* Exercises */}
      <div className="px-4 mt-8">
        <h2 className="font-medium mb-3">Exercises</h2>
        
        <div className="space-y-3">
          {workout.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              name={exercise.name}
              sets={exercise.sets}
              reps={exercise.reps}
              duration={exercise.duration}
              description={exercise.muscles.join(", ")}
              onSelect={() => navigate(`/exercise/${workout.id}/${exercise.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetail;

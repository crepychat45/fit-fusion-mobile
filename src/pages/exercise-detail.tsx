import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { workouts } from "@/data/workouts";
import { workoutVideos } from "@/data/workout-videos";
import { WorkoutVideo } from "@/components/workout-video";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

const ExerciseDetail = () => {
  const { workoutId, exerciseId } = useParams<{
    workoutId: string;
    exerciseId: string;
  }>();
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  const workout = workouts.find((w) => w.id === workoutId);
  const exercise = workout?.exercises.find((e) => e.id === exerciseId);
  const exerciseVideo = workoutVideos.find((v) => v.exerciseId === exerciseId);

  useEffect(() => {
    // Check if we have a workout and exercise
    if (!workout || !exercise) {
      toast({
        title: "Exercise not found",
        description: "We couldn't find the exercise you're looking for.",
        variant: "destructive",
      });
    }
  }, [workout, exercise]);

  if (!workout || !exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Exercise not found</p>
          <Button onClick={() => navigate("/workouts")}>
            Go back to workouts
          </Button>
        </div>
      </div>
    );
  }

  const handleWatchDemo = () => {
    if (exerciseVideo) {
      setShowVideo(true);
    } else {
      toast({
        title: "Video unavailable",
        description: "Demo video is not available for this exercise.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative fitness-gradient h-48">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-10 bg-white/20 text-white hover:bg-white/30 hover:text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
            <PlayCircle className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Exercise Details */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge>{workout.category}</Badge>
          <Badge variant="outline">
            {exercise.duration
              ? `${exercise.duration}s`
              : `${exercise.reps} reps`}
          </Badge>
        </div>

        <h1 className="text-2xl font-bold">{exercise.name}</h1>

        <div className="mt-4">
          <h2 className="text-base font-medium mb-2">How to perform</h2>
          <p className="text-sm text-muted-foreground">
            {exercise.instructions ||
              "Start in a standing position with feet shoulder-width apart. Keep your back straight throughout the movement. Complete all repetitions with proper form."}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-base font-medium mb-2">Target muscles</h2>
          <div className="flex flex-wrap gap-2">
            {exercise.muscles.map((muscle) => (
              <Badge key={muscle} variant="secondary">
                {muscle}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Back to workout
          </Button>
          <Button className="flex-1" onClick={handleWatchDemo}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Watch Demo
          </Button>
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4 absolute z-10 w-full bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white">Exercise Demo</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={() => setShowVideo(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {exerciseVideo && (
            <div className="aspect-video w-full">
              <WorkoutVideo
                videoUrl={exerciseVideo.videoUrl}
                title={exercise.name}
                thumbnailUrl={exerciseVideo.thumbnailUrl || "/placeholder.svg"}
                duration={exerciseVideo.duration || "2:30"}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseDetail;

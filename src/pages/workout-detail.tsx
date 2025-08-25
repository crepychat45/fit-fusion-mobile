import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/exercise-card";
import {
  ArrowLeft,
  Dumbbell,
  Clock,
  Play,
  Video,
  X,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { workouts } from "@/data/workouts";
import { WorkoutVideo } from "@/components/workout-video";
import { WorkoutTimer } from "@/components/workout-timer";
import { workoutVideos } from "@/data/workout-videos";
import { EnhancedWorkoutCustomizer } from "@/components/enhanced-workout-customizer";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { provideFeedback } from "@/utils/feedback-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showVideo, setShowVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [workoutCustomization, setWorkoutCustomization] = useState<any>(null);

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

  const workoutVideo = workoutVideos.find((v) => v.workoutId === id);

  const handleStartWorkout = async () => {
    setIsStarting(true);

    // Provide feedback (sound + haptic)
    await provideFeedback("workout-start", "success");

    // Show toast notification
    toast({
      title: "Workout Started",
      description: "Get ready! Your workout has started.",
    });

    // Navigate to exercise screen after a short delay for feedback to complete
    setTimeout(() => {
      setIsStarting(false);
      navigate(`/exercise/${workout.id}/${workout.exercises[0].id}`);
    }, 800);
  };

  const openVideoPreview = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
    setShowVideo(true);
  };

  const handleTimerComplete = () => {
    toast({
      title: "Timer Complete",
      description: "Your workout timer has finished!",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-6">
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

      <div className="px-4 -mt-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
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

          {/* Enhanced Video Section */}
          <div className="mt-4 grid grid-cols-1 gap-3">
            {workoutVideo && (
              <div
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group shadow-lg"
                onClick={() =>
                  openVideoPreview(
                    workoutVideo.videoUrl ||
                      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                  )
                }
              >
                <img
                  src={workoutVideo.thumbnailUrl || "/placeholder.svg"}
                  alt={`${workout.title} preview`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center group-hover:from-black/80 transition-all">
                  <div className="text-center">
                    <Video className="h-12 w-12 text-white mx-auto mb-2" />
                    <span className="text-white font-medium text-lg">
                      HD Preview
                    </span>
                    <p className="text-white/80 text-sm mt-1">
                      1080p • {workoutVideo.duration || "3:45"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional exercise videos */}
            <div className="grid grid-cols-2 gap-2">
              {workout.exercises.slice(0, 4).map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group bg-muted"
                  onClick={() =>
                    openVideoPreview(
                      `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4`,
                    )
                  }
                >
                  <img
                    src={`/placeholder.svg`}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                    <Play className="h-6 w-6 text-white" fill="white" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-medium truncate">
                      {exercise.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-6 space-y-3">
          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleStartWorkout}
              disabled={isStarting}
            >
              <Play
                className={`h-4 w-4 mr-2 ${isStarting ? "animate-pulse" : ""}`}
              />
              {t("workout.start")}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowCustomizer(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowTimer(!showTimer)}
            className="w-full"
          >
            <Clock className="h-4 w-4 mr-2" />
            Workout Timer
          </Button>
        </div>

        {showTimer && (
          <div className="mt-4">
            <WorkoutTimer
              initialTime={workout.duration * 60}
              onComplete={handleTimerComplete}
            />
          </div>
        )}
      </div>

      <div className="px-4 mt-8">
        <Tabs defaultValue="exercises">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="exercises" className="mt-4">
            <div className="space-y-3">
              {workout.exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  name={exercise.name}
                  sets={exercise.sets}
                  reps={exercise.reps}
                  duration={
                    exercise.duration ? exercise.duration.toString() : undefined
                  }
                  description={exercise.muscles.join(", ")}
                  onSelect={() =>
                    navigate(`/exercise/${workout.id}/${exercise.id}`)
                  }
                  hasVideo={Boolean(
                    workoutVideos.find((v) => v.exerciseId === exercise.id),
                  )}
                  onVideoClick={(e) => {
                    e.stopPropagation();
                    const exerciseVideo = workoutVideos.find(
                      (v) => v.exerciseId === exercise.id,
                    );
                    if (exerciseVideo) {
                      openVideoPreview(exerciseVideo.videoUrl);
                    }
                  }}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Level</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {workout.level}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Target Muscles</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set(workout.exercises.flatMap((ex) => ex.muscles)),
                  ).map((muscle) => (
                    <Badge
                      key={muscle}
                      variant="outline"
                      className="capitalize"
                    >
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-1">Equipment Needed</h3>
                <p className="text-sm text-muted-foreground">
                  {workout.category === "strength"
                    ? "Dumbbells, Exercise Mat"
                    : workout.category === "cardio"
                      ? "None required"
                      : workout.category === "hiit"
                        ? "Exercise Mat, Timer"
                        : "Yoga Mat, Resistance Bands"}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <WorkoutVideo
                  title={`${workout.title} - Full Workout`}
                  thumbnailUrl="/placeholder.svg"
                  videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  duration="25:30"
                />
                {workout.exercises.slice(0, 3).map((exercise, index) => (
                  <WorkoutVideo
                    key={exercise.id}
                    title={`${exercise.name} - Technique Guide`}
                    thumbnailUrl="/placeholder.svg"
                    videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
                    duration="2:45"
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4 absolute z-10 w-full bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white">Exercise Video</DialogTitle>
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

          {selectedVideo && (
            <div className="aspect-video w-full">
              <WorkoutVideo
                videoUrl={selectedVideo}
                title="Exercise Demo"
                thumbnailUrl="/placeholder.svg"
                duration="2:30"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Workout Customizer Dialog */}
      <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Your Workout</DialogTitle>
          </DialogHeader>
          <EnhancedWorkoutCustomizer
            workoutId={workout.id}
            onSave={(customization) => {
              setWorkoutCustomization(customization);
              setShowCustomizer(false);
              toast({
                title: "Workout Customized!",
                description: "Your personalized workout is ready to start.",
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutDetail;

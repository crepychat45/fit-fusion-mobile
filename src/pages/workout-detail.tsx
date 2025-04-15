
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/exercise-card";
import { ArrowLeft, Dumbbell, Clock, Play, Video, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { workouts } from "@/data/workouts";
import { WorkoutVideo } from "@/components/workout-video";
import { WorkoutTimer } from "@/components/workout-timer";
import { workoutVideos } from "@/data/workout-videos";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showVideo, setShowVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  
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
  
  const workoutVideo = workoutVideos.find(v => v.workoutId === id);
  
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
          
          {workoutVideo && (
            <div 
              className="mt-4 relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openVideoPreview(workoutVideo.videoUrl)}
            >
              <img 
                src={workoutVideo.thumbnailUrl || "/placeholder.svg"} 
                alt={`${workout.title} preview`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                <Video className="h-10 w-10 text-white" />
                <span className="text-white font-medium ml-2">Watch Preview</span>
              </div>
            </div>
          )}
        </motion.div>
        
        <div className="mt-6 flex gap-2">
          <Button 
            className="flex-1" 
            size="lg" 
            onClick={handleStartWorkout}
            disabled={isStarting}
          >
            <Play className={`h-4 w-4 mr-2 ${isStarting ? 'animate-pulse' : ''}`} />
            {t('workout.start')}
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            onClick={() => setShowTimer(!showTimer)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Timer
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
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exercises" className="mt-4">
            <div className="space-y-3">
              {workout.exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  name={exercise.name}
                  sets={exercise.sets}
                  reps={exercise.reps}
                  duration={exercise.duration ? exercise.duration.toString() : undefined}
                  description={exercise.muscles.join(", ")}
                  onSelect={() => navigate(`/exercise/${workout.id}/${exercise.id}`)}
                  hasVideo={Boolean(workoutVideos.find(v => v.exerciseId === exercise.id))}
                  onVideoClick={(e) => {
                    e.stopPropagation();
                    const exerciseVideo = workoutVideos.find(v => v.exerciseId === exercise.id);
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
                <p className="text-sm text-muted-foreground capitalize">{workout.level}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Target Muscles</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(workout.exercises.flatMap(ex => ex.muscles))).map(muscle => (
                    <Badge key={muscle} variant="outline" className="capitalize">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Equipment Needed</h3>
                <p className="text-sm text-muted-foreground">
                  {workout.category === 'strength' 
                    ? 'Dumbbells, Exercise Mat' 
                    : workout.category === 'cardio' 
                    ? 'None required' 
                    : workout.category === 'hiit' 
                    ? 'Exercise Mat, Timer' 
                    : 'Yoga Mat, Resistance Bands'}
                </p>
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
    </div>
  );
};

export default WorkoutDetail;

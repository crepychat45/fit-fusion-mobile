
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Timer, AlarmClock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Workout {
  id: string;
  name: string;
  time: string;
  day: string;
  duration: string;
}

interface TodaysWorkoutProps {
  workouts: Workout[];
  onReschedule: (workout: Workout) => void;
}

export function TodaysWorkout({ workouts, onReschedule }: TodaysWorkoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleStartWorkout = (workout: Workout) => {
    const audio = new Audio("/workout-start.mp3");
    audio.volume = 0.3;
    audio.play().catch(err => console.log("Audio playback prevented: ", err));
    
    toast({
      title: "Workout Started",
      description: `Starting ${workout.name} workout. Let's crush it!`,
    });
    
    navigate(`/workout/1`);
  };
  
  const todaysWorkouts = workouts.filter(workout => workout.day === "Today");
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="px-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">Today's Workout</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center text-xs text-muted-foreground"
          onClick={() => navigate("/workouts")}
        >
          See All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {todaysWorkouts.map((workout) => (
        <motion.div key={workout.id} variants={itemVariants} initial="hidden" animate="visible">
          <Card className="mb-3 overflow-hidden border border-primary/10 shadow-md">
            <CardContent className="p-0">
              <div className="flex items-center p-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium">{workout.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AlarmClock className="mr-1 h-3.5 w-3.5" />
                    <span>{workout.time}</span>
                    <span className="mx-1">•</span>
                    <Timer className="mr-1 h-3.5 w-3.5" />
                    <span>{workout.duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 border-t">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => handleStartWorkout(workout)}
                >
                  Start Workout
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onReschedule(workout)}
                >
                  Reschedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

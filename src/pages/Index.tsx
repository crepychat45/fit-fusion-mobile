
import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ActivityCard } from "@/components/activity-card";
import { ActivitySummary } from "@/components/activity-summary";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { userProfile } from "@/data/user";
import { Dumbbell, Timer, Calendar, ChevronRight, AlarmClock, Bell } from "lucide-react";
import { workouts } from "@/data/workouts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Scheduled workouts data
const scheduledWorkouts = [
  {
    id: "1",
    name: "Upper Body",
    time: "07:00 AM",
    day: "Today",
    duration: "45 min"
  },
  {
    id: "2",
    name: "Cardio Session",
    time: "06:30 AM",
    day: "Tomorrow",
    duration: "30 min"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date());
  const [scheduledTime, setScheduledTime] = useState("07:00 AM");
  
  // Times for reschedule dropdown
  const availableTimes = [
    "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM", 
    "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
    "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", 
    "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM"
  ];
  
  const handleStartWorkout = (workout: any) => {
    // Play a subtle sound effect when starting a workout
    const audio = new Audio("/workout-start.mp3");
    audio.volume = 0.3;
    audio.play().catch(err => console.log("Audio playback prevented: ", err));
    
    toast({
      title: "Workout Started",
      description: `Starting ${workout.name} workout. Let's crush it!`,
    });
    
    // Navigate to the workout detail page
    navigate(`/workout/${workouts[0].id}`);
  };
  
  const openRescheduleDialog = (workout: any) => {
    setSelectedWorkout(workout);
    setShowReschedule(true);
  };
  
  const handleReschedule = () => {
    if (selectedWorkout && scheduledDate) {
      toast({
        title: "Workout Rescheduled",
        description: `${selectedWorkout.name} rescheduled to ${format(scheduledDate, "EEEE, MMM d")} at ${scheduledTime}`,
      });
      setShowReschedule(false);
    }
  };
  
  // Animation variants for list items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <h1 className="text-xl font-bold text-white mb-1">Welcome back, {userProfile.name}</h1>
        <p className="text-white/80 text-sm">{format(new Date(), "EEEE, MMMM d")}</p>
      </div>
      
      {/* Activity Summary */}
      <div className="px-4 -mt-6 relative z-10">
        <ActivitySummary
          workoutsCompleted={userProfile.stats.workoutsCompleted}
          streakDays={userProfile.stats.streakDays}
          caloriesBurned={userProfile.stats.caloriesBurned}
          avgHeartRate={userProfile.stats.avgHeartRate}
        />
      </div>
      
      {/* Today's Workout */}
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
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {scheduledWorkouts.map((workout, index) => (
            workout.day === "Today" && (
              <motion.div key={workout.id} variants={itemVariants}>
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
                        onClick={() => openRescheduleDialog(workout)}
                      >
                        Reschedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          ))}
        </motion.div>
      </div>
      
      {/* Upcoming Workouts */}
      <div className="px-4 mt-6">
        <h2 className="font-medium mb-3">Upcoming Workouts</h2>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {scheduledWorkouts.map((workout, index) => (
            workout.day !== "Today" && (
              <motion.div key={workout.id} variants={itemVariants}>
                <Card className="mb-3 overflow-hidden border border-primary/10 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="bg-secondary/50 p-3 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{workout.name}</h3>
                          <Badge variant="outline">{workout.day}</Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <AlarmClock className="mr-1 h-3.5 w-3.5" />
                          <span>{workout.time}</span>
                          <span className="mx-1">•</span>
                          <Timer className="mr-1 h-3.5 w-3.5" />
                          <span>{workout.duration}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          ))}
        </motion.div>
      </div>
      
      {/* Recent Activity */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Recent Activity</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-xs text-muted-foreground"
            onClick={() => navigate("/progress")}
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <ActivityCard 
            title="Leg Day Workout"
            description="Completed in 45 minutes"
            date="Yesterday"
            icon={<Dumbbell className="h-6 w-6" />}
            stats={[
              { label: "Calories", value: "320" },
              { label: "Exercises", value: "8" }
            ]}
          />
          
          <ActivityCard 
            title="Morning Cardio"
            description="Completed in 30 minutes"
            date="2 days ago"
            icon={<Timer className="h-6 w-6" />}
            stats={[
              { label: "Calories", value: "240" },
              { label: "Distance", value: "4.2 km" }
            ]}
          />
        </div>
      </div>
      
      {/* Daily Tips */}
      <div className="px-4 mt-6 mb-20">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fitness Tip of the Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Stay hydrated during your workouts! Aim to drink water before, during, and after exercising to maintain optimal performance.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Reschedule Dialog */}
      <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Workout</DialogTitle>
            <DialogDescription>
              Choose a new date and time for your workout
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Select Date</h4>
              <CalendarComponent
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                className="rounded-md border"
                initialFocus
              />
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Select Time</h4>
              <select 
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                {availableTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReschedule(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Index;

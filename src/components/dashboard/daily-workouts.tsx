import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Flame,
  Target,
  TrendingUp,
  CheckCircle,
  PlayCircle,
  RefreshCw,
  Star,
  Zap,
} from "lucide-react";

interface DailyWorkout {
  id: string;
  title: string;
  description: string;
  duration: number;
  calories: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  exercises: number;
  completed: boolean;
  progress: number;
  recommended: boolean;
}

const generateDailyWorkouts = (): DailyWorkout[] => {
  const today = new Date().getDay();
  const workouts: DailyWorkout[] = [
    {
      id: "daily-1",
      title: "Morning Energy Boost",
      description: "Start your day with this energizing full-body routine",
      duration: 20,
      calories: 180,
      difficulty: "beginner",
      category: "Full Body",
      exercises: 8,
      completed: false,
      progress: 0,
      recommended: true,
    },
    {
      id: "daily-2",
      title: "Core Strength Builder",
      description: "Strengthen your core with targeted ab exercises",
      duration: 15,
      calories: 120,
      difficulty: "intermediate",
      category: "Core",
      exercises: 6,
      completed: false,
      progress: 0,
      recommended: today % 2 === 0,
    },
    {
      id: "daily-3",
      title: "Cardio Fat Burner",
      description: "High-intensity cardio to maximize calorie burn",
      duration: 30,
      calories: 350,
      difficulty: "advanced",
      category: "Cardio",
      exercises: 10,
      completed: false,
      progress: 0,
      recommended: today % 3 === 0,
    },
  ];

  // Load progress from localStorage
  const savedProgress = localStorage.getItem("daily-workouts-progress");
  if (savedProgress) {
    const progress = JSON.parse(savedProgress);
    const today = new Date().toDateString();
    if (progress.date === today) {
      return workouts.map(w => ({
        ...w,
        completed: progress.completed.includes(w.id),
        progress: progress.progress[w.id] || 0,
      }));
    }
  }

  return workouts;
};

const DifficultyBadge = ({ level }: { level: string }) => {
  const colors = {
    beginner: "bg-green-500/10 text-green-500 border-green-500/20",
    intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    advanced: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <Badge className={`${colors[level as keyof typeof colors]} border`}>
      {level}
    </Badge>
  );
};

export const DailyWorkouts: React.FC = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<DailyWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setWorkouts(generateDailyWorkouts());
    setLoading(false);
  }, []);

  const saveProgress = (updatedWorkouts: DailyWorkout[]) => {
    const progress = {
      date: new Date().toDateString(),
      completed: updatedWorkouts.filter(w => w.completed).map(w => w.id),
      progress: Object.fromEntries(updatedWorkouts.map(w => [w.id, w.progress])),
    };
    localStorage.setItem("daily-workouts-progress", JSON.stringify(progress));
  };

  const handleStartWorkout = (workoutId: string) => {
    const updatedWorkouts = workouts.map(w =>
      w.id === workoutId ? { ...w, progress: 0 } : w
    );
    setWorkouts(updatedWorkouts);
    saveProgress(updatedWorkouts);
    navigate(`/workout-session/${workoutId}`);
  };

  const handleCompleteWorkout = (workoutId: string) => {
    const updatedWorkouts = workouts.map(w =>
      w.id === workoutId ? { ...w, completed: true, progress: 100 } : w
    );
    setWorkouts(updatedWorkouts);
    saveProgress(updatedWorkouts);
  };

  const refreshWorkouts = () => {
    setLoading(true);
    setTimeout(() => {
      setWorkouts(generateDailyWorkouts());
      setLoading(false);
    }, 500);
  };

  const totalCompleted = workouts.filter(w => w.completed).length;
  const completionRate = (totalCompleted / workouts.length) * 100;

  if (loading) {
    return (
      <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Daily Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted/50" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Daily Workouts
            <Badge variant="secondary" className="ml-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshWorkouts}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {totalCompleted > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today's Progress</span>
              <span className="font-semibold text-primary">
                {totalCompleted}/{workouts.length} completed
              </span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence mode="popLayout">
          {workouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden border transition-all hover:shadow-lg ${
                workout.recommended ? 'border-primary/50 bg-primary/5' : 'border-border/50'
              } ${workout.completed ? 'opacity-60' : ''}`}>
                {workout.recommended && (
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <Star className="mr-1 h-3 w-3" />
                      Recommended
                    </Badge>
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{workout.title}</h3>
                          {workout.completed && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {workout.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <DifficultyBadge level={workout.difficulty} />
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {workout.duration} min
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Flame className="h-3 w-3" />
                        {workout.calories} cal
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Target className="h-3 w-3" />
                        {workout.exercises} exercises
                      </Badge>
                    </div>

                    {workout.progress > 0 && workout.progress < 100 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">In Progress</span>
                          <span className="font-medium">{workout.progress}%</span>
                        </div>
                        <Progress value={workout.progress} className="h-1" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!workout.completed ? (
                        <>
                          <Button
                            onClick={() => handleStartWorkout(workout.id)}
                            className="flex-1 gap-2"
                            variant={workout.recommended ? "default" : "secondary"}
                          >
                            <PlayCircle className="h-4 w-4" />
                            {workout.progress > 0 ? 'Continue' : 'Start'}
                          </Button>
                          {workout.progress > 50 && (
                            <Button
                              onClick={() => handleCompleteWorkout(workout.id)}
                              variant="outline"
                              className="gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Complete
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          onClick={() => handleStartWorkout(workout.id)}
                          variant="outline"
                          className="flex-1 gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Do Again
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {completionRate === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg bg-gradient-to-r from-green-500/10 to-primary/10 p-4 text-center"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-green-500/20 p-3">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold">Amazing Work! 🎉</h3>
              <p className="text-sm text-muted-foreground">
                You've completed all daily workouts!
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

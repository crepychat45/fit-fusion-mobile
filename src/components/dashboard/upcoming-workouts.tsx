import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Timer, AlarmClock } from "lucide-react";
import { motion } from "framer-motion";

interface Workout {
  id: string;
  name: string;
  time: string;
  day: string;
  duration: string;
}

interface UpcomingWorkoutsProps {
  workouts: Workout[];
}

export function UpcomingWorkouts({ workouts }: UpcomingWorkoutsProps) {
  const upcomingWorkouts = workouts.filter(
    (workout) => workout.day !== "Today",
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  if (upcomingWorkouts.length === 0) {
    return null;
  }

  return (
    <div className="px-4 mt-6">
      <h2 className="font-medium mb-3">Upcoming Workouts</h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {upcomingWorkouts.map((workout) => (
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
        ))}
      </motion.div>
    </div>
  );
}

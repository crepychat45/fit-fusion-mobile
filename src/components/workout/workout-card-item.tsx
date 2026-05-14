import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Flame, Dumbbell, PlayCircle } from "lucide-react";
import { Workout } from "./workout-library";
import { cn } from "@/lib/utils";

interface WorkoutCardItemProps {
  workout: Workout;
}

export function WorkoutCard({ workout }: WorkoutCardItemProps) {
  const difficultyColors = {
    beginner: "bg-green-500/10 text-green-700 dark:text-green-400",
    intermediate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    advanced: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        <div className="absolute top-3 left-3">
          <Badge className={cn("capitalize", difficultyColors[workout.difficulty])}>
            {workout.difficulty}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary">{workout.category}</Badge>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
        </div>
      </div>

      <CardHeader>
        <h3 className="text-xl font-bold line-clamp-1">{workout.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {workout.description}
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{workout.duration} min</span>
          </div>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Flame className="h-4 w-4" />
            <span>{workout.caloriesBurn} cal</span>
          </div>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Dumbbell className="h-4 w-4" />
            <span>{workout.exercises} moves</span>
          </div>
        </div>

        {workout.equipment.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {workout.equipment.map((item) => (
              <Badge key={item} variant="outline" className="text-xs capitalize">
                {item}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/workout-detail/${workout.id}`}>
            Start Workout
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

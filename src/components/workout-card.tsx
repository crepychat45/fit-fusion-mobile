import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, PlayCircle, Heart } from "lucide-react";
import { Workout } from "@/data/workouts";

interface WorkoutCardProps {
  workout: Workout;
  onFavorite: () => void;
  isFavorite: boolean;
}

export function WorkoutCard({
  workout,
  onFavorite,
  isFavorite,
}: WorkoutCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{workout.title}</CardTitle>
            <CardDescription className="text-sm">
              {workout.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onFavorite}
              className="p-2"
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
              />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{workout.duration} mins</span>
          </div>
          <Badge variant="outline">{workout.level}</Badge>
          <Badge variant="secondary">{workout.category}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              {workout.exercises?.length || 8} exercises
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => navigate(`/workout-detail/${workout.id}`)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <PlayCircle className="h-4 w-4 mr-1" />
            Start
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

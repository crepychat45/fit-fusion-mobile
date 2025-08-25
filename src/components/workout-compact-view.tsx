import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Dumbbell, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutCompactViewProps {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: number;
  isCompact?: boolean;
  showCalories?: boolean;
  showHeartRate?: boolean;
}

export function WorkoutCompactView({
  id,
  title,
  category,
  level,
  duration,
  isCompact = false,
  showCalories = true,
  showHeartRate = true,
}: WorkoutCompactViewProps) {
  const navigate = useNavigate();

  const categoryColors: Record<string, string> = {
    strength: "bg-blue-100 text-blue-800",
    cardio: "bg-red-100 text-red-800",
    flexibility: "bg-green-100 text-green-800",
    hiit: "bg-purple-100 text-purple-800",
    default: "bg-gray-100 text-gray-800",
  };

  const levelColors: Record<string, string> = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800",
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md overflow-hidden",
        isCompact ? "border-l-4 border-l-primary" : "",
      )}
      onClick={() => navigate(`/workout/${id}`)}
    >
      <CardContent
        className={cn(
          "p-4",
          isCompact ? "flex items-center justify-between" : "",
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-2",
            isCompact ? "flex-row items-center gap-4" : "",
          )}
        >
          <div className={isCompact ? "min-w-[50%]" : ""}>
            <h3
              className={cn(
                "font-semibold",
                isCompact ? "text-base mb-0" : "text-lg mb-2",
              )}
            >
              {title}
            </h3>

            {!isCompact && (
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  className={categoryColors[category] || categoryColors.default}
                >
                  {category}
                </Badge>
                <Badge className={levelColors[level] || levelColors.default}>
                  {level}
                </Badge>
              </div>
            )}
          </div>

          <div
            className={cn(
              "flex items-center gap-4",
              isCompact ? "ml-auto" : "mt-2",
            )}
          >
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{duration} min</span>
            </div>

            {showCalories && (
              <div className="flex items-center gap-1">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">250 cal</span>
              </div>
            )}

            {showHeartRate && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">4.8</span>
              </div>
            )}

            {isCompact && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Card, CardContent } from "./ui/card";
import { Dumbbell, Timer, ChevronRight, Video } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface ExerciseCardProps {
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;
  description: string;
  onSelect?: () => void;
  hasVideo?: boolean;
  onVideoClick?: (e: React.MouseEvent) => void;
}

export function ExerciseCard({
  name,
  sets,
  reps,
  duration,
  description,
  onSelect,
  hasVideo = false,
  onVideoClick,
}: ExerciseCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card
        className={cn(
          "overflow-hidden border-primary/10 shadow-sm",
          onSelect && "cursor-pointer",
        )}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{name}</h3>
                {hasVideo && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary hover:text-primary/80 -mr-2"
                    onClick={onVideoClick}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>
            {onSelect && (
              <ChevronRight className="h-5 w-5 text-muted-foreground ml-2 flex-shrink-0" />
            )}
          </div>

          {(sets || reps || duration) && (
            <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
              {sets && reps && (
                <div className="flex items-center gap-1">
                  <Dumbbell className="h-3.5 w-3.5" />
                  <span>
                    {sets} sets × {reps} reps
                  </span>
                </div>
              )}
              {duration && (
                <div className="flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5" />
                  <span>{duration}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}


import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ExerciseCardProps {
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  image?: string;
  description?: string;
  onSelect?: () => void;
}

export function ExerciseCard({ 
  name, 
  sets, 
  reps, 
  duration, 
  image, 
  description,
  onSelect 
}: ExerciseCardProps) {
  return (
    <Card 
      className="flex overflow-hidden cursor-pointer hover:shadow-sm transition-all"
      onClick={onSelect}
    >
      <div className="w-24 h-24 bg-muted-foreground/10 flex items-center justify-center">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full fitness-gradient flex items-center justify-center text-white font-bold">
            {name.substring(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      
      <CardContent className="flex-1 flex flex-col justify-center p-3">
        <h3 className="font-medium text-sm">{name}</h3>
        
        <div className="flex gap-1 mt-1 text-muted-foreground text-xs">
          <span>{sets} sets</span>
          <span>•</span>
          <span>{reps} reps</span>
          
          {duration && (
            <>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {duration}s
              </span>
            </>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

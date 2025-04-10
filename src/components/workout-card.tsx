
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock } from "lucide-react";

interface WorkoutCardProps {
  id: string;
  title: string;
  category: string;
  duration: number;
  exercises: number;
  image?: string;
}

export function WorkoutCard({ id, title, category, duration, exercises, image }: WorkoutCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={() => navigate(`/workout/${id}`)}
    >
      <div className="relative h-36 w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full fitness-gradient flex items-center justify-center">
            <Dumbbell className="h-12 w-12 text-white" />
          </div>
        )}
        
        <Badge className="absolute top-2 right-2 z-20 bg-black/40 text-white border-none">
          {category}
        </Badge>
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-semibold text-base">{title}</h3>
        
        <div className="flex items-center gap-4 mt-2 text-muted-foreground text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="h-3.5 w-3.5" />
            <span>{exercises} exercises</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

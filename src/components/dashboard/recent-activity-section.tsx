
import React from "react";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { ChevronRight, Dumbbell, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RecentActivitySection() {
  const navigate = useNavigate();
  
  return (
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
  );
}

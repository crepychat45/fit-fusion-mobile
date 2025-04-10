
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { achievements } from "@/data/achievements";

export function ProfileAchievements() {
  return (
    <div>
      <h3 className="font-medium mb-2">Achievements</h3>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement, index) => (
          <Card 
            key={index} 
            className={`${achievement.earned ? "border-primary/30" : "border-muted/50 opacity-70"}`}
          >
            <CardContent className="p-3 flex flex-col items-center text-center">
              <div className={`rounded-full p-2 mb-2 ${achievement.earned ? "bg-primary/10 text-primary" : "bg-muted/10 text-muted-foreground"}`}>
                <achievement.icon className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-medium">{achievement.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

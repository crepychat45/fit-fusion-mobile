
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { achievements } from "@/data/achievements";
import { motion } from "framer-motion";

export function ProfileAchievements() {
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null);
  
  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((earnedCount / totalCount) * 100);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Achievements</h3>
        <Badge variant="outline" className="bg-primary/10 text-primary">
          {earnedCount}/{totalCount} Earned
        </Badge>
      </div>
      
      <div className="w-full bg-muted/30 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement, index) => (
          <motion.div
            key={index}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedAchievement(selectedAchievement === index ? null : index)}
          >
            <Card 
              className={`${
                achievement.earned 
                  ? "border-primary/30 shadow-sm" 
                  : "border-muted/50 opacity-70"
              } ${
                selectedAchievement === index
                  ? "ring-2 ring-primary/20"
                  : ""
              } transition-all hover:shadow-md cursor-pointer`}
            >
              <CardContent className="p-3 flex flex-col items-center text-center">
                <div 
                  className={`rounded-full p-2.5 mb-2 ${
                    achievement.earned 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted/10 text-muted-foreground"
                  }`}
                >
                  <achievement.icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-medium">
                  {achievement.title}
                  {achievement.earned && (
                    <span className="ml-1 inline-flex">
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        ✓
                      </motion.span>
                    </span>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                
                {selectedAchievement === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-muted/30 w-full"
                  >
                    <p className="text-xs">
                      {achievement.earned 
                        ? "Earned on April 8, 2025" 
                        : "Keep training to unlock this achievement!"}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

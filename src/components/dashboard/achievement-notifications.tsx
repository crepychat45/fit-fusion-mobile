
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Medal, 
  X,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
}

export function AchievementNotifications() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Morning Warrior',
      description: 'Completed 5 morning workouts this week',
      icon: Trophy,
      points: 50,
      rarity: 'rare',
      unlocked: true
    },
    {
      id: '2',
      title: 'Streak Master',
      description: '7-day workout streak achieved!',
      icon: Flame,
      points: 100,
      rarity: 'epic',
      unlocked: true
    }
  ]);

  const [visibleAchievements, setVisibleAchievements] = useState<Achievement[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Show new achievements with delay
    achievements.forEach((achievement, index) => {
      if (achievement.unlocked) {
        setTimeout(() => {
          setVisibleAchievements(prev => {
            if (!prev.find(a => a.id === achievement.id)) {
              return [...prev, achievement];
            }
            return prev;
          });
        }, index * 1000);
      }
    });
  }, [achievements]);

  const dismissAchievement = (achievementId: string) => {
    setVisibleAchievements(prev => prev.filter(a => a.id !== achievementId));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'rare':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'epic':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const celebrateAchievement = (achievement: Achievement) => {
    toast({
      title: `🎉 ${achievement.title}`,
      description: `You earned ${achievement.points} points! ${achievement.description}`,
    });
  };

  if (visibleAchievements.length === 0) return null;

  return (
    <div className="px-4">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-medium">New Achievements</h2>
        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <Sparkles className="h-3 w-3 mr-1" />
          Unlocked
        </Badge>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {visibleAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 100 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
              layout
            >
              <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full text-white"
                      >
                        <achievement.icon className="h-5 w-5" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-primary">{achievement.title}</h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRarityColor(achievement.rarity)}`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary">
                            +{achievement.points} XP
                          </Badge>
                          
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => celebrateAchievement(achievement)}
                            className="text-xs h-6 px-2"
                          >
                            🎉 Celebrate
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAchievement(achievement.id)}
                      className="h-6 w-6 p-0 hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

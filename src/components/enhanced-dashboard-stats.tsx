
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Activity, 
  Target, 
  Flame, 
  Clock, 
  TrendingUp, 
  Award, 
  Zap,
  Heart,
  Users,
  Calendar,
  Trophy,
  Star,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";

interface StatCard {
  id: string;
  title: string;
  value: string;
  unit: string;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ComponentType<any>;
  color: string;
  progress?: number;
  target?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export function EnhancedDashboardStats() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("week");
  const [isLoading, setIsLoading] = useState(false);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  const statsData: StatCard[] = [
    {
      id: "calories",
      title: "Calories Burned",
      value: "2,847",
      unit: "kcal",
      change: 12.5,
      changeType: "increase",
      icon: Flame,
      color: "text-orange-600",
      progress: 75,
      target: "3,200"
    },
    {
      id: "workouts",
      title: "Workouts Completed",
      value: "24",
      unit: "sessions",
      change: 8.3,
      changeType: "increase",
      icon: Activity,
      color: "text-blue-600",
      progress: 80,
      target: "30"
    },
    {
      id: "time",
      title: "Active Time",
      value: "18.5",
      unit: "hours",
      change: -2.1,
      changeType: "decrease",
      icon: Clock,
      color: "text-green-600",
      progress: 62,
      target: "25"
    },
    {
      id: "streak",
      title: "Current Streak",
      value: "12",
      unit: "days",
      change: 15.2,
      changeType: "increase",
      icon: Target,
      color: "text-purple-600",
      progress: 85,
      target: "15"
    },
    {
      id: "heartrate",
      title: "Avg Heart Rate",
      value: "142",
      unit: "bpm",
      change: 3.7,
      changeType: "increase",
      icon: Heart,
      color: "text-red-600"
    },
    {
      id: "friends",
      title: "Active Friends",
      value: "18",
      unit: "online",
      change: 5.2,
      changeType: "increase",
      icon: Users,
      color: "text-indigo-600"
    }
  ];

  const achievements: Achievement[] = [
    {
      id: "1",
      title: "Week Warrior",
      description: "Complete 7 workouts in a week",
      icon: "🏆",
      unlockedAt: new Date(Date.now() - 86400000),
      rarity: "rare"
    },
    {
      id: "2",
      title: "Calorie Crusher",
      description: "Burn 3000+ calories in a day",
      icon: "🔥",
      unlockedAt: new Date(Date.now() - 172800000),
      rarity: "epic"
    },
    {
      id: "3",
      title: "Social Butterfly",
      description: "Join 5 group challenges",
      icon: "🦋",
      unlockedAt: new Date(Date.now() - 259200000),
      rarity: "common"
    }
  ];

  useEffect(() => {
    setRecentAchievements(achievements);
  }, []);

  const refreshStats = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Stats Updated",
      description: "Your fitness data has been refreshed.",
    });
    
    setIsLoading(false);
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "increase":
        return <ArrowUp className="h-3 w-3 text-green-600" />;
      case "decrease":
        return <ArrowDown className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case "increase":
        return "text-green-600";
      case "decrease":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-300 bg-gray-50";
      case "rare":
        return "border-blue-300 bg-blue-50";
      case "epic":
        return "border-purple-300 bg-purple-50";
      case "legendary":
        return "border-yellow-300 bg-yellow-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fitness Overview</h2>
          <p className="text-muted-foreground">Track your progress and achievements</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            {["week", "month", "year"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period as any)}
                className="capitalize"
              >
                {period}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            disabled={isLoading}
            className="gap-1"
          >
            {isLoading ? (
              <Zap className="h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.unit}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  {getChangeIcon(stat.changeType)}
                  <span className={getChangeColor(stat.changeType)}>
                    {Math.abs(stat.change)}% vs last {selectedPeriod}
                  </span>
                </div>
                
                {stat.progress && stat.target && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress to goal</span>
                      <span className="font-medium">{stat.target} {stat.unit}</span>
                    </div>
                    <Progress value={stat.progress} className="h-2" />
                  </div>
                )}
              </CardContent>
              
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Recent Achievements
            </CardTitle>
            <CardDescription>Your latest fitness milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-3 border rounded-lg ${getRarityColor(achievement.rarity)}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {achievement.unlockedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <Button variant="outline" className="w-full mt-3" size="sm">
              <Award className="h-4 w-4 mr-1" />
              View All Achievements
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Weekly Goals
            </CardTitle>
            <CardDescription>Stay on track with your targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Workout Sessions</span>
                <span className="font-medium">6/7</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Calories Burned</span>
                <span className="font-medium">2,847/3,500</span>
              </div>
              <Progress value={81} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Active Minutes</span>
                <span className="font-medium">1,230/1,500</span>
              </div>
              <Progress value={82} className="h-2" />
            </div>
            
            <Button variant="outline" className="w-full mt-3" size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              Set New Goals
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Keep up the momentum! 🚀</h3>
                <p className="text-blue-100">
                  You're just 3 workouts away from beating your personal record this month.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-8 w-8 text-yellow-300" />
                <span className="text-3xl font-bold">12</span>
                <span className="text-sm">day streak</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

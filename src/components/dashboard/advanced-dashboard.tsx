
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Zap, 
  Heart, 
  Flame, 
  Trophy,
  BarChart3,
  Clock,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function AdvancedDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const weeklyProgress = {
    workouts: { completed: 4, target: 5, percentage: 80 },
    calories: { burned: 1800, target: 2500, percentage: 72 },
    duration: { completed: 240, target: 300, percentage: 80 },
    strength: { completed: 2, target: 3, percentage: 67 }
  };

  const todayStats = {
    heartRate: { current: 78, zone: "Resting", color: "green" },
    steps: { count: 8543, target: 10000, percentage: 85 },
    activeMinutes: { count: 45, target: 60, percentage: 75 },
    calories: { burned: 380, target: 500, percentage: 76 }
  };

  const achievements = [
    { name: "Week Warrior", description: "4 workouts this week", icon: Trophy, earned: true },
    { name: "Calorie Crusher", description: "1800+ calories burned", icon: Flame, earned: true },
    { name: "Consistency King", description: "5 days streak", icon: Target, earned: false }
  ];

  const getProgressValue = (key: string, data: any) => {
    if (key === 'calories') {
      return `${data.burned}/${data.target}`;
    }
    return `${data.completed}/${data.target}`;
  };

  return (
    <div className="px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Advanced Analytics</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/progress")}
        >
          View All <BarChart3 className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Today's Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Today's Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Steps</span>
                    <span className="text-sm font-medium">{todayStats.steps.count.toLocaleString()}</span>
                  </div>
                  <Progress value={todayStats.steps.percentage} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Active Minutes</span>
                    <span className="text-sm font-medium">{todayStats.activeMinutes.count}</span>
                  </div>
                  <Progress value={todayStats.activeMinutes.percentage} className="h-2" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">{todayStats.heartRate.current} BPM</p>
                    <p className="text-xs text-muted-foreground">{todayStats.heartRate.zone} Zone</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Optimal
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="cursor-pointer" onClick={() => navigate("/workouts")}>
                <CardContent className="p-4 text-center">
                  <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">380</p>
                  <p className="text-xs text-muted-foreground">Calories Burned</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="cursor-pointer" onClick={() => navigate("/progress")}>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-xs text-muted-foreground">Active Minutes</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Weekly Progress
              </CardTitle>
              <CardDescription>Your performance this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(weeklyProgress).map(([key, data]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{key}</span>
                    <span className="text-sm text-muted-foreground">
                      {getProgressValue(key, data)}
                    </span>
                  </div>
                  <Progress value={data.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{data.percentage}% complete</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Achievement Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`p-2 rounded-full ${achievement.earned ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                    <achievement.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.earned && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Earned
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

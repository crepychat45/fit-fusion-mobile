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
  MoreHorizontal,
  Download,
  CheckCircle,
  Sparkles
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
  const [isExporting, setIsExporting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<"all" | "fitness" | "social" | "achievements">("all");
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedStats, setSelectedStats] = useState<string[]>([]);

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
    
    // Simulate enhanced API call with realistic data updates
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate updating stats with slight variations
    const updatedToast = Math.random() > 0.5 
      ? { title: "📊 Stats Updated", description: "Your fitness data has been refreshed with latest metrics." }
      : { title: "🎯 New Personal Record!", description: "You've achieved a new milestone in your fitness journey!" };
    
    toast(updatedToast);
    setIsLoading(false);
  };

  const exportData = async () => {
    setIsExporting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate data export
      const exportData = {
        period: selectedPeriod,
        stats: statsData,
        achievements: recentAchievements,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitness-stats-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      toast({
        title: "📤 Export Complete",
        description: "Your fitness data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "❌ Export Failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const toggleStatSelection = (statId: string) => {
    setSelectedStats(prev => 
      prev.includes(statId) 
        ? prev.filter(id => id !== statId)
        : [...prev, statId]
    );
  };

  const filteredStats = statsData.filter(stat => {
    if (filterCategory === "all") return true;
    if (filterCategory === "fitness") return ["calories", "workouts", "time", "heartrate"].includes(stat.id);
    if (filterCategory === "social") return ["friends", "streak"].includes(stat.id);
    return false;
  });

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
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Fitness Overview
          </h2>
          <p className="text-muted-foreground mt-1">Track your progress and achievements with advanced analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filter Controls */}
          <div className="flex bg-muted rounded-lg p-1">
            {["all", "fitness", "social"].map((category) => (
              <Button
                key={category}
                variant={filterCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterCategory(category as any)}
                className="capitalize text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
          
          {/* Period Selector */}
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
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComparisonMode(!comparisonMode)}
              className={comparisonMode ? "bg-blue-50 border-blue-200" : ""}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Compare
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              disabled={isExporting}
            >
              {isExporting ? (
                <Zap className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Export
            </Button>
            
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
      </div>

      {/* Comparison Mode Alert */}
      {comparisonMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              Comparison mode enabled. Click on stats to compare different metrics side by side.
              {selectedStats.length > 0 && (
                <span className="ml-2 font-medium">
                  Comparing: {selectedStats.length} stats
                </span>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={comparisonMode ? "cursor-pointer" : ""}
            onClick={() => comparisonMode && toggleStatSelection(stat.id)}
          >
            <Card className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 ${
              comparisonMode && selectedStats.includes(stat.id) 
                ? "ring-2 ring-blue-500 shadow-lg transform scale-105" 
                : "hover:shadow-lg"
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-muted ${stat.color} relative`}>
                      <stat.icon className="h-4 w-4" />
                      {comparisonMode && selectedStats.includes(stat.id) && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    {stat.changeType === "increase" && (
                      <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                        ↗️ +{stat.change}%
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.unit}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  {getChangeIcon(stat.changeType)}
                  <span className={getChangeColor(stat.changeType)}>
                    {Math.abs(stat.change)}% vs last {selectedPeriod}
                  </span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {selectedPeriod}
                  </Badge>
                </div>
                
                {stat.progress && stat.target && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress to goal</span>
                      <span className="font-medium">{stat.target} {stat.unit}</span>
                    </div>
                    <div className="relative">
                      <Progress value={stat.progress} className="h-2" />
                      <div className="absolute top-0 right-0 text-xs text-muted-foreground mt-2">
                        {stat.progress}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Mini Chart Visualization */}
                <div className="mt-3 h-8 flex items-end gap-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 ${stat.color.replace('text-', 'bg-')} opacity-60 rounded-sm`}
                      style={{ 
                        height: `${Math.random() * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                  ))}
                </div>
              </CardContent>
              
              {/* Enhanced decorative gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              
              {/* Hover overlay for comparison mode */}
              {comparisonMode && (
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Click to {selectedStats.includes(stat.id) ? 'remove from' : 'add to'} comparison
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Achievements */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Recent Achievements
              <Badge variant="secondary" className="ml-auto">
                {recentAchievements.length} new
              </Badge>
            </CardTitle>
            <CardDescription>Your latest fitness milestones and accomplishments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 border rounded-lg ${getRarityColor(achievement.rarity)} hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl animate-bounce">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {achievement.rarity}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {achievement.unlockedAt.toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Unlocked {achievement.unlockedAt.toLocaleDateString()}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        Share 🎉
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button variant="outline" className="w-full" size="sm">
                <Award className="h-4 w-4 mr-1" />
                View All
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Star className="h-4 w-4 mr-1" />
                Share Progress
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Weekly Goals */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Weekly Goals
              <Badge variant="default" className="ml-auto bg-blue-600">
                6/7 completed
              </Badge>
            </CardTitle>
            <CardDescription>Stay on track with your personalized targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Workout Sessions", current: 6, target: 7, progress: 85, icon: Activity, color: "text-blue-600" },
              { name: "Calories Burned", current: 2847, target: 3500, progress: 81, icon: Flame, color: "text-orange-600" },
              { name: "Active Minutes", current: 1230, target: 1500, progress: 82, icon: Clock, color: "text-green-600" }
            ].map((goal, index) => (
              <motion.div
                key={goal.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <goal.icon className={`h-4 w-4 ${goal.color}`} />
                    <span className="font-medium">{goal.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{goal.current}/{goal.target}</span>
                    <Badge variant="outline" className="text-xs">
                      {goal.progress}%
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={goal.progress} className="h-2" />
                  {goal.progress >= 100 && (
                    <div className="absolute -top-1 -right-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button variant="outline" className="w-full" size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                Adjust Goals
              </Button>
              <Button variant="default" className="w-full" size="sm">
                <Zap className="h-4 w-4 mr-1" />
                Quick Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Motivational Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  Keep crushing your goals! 
                  <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                </h3>
                <p className="text-blue-100 mb-3">
                  You're just 3 workouts away from beating your personal record this month.
                  Your consistency is inspiring! 💪
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <Zap className="h-4 w-4 mr-1" />
                    Start Workout
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    View Progress
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <Star className="h-6 w-6 text-yellow-300" />
                  <span className="text-2xl font-bold">12</span>
                  <span className="text-sm">day streak</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">
                  🏆 Top 5% this week
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Comparison Panel */}
      {comparisonMode && selectedStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Stats Comparison
                <Badge variant="outline">{selectedStats.length} selected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedStats.map(statId => {
                  const stat = statsData.find(s => s.id === statId);
                  if (!stat) return null;
                  
                  return (
                    <div key={statId} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="font-medium text-sm">{stat.title}</span>
                      </div>
                      <div className="text-lg font-bold">{stat.value} {stat.unit}</div>
                      <div className="text-xs text-muted-foreground">
                        {stat.change > 0 ? '+' : ''}{stat.change}% vs last {selectedPeriod}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedStats([])}
                className="mt-4"
              >
                Clear Comparison
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

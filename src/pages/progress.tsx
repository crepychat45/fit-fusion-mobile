import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Calendar,
  Target,
  Award,
  BarChart3,
  Activity,
  Flame,
  Clock,
  Zap,
  Trophy,
  Star,
  Heart,
  Brain,
  LineChart,
  PieChart,
  Download,
  Share2,
  Camera,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { ProgressChart } from "@/components/progress-chart";

const ProgressPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [progressData, setProgressData] = useState({
    weeklyGoal: 5,
    currentStreak: 12,
    totalWorkouts: 156,
    caloriesBurned: 45680,
    averageWorkoutTime: 32,
    personalBests: 8,
    achievements: 24,
    weeklyProgress: 80,
  });

  const [weeklyData] = useState([
    { name: "Mon", value: 45 },
    { name: "Tue", value: 32 },
    { name: "Wed", value: 58 },
    { name: "Thu", value: 41 },
    { name: "Fri", value: 67 },
    { name: "Sat", value: 23 },
    { name: "Sun", value: 39 },
  ]);

  const [monthlyData] = useState([
    { name: "Week 1", value: 4 },
    { name: "Week 2", value: 6 },
    { name: "Week 3", value: 5 },
    { name: "Week 4", value: 7 },
  ]);

  const [aiInsights] = useState([
    {
      type: "improvement",
      title: "Strength Gains Detected",
      description: "Your performance has improved by 15% this month",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      type: "recommendation",
      title: "Recovery Day Suggested",
      description: "Consider a rest day to optimize your progress",
      icon: Heart,
      color: "text-blue-600",
    },
    {
      type: "achievement",
      title: "New Personal Best",
      description: "You've reached a new milestone in endurance",
      icon: Trophy,
      color: "text-yellow-600",
    },
  ]);

  const [recentAchievements] = useState([
    {
      id: 1,
      title: "Early Bird",
      description: "Complete 10 morning workouts",
      icon: "🌅",
      progress: 100,
      unlockedAt: "2 days ago",
    },
    {
      id: 2,
      title: "Consistency Champion",
      description: "14-day workout streak",
      icon: "🏆",
      progress: 100,
      unlockedAt: "1 week ago",
    },
    {
      id: 3,
      title: "Strength Builder",
      description: "Complete 50 strength workouts",
      icon: "💪",
      progress: 78,
      unlockedAt: null,
    },
    {
      id: 4,
      title: "Cardio King",
      description: "Burn 10,000 calories",
      icon: "🔥",
      progress: 45,
      unlockedAt: null,
    },
  ]);

  const exportProgress = () => {
    const data = {
      exported_at: new Date().toISOString(),
      progress: progressData,
      weekly_data: weeklyData,
      monthly_data: monthlyData,
      achievements: recentAchievements,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitfusion-progress-${new Date().toISOString().split("T")[0]}.json`;
    a.click();

    toast({
      title: "📊 Progress Exported",
      description: "Your fitness data has been downloaded successfully.",
    });
  };

  const shareProgress = () => {
    if (navigator.share) {
      navigator.share({
        title: "My FitFusion Progress",
        text: `I've completed ${progressData.totalWorkouts} workouts and maintained a ${progressData.currentStreak}-day streak!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(
        `Check out my fitness progress: ${progressData.totalWorkouts} workouts completed with a ${progressData.currentStreak}-day streak! 💪`,
      );
      toast({
        title: "📋 Copied to clipboard",
        description: "Share your progress on social media!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-teal-500 to-blue-600" />
        <div className="absolute inset-0 bg-black/20" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative pt-12 pb-8 px-4 text-white"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Progress Analytics</h1>
              <p className="text-white/80">
                Track your fitness journey with AI insights
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                v5.0.4
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={shareProgress}
                className="text-white"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
            >
              <Flame className="h-6 w-6 mx-auto mb-2 text-orange-300" />
              <div className="text-2xl font-bold">
                {progressData.currentStreak}
              </div>
              <div className="text-xs text-white/80">Day Streak</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
            >
              <Target className="h-6 w-6 mx-auto mb-2 text-green-300" />
              <div className="text-2xl font-bold">
                {progressData.totalWorkouts}
              </div>
              <div className="text-xs text-white/80">Workouts</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
            >
              <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-300" />
              <div className="text-2xl font-bold">
                {(progressData.caloriesBurned / 1000).toFixed(1)}k
              </div>
              <div className="text-xs text-white/80">Calories</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
            >
              <Trophy className="h-6 w-6 mx-auto mb-2 text-purple-300" />
              <div className="text-2xl font-bold">
                {progressData.achievements}
              </div>
              <div className="text-xs text-white/80">Achievements</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <LineChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Award className="h-4 w-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Weekly Progress */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          This Week's Progress
                        </CardTitle>
                        <CardDescription>
                          {progressData.weeklyProgress}% of weekly goal
                          completed
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {Math.floor(progressData.weeklyProgress / 20)}/
                        {progressData.weeklyGoal} workouts
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Progress
                        value={progressData.weeklyProgress}
                        className="h-3"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>
                          Current:{" "}
                          {Math.floor(progressData.weeklyProgress / 20)}{" "}
                          workouts
                        </span>
                        <span>Goal: {progressData.weeklyGoal} workouts</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProgressChart
                    title="Weekly Activity"
                    data={weeklyData}
                    color="#10b981"
                  />
                  <ProgressChart
                    title="Monthly Summary"
                    data={monthlyData}
                    color="#6366f1"
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950/20 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {progressData.averageWorkoutTime} min
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Avg. Workout Time
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-950/20 rounded-lg">
                          <Star className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {progressData.personalBests}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Personal Bests
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Advanced Analytics
                    </CardTitle>
                    <CardDescription>
                      Detailed breakdown of your fitness performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                        <PieChart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <h3 className="font-medium">Workout Distribution</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          40% Strength, 35% Cardio, 25% Flexibility
                        </p>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-medium">Performance Trend</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          +18% improvement this month
                        </p>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
                        <Activity className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                        <h3 className="font-medium">Intensity Score</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          8.2/10 average intensity
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button
                    onClick={exportProgress}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button
                    onClick={shareProgress}
                    variant="outline"
                    className="flex-1"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Progress
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Your Achievements
                    </CardTitle>
                    <CardDescription>
                      Track your fitness milestones and unlock new badges
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="space-y-4">
                  {recentAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`transition-all duration-300 ${achievement.progress === 100 ? "border-green-200 bg-green-50/50 dark:bg-green-950/10" : "hover:shadow-lg"}`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div
                              className={`text-3xl ${achievement.progress === 100 ? "animate-bounce" : ""}`}
                            >
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">
                                  {achievement.title}
                                </h3>
                                {achievement.progress === 100 && (
                                  <Badge className="bg-green-100 text-green-800">
                                    ✓ Unlocked
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {achievement.description}
                              </p>

                              {achievement.progress < 100 ? (
                                <div className="space-y-2">
                                  <Progress
                                    value={achievement.progress}
                                    className="h-2"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    {achievement.progress}% complete
                                  </p>
                                </div>
                              ) : (
                                <p className="text-xs text-green-600 font-medium">
                                  Unlocked {achievement.unlockedAt}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6 mt-0">
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      AI-Powered Insights
                    </CardTitle>
                    <CardDescription>
                      Personalized recommendations based on your progress
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div
                              className={`p-2 rounded-lg bg-muted ${insight.color}`}
                            >
                              <insight.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium mb-1">
                                {insight.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {insight.description}
                              </p>
                            </div>
                            <div className="flex-1 text-right">
                              <Badge variant="outline">
                                {insight.type === "improvement"
                                  ? "Trend"
                                  : insight.type === "recommendation"
                                    ? "Suggestion"
                                    : "Achievement"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  <Card className="overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">
                            Personalized Insight
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Based on your workout patterns, we recommend
                            focusing on upper body strength training this week.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button size="sm">Apply Recommendation</Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
};

export default ProgressPage;

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Calendar, Target, Award, BarChart3, Activity, Flame,
  Clock, Zap, Trophy, Star, Heart, Brain, LineChart, PieChart, Download, Share2, Sparkles,
} from "lucide-react";
import { ProgressChart } from "@/components/progress-chart";

const ProgressPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const data = {
    weeklyGoal: 5, currentStreak: 12, totalWorkouts: 156, caloriesBurned: 45680,
    averageWorkoutTime: 32, personalBests: 8, achievements: 24, weeklyProgress: 80,
  };

  const weeklyData = [
    { name: "Mon", value: 45 }, { name: "Tue", value: 32 }, { name: "Wed", value: 58 },
    { name: "Thu", value: 41 }, { name: "Fri", value: 67 }, { name: "Sat", value: 23 }, { name: "Sun", value: 39 },
  ];
  const monthlyData = [
    { name: "Week 1", value: 4 }, { name: "Week 2", value: 6 }, { name: "Week 3", value: 5 }, { name: "Week 4", value: 7 },
  ];

  const aiInsights = [
    { type: "improvement", title: "Strength Gains Detected", description: "Your performance has improved by 15% this month", icon: TrendingUp, color: "text-accent-foreground" },
    { type: "recommendation", title: "Recovery Day Suggested", description: "Consider a rest day to optimize your progress", icon: Heart, color: "text-primary" },
    { type: "achievement", title: "New Personal Best", description: "You've reached a new milestone in endurance", icon: Trophy, color: "text-accent-foreground" },
  ];

  const achievements = [
    { id: 1, title: "Early Bird", description: "Complete 10 morning workouts", icon: "🌅", progress: 100, unlockedAt: "2 days ago" },
    { id: 2, title: "Consistency Champion", description: "14-day workout streak", icon: "🏆", progress: 100, unlockedAt: "1 week ago" },
    { id: 3, title: "Strength Builder", description: "Complete 50 strength workouts", icon: "💪", progress: 78, unlockedAt: null },
    { id: 4, title: "Cardio King", description: "Burn 10,000 calories", icon: "🔥", progress: 45, unlockedAt: null },
  ];

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify({ data, weeklyData, monthlyData, achievements }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fitfusion-progress-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    toast({ title: "📊 Progress Exported", description: "Your data has been downloaded." });
  };

  const shareProgress = () => {
    if (navigator.share) {
      navigator.share({ title: "My FitFusion Progress", text: `${data.totalWorkouts} workouts, ${data.currentStreak}-day streak!`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${data.totalWorkouts} workouts completed with a ${data.currentStreak}-day streak! 💪`);
      toast({ title: "📋 Copied to clipboard" });
    }
  };

  const fadeUp = { hidden: { y: 12, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-foreground via-primary to-primary/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative pt-12 pb-8 px-4 text-primary-foreground">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Progress</h1>
              </div>
              <p className="text-primary-foreground/70 text-sm">Track your fitness journey</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={shareProgress} className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { icon: Flame, value: data.currentStreak, label: "Streak" },
              { icon: Target, value: data.totalWorkouts, label: "Workouts" },
              { icon: Zap, value: `${(data.caloriesBurned / 1000).toFixed(1)}k`, label: "Calories" },
              { icon: Trophy, value: data.achievements, label: "Awards" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 }}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center border border-primary-foreground/10">
                <s.icon className="h-5 w-5 mx-auto mb-1 text-primary-foreground/80" />
                <div className="text-xl font-bold leading-tight">{s.value}</div>
                <div className="text-[10px] text-primary-foreground/60">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-5 bg-muted/40 backdrop-blur-sm rounded-xl h-10">
            <TabsTrigger value="overview" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><BarChart3 className="h-3.5 w-3.5 mr-1" />Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><LineChart className="h-3.5 w-3.5 mr-1" />Stats</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Award className="h-3.5 w-3.5 mr-1" />Goals</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Brain className="h-3.5 w-3.5 mr-1" />AI</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

              <TabsContent value="overview" className="space-y-4 mt-0">
                <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4" />Weekly Progress</CardTitle>
                        <CardDescription className="text-sm">{data.weeklyProgress}% of weekly goal</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">{Math.floor(data.weeklyProgress / 20)}/{data.weeklyGoal}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={data.weeklyProgress} className="h-2.5 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Current: {Math.floor(data.weeklyProgress / 20)}</span>
                      <span>Goal: {data.weeklyGoal} workouts</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProgressChart title="Weekly Activity" data={weeklyData} color="hsl(var(--primary))" />
                  <ProgressChart title="Monthly Summary" data={monthlyData} color="hsl(var(--accent-foreground))" />
                </div>

                {/* Personal Records Board */}
                <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4 text-accent-foreground" />Personal Records</CardTitle>
                    <CardDescription className="text-sm">Your best performances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { exercise: "Push-ups", record: "52 reps", date: "Mar 5", icon: "💪" },
                        { exercise: "Plank Hold", record: "4m 12s", date: "Mar 2", icon: "⏱️" },
                        { exercise: "Running", record: "5K in 24:30", date: "Feb 28", icon: "🏃" },
                        { exercise: "Deadlift", record: "120 kg", date: "Feb 25", icon: "🏋️" },
                      ].map((pr) => (
                        <div key={pr.exercise} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/10">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{pr.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-foreground">{pr.exercise}</p>
                              <p className="text-[10px] text-muted-foreground">{pr.date}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs font-bold">{pr.record}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Muscle Group Heatmap */}
                <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-primary" />Muscle Activity</CardTitle>
                    <CardDescription className="text-sm">This week's training focus</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { muscle: "Chest", intensity: 85, color: "bg-primary" },
                        { muscle: "Back", intensity: 70, color: "bg-primary/80" },
                        { muscle: "Legs", intensity: 95, color: "bg-primary" },
                        { muscle: "Arms", intensity: 60, color: "bg-primary/60" },
                        { muscle: "Core", intensity: 80, color: "bg-primary/80" },
                        { muscle: "Shoulders", intensity: 45, color: "bg-primary/40" },
                      ].map((m) => (
                        <div key={m.muscle} className="text-center p-2.5 rounded-xl bg-muted/20 border border-border/10">
                          <div className={`w-8 h-8 mx-auto mb-1.5 rounded-full ${m.color} flex items-center justify-center`}>
                            <span className="text-[10px] font-bold text-primary-foreground">{m.intensity}%</span>
                          </div>
                          <p className="text-xs font-medium text-foreground">{m.muscle}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl"><Clock className="h-4 w-4 text-primary" /></div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{data.averageWorkoutTime}m</p>
                          <p className="text-xs text-muted-foreground">Avg Time</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/30 rounded-xl"><Star className="h-4 w-4 text-accent-foreground" /></div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{data.personalBests}</p>
                          <p className="text-xs text-muted-foreground">PBs</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4 mt-0">
                <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><LineChart className="h-4 w-4" />Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { icon: PieChart, title: "Distribution", desc: "40% Strength, 35% Cardio, 25% Flex", color: "bg-primary/5" },
                        { icon: TrendingUp, title: "Trend", desc: "+18% improvement this month", color: "bg-accent/10" },
                        { icon: Activity, title: "Intensity", desc: "8.2/10 average score", color: "bg-primary/5" },
                      ].map((item) => (
                        <div key={item.title} className={`text-center p-4 ${item.color} rounded-xl`}>
                          <item.icon className="h-7 w-7 mx-auto mb-2 text-primary" />
                          <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <div className="flex gap-3">
                  <Button onClick={exportProgress} variant="outline" className="flex-1 rounded-xl h-10 border-border/30"><Download className="h-4 w-4 mr-2" />Export</Button>
                  <Button onClick={shareProgress} variant="outline" className="flex-1 rounded-xl h-10 border-border/30"><Share2 className="h-4 w-4 mr-2" />Share</Button>
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-3 mt-0">
                {achievements.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className={`border-border/20 bg-card/60 backdrop-blur-sm transition-all ${a.progress === 100 ? "border-accent-foreground/30" : ""}`}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{a.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-semibold text-sm text-foreground">{a.title}</h3>
                              {a.progress === 100 && <Badge className="bg-accent text-accent-foreground text-[10px] h-5">✓ Unlocked</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{a.description}</p>
                            {a.progress < 100 ? (
                              <div className="space-y-1">
                                <Progress value={a.progress} className="h-1.5" />
                                <p className="text-[10px] text-muted-foreground">{a.progress}% complete</p>
                              </div>
                            ) : (
                              <p className="text-[10px] text-accent-foreground font-medium">Unlocked {a.unlockedAt}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="insights" className="space-y-3 mt-0">
                <Card className="border-border/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" />AI Insights</CardTitle>
                    <CardDescription className="text-sm">Personalized recommendations</CardDescription>
                  </CardHeader>
                </Card>
                {aiInsights.map((insight, i) => (
                  <motion.div key={insight.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="border-border/20 bg-card/60 backdrop-blur-sm hover:shadow-lg transition-all">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-xl shrink-0">
                            <insight.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm text-foreground mb-0.5">{insight.title}</h3>
                            <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                            <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg border-border/30">Apply</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
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

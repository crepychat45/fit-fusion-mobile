import { ProgressToolkit } from "@/components/extras/page-toolkits";
import React, { useMemo, useState } from "react";
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
  Clock, Zap, Trophy, Star, Heart, Brain, LineChart, Download, Share2, Sparkles,
} from "lucide-react";
import { ProgressChart } from "@/components/progress-chart";
import { SessionHistory } from "@/components/progress/session-history";
import { ProgressPowerExtras } from "@/components/progress/progress-power-extras";
import { ProgressInsightLab } from "@/components/progress/progress-insight-lab";
import { useWorkoutHistory } from "@/hooks/use-workout-history";
import { readJson, writeJson } from "@/lib/safe-storage";

const WEEKLY_GOAL_KEY = "fitfusion-weekly-goal";

const ProgressPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const { sessions, stats } = useWorkoutHistory();
  const [weeklyGoal, setWeeklyGoal] = useState<number>(() => readJson<number>(WEEKLY_GOAL_KEY, 5));

  const done = useMemo(() => sessions.filter((s) => s.status === "completed"), [sessions]);

  // Real charts computed from recorded sessions.
  const weeklyData = useMemo(() => {
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const minutes = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    for (const s of done) {
      const d = new Date(s.completedAt);
      if (d >= start) minutes[d.getDay()] += Math.round(s.durationSec / 60);
    }
    return [1, 2, 3, 4, 5, 6, 0].map((i) => ({ name: labels[i], value: minutes[i] }));
  }, [done]);

  const monthlyData = useMemo(() => {
    const counts = [0, 0, 0, 0];
    const now = Date.now();
    for (const s of done) {
      const ageDays = (now - Date.parse(s.completedAt)) / 86400000;
      if (ageDays < 7) counts[3]++;
      else if (ageDays < 14) counts[2]++;
      else if (ageDays < 21) counts[1]++;
      else if (ageDays < 28) counts[0]++;
    }
    return counts.map((v, i) => ({ name: `Week ${i + 1}`, value: v }));
  }, [done]);

  const avgMinutes = stats.totalSessions ? Math.round(stats.totalMinutes / stats.totalSessions) : 0;
  const weeklyProgress = Math.min(100, Math.round((stats.thisWeek / Math.max(1, weeklyGoal)) * 100));

  // Achievements unlocked by real recorded stats only.
  const achievements = useMemo(() => [
    { id: 1, title: "First Steps", description: "Complete your first workout", icon: "🎯", progress: Math.min(100, stats.totalSessions * 100) },
    { id: 2, title: "Consistency Champion", description: "Reach a 7-day workout streak", icon: "🏆", progress: Math.min(100, Math.round((stats.longestStreak / 7) * 100)) },
    { id: 3, title: "Regular", description: "Complete 10 workouts", icon: "💪", progress: Math.min(100, Math.round((stats.totalSessions / 10) * 100)) },
    { id: 4, title: "Dedicated", description: "Complete 50 workouts", icon: "🔥", progress: Math.min(100, Math.round((stats.totalSessions / 50) * 100)) },
    { id: 5, title: "Time Invested", description: "Train for 10 hours total", icon: "⏱️", progress: Math.min(100, Math.round((stats.totalMinutes / 600) * 100)) },
    { id: 6, title: "Explorer", description: "Try 5 different workouts", icon: "🧭", progress: Math.min(100, Math.round((stats.uniqueWorkouts / 5) * 100)) },
  ], [stats]);

  // Insights derived from real numbers; shown only when there is data.
  const insights = useMemo(() => {
    const list: { title: string; description: string; icon: typeof TrendingUp }[] = [];
    if (stats.totalSessions === 0) {
      list.push({ title: "Start your journey", description: "Complete your first workout and your insights will appear here.", icon: Sparkles });
      return list;
    }
    if (stats.thisWeek >= weeklyGoal) {
      list.push({ title: "Weekly goal reached", description: `You hit ${stats.thisWeek}/${weeklyGoal} workouts this week. Consider raising your goal.`, icon: Trophy });
    } else {
      list.push({ title: "Keep going", description: `${weeklyGoal - stats.thisWeek} more workout${weeklyGoal - stats.thisWeek === 1 ? "" : "s"} to reach this week's goal of ${weeklyGoal}.`, icon: Target });
    }
    if (stats.currentStreak >= 3) {
      list.push({ title: "Streak building", description: `You're on a ${stats.currentStreak}-day streak. A rest or mobility session still counts.`, icon: Flame });
    } else if (stats.currentStreak === 0 && stats.longestStreak > 0) {
      list.push({ title: "Restart your streak", description: `Your longest streak is ${stats.longestStreak} days. One workout today starts a new run.`, icon: Heart });
    }
    if (stats.completionRate < 70 && sessions.length > 2) {
      list.push({ title: "Finish rate", description: `You finish ${stats.completionRate}% of started workouts. Shorter sessions may help you complete more.`, icon: Activity });
    }
    return list;
  }, [stats, weeklyGoal, sessions.length]);

  const saveGoal = (g: number) => {
    const clamped = Math.min(14, Math.max(1, g));
    setWeeklyGoal(clamped);
    writeJson(WEEKLY_GOAL_KEY, clamped);
    toast({ title: "Goal updated", description: `Weekly goal set to ${clamped} workouts.` });
  };

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify({ stats, weeklyGoal, sessions: done }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fitfusion-progress-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    toast({ title: "📊 Progress Exported", description: "Your data has been downloaded." });
  };

  const shareProgress = () => {
    const text = `${stats.totalSessions} workouts, ${stats.currentStreak}-day streak on FitXFusion!`;
    if (navigator.share) {
      navigator.share({ title: "My FitXFusion Progress", text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "📋 Copied to clipboard" });
    }
  };

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
              <Button variant="ghost" size="sm" onClick={shareProgress} className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 p-0" aria-label="Share progress">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { icon: Flame, value: stats.currentStreak, label: "Streak" },
              { icon: Target, value: stats.totalSessions, label: "Workouts" },
              { icon: Zap, value: stats.estimatedCalories >= 1000 ? `${(stats.estimatedCalories / 1000).toFixed(1)}k` : stats.estimatedCalories, label: "Est. Calories" },
              { icon: Trophy, value: achievements.filter((a) => a.progress === 100).length, label: "Awards" },
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
                        <CardDescription className="text-sm">{weeklyProgress}% of weekly goal</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">{stats.thisWeek}/{weeklyGoal}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={weeklyProgress} className="h-2.5 mb-2" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>This week: {stats.thisWeek}</span>
                      <span className="flex items-center gap-1">
                        Goal:
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs" onClick={() => saveGoal(weeklyGoal - 1)} aria-label="Decrease weekly goal">−</Button>
                        <span className="font-semibold text-foreground">{weeklyGoal}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs" onClick={() => saveGoal(weeklyGoal + 1)} aria-label="Increase weekly goal">+</Button>
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProgressChart title="Weekly Activity (minutes)" data={weeklyData} color="hsl(var(--primary))" />
                  <ProgressChart title="Last 4 Weeks (workouts)" data={monthlyData} color="hsl(var(--accent-foreground))" />
                </div>

                {/* Live Session History */}
                <SessionHistory />

                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl"><Clock className="h-4 w-4 text-primary" /></div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{avgMinutes}m</p>
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
                          <p className="text-xl font-bold text-foreground">{stats.longestStreak}d</p>
                          <p className="text-xs text-muted-foreground">Best Streak</p>
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
                        { icon: Target, title: "Unique Workouts", desc: `${stats.uniqueWorkouts} different workouts tried` },
                        { icon: TrendingUp, title: "This Month", desc: `${stats.thisMonth} workouts in the last 30 days` },
                        { icon: Activity, title: "Finish Rate", desc: `${stats.completionRate}% of started workouts completed` },
                      ].map((item) => (
                        <div key={item.title} className="text-center p-4 bg-primary/5 rounded-xl">
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
                <ProgressPowerExtras />
                <ProgressInsightLab />
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
                              <p className="text-[10px] text-accent-foreground font-medium">Unlocked</p>
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
                    <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" />Insights</CardTitle>
                    <CardDescription className="text-sm">Based on your recorded workouts</CardDescription>
                  </CardHeader>
                </Card>
                {insights.map((insight, i) => (
                  <motion.div key={insight.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="border-border/20 bg-card/60 backdrop-blur-sm hover:shadow-lg transition-all">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-xl shrink-0">
                            <insight.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm text-foreground mb-0.5">{insight.title}</h3>
                            <p className="text-xs text-muted-foreground">{insight.description}</p>
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

      <ProgressToolkit />
      <MobileNav />
    </div>
  );
};

export default ProgressPage;

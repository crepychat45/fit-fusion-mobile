import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  Share,
  Trophy,
  Target,
  Flame,
  Clock,
  Activity,
  Zap,
  Award,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

interface ActivityData {
  name: string;
  workouts: number;
  calories: number;
}

interface WeightData {
  name: string;
  weight: number;
}

interface GoalData {
  name: string;
  value: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const weeklyActivity: ActivityData[] = [
  { name: "Mon", workouts: 3, calories: 350 },
  { name: "Tue", workouts: 2, calories: 280 },
  { name: "Wed", workouts: 1, calories: 150 },
  { name: "Thu", workouts: 3, calories: 400 },
  { name: "Fri", workouts: 2, calories: 320 },
  { name: "Sat", workouts: 4, calories: 510 },
  { name: "Sun", workouts: 1, calories: 190 },
];

const weightProgress: WeightData[] = [
  { name: "Week 1", weight: 80 },
  { name: "Week 2", weight: 79.5 },
  { name: "Week 3", weight: 79 },
  { name: "Week 4", weight: 78.3 },
  { name: "Week 5", weight: 77.8 },
  { name: "Week 6", weight: 77.2 },
];

const fitnessGoals: GoalData[] = [
  { name: "Strength", value: 30 },
  { name: "Endurance", value: 25 },
  { name: "Cardio", value: 20 },
  { name: "Flexibility", value: 15 },
  { name: "Balance", value: 10 },
];

export function EnhancedDashboardStats() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("weekly");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);
  const [isCompareMode, setIsCompareMode] = useState(false);

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
  };

  const handleExport = () => {
    setShowExportOptions(true);
    toast({
      title: "Exporting Data",
      description: "Preparing your data for export. This may take a moment.",
    });

    setTimeout(() => {
      setShowExportOptions(false);
      toast({
        title: "Data Exported",
        description: "Your data has been successfully exported.",
      });
    }, 3000);
  };

  const handleShare = () => {
    toast({
      title: "Sharing Stats",
      description: "Sharing your stats with friends and followers.",
    });
  };

  const handleCompare = () => {
    setIsCompareMode(!isCompareMode);
    toast({
      title: "Compare Mode",
      description: isCompareMode
        ? "Compare mode disabled."
        : "Compare mode enabled.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleCompare}>
            {isCompareMode ? "Disable Compare" : "Enable Compare"}
          </Button>
          <Select value={timeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Workouts Completed</CardTitle>
            <CardDescription>Total workouts this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">27</div>
            <div className="text-sm text-muted-foreground">
              <TrendingUp className="inline-block w-4 h-4 mr-1" />
              12% increase from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calories Burned</CardTitle>
            <CardDescription>Total calories burned this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">6,580</div>
            <div className="text-sm text-muted-foreground">
              <TrendingDown className="inline-block w-4 h-4 mr-1" />
              5% decrease from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg. Workout Time</CardTitle>
            <CardDescription>Average workout duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">45 min</div>
            <div className="text-sm text-muted-foreground">
              <TrendingUp className="inline-block w-4 h-4 mr-1" />
              3% increase from last week
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tabs List */}
        <TabsList className="bg-secondary rounded-md p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="detailed"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Detailed Stats
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Achievements
          </TabsTrigger>
          <TabsTrigger
            value="compare"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Compare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Workouts and calories burned</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={weeklyActivity}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      yAxisId="left"
                      label={{
                        value: "Workouts",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle" },
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{
                        value: "Calories",
                        angle: 90,
                        position: "insideRight",
                        style: { textAnchor: "middle" },
                      }}
                    />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="workouts"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="calories"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
                <CardDescription>
                  Your weight over the last 6 weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={weightProgress}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      label={{
                        value: "Weight (kg)",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle" },
                      }}
                    />
                    <Tooltip />
                    <Bar dataKey="weight" fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Alert with proper components */}
          <Alert className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Your performance has improved by 23% this month. Keep up the
              excellent work!
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="detailed" className="mt-6">
          {/* Detailed View */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fitness Goals Distribution</CardTitle>
                <CardDescription>
                  Distribution of your fitness goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={fitnessGoals}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label
                    >
                      {fitnessGoals.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Actions</CardTitle>
                <CardDescription>Export or share your stats</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center space-x-4">
                <Button onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share className="w-4 h-4 mr-2" />
                  Share Stats
                </Button>
              </CardContent>
            </Card>
          </div>

          {showExportOptions && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <Download className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Your data export is ready! Check your downloads folder.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>
                Track your progress and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-600">
                      <Trophy className="inline-block w-5 h-5 mr-2" />
                      Workout Warrior
                    </CardTitle>
                  </CardHeader>
                  <CardContent>Complete 50 workouts.</CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-600">
                      <Flame className="inline-block w-5 h-5 mr-2" />
                      Calorie Crusher
                    </CardTitle>
                  </CardHeader>
                  <CardContent>Burn 10,000 calories.</CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-yellow-600">
                      <Target className="inline-block w-5 h-5 mr-2" />
                      Goal Getter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>Achieve your fitness goal.</CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Compare Statistics</CardTitle>
              <CardDescription>Compare your stats with others</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  This feature is under development. Stay tuned for updates!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

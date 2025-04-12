
import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ProgressChart } from "@/components/progress-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userProfile } from "@/data/user";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid, YAxis } from "recharts";
import { format, subMonths, subYears, getYear, getMonth, startOfMonth, startOfYear, endOfMonth, endOfYear, eachMonthOfInterval, eachYearOfInterval, isSameDay } from "date-fns";
import { Dumbbell, Calendar as CalendarIcon, Activity, Heart, Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Progress as ProgressBar } from "@/components/ui/progress";

const ProgressPage = () => {
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month" | "year">("week");
  const [activeTab, setActiveTab] = useState("activity");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Function to get activity data based on timeframe
  const getActivityData = () => {
    if (timeframe === "day") {
      // Return daily data for the last 7 days
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = format(date, "yyyy-MM-dd");
        const activity = userProfile.dailyActivity[dateKey] || {
          workoutsCompleted: 0, caloriesBurned: 0, avgHeartRate: 0, workoutsDuration: 0
        };
        
        result.push({
          name: format(date, "EEE"),
          minutes: activity.workoutsDuration,
          calories: activity.caloriesBurned,
          workouts: activity.workoutsCompleted,
          heartRate: activity.avgHeartRate
        });
      }
      return result;
    } else if (timeframe === "week") {
      // We'll just use the weekly progress data for this
      return userProfile.weeklyProgress.map(day => ({
        name: day.name,
        minutes: day.value,
        calories: day.name === "Wed" ? 0 : Math.round(day.value * 4.5),
        workouts: day.value > 0 ? 1 : 0,
        heartRate: day.value > 0 ? Math.round(125 + Math.random() * 20) : 0
      }));
    } else if (timeframe === "month") {
      // Return monthly data for the last 6 months
      const result = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = format(date, "yyyy-MM");
        const activity = userProfile.monthlyActivity[monthKey] || {
          workoutsCompleted: 0, caloriesBurned: 0, avgHeartRate: 0, workoutsDuration: 0
        };
        
        result.push({
          name: format(date, "MMM"),
          minutes: activity.workoutsDuration,
          calories: activity.caloriesBurned,
          workouts: activity.workoutsCompleted,
          heartRate: activity.avgHeartRate
        });
      }
      return result;
    } else {
      // Return yearly data
      return Object.keys(userProfile.yearlyActivity).map(year => {
        const activity = userProfile.yearlyActivity[year];
        return {
          name: year,
          minutes: activity.workoutsDuration,
          calories: activity.caloriesBurned,
          workouts: activity.workoutsCompleted,
          heartRate: activity.avgHeartRate
        };
      });
    }
  };
  
  // Get activity data based on current timeframe
  const activityData = getActivityData();
  
  // Calculate total stats for the current timeframe
  const totalStats = activityData.reduce((acc, curr) => ({
    minutes: acc.minutes + (curr.minutes || 0),
    calories: acc.calories + (curr.calories || 0),
    workouts: acc.workouts + (curr.workouts || 0),
    heartRate: curr.heartRate ? acc.heartRate + curr.heartRate : acc.heartRate,
    heartRateCount: curr.heartRate ? acc.heartRateCount + 1 : acc.heartRateCount
  }), { minutes: 0, calories: 0, workouts: 0, heartRate: 0, heartRateCount: 0 });
  
  // Calculate average heart rate (avoid division by zero)
  const avgHeartRate = totalStats.heartRateCount > 0 
    ? Math.round(totalStats.heartRate / totalStats.heartRateCount) 
    : 0;
  
  // Function to render calendar heatmap for activity
  const renderCalendarActivity = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const activity = userProfile.dailyActivity[dateKey];
    
    if (!activity || activity.workoutsCompleted === 0) {
      return null;
    }
    
    // Calculate intensity (1-3) based on workout duration
    const intensity = activity.workoutsDuration <= 30 ? 1 : 
                      activity.workoutsDuration <= 60 ? 2 : 3;
    
    return (
      <div className={`h-full w-full rounded-full ${
        intensity === 1 ? "bg-primary/30" : 
        intensity === 2 ? "bg-primary/60" : "bg-primary"
      }`}>
      </div>
    );
  };
  
  // Function to handle date selection in calendar
  const handleDateSelect = (day: Date) => {
    setSelectedDate(day);
  };
  
  // Get activity for selected date
  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedActivity = userProfile.dailyActivity[selectedDateKey] || {
    workoutsCompleted: 0, caloriesBurned: 0, avgHeartRate: 0, workoutsDuration: 0
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <h1 className="text-xl font-bold text-white mb-2">Your Progress</h1>
        <p className="text-sm text-white/80">Track your fitness journey</p>
      </div>
      
      {/* Summary */}
      <div className="p-4 -mt-6 relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-card/95 backdrop-blur-sm shadow-lg border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Current Goal</h3>
                  <p className="text-muted-foreground text-sm">{userProfile.goal}</p>
                </div>
                <div className="bg-primary p-2 rounded-full text-white text-xs font-medium">
                  In Progress
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <ProgressBar value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Activity Timeframe Selector */}
      <div className="px-4 pt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium">Activity Timeline</h2>
          <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)} className="h-8">
            <TabsList className="h-8">
              <TabsTrigger value="day" className="text-xs h-7 px-2">Daily</TabsTrigger>
              <TabsTrigger value="week" className="text-xs h-7 px-2">Weekly</TabsTrigger>
              <TabsTrigger value="month" className="text-xs h-7 px-2">Monthly</TabsTrigger>
              <TabsTrigger value="year" className="text-xs h-7 px-2">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="shadow-md border border-primary/10 mb-4">
              <CardContent className="p-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
                        contentStyle={{ 
                          backgroundColor: "#fff", 
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.375rem",
                          fontSize: "12px"
                        }}
                        formatter={(value, name) => {
                          if (name === "minutes") return [`${value} min`, "Duration"];
                          if (name === "calories") return [`${value} kcal`, "Calories"];
                          if (name === "workouts") return [`${value}`, "Workouts"];
                          if (name === "heartRate") return [`${value} bpm`, "Heart Rate"];
                          return [value, name];
                        }}
                      />
                      <Bar dataKey="minutes" name="minutes" fill="#8B5CF6" radius={[4, 4, 0, 0]} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="text-center p-2 rounded-lg bg-secondary/30">
                    <Dumbbell className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Workouts</p>
                    <p className="text-lg font-bold">{totalStats.workouts}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-secondary/30">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-lg font-bold">{totalStats.minutes}<span className="text-xs">min</span></p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-secondary/30">
                    <Flame className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Calories</p>
                    <p className="text-lg font-bold">{totalStats.calories}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-secondary/30">
                    <Heart className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                    <p className="text-lg font-bold">{avgHeartRate}<span className="text-xs">bpm</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Stats Tabs */}
      <div className="px-4 pt-2">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="pt-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ProgressChart 
                title="Weekly Activity (minutes)" 
                data={userProfile.weeklyProgress}
              />
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-card rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-xs">Weekly Average</p>
                  <p className="text-xl font-bold mt-1">
                    {Math.round(
                      userProfile.weeklyProgress.reduce((sum, day) => sum + day.value, 0) / 
                      userProfile.weeklyProgress.length
                    )} min
                  </p>
                </div>
                
                <div className="bg-card rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-xs">Total This Week</p>
                  <p className="text-xl font-bold mt-1">
                    {userProfile.weeklyProgress.reduce((sum, day) => sum + day.value, 0)} min
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="weight" className="pt-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ProgressChart 
                title="Weight Progress (kg)" 
                data={userProfile.weightProgress}
                color="#6E59A5"
              />
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-card rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-xs">Starting Weight</p>
                  <p className="text-xl font-bold mt-1">
                    {userProfile.weightProgress[0].value} kg
                  </p>
                </div>
                
                <div className="bg-card rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-xs">Current Weight</p>
                  <p className="text-xl font-bold mt-1">
                    {userProfile.weightProgress[userProfile.weightProgress.length - 1].value} kg
                  </p>
                </div>
                
                <div className="col-span-2 bg-card rounded-lg p-3 text-center mt-2">
                  <p className="text-muted-foreground text-xs">Total Weight Loss</p>
                  <p className="text-xl font-bold mt-1 text-green-600">
                    {(userProfile.weightProgress[0].value - userProfile.weightProgress[userProfile.weightProgress.length - 1].value).toFixed(1)} kg
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="calendar" className="pt-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-primary/10 shadow-md">
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && handleDateSelect(date)}
                    className="rounded-md"
                  />
                </CardContent>
              </Card>
              
              <div className="mt-4">
                <Card className="border border-primary/10 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                        selectedActivity.workoutsCompleted > 0 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {selectedActivity.workoutsCompleted > 0 ? 'Active' : 'Rest day'}
                      </div>
                    </div>
                    
                    {selectedActivity.workoutsCompleted > 0 ? (
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center p-3 rounded-lg bg-secondary/30">
                          <Dumbbell className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <p className="text-xs text-muted-foreground">Workouts</p>
                            <p className="text-lg font-bold">{selectedActivity.workoutsCompleted}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 rounded-lg bg-secondary/30">
                          <Clock className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="text-lg font-bold">{selectedActivity.workoutsDuration} min</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 rounded-lg bg-secondary/30">
                          <Flame className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <p className="text-xs text-muted-foreground">Calories</p>
                            <p className="text-lg font-bold">{selectedActivity.caloriesBurned}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 rounded-lg bg-secondary/30">
                          <Heart className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <p className="text-xs text-muted-foreground">Heart Rate</p>
                            <p className="text-lg font-bold">{selectedActivity.avgHeartRate} bpm</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No workout recorded for this day</p>
                        <Button className="mt-4">Schedule a Workout</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default ProgressPage;

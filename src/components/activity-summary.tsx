
import React, { useState } from "react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserStats } from "@/components/user-stats";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { userProfile } from "@/data/user";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface ActivitySummaryProps {
  className?: string;
}

interface ActivityData {
  name: string;
  value: number;
}

export function ActivitySummary({ className }: ActivitySummaryProps) {
  const [timeframe, setTimeframe] = useState<"day" | "month" | "year">("day");
  
  const getActivityData = (): ActivityData[] => {
    if (timeframe === "day") {
      // Get last 7 days of data
      const today = new Date();
      const result: ActivityData[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = format(date, "yyyy-MM-dd");
        const dayName = format(date, "EEE");
        
        const activity = userProfile.dailyActivity[dateKey] || {
          workoutsCompleted: 0,
          caloriesBurned: 0,
          avgHeartRate: 0,
          workoutsDuration: 0
        };
        
        result.push({
          name: dayName,
          value: activity.workoutsDuration
        });
      }
      
      return result;
    } else if (timeframe === "month") {
      // Get last 6 months of data
      const today = new Date();
      const result: ActivityData[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = format(date, "yyyy-MM");
        const monthName = format(date, "MMM");
        
        const activity = userProfile.monthlyActivity[monthKey] || {
          workoutsCompleted: 0,
          caloriesBurned: 0,
          avgHeartRate: 0,
          workoutsDuration: 0
        };
        
        result.push({
          name: monthName,
          value: activity.workoutsCompleted
        });
      }
      
      return result;
    } else {
      // Get yearly data
      return Object.keys(userProfile.yearlyActivity).map(year => ({
        name: year,
        value: userProfile.yearlyActivity[year].workoutsCompleted
      }));
    }
  };
  
  const getStatsForTimeframe = () => {
    if (timeframe === "day") {
      // Get today's stats
      const today = format(new Date(), "yyyy-MM-dd");
      const todayActivity = userProfile.dailyActivity[today] || {
        workoutsCompleted: 0,
        caloriesBurned: 0,
        avgHeartRate: 0,
        workoutsDuration: 0
      };
      
      return {
        workoutsCompleted: todayActivity.workoutsCompleted,
        caloriesBurned: todayActivity.caloriesBurned,
        avgHeartRate: todayActivity.avgHeartRate,
        streakDays: userProfile.stats.streakDays
      };
    } else if (timeframe === "month") {
      // Get current month's stats
      const currentMonth = format(new Date(), "yyyy-MM");
      const monthActivity = userProfile.monthlyActivity[currentMonth] || {
        workoutsCompleted: 0,
        caloriesBurned: 0,
        avgHeartRate: 0,
        workoutsDuration: 0
      };
      
      return {
        workoutsCompleted: monthActivity.workoutsCompleted,
        caloriesBurned: monthActivity.caloriesBurned,
        avgHeartRate: monthActivity.avgHeartRate,
        streakDays: userProfile.stats.streakDays
      };
    } else {
      // Get current year's stats
      const currentYear = new Date().getFullYear().toString();
      const yearActivity = userProfile.yearlyActivity[currentYear] || {
        workoutsCompleted: 0,
        caloriesBurned: 0,
        avgHeartRate: 0,
        workoutsDuration: 0
      };
      
      return {
        workoutsCompleted: yearActivity.workoutsCompleted,
        caloriesBurned: yearActivity.caloriesBurned,
        avgHeartRate: yearActivity.avgHeartRate,
        streakDays: userProfile.stats.streakDays
      };
    }
  };
  
  const activityData = getActivityData();
  const currentStats = getStatsForTimeframe();
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">Activity Summary</h2>
        <Link to="/progress">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-md border border-primary/10">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">
                {timeframe === "day" 
                  ? "Daily Activity" 
                  : timeframe === "month" 
                    ? "Monthly Progress" 
                    : "Yearly Overview"}
              </CardTitle>
              <Tabs 
                value={timeframe} 
                onValueChange={(value) => setTimeframe(value as "day" | "month" | "year")}
                className="h-8"
              >
                <TabsList className="h-8 px-1">
                  <TabsTrigger className="text-xs h-6 px-2" value="day">Day</TabsTrigger>
                  <TabsTrigger className="text-xs h-6 px-2" value="month">Month</TabsTrigger>
                  <TabsTrigger className="text-xs h-6 px-2" value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.375rem",
                      fontSize: "12px"
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#8B5CF6" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4">
              <UserStats 
                workoutsCompleted={currentStats.workoutsCompleted}
                streakDays={currentStats.streakDays}
                caloriesBurned={currentStats.caloriesBurned}
                avgHeartRate={currentStats.avgHeartRate}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

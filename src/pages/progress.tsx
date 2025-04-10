
import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ProgressChart } from "@/components/progress-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userProfile } from "@/data/user";

const Progress = () => {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="p-4">
        <h1 className="text-xl font-bold mb-2">Your Progress</h1>
        <p className="text-sm text-muted-foreground">Track your fitness journey</p>
      </header>
      
      {/* Summary */}
      <div className="p-4 pt-0">
        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Current Goal</h3>
              <p className="text-muted-foreground text-sm">{userProfile.goal}</p>
            </div>
            <div className="bg-primary p-2 rounded-full text-white text-xs font-medium">
              In Progress
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Tabs */}
      <div className="px-4">
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="pt-4">
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
          </TabsContent>
          
          <TabsContent value="weight" className="pt-4">
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Progress;


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { ProfileEditor } from "@/components/profile-editor";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, BarChart2, ListChecks, Shield, CreditCard, Settings, User, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userProfile } from "@/data/user";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  
  const handleProfileSave = () => {
    // Any additional logic after profile has been saved successfully
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
      </div>
      
      <div className="px-4 py-6">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full max-w-3xl mx-auto"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <ProfileEditor onSave={handleProfileSave} />
            
            {/* Quick Actions Section */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate("/settings")}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <span>Settings</span>
                  </div>
                  <span className="text-xs text-muted-foreground">App Version 3.5.2</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate("/privacy")}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <span>Privacy & Security</span>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate("/subscription")}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span>Subscription</span>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate("/notifications")}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span>Notifications</span>
                  </div>
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="achievements">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Achievements</h2>
              <p className="text-muted-foreground">Track your fitness journey and celebrate milestones.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">First Workout</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">Completed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Successfully completed your first workout.</p>
                </div>
                
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">5 Workouts a Week</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">In Progress</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Maintain a consistent workout schedule.</p>
                </div>
                
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <h3 className="font-medium">30 Day Streak</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">Locked</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Achieve a 30-day workout streak.</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Statistics</h2>
              <p className="text-muted-foreground">Track your progress and see how far you've come.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Workouts Completed</h3>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold">{userProfile.stats.workoutsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Total workouts completed.</p>
                </div>
                
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Calories Burned</h3>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold">{userProfile.stats.caloriesBurned}</p>
                  <p className="text-sm text-muted-foreground">Total calories burned.</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" onClick={() => navigate("/progress")}>View Detailed Stats</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default Profile;


import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Bell, 
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Medal,
  Activity,
  Clock
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UserStats } from "@/components/user-stats";
import { userProfile } from "@/data/user";
import { Link } from "react-router-dom";
import { ProfileAchievements } from "@/components/profile-achievements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  {
    icon: Settings,
    label: "Settings",
    path: "/settings"
  },
  {
    icon: Bell,
    label: "Notifications",
    path: "/notifications"
  },
  {
    icon: Lock,
    label: "Privacy",
    path: "/privacy"
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    path: "/help"
  }
];

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-20 px-4">
        <h1 className="text-xl font-bold text-white">Profile</h1>
      </div>
      
      {/* Profile Card */}
      <div className="px-4 -mt-16 relative z-10">
        <Card className="p-4 shadow">
          <div className="flex items-center">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-background">
                <AvatarFallback className="bg-primary text-white text-xl">
                  {userProfile.name.split(" ").map(word => word[0]).join("")}
                </AvatarFallback>
                <AvatarImage src="/placeholder.svg" />
              </Avatar>
              <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 shadow-md">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{userProfile.name}</h2>
                  <p className="text-sm text-muted-foreground">{userProfile.goal}</p>
                </div>
                <Badge variant="outline" className="bg-secondary/50 text-primary">Pro</Badge>
              </div>
              
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>Member since April 2025</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{userProfile.stats.workoutsCompleted}</p>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{userProfile.stats.streakDays}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{userProfile.stats.caloriesBurned}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
          </div>
          
          <Button variant="default" className="w-full mt-4 bg-primary">
            Edit Profile
          </Button>
        </Card>
      </div>
      
      {/* Stats Summary */}
      <div className="px-4 mt-6">
        <h3 className="font-medium mb-2">Activity Summary</h3>
        <div className="bg-card rounded-lg shadow p-4">
          <UserStats 
            workoutsCompleted={userProfile.stats.workoutsCompleted}
            streakDays={userProfile.stats.streakDays}
            caloriesBurned={userProfile.stats.caloriesBurned}
            avgHeartRate={userProfile.stats.avgHeartRate}
          />
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Card className="bg-secondary/30">
              <CardContent className="p-3 flex items-center space-x-3">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Last Workout</p>
                  <p className="text-xs text-muted-foreground">Upper Body</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/30">
              <CardContent className="p-3 flex items-center space-x-3">
                <Medal className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Level</p>
                  <p className="text-xs text-muted-foreground">Intermediate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Achievements */}
      <div className="px-4 mt-6">
        <ProfileAchievements />
      </div>
      
      {/* Menu */}
      <div className="px-4 mt-6">
        <h3 className="font-medium mb-2">Settings</h3>
        <Card className="shadow overflow-hidden">
          {menuItems.map((item, index) => (
            <Link to={item.path} key={item.label}>
              <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center">
                  <div className="bg-secondary/50 rounded-full p-2 mr-3">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              {index < menuItems.length - 1 && <Separator />}
            </Link>
          ))}
        </Card>
      </div>
      
      {/* Logout */}
      <div className="px-4 mt-6 mb-6">
        <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5" size="lg">
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Profile;

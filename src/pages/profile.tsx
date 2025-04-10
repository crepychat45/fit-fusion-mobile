
import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Bell, 
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UserStats } from "@/components/user-stats";
import { userProfile } from "@/data/user";

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
      <div className="fitness-gradient pt-12 pb-16 px-4">
        <h1 className="text-xl font-bold text-white">Profile</h1>
      </div>
      
      {/* Profile Card */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-white">
                {userProfile.name.split(" ").map(word => word[0]).join("")}
              </AvatarFallback>
            </Avatar>
            
            <div className="ml-4">
              <h2 className="font-semibold text-lg">{userProfile.name}</h2>
              <p className="text-sm text-muted-foreground">{userProfile.goal}</p>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            Edit Profile
          </Button>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="px-4 mt-6">
        <h3 className="font-medium mb-2">Activity Summary</h3>
        <UserStats 
          workoutsCompleted={userProfile.stats.workoutsCompleted}
          streakDays={userProfile.stats.streakDays}
          caloriesBurned={userProfile.stats.caloriesBurned}
          avgHeartRate={userProfile.stats.avgHeartRate}
        />
      </div>
      
      {/* Menu */}
      <div className="px-4 mt-6">
        <h3 className="font-medium mb-2">Settings</h3>
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <div className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center">
                  <item.icon className="h-5 w-5 text-muted-foreground mr-3" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              {index < menuItems.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Logout */}
      <div className="px-4 mt-6">
        <Button variant="outline" className="w-full text-destructive" size="lg">
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

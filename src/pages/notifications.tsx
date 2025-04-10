
import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft, Bell, BellOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

const NotificationsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="text-white p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">Notifications</h1>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="px-4 py-6">
        <div className="bg-card rounded-lg shadow-sm mb-6">
          <div className="p-4">
            <h3 className="font-medium mb-4">Notification Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="workout-reminders" className="font-medium">Workout Reminders</Label>
                  <p className="text-sm text-muted-foreground">Daily workout notifications</p>
                </div>
                <Switch id="workout-reminders" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="achievement" className="font-medium">Achievements</Label>
                  <p className="text-sm text-muted-foreground">Notify when you earn achievements</p>
                </div>
                <Switch id="achievement" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="new-features" className="font-medium">App Updates</Label>
                  <p className="text-sm text-muted-foreground">New features and improvements</p>
                </div>
                <Switch id="new-features" defaultChecked />
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Notifications */}
        <h3 className="font-medium mb-3">Recent Notifications</h3>
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Workout Reminder</p>
                <p className="text-sm text-muted-foreground">Time for your scheduled upper body workout!</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Achievement Unlocked!</p>
                <p className="text-sm text-muted-foreground">You've completed 25 workouts. Great job!</p>
                <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">New Feature Available</p>
                <p className="text-sm text-muted-foreground">Check out our new workout analytics dashboard!</p>
                <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default NotificationsPage;

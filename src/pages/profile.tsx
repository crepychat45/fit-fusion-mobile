
import React, { useState } from "react";
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
  Medal,
  Activity,
  Clock,
  Edit,
  Camera,
  MessageCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UserStats } from "@/components/user-stats";
import { userProfile } from "@/data/user";
import { Link } from "react-router-dom";
import { ProfileAchievements } from "@/components/profile-achievements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AIChatbot } from "@/components/ai-chatbot";
import { ProfilePhotoUpload } from "@/components/profile-photo-upload";
import { AuthForm } from "@/components/auth/auth-form";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [showAuth, setShowAuth] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { toast } = useToast();
  
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };
  
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-20 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 rounded-full"
            onClick={() => setShowChatbot(true)}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Profile Card */}
      <div className="px-4 -mt-16 relative z-10">
        <Card className="p-4 shadow">
          <div className="flex items-center">
            <div className="relative">
              <ProfilePhotoUpload name={userProfile.name} />
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{userProfile.name}</h2>
                  <p className="text-sm text-muted-foreground">{userProfile.goal}</p>
                </div>
                {userProfile.isPro && (
                  <Badge variant="outline" className="bg-secondary/50 text-primary">Pro</Badge>
                )}
              </div>
              
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>Member since {userProfile.memberSince}</span>
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
          
          <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
            <DialogTrigger asChild>
              <Button variant="default" className="w-full mt-4 bg-primary">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile Info</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="space-y-4 mt-4">
                    <div className="flex flex-col items-center mb-4">
                      <ProfilePhotoUpload name={userProfile.name} />
                      <p className="text-sm text-muted-foreground mt-2">Tap to change photo</p>
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">Name</label>
                        <input 
                          id="name" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          defaultValue={userProfile.name}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="goal" className="text-sm font-medium">Fitness Goal</label>
                        <input 
                          id="goal" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          defaultValue={userProfile.goal}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="level" className="text-sm font-medium">Fitness Level</label>
                        <select 
                          id="level" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          defaultValue={userProfile.level}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                    
                    <Button className="w-full">Save Changes</Button>
                  </TabsContent>
                  
                  <TabsContent value="account" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <input 
                          id="email" 
                          type="email"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          defaultValue="john.smith@example.com"
                        />
                      </div>
                      
                      <Button variant="outline" className="w-full">Change Password</Button>
                      <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5">
                        Delete Account
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
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
                  <p className="text-xs text-muted-foreground">{userProfile.lastWorkout}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/30">
              <CardContent className="p-3 flex items-center space-x-3">
                <Medal className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Level</p>
                  <p className="text-xs text-muted-foreground">{userProfile.level}</p>
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
      
      {/* Authentication Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md p-0">
          <AuthForm />
        </DialogContent>
      </Dialog>
      
      {/* Chatbot Dialog */}
      <Dialog open={showChatbot} onOpenChange={setShowChatbot}>
        <DialogContent className="sm:max-w-md p-0 h-[600px]">
          <AIChatbot />
        </DialogContent>
      </Dialog>
      
      {/* Logout */}
      <div className="px-4 mt-6 mb-6">
        <Button 
          variant="outline" 
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/5" 
          size="lg"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
      
      {/* Footer */}
      <div className="px-4 mt-6 mb-20 text-center text-xs text-muted-foreground">
        <p>FitFusion © 2025 By Junedkhan</p>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Profile;

import React, { useState, useEffect, useNavigate } from "react";
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
  MessageCircle,
  RefreshCcw
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UserStats } from "@/components/user-stats";
import { userProfile as initialUserProfile } from "@/data/user";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { AIChatbot } from "@/components/ai-chatbot";
import { ProfilePhotoUpload } from "@/components/profile-photo-upload";
import { AuthForm } from "@/components/auth/auth-form";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const navigate = useNavigate();
  
  const loadSavedProfileData = () => {
    try {
      const savedName = localStorage.getItem('profileName');
      const savedGoal = localStorage.getItem('profileGoal');
      const savedLevel = localStorage.getItem('profileLevel');
      const savedEmail = localStorage.getItem('profileEmail');
      const savedImage = localStorage.getItem('profileImage');
      
      return {
        name: savedName || initialUserProfile.name,
        goal: savedGoal || initialUserProfile.goal,
        level: savedLevel || initialUserProfile.level,
        email: savedEmail || "john.smith@example.com",
        image: savedImage || null
      };
    } catch (error) {
      console.error("Error loading profile data from localStorage:", error);
      return {
        name: initialUserProfile.name,
        goal: initialUserProfile.goal,
        level: initialUserProfile.level,
        email: "john.smith@example.com",
        image: null
      };
    }
  };

  const [showAuth, setShowAuth] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const savedData = loadSavedProfileData();
  const [profileImage, setProfileImage] = useState<string | null>(savedData.image);
  const [profileData, setProfileData] = useState({
    name: savedData.name,
    goal: savedData.goal,
    level: savedData.level,
    email: savedData.email
  });
  
  const { toast } = useToast();
  
  const profileForm = useForm({
    defaultValues: {
      name: profileData.name,
      goal: profileData.goal,
      level: profileData.level,
    }
  });
  
  const accountForm = useForm({
    defaultValues: {
      email: profileData.email,
    }
  });
  
  useEffect(() => {
    profileForm.reset({
      name: profileData.name,
      goal: profileData.goal,
      level: profileData.level,
    });
    
    accountForm.reset({
      email: profileData.email,
    });
  }, [profileData, profileForm, accountForm]);
  
  const handleSaveProfileChanges = (data: any) => {
    const newProfileData = {
      ...profileData,
      name: data.name,
      goal: data.goal,
      level: data.level
    };
    
    setProfileData(newProfileData);
    
    try {
      localStorage.setItem('profileName', data.name);
      localStorage.setItem('profileGoal', data.goal);
      localStorage.setItem('profileLevel', data.level);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving profile data to localStorage:", error);
      toast({
        title: "Error saving profile",
        description: "Unable to save your profile information",
        variant: "destructive"
      });
    }
    
    setShowEditProfile(false);
  };
  
  const handleSaveAccountChanges = (data: any) => {
    const newProfileData = {
      ...profileData,
      email: data.email
    };
    
    setProfileData(newProfileData);
    
    try {
      localStorage.setItem('profileEmail', data.email);
      
      toast({
        title: "Account updated",
        description: "Your account information has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving account data to localStorage:", error);
      toast({
        title: "Error saving account",
        description: "Unable to save your account information",
        variant: "destructive"
      });
    }
    
    setShowEditProfile(false);
  };
  
  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "Your account deletion request has been submitted.",
      variant: "destructive"
    });
    setShowEditProfile(false);
  };
  
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const handleProfilePhotoUpdate = (imageUrl: string) => {
    setProfileImage(imageUrl);
    
    try {
      localStorage.setItem('profileImage', imageUrl);
    } catch (error) {
      console.error("Error saving profile image to localStorage:", error);
    }
  };
  
  const resetProfile = () => {
    setProfileData({
      name: initialUserProfile.name,
      goal: initialUserProfile.goal,
      level: initialUserProfile.level,
      email: "john.smith@example.com"
    });
    
    setProfileImage(null);
    
    try {
      localStorage.removeItem('profileName');
      localStorage.removeItem('profileGoal');
      localStorage.removeItem('profileLevel');
      localStorage.removeItem('profileEmail');
      localStorage.removeItem('profileImage');
      
      toast({
        title: "Profile reset",
        description: "Your profile has been reset to default settings",
      });
    } catch (error) {
      console.error("Error clearing profile data from localStorage:", error);
    }
    
    setShowResetConfirm(false);
  };
  
  return (
    <div className="min-h-screen bg-background pb-16">
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
      
      <div className="px-4 -mt-16 relative z-10">
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="p-4 shadow-lg border-primary/10">
            <div className="flex items-center">
              <div className="relative">
                <ProfilePhotoUpload 
                  name={profileData.name} 
                  initialImage={profileImage}
                  onImageUpdate={handleProfilePhotoUpdate}
                />
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-lg">{profileData.name}</h2>
                    <p className="text-sm text-muted-foreground">{profileData.goal}</p>
                  </div>
                  {initialUserProfile.isPro && (
                    <Badge variant="outline" className="bg-secondary/50 text-primary">Pro</Badge>
                  )}
                </div>
                
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>Member since {initialUserProfile.memberSince}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{initialUserProfile.stats.workoutsCompleted}</p>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{initialUserProfile.stats.streakDays}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{initialUserProfile.stats.caloriesBurned}</p>
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
                  <DialogDescription>
                    Make changes to your profile information here.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="profile">Profile Info</TabsTrigger>
                      <TabsTrigger value="account">Account</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="space-y-4 mt-4">
                      <div className="flex flex-col items-center mb-4">
                        <ProfilePhotoUpload 
                          name={profileData.name}
                          initialImage={profileImage}
                          onImageUpdate={handleProfilePhotoUpdate}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Tap to change photo</p>
                      </div>
                      
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(handleSaveProfileChanges)} className="space-y-4">
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="goal"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fitness Goal</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="level"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fitness Level</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" className="w-full">Save Changes</Button>
                        </form>
                      </Form>
                    </TabsContent>
                    
                    <TabsContent value="account" className="space-y-4 mt-4">
                      <Form {...accountForm}>
                        <form onSubmit={accountForm.handleSubmit(handleSaveAccountChanges)} className="space-y-4">
                          <FormField
                            control={accountForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" className="w-full">Save Changes</Button>
                        </form>
                      </Form>
                      
                      <div className="pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            navigate("/privacy");
                            toast({
                              title: "Change password",
                              description: "Navigate to Privacy & Security to change your password",
                            });
                          }}
                        >
                          Change Password
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full mt-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                          onClick={handleDeleteAccount}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </motion.div>
      </div>
      
      <div className="px-4 mt-6">
        <h3 className="font-medium mb-2">Activity Summary</h3>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-lg shadow-lg p-4 border border-primary/5"
        >
          <UserStats 
            workoutsCompleted={initialUserProfile.stats.workoutsCompleted}
            streakDays={initialUserProfile.stats.streakDays}
            caloriesBurned={initialUserProfile.stats.caloriesBurned}
            avgHeartRate={initialUserProfile.stats.avgHeartRate}
          />
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
              <Card className="bg-secondary/30 hover:bg-secondary/40 transition-colors duration-300">
                <CardContent className="p-3 flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Last Workout</p>
                    <p className="text-xs text-muted-foreground">{initialUserProfile.lastWorkout}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
              <Card className="bg-secondary/30 hover:bg-secondary/40 transition-colors duration-300">
                <CardContent className="p-3 flex items-center space-x-3">
                  <Medal className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Level</p>
                    <p className="text-xs text-muted-foreground">{profileData.level}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <div className="px-4 mt-6">
        <ProfileAchievements />
      </div>
      
      <div className="px-4 mt-6">
        <h3 className="font-medium mb-2">Settings</h3>
        <Card className="shadow-lg overflow-hidden border border-primary/5">
          {menuItems.map((item, index) => (
            <Link to={item.path} key={item.label}>
              <motion.div 
                whileHover={{ 
                  backgroundColor: "rgba(var(--muted), 0.2)",
                  x: 5 
                }}
                className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="bg-secondary/50 rounded-full p-2 mr-3">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
              {index < menuItems.length - 1 && <Separator />}
            </Link>
          ))}
        </Card>
      </div>
      
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset your profile to default settings. All your customizations will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetProfile}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md p-0">
          <AuthForm />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showChatbot} onOpenChange={setShowChatbot}>
        <DialogContent className="sm:max-w-md p-0 h-[600px]">
          <AIChatbot />
        </DialogContent>
      </Dialog>
      
      <div className="px-4 mt-6 flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-2" 
          onClick={() => setShowResetConfirm(true)}
        >
          <RefreshCcw className="h-4 w-4" />
          Reset Profile
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/5" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
      
      <div className="px-4 mt-6 mb-20 text-center text-xs text-muted-foreground">
        <p>FitFusion © 2025 By Junedkhan</p>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default Profile;

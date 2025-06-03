
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { ProfileEditor } from "@/components/profile-editor";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, BarChart2, ListChecks, Shield, CreditCard, Settings, User, Bell, RefreshCw, Award, Medal, Trophy, BookOpen, Clock, Zap, Target, Flame, TrendingUp, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userProfile } from "@/data/user";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileAchievements } from "@/components/profile-achievements";
import { EnhancedDashboardStats } from "@/components/enhanced-dashboard-stats";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [currentVersion, setCurrentVersion] = useState("4.9.2"); // Updated to latest version
  const [profileData, setProfileData] = useState(userProfile);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  
  // Load saved profile data and sync with local storage
  useEffect(() => {
    const savedProfile = localStorage.getItem('fitfusion-profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileData({ ...userProfile, ...parsed });
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
    
    // Check for app version updates
    const savedVersion = localStorage.getItem('app_version');
    if (savedVersion && savedVersion !== currentVersion) {
      setCurrentVersion(savedVersion);
    } else if (!savedVersion) {
      localStorage.setItem('app_version', currentVersion);
    }
  }, [currentVersion]);
  
  const handleProfileSave = () => {
    setLastSyncTime(new Date());
    toast({
      title: "✅ Profile Updated",
      description: "Your profile has been successfully updated and synced.",
    });
  };

  const handleVersionCheck = () => {
    // Simulate version check
    toast({
      title: "🔄 Checking for Updates",
      description: "Looking for the latest version...",
    });
    
    setTimeout(() => {
      const latestVersion = "4.9.2";
      localStorage.setItem('app_version', latestVersion);
      setCurrentVersion(latestVersion);
      
      toast({
        title: "✅ Up to Date",
        description: `You're running the latest version ${latestVersion}`,
      });
    }, 2000);
  };

  const newFeatures = [
    {
      icon: Zap,
      title: "AI Workout Recommendations",
      description: "Personalized workout suggestions based on your progress",
      isNew: true
    },
    {
      icon: Target,
      title: "Smart Goal Tracking",
      description: "Advanced goal setting with milestone tracking",
      isNew: true
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Detailed insights into your fitness journey",
      isNew: false
    }
  ];
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-black/20" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative pt-12 pb-8 px-4 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-white/80 text-sm">
                Welcome back, {profileData.name}! 👋
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  v{currentVersion}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20"
                  onClick={handleVersionCheck}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-white/70">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{profileData.stats.workoutsCompleted}</div>
              <div className="text-xs text-white/80">Workouts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{profileData.stats.streakDays}</div>
              <div className="text-xs text-white/80">Day Streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{Math.round(profileData.stats.caloriesBurned / 1000)}k</div>
              <div className="text-xs text-white/80">Calories</div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="px-4 py-6">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full max-w-4xl mx-auto"
        >
          <TabsList className="grid grid-cols-4 mb-6 bg-muted/50">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart2 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Star className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="profile" className="space-y-6 mt-0">
                <ProfileEditor onSave={handleProfileSave} />
                
                {/* Enhanced Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Manage your app settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-between h-auto p-4"
                        onClick={() => navigate("/settings")}
                      >
                        <div className="flex items-center gap-3">
                          <Settings className="h-5 w-5 text-primary" />
                          <div className="text-left">
                            <div className="font-medium">Settings</div>
                            <div className="text-xs text-muted-foreground">App preferences</div>
                          </div>
                        </div>
                        <Badge variant="outline">v{currentVersion}</Badge>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-between h-auto p-4"
                        onClick={() => navigate("/privacy")}
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-green-600" />
                          <div className="text-left">
                            <div className="font-medium">Privacy & Security</div>
                            <div className="text-xs text-muted-foreground">Data protection</div>
                          </div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-between h-auto p-4"
                        onClick={() => navigate("/subscription")}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-amber-600" />
                          <div className="text-left">
                            <div className="font-medium">Subscription</div>
                            <div className="text-xs text-muted-foreground">Manage billing</div>
                          </div>
                        </div>
                        {profileData.isPro && <Badge>Pro</Badge>}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-between h-auto p-4"
                        onClick={() => navigate("/notifications")}
                      >
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-blue-600" />
                          <div className="text-left">
                            <div className="font-medium">Notifications</div>
                            <div className="text-xs text-muted-foreground">Alert preferences</div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recent Activity Enhanced */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium">New Achievement Unlocked!</h4>
                        </div>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        You've earned the "Early Riser" badge for completing 5 morning workouts.
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">+50 XP</Badge>
                        <Badge variant="outline">Achievement</Badge>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Flame className="h-5 w-5 text-amber-500" />
                          <h4 className="font-medium">Workout Streak</h4>
                        </div>
                        <span className="text-xs text-muted-foreground">Yesterday</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        You're on a {profileData.stats.streakDays}-day workout streak! Keep going!
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{profileData.stats.streakDays} days</span>
                          <span>30 days goal</span>
                        </div>
                        <Progress value={(profileData.stats.streakDays / 30) * 100} className="h-2" />
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="achievements" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Your Achievements
                    </CardTitle>
                    <CardDescription>
                      Track your fitness journey and celebrate milestones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileAchievements />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="stats" className="mt-0">
                <EnhancedDashboardStats />
              </TabsContent>
              
              <TabsContent value="features" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      New Features & Updates
                    </CardTitle>
                    <CardDescription>
                      Discover what's new in version {currentVersion}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {newFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className={`rounded-full p-2 ${feature.isNew ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <feature.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{feature.title}</h3>
                            {feature.isNew && (
                              <Badge className="bg-primary text-primary-foreground text-xs">NEW</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                    
                    <div className="pt-4 border-t">
                      <Button className="w-full" onClick={() => navigate("/settings")}>
                        <Settings className="h-4 w-4 mr-2" />
                        Explore All Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default Profile;

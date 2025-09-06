import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { ProfileEditor } from "@/components/profile-editor";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Shield,
  CreditCard,
  Settings,
  User,
  Bell,
  RefreshCw,
  Trophy,
  Activity,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userProfile } from "@/data/user";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [currentVersion, setCurrentVersion] = useState("5.0.2");
  const [profileData, setProfileData] = useState(userProfile);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  useEffect(() => {
    const savedProfile = localStorage.getItem("fitfusion-profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileData({ ...userProfile, ...parsed });
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }

    const savedVersion = localStorage.getItem("fitfusion-app-version");
    if (savedVersion) {
      setCurrentVersion(savedVersion);
    }
  }, []);

  const handleProfileSave = () => {
    setLastSyncTime(new Date());
    toast({
      title: "✅ Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleVersionCheck = () => {
    toast({
      title: "🔄 Checking for Updates",
      description: "Looking for the latest version...",
    });

    setTimeout(() => {
      toast({
        title: "✅ Up to Date",
        description: `You're running the latest version ${currentVersion}!`,
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
        <div className="absolute inset-0 bg-black/10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative pt-12 pb-8 px-4 text-primary-foreground"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-primary-foreground/80 text-sm">
                Welcome back, {profileData?.name || "User"}! 👋
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
              <p className="text-xs text-primary-foreground/70">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">
                {profileData?.stats?.workoutsCompleted || 0}
              </div>
              <div className="text-xs text-primary-foreground/80">Workouts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">
                {profileData?.stats?.streakDays || 0}
              </div>
              <div className="text-xs text-primary-foreground/80">Day Streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">
                {Math.round((profileData?.stats?.caloriesBurned || 0) / 1000)}k
              </div>
              <div className="text-xs text-primary-foreground/80">Calories</div>
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
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Activity className="h-4 w-4 mr-2" />
              Stats
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

                {/* Quick Actions */}
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
                            <div className="text-xs text-muted-foreground">
                              App preferences
                            </div>
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
                            <div className="text-xs text-muted-foreground">
                              Data protection
                            </div>
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
                            <div className="text-xs text-muted-foreground">
                              Manage billing
                            </div>
                          </div>
                        </div>
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
                            <div className="text-xs text-muted-foreground">
                              Alert preferences
                            </div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and privacy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Biometric Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Use fingerprint or face recognition
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Setup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>
                      Track your fitness milestones and accomplishments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex flex-col items-center p-4 border rounded-lg">
                        <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
                        <h4 className="font-medium text-sm">First Workout</h4>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="flex flex-col items-center p-4 border rounded-lg">
                        <Shield className="h-8 w-8 text-blue-500 mb-2" />
                        <h4 className="font-medium text-sm">7-Day Streak</h4>
                        <p className="text-xs text-muted-foreground">Unlocked</p>
                      </div>
                      <div className="flex flex-col items-center p-4 border rounded-lg opacity-50">
                        <Activity className="h-8 w-8 text-gray-400 mb-2" />
                        <h4 className="font-medium text-sm">30-Day Challenge</h4>
                        <p className="text-xs text-muted-foreground">Locked</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Fitness Statistics</CardTitle>
                    <CardDescription>
                      Your fitness journey at a glance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {profileData?.stats?.workoutsCompleted || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Workouts
                          </div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {profileData?.stats?.streakDays || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Current Streak
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {Math.round((profileData?.stats?.caloriesBurned || 0) / 1000)}k
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Calories Burned
                        </div>
                      </div>
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
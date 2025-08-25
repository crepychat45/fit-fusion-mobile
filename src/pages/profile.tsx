import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { ProfileEditor } from "@/components/profile-editor";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CheckCircle,
  BarChart2,
  ListChecks,
  Shield,
  CreditCard,
  Settings,
  User,
  Bell,
  RefreshCw,
  Award,
  Medal,
  Trophy,
  BookOpen,
  Clock,
  Zap,
  Target,
  Flame,
  TrendingUp,
  Star,
  Activity,
  Download,
  Share2,
  FileText,
  Gift,
  Smartphone,
  Wallet,
  Users,
  BellRing,
  HelpCircle,
  Heart,
  LogOut,
  Lock,
  UserCog,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userProfile } from "@/data/user";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileAchievements } from "@/components/profile-achievements";
import { EnhancedDashboardStats } from "@/components/enhanced-dashboard-stats";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [currentVersion, setCurrentVersion] = useState("5.0.4"); // Updated to latest version
  const [profileData, setProfileData] = useState(userProfile);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataSync, setDataSync] = useState(true);

  // Load saved profile data and sync with local storage
  useEffect(() => {
    const savedProfile = localStorage.getItem("fitfusion-profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileData({ ...userProfile, ...parsed });

        // Check for subscription status
        if (parsed.isPro) {
          setIsSubscriptionActive(true);
          setSubscriptionTier(parsed.subscriptionTier || "Pro");
        }

        // Check for auth settings
        setBiometricAuth(parsed.biometricAuth || false);
        setTwoFactorAuth(parsed.twoFactorAuth || false);
        setNotificationsEnabled(parsed.notificationsEnabled !== false);
        setDataSync(parsed.dataSync !== false);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }

    // Check for app version updates
    const savedVersion = localStorage.getItem("app_version");
    if (savedVersion && savedVersion !== currentVersion) {
      setCurrentVersion(savedVersion);
    } else {
      localStorage.setItem("app_version", currentVersion);
    }
  }, [currentVersion]);

  const handleProfileSave = () => {
    setLastSyncTime(new Date());
    toast({
      title: "✅ Profile Updated",
      description:
        "Your profile has been successfully updated and synced to cloud.",
    });
  };

  const handleVersionCheck = () => {
    // Simulate version check
    toast({
      title: "🔄 Checking for Updates",
      description: "Looking for the latest version...",
    });

    setTimeout(() => {
      const latestVersion = "5.0.4";
      localStorage.setItem("app_version", latestVersion);
      setCurrentVersion(latestVersion);

      toast({
        title: "✅ Up to Date",
        description: `You're running the latest version ${latestVersion}`,
      });
    }, 2000);
  };

  const toggleSubscription = () => {
    const newStatus = !isSubscriptionActive;
    setIsSubscriptionActive(newStatus);

    // Update local storage
    const savedProfile = localStorage.getItem("fitfusion-profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        parsed.isPro = newStatus;
        parsed.subscriptionTier = newStatus ? "Pro" : null;
        localStorage.setItem("fitfusion-profile", JSON.stringify(parsed));
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }

    toast({
      title: newStatus
        ? "✨ Subscription Activated"
        : "Subscription Deactivated",
      description: newStatus
        ? "You now have access to premium features!"
        : "Your premium access has been deactivated.",
    });
  };

  const toggleBiometricAuth = () => {
    setBiometricAuth(!biometricAuth);
    toast({
      title: biometricAuth
        ? "Biometric Authentication Disabled"
        : "Biometric Authentication Enabled",
      description: biometricAuth
        ? "Fingerprint/Face ID login has been disabled."
        : "You can now log in using your fingerprint or face ID.",
    });
  };

  const toggleTwoFactorAuth = () => {
    setTwoFactorAuth(!twoFactorAuth);
    toast({
      title: twoFactorAuth
        ? "Two-Factor Authentication Disabled"
        : "Two-Factor Authentication Enabled",
      description: twoFactorAuth
        ? "2FA has been disabled for your account."
        : "Your account is now more secure with 2FA.",
    });
  };

  const handleExportData = () => {
    // Create data export
    const exportData = {
      profile: profileData,
      settings: {
        biometricAuth,
        twoFactorAuth,
        notificationsEnabled,
        dataSync,
      },
      subscription: {
        active: isSubscriptionActive,
        tier: subscriptionTier,
      },
      exportedAt: new Date().toISOString(),
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fitfusion-data-export.json";
    a.click();

    toast({
      title: "📊 Data Exported",
      description: "Your data has been exported successfully.",
    });
  };

  const newFeatures = [
    {
      icon: Brain,
      title: "AI Workout Recommendations",
      description: "Personalized workout suggestions based on your progress",
      isNew: true,
    },
    {
      icon: Target,
      title: "Smart Goal Tracking",
      description: "Advanced goal setting with milestone tracking",
      isNew: true,
    },
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "Biometric authentication & end-to-end encryption",
      isNew: true,
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Detailed insights into your fitness journey",
      isNew: false,
    },
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
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
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
              <div className="text-2xl font-bold">
                {profileData.stats.workoutsCompleted}
              </div>
              <div className="text-xs text-white/80">Workouts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">
                {profileData.stats.streakDays}
              </div>
              <div className="text-xs text-white/80">Day Streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">
                {Math.round(profileData.stats.caloriesBurned / 1000)}k
              </div>
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
          <TabsList className="grid grid-cols-5 mb-6 bg-muted/50">
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
              <BarChart2 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
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
                            <div className="font-medium">
                              Privacy & Security
                            </div>
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
                        {isSubscriptionActive && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                            {subscriptionTier}
                          </Badge>
                        )}
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

                {/* Recent Activity Enhanced */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Your latest fitness milestones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-[300px] pr-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 mb-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-green-600" />
                            <h4 className="font-medium">
                              New Achievement Unlocked!
                            </h4>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            2 hours ago
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          You've earned the "Early Riser" badge for completing 5
                          morning workouts.
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            +50 XP
                          </Badge>
                          <Badge variant="outline">Achievement</Badge>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4 mb-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Flame className="h-5 w-5 text-amber-500" />
                            <h4 className="font-medium">Workout Streak</h4>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Yesterday
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          You're on a {profileData.stats.streakDays}-day workout
                          streak! Keep going!
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{profileData.stats.streakDays} days</span>
                            <span>30 days goal</span>
                          </div>
                          <Progress
                            value={(profileData.stats.streakDays / 30) * 100}
                            className="h-2"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 mb-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Medal className="h-5 w-5 text-blue-600" />
                            <h4 className="font-medium">Personal Record</h4>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            3 days ago
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          You've set a new personal best for bench press: 185
                          lbs!
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            +75 XP
                          </Badge>
                          <Badge variant="outline">Personal Best</Badge>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 mb-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-purple-600" />
                            <h4 className="font-medium">
                              New AI Recommendation
                            </h4>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            5 days ago
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Based on your progress, our AI suggests focusing more
                          on upper body strength this week.
                        </p>
                        <Button size="sm" variant="secondary">
                          View Recommendation
                        </Button>
                      </motion.div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Security & Privacy
                    </CardTitle>
                    <CardDescription>
                      Manage your account security and privacy preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Authentication</h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label
                            htmlFor="biometric"
                            className="text-base font-medium"
                          >
                            Biometric Authentication
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Use fingerprint or face recognition to log in
                          </p>
                        </div>
                        <Switch
                          id="biometric"
                          checked={biometricAuth}
                          onCheckedChange={toggleBiometricAuth}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label
                            htmlFor="twoFactor"
                            className="text-base font-medium"
                          >
                            Two-Factor Authentication
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Receive a code on your phone for added security
                          </p>
                        </div>
                        <Switch
                          id="twoFactor"
                          checked={twoFactorAuth}
                          onCheckedChange={toggleTwoFactorAuth}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold">Data & Privacy</h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label
                            htmlFor="notifications"
                            className="text-base font-medium"
                          >
                            Push Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Receive alerts for workout reminders and updates
                          </p>
                        </div>
                        <Switch
                          id="notifications"
                          checked={notificationsEnabled}
                          onCheckedChange={() =>
                            setNotificationsEnabled(!notificationsEnabled)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label
                            htmlFor="dataSync"
                            className="text-base font-medium"
                          >
                            Data Synchronization
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Sync your workout data across devices
                          </p>
                        </div>
                        <Switch
                          id="dataSync"
                          checked={dataSync}
                          onCheckedChange={() => setDataSync(!dataSync)}
                        />
                      </div>

                      <div className="flex flex-col gap-2 mt-4">
                        <Button
                          onClick={handleExportData}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export My Data
                        </Button>

                        <Button variant="destructive" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Request Account Deletion
                        </Button>
                      </div>
                    </div>
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
                        <div
                          className={`rounded-full p-2 ${feature.isNew ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                        >
                          <feature.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{feature.title}</h3>
                            {feature.isNew && (
                              <Badge className="bg-primary text-primary-foreground text-xs">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {/* Subscription Card */}
                    <Card className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-amber-600" />
                          {isSubscriptionActive
                            ? "Your Premium Subscription"
                            : "Upgrade to FitFusion Pro"}
                        </CardTitle>
                        <CardDescription>
                          {isSubscriptionActive
                            ? "Get the most out of your fitness journey with premium features"
                            : "Unlock premium features and take your fitness to the next level"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>AI-powered workout plans</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Advanced analytics</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Premium workout videos</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Priority support</span>
                          </div>
                        </div>

                        <Button
                          size="lg"
                          onClick={toggleSubscription}
                          className={`w-full ${
                            isSubscriptionActive
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                          }`}
                        >
                          {isSubscriptionActive ? (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Cancel Subscription
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Upgrade Now
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => navigate("/settings/about")}
                        className="w-full"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Explore All Features
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

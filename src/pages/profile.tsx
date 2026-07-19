import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { ProfileEditor } from "@/components/profile-editor";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CreditCard, Settings, User, Bell, Trophy, Activity, Share2, Target, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userProfile } from "@/data/user";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BodyMetricsWidget } from "@/components/profile/body-metrics-widget";
import { ActivityHeatmap } from "@/components/profile/activity-heatmap";
import { WeeklyPulseWidget } from "@/components/profile/weekly-pulse-widget";
import { VitalityRingsWidget } from "@/components/profile/vitality-rings-widget";
import { ProfileTabExtras } from "@/components/profile/profile-tab-extras";
import { ProfileHub } from "@/components/profile/profile-hub";
import { MobileAppDownloadCard } from "@/components/profile/mobile-app-download-card";
import { AdminAabDownloadCard } from "@/components/profile/admin-aab-download-card";
import { APP_VERSION, getInstalledVersion } from "@/lib/app-version";
import { ProfilePhotoUpload } from "@/components/profile-photo-upload";
import { useProfile } from "@/hooks/use-profile";
import { FitnessIDCard } from "@/components/profile/fitness-id-card";
import { SecurityPanel } from "@/components/profile/security-panel";
import { AwardsExtras } from "@/components/profile/awards-extras";
import { StatsExtras } from "@/components/profile/stats-extras";
import { ProfileInsightsWidget } from "@/components/profile/profile-insights-widget";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useEnhancedAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [currentVersion, setCurrentVersion] = useState(() => getInstalledVersion());
  // Read-only stats fallback from local activity data — never treated as identity
  const [localStats, setLocalStats] = useState(userProfile.stats);
  const {
    profile: cloudProfile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
    updateProfile,
  } = useProfile(user?.id, { enabled: !!user?.id });

  // Redirect unauthenticated users; never render profile UI without a user.
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const syncVersion = () => setCurrentVersion(getInstalledVersion());
    window.addEventListener("versionUpdated", syncVersion);
    // Pull local activity stats only (workouts count etc.) — not identity
    try {
      const saved = localStorage.getItem("fitfusion-profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.stats) setLocalStats((s: typeof userProfile.stats) => ({ ...s, ...parsed.stats }));
      }
    } catch {}
    return () => window.removeEventListener("versionUpdated", syncVersion);
  }, []);

  const userEmail = user?.email ?? "";
  const displayName = cloudProfile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const displayAvatar = cloudProfile?.avatar_url || null;

  const handleAvatarUpdate = useCallback((url: string | null) => {
    if (!user) return;
    updateProfile.mutate({ avatar_url: url || null } as never);
    window.dispatchEvent(new Event("profileUpdated"));
  }, [updateProfile, user]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "My FitFusion Progress",
      text: `💪 ${localStats.workoutsCompleted || 0} workouts • 🔥 ${localStats.streakDays || 0}-day streak on FitFusion!`,
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast({ title: "Copied", description: "Progress copied to clipboard" });
      }
    } catch {
      // user cancelled
    }
  }, [localStats, toast]);

  // Skeleton loader — prevents flicker and demo-value flash on refresh.
  if (authLoading || (user && profileLoading && !cloudProfile)) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="pt-12 pb-8 px-4 bg-gradient-to-br from-primary/80 via-primary/60 to-accent-foreground/60">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-28 w-28 rounded-full bg-primary-foreground/20 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-32 bg-primary-foreground/20 rounded animate-pulse" />
              <div className="h-4 w-48 bg-primary-foreground/15 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-primary-foreground/10 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="px-4 py-5 space-y-3">
          <div className="h-10 rounded-xl bg-muted/40 animate-pulse" />
          <div className="h-48 rounded-xl bg-muted/30 animate-pulse" />
          <div className="h-64 rounded-xl bg-muted/30 animate-pulse" />
        </div>
      </div>
    );
  }
  if (!user) return null;

  // If the profile failed to load (network etc.), show a retry surface.
  if (profileError && !cloudProfile) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base">Couldn't load your profile</CardTitle>
            <CardDescription>
              {(profileError as Error)?.message || "Please check your connection and try again."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetchProfile()} className="w-full">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent-foreground" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative pt-12 pb-8 px-4 text-primary-foreground">
          <div className="flex items-center gap-4 mb-5">
            <ProfilePhotoUpload
              name={displayName}
              initialImage={displayAvatar}
              size="lg"
              onImageUpdate={(url) => handleAvatarUpdate(url || null)}
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">Profile</h1>
              <p className="text-primary-foreground/70 text-sm truncate">Welcome, {displayName} 👋</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-[10px] h-5">
                  v{currentVersion}{currentVersion === APP_VERSION ? "" : " ↑"}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-[10px] text-primary-foreground/90 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  onClick={handleShare}
                >
                  <Share2 className="h-3 w-3 mr-1" />Share
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { value: localStats.workoutsCompleted || 0, label: "Workouts" },
              { value: localStats.streakDays || 0, label: "Streak" },
              { value: `${Math.round((localStats.caloriesBurned || 0) / 1000)}k`, label: "Calories" },
            ].map((s) => (
              <div key={s.label} className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center border border-primary-foreground/10">
                <div className="text-xl font-bold leading-tight">{s.value}</div>
                <div className="text-[10px] text-primary-foreground/60">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-4 mb-5 bg-muted/40 backdrop-blur-sm rounded-xl h-10">
            <TabsTrigger value="profile" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><User className="h-3.5 w-3.5 mr-1" />Profile</TabsTrigger>
            <TabsTrigger value="security" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Shield className="h-3.5 w-3.5 mr-1" />Security</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Trophy className="h-3.5 w-3.5 mr-1" />Awards</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Activity className="h-3.5 w-3.5 mr-1" />Stats</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

              <TabsContent value="profile" className="space-y-4 mt-0">
                <FitnessIDCard
                  name={displayName}
                  email={userEmail || undefined}
                  avatarUrl={displayAvatar}
                  memberSince={cloudProfile?.created_at ? new Date(cloudProfile.created_at).getFullYear().toString() : undefined}
                  level={Math.max(1, Math.floor((localStats.workoutsCompleted || 0) / 10) + 1)}
                  workouts={localStats.workoutsCompleted || 0}
                  streak={localStats.streakDays || 0}
                  calories={localStats.caloriesBurned || 0}
                  fitnessScore={78}
                  goal={cloudProfile?.fitness_goals?.[0] || "Stay Fit"}
                />
                <ProfileInsightsWidget
                  workouts={localStats.workoutsCompleted || 0}
                  streak={localStats.streakDays || 0}
                  calories={localStats.caloriesBurned || 0}
                />
                <ProfileHub email={userEmail} displayName={displayName} userId={user?.id ?? null} />
                <div id="profile-editor" />
                <ProfileEditor onSave={() => toast({ title: "✅ Profile Updated" })} />
                <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Settings className="h-4 w-4" />Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { icon: Settings, label: "Settings", desc: "App preferences", href: "/settings", badge: `v${currentVersion}` },
                        { icon: Shield, label: "Privacy", desc: "Data protection", href: "/privacy" },
                        { icon: CreditCard, label: "Subscription", desc: "Manage billing", href: "/subscription" },
                        { icon: Bell, label: "Notifications", desc: "Alert preferences", href: "/notifications" },
                      ].map((item) => (
                        <Button key={item.label} variant="outline" className="w-full justify-between h-auto p-3 rounded-xl border-border/20 bg-card/40 hover:bg-card/60"
                          onClick={() => navigate(item.href)}>
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-primary/10"><item.icon className="h-4 w-4 text-primary" /></div>
                            <div className="text-left">
                              <div className="text-sm font-medium text-foreground">{item.label}</div>
                              <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                            </div>
                          </div>
                          {item.badge && <Badge variant="outline" className="text-[10px] h-5">{item.badge}</Badge>}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Lots of new features: identity, milestones, prefs, connections, sharing, danger zone */}
                <MobileAppDownloadCard />
                <AdminAabDownloadCard />
                <ProfileTabExtras />
              </TabsContent>

              <TabsContent value="security" className="space-y-3 mt-0">
                <SecurityPanel userEmail={userEmail} />
              </TabsContent>


              <TabsContent value="achievements" className="space-y-3 mt-0">
                {/* Level & Badges */}
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent-foreground flex items-center justify-center shadow-lg">
                          <span className="text-2xl font-black text-primary-foreground">12</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">LVL</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-foreground">Fitness Warrior</h3>
                        <p className="text-xs text-muted-foreground mb-2">1,240 / 2,000 XP to next level</p>
                        <div className="w-full bg-muted/30 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: "62%" }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["🔥 7-Day Streak", "💪 100 Workouts", "🏃 Marathon Ready", "⭐ Early Bird", "🎯 Goal Setter"].map((badge) => (
                        <Badge key={badge} variant="outline" className="text-xs bg-card/60 border-border/30">{badge}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Achievements</CardTitle>
                    <CardDescription className="text-sm">Your fitness milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { icon: Trophy, label: "First Workout", status: "Completed", opacity: "" },
                        { icon: Shield, label: "7-Day Streak", status: "Unlocked", opacity: "" },
                        { icon: Activity, label: "30-Day Challenge", status: "In Progress", opacity: "" },
                        { icon: Trophy, label: "50 Workouts", status: "78%", opacity: "" },
                        { icon: Shield, label: "Community Star", status: "Locked", opacity: "opacity-40" },
                        { icon: Activity, label: "Iron Will", status: "Locked", opacity: "opacity-40" },
                      ].map((a) => (
                        <div key={a.label} className={`flex flex-col items-center p-4 rounded-xl border border-border/20 bg-muted/20 ${a.opacity}`}>
                          <a.icon className="h-7 w-7 text-primary mb-2" />
                          <h4 className="text-sm font-medium text-foreground text-center">{a.label}</h4>
                          <p className="text-[10px] text-muted-foreground">{a.status}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <AwardsExtras xp={1240} />
              </TabsContent>

              <TabsContent value="stats" className="space-y-3 mt-0">
                <StatsExtras />
                {/* Liquid Glass Vitality Rings — new */}
                <VitalityRingsWidget />

                {/* Body Metrics & Goals */}
                <BodyMetricsWidget />

                {/* Weekly Pulse — new in v7.0 */}
                <WeeklyPulseWidget />

                {/* Year-in-review activity heatmap */}
                <ActivityHeatmap />




                {/* Fitness Score Dashboard */}
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-primary" />Fitness Score</CardTitle>
                    <CardDescription className="text-sm">Your overall fitness rating</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-5 mb-4">
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                          <circle cx="40" cy="40" r="35" fill="none" className="stroke-muted/30" strokeWidth="6" />
                          <circle cx="40" cy="40" r="35" fill="none" className="stroke-primary" strokeWidth="6" strokeDasharray={`${78 * 2.2} 220`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-black text-foreground">78</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[
                          { label: "Strength", score: 82 },
                          { label: "Cardio", score: 75 },
                          { label: "Flexibility", score: 68 },
                          { label: "Consistency", score: 90 },
                        ].map((s) => (
                          <div key={s.label} className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-16">{s.label}</span>
                            <div className="flex-1 bg-muted/30 rounded-full h-1.5">
                              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${s.score}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-foreground w-6 text-right">{s.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Fitness Statistics</CardTitle>
                    <CardDescription className="text-sm">Your journey at a glance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-3 bg-muted/30 rounded-xl">
                        <div className="text-xl font-bold text-primary">{localStats.workoutsCompleted || 0}</div>
                        <div className="text-xs text-muted-foreground">Total Workouts</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-xl">
                        <div className="text-xl font-bold text-primary">{localStats.streakDays || 0}</div>
                        <div className="text-xs text-muted-foreground">Current Streak</div>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl">
                      <div className="text-xl font-bold text-primary">{Math.round((localStats.caloriesBurned || 0) / 1000)}k</div>
                      <div className="text-xs text-muted-foreground">Total Calories Burned</div>
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

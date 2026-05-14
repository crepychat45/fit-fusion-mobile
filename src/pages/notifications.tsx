import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import {
  ChevronLeft,
  Bell,
  BellOff,
  Volume2,
  Vibrate,
  MessageSquare,
  Clock,
  Calendar,
  Dumbbell,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Notification settings
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [appUpdates, setAppUpdates] = useState(true);
  const [progressAlerts, setProgressAlerts] = useState(true);
  const [socialNotifications, setSocialNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [voiceGuidance, setVoiceGuidance] = useState(false);
  const [quietHours, setQuietHours] = useState(false);

  const handleToggle = (setting: string, enabled: boolean) => {
    toast({
      title: `${setting} ${enabled ? "Enabled" : "Disabled"}`,
      description: "Your notification preferences have been updated.",
    });
  };

  const testSound = () => {
    const audio = new Audio("/notification-sound.mp3");
    audio.volume = 0.5;
    audio.play().catch((err) => {
      console.log("Audio playback prevented: ", err);
      toast({
        title: "Sound Test Failed",
        description: "Unable to play sound. Please check your device settings.",
      });
    });

    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(200);
    }

    toast({
      title: "Notification Test",
      description: "This is a test notification.",
    });
  };

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

      <Tabs defaultValue="settings" className="w-full">
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="settings" className="px-4 py-6">
          {/* Notification Types */}
          <div className="bg-card rounded-lg shadow-sm mb-6">
            <div className="p-4">
              <h3 className="font-medium mb-4">Notification Types</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="workout-reminders" className="font-medium">
                      Workout Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Daily workout notifications
                    </p>
                  </div>
                  <Switch
                    id="workout-reminders"
                    checked={workoutReminders}
                    onCheckedChange={(checked) => {
                      setWorkoutReminders(checked);
                      handleToggle("Workout Reminders", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="achievement" className="font-medium">
                      Achievements
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when you earn achievements
                    </p>
                  </div>
                  <Switch
                    id="achievement"
                    checked={achievements}
                    onCheckedChange={(checked) => {
                      setAchievements(checked);
                      handleToggle("Achievements", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="app-updates" className="font-medium">
                      App Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      New features and improvements
                    </p>
                  </div>
                  <Switch
                    id="app-updates"
                    checked={appUpdates}
                    onCheckedChange={(checked) => {
                      setAppUpdates(checked);
                      handleToggle("App Updates", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="progress-alerts" className="font-medium">
                      Progress Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Updates on your fitness goals
                    </p>
                  </div>
                  <Switch
                    id="progress-alerts"
                    checked={progressAlerts}
                    onCheckedChange={(checked) => {
                      setProgressAlerts(checked);
                      handleToggle("Progress Alerts", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="social-notifications"
                      className="font-medium"
                    >
                      Social Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Friend activity and challenges
                    </p>
                  </div>
                  <Switch
                    id="social-notifications"
                    checked={socialNotifications}
                    onCheckedChange={(checked) => {
                      setSocialNotifications(checked);
                      handleToggle("Social Notifications", checked);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sound & Haptics */}
          <div className="bg-card rounded-lg shadow-sm mb-6">
            <div className="p-4">
              <h3 className="font-medium mb-4">Sound & Haptics</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound-enabled" className="font-medium">
                      Notification Sounds
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Play sounds for notifications
                    </p>
                  </div>
                  <Switch
                    id="sound-enabled"
                    checked={soundEnabled}
                    onCheckedChange={(checked) => {
                      setSoundEnabled(checked);
                      handleToggle("Notification Sounds", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="vibration-enabled" className="font-medium">
                      Haptic Feedback
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Vibrate on notifications
                    </p>
                  </div>
                  <Switch
                    id="vibration-enabled"
                    checked={vibrationEnabled}
                    onCheckedChange={(checked) => {
                      setVibrationEnabled(checked);
                      handleToggle("Haptic Feedback", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="voice-guidance" className="font-medium">
                      Voice Guidance
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Audio instructions during workouts
                    </p>
                  </div>
                  <Switch
                    id="voice-guidance"
                    checked={voiceGuidance}
                    onCheckedChange={(checked) => {
                      setVoiceGuidance(checked);
                      handleToggle("Voice Guidance", checked);
                    }}
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={testSound}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Test Notification
                </Button>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-card rounded-lg shadow-sm mb-6">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">Quiet Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Silence notifications during specific times
                  </p>
                </div>
                <Switch
                  checked={quietHours}
                  onCheckedChange={(checked) => {
                    setQuietHours(checked);
                    handleToggle("Quiet Hours", checked);
                  }}
                />
              </div>

              {quietHours && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-sm mb-1 block">Start Time</Label>
                      <select className="w-full border rounded-md p-2 bg-background">
                        <option>10:00 PM</option>
                        <option>11:00 PM</option>
                        <option>12:00 AM</option>
                        <option>1:00 AM</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm mb-1 block">End Time</Label>
                      <select className="w-full border rounded-md p-2 bg-background">
                        <option>6:00 AM</option>
                        <option>7:00 AM</option>
                        <option>8:00 AM</option>
                        <option>9:00 AM</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <Label className="text-sm mb-1 block">
                      Allow Notifications From
                    </Label>
                  </div>

                  <RadioGroup defaultValue="none" className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none">No one</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="important" id="important" />
                      <Label htmlFor="important">
                        Important notifications only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="favorites" id="favorites" />
                      <Label htmlFor="favorites">Favorite workouts</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced Notification Settings
          </Button>
        </TabsContent>

        <TabsContent value="recent" className="px-4 py-6">
          <h3 className="font-medium mb-3">Recent Notifications</h3>
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <Bell className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Workout Reminder</p>
                  <p className="text-sm text-muted-foreground">
                    Time for your scheduled upper body workout!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 hours ago
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <Dumbbell className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Achievement Unlocked!</p>
                  <p className="text-sm text-muted-foreground">
                    You've completed 25 workouts. Great job!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Yesterday
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">New Feature Available</p>
                  <p className="text-sm text-muted-foreground">
                    Check out our new workout analytics dashboard!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 days ago
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Weekly Summary</p>
                  <p className="text-sm text-muted-foreground">
                    You completed 4 workouts this week - view your stats!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    5 days ago
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4">
            <Button variant="outline" className="w-full">
              Clear All Notifications
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <MobileNav />
    </div>
  );
};

export default NotificationsPage;

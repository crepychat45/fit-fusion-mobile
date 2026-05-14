import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Mail,
  Smartphone,
  Trophy,
  Calendar,
  MessageSquare,
  Zap,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function NotificationSettings() {
  const { toast } = useToast();
  
  // Notification toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [achievementNotifs, setAchievementNotifs] = useState(true);
  const [socialNotifs, setSocialNotifs] = useState(false);
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [progressUpdates, setProgressUpdates] = useState(true);
  const [challengeNotifs, setChallengeNotifs] = useState(true);
  
  // Notification timing
  const [workoutReminderTime, setWorkoutReminderTime] = useState("30");
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");
  const [notificationFrequency, setNotificationFrequency] = useState("realtime");

  const handleSaveSettings = () => {
    const settings = {
      push: pushEnabled,
      email: emailEnabled,
      workoutReminders,
      achievements: achievementNotifs,
      social: socialNotifs,
      messages: messageNotifs,
      progress: progressUpdates,
      challenges: challengeNotifs,
      reminderTime: workoutReminderTime,
      quietHours: {
        enabled: quietHoursEnabled,
        start: quietHoursStart,
        end: quietHoursEnd,
      },
      frequency: notificationFrequency,
    };

    localStorage.setItem("fitfusion-notification-settings", JSON.stringify(settings));

    toast({
      title: "✅ Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast({
          title: "✅ Notifications Enabled",
          description: "You'll now receive push notifications.",
        });
        setPushEnabled(true);
      } else {
        toast({
          title: "❌ Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on this device
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pushEnabled && (
                <Badge variant="secondary" className="text-xs">Active</Badge>
              )}
              <Switch
                checked={pushEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    requestNotificationPermission();
                  } else {
                    setPushEnabled(false);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Select which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <Label>Workout Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded before scheduled workouts
                </p>
              </div>
            </div>
            <Switch
              checked={workoutReminders}
              onCheckedChange={setWorkoutReminders}
            />
          </div>

          {workoutReminders && (
            <div className="ml-7 pl-4 border-l-2 border-muted">
              <Label htmlFor="reminderTime" className="text-sm">Remind me</Label>
              <Select value={workoutReminderTime} onValueChange={setWorkoutReminderTime}>
                <SelectTrigger id="reminderTime" className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="120">2 hours before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <div>
                <Label>Achievements & Milestones</Label>
                <p className="text-sm text-muted-foreground">
                  Celebrate your fitness achievements
                </p>
              </div>
            </div>
            <Switch
              checked={achievementNotifs}
              onCheckedChange={setAchievementNotifs}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-green-600" />
              <div>
                <Label>Messages & Chat</Label>
                <p className="text-sm text-muted-foreground">
                  New messages from community members
                </p>
              </div>
            </div>
            <Switch checked={messageNotifs} onCheckedChange={setMessageNotifs} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-purple-600" />
              <div>
                <Label>Progress Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly summaries and streak milestones
                </p>
              </div>
            </div>
            <Switch
              checked={progressUpdates}
              onCheckedChange={setProgressUpdates}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-orange-600" />
              <div>
                <Label>Challenge Invitations</Label>
                <p className="text-sm text-muted-foreground">
                  New challenges and competitions
                </p>
              </div>
            </div>
            <Switch
              checked={challengeNotifs}
              onCheckedChange={setChallengeNotifs}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-pink-600" />
              <div>
                <Label>Social Interactions</Label>
                <p className="text-sm text-muted-foreground">
                  Likes, comments, and follows
                </p>
              </div>
            </div>
            <Switch checked={socialNotifs} onCheckedChange={setSocialNotifs} />
          </div>
        </CardContent>
      </Card>

      {/* Notification Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Notification Timing
          </CardTitle>
          <CardDescription>
            Control when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
              <SelectTrigger id="frequency" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time (Instant)</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Summary</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quietHours">Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">
                  Pause notifications during specific times
                </p>
              </div>
              <Switch
                id="quietHours"
                checked={quietHoursEnabled}
                onCheckedChange={setQuietHoursEnabled}
              />
            </div>

            {quietHoursEnabled && (
              <div className="ml-0 pl-4 border-l-2 border-muted space-y-3">
                <div>
                  <Label htmlFor="quietStart" className="text-sm">Start Time</Label>
                  <Input
                    id="quietStart"
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quietEnd" className="text-sm">End Time</Label>
                  <Input
                    id="quietEnd"
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setPushEnabled(true);
            setEmailEnabled(true);
            setWorkoutReminders(true);
            setAchievementNotifs(true);
            setSocialNotifs(false);
            setMessageNotifs(true);
            setProgressUpdates(true);
            setChallengeNotifs(true);
            toast({
              title: "Settings Reset",
              description: "Notification settings restored to defaults.",
            });
          }}
        >
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveSettings}>
          <Bell className="h-4 w-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

// Missing Input import
import { Input } from "@/components/ui/input";

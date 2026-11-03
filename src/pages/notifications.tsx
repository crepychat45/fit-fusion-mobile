import React, { useEffect, useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft, Volume2, Settings } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { NotificationInboxList } from "@/components/notifications/notification-inbox-list";
import { readJson } from "@/lib/safe-storage";

const PREFS_KEY = "fitfusion-notification-prefs-v1";

type Prefs = {
  workoutReminders: boolean;
  achievements: boolean;
  appUpdates: boolean;
  progressAlerts: boolean;
  socialNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
};

const DEFAULTS: Prefs = {
  workoutReminders: true,
  achievements: true,
  appUpdates: true,
  progressAlerts: true,
  socialNotifications: false,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHours: false,
  quietStart: "22:00",
  quietEnd: "07:00",
};

const TOGGLES: { key: keyof Prefs; label: string; desc: string; group: "types" | "sound" }[] = [
  { key: "workoutReminders", label: "Workout Reminders", desc: "Daily workout notifications", group: "types" },
  { key: "achievements", label: "Achievements", desc: "Notify when you earn achievements", group: "types" },
  { key: "appUpdates", label: "App Updates", desc: "New features and improvements", group: "types" },
  { key: "progressAlerts", label: "Progress Alerts", desc: "Updates on your fitness goals", group: "types" },
  { key: "socialNotifications", label: "Social Notifications", desc: "Friend activity and challenges", group: "types" },
  { key: "soundEnabled", label: "Notification Sounds", desc: "Play sounds for notifications", group: "sound" },
  { key: "vibrationEnabled", label: "Haptic Feedback", desc: "Vibrate on notifications", group: "sound" },
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "settings" ? "settings" : "recent";
  const [prefs, setPrefs] = useState<Prefs>(() => ({ ...DEFAULTS, ...readJson<Partial<Prefs>>(PREFS_KEY, {}) }));

  useEffect(() => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* storage full */ }
  }, [prefs]);

  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs((p) => ({ ...p, [k]: v }));

  const testNotification = async () => {
    if (prefs.soundEnabled) new Audio("/notification-sound.mp3").play().catch(() => undefined);
    if (prefs.vibrationEnabled && navigator.vibrate) navigator.vibrate(200);
    if ("Notification" in window && window.top === window.self) {
      const perm = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      if (perm === "granted") {
        new Notification("FitxFusion", { body: "Test notification", icon: "/favicon.ico" });
        return;
      }
    }
    toast({ title: "Test notification", description: "System alerts need permission and the app open in its own tab." });
  };

  const renderGroup = (group: "types" | "sound") =>
    TOGGLES.filter((t) => t.group === group).map((t) => (
      <div key={t.key} className="flex items-center justify-between">
        <div>
          <Label htmlFor={t.key} className="font-medium">{t.label}</Label>
          <p className="text-sm text-muted-foreground">{t.desc}</p>
        </div>
        <Switch id={t.key} checked={prefs[t.key] as boolean} onCheckedChange={(c) => set(t.key, c as never)} />
      </div>
    ));

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} aria-label="Back" className="text-primary-foreground p-2 rounded-full hover:bg-primary-foreground/10">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground ml-2">Notifications</h1>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setParams(v === "recent" ? {} : { tab: v }, { replace: true })} className="w-full">
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="recent" className="px-4 py-6">
          <NotificationInboxList />
        </TabsContent>

        <TabsContent value="settings" className="px-4 py-6 space-y-6">
          <div className="bg-card rounded-lg shadow-sm p-4">
            <h3 className="font-medium mb-4">Notification Types</h3>
            <div className="space-y-4">{renderGroup("types")}</div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-4">
            <h3 className="font-medium mb-4">Sound & Haptics</h3>
            <div className="space-y-4">
              {renderGroup("sound")}
              <Button variant="outline" className="w-full" onClick={testNotification}>
                <Volume2 className="h-4 w-4 mr-2" /> Test Notification
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">Quiet Hours</h3>
                <p className="text-sm text-muted-foreground">Silence notifications during specific times</p>
              </div>
              <Switch checked={prefs.quietHours} onCheckedChange={(c) => set("quietHours", c)} />
            </div>
            {prefs.quietHours && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1 block" htmlFor="qs">Start</Label>
                  <input id="qs" type="time" value={prefs.quietStart} onChange={(e) => set("quietStart", e.target.value)} className="w-full border rounded-md p-2 bg-background" />
                </div>
                <div>
                  <Label className="text-sm mb-1 block" htmlFor="qe">End</Label>
                  <input id="qe" type="time" value={prefs.quietEnd} onChange={(e) => set("quietEnd", e.target.value)} className="w-full border rounded-md p-2 bg-background" />
                </div>
              </div>
            )}
          </div>

          <Button variant="outline" className="w-full" onClick={() => navigate("/settings?tab=notifications")}>
            <Settings className="h-4 w-4 mr-2" /> Advanced Notification Settings
          </Button>
        </TabsContent>
      </Tabs>

      <MobileNav />
    </div>
  );
};

export default NotificationsPage;

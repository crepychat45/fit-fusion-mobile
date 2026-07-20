import React, { useEffect, useState } from "react";
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
import { Bell, Mail, Volume2, Vibrate } from "lucide-react";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { useToast } from "@/hooks/use-toast";

interface Prefs {
  push: boolean;
  emailWeekly: boolean;
  emailMonthly: boolean;
  sound: boolean;
  haptic: boolean;
}

const DEFAULTS: Prefs = {
  push: true,
  emailWeekly: true,
  emailMonthly: false,
  sound: true,
  haptic: true,
};

const keyFor = (uid: string | undefined) =>
  `fitfusion:notif:${uid ?? "anon"}`;

export function NotificationPreferences() {
  const { user } = useEnhancedAuth();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(keyFor(user?.id));
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, [user?.id]);

  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    try {
      localStorage.setItem(keyFor(user?.id), JSON.stringify(next));
    } catch { /* ignore */ }
  };

  const testHaptic = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([80, 40, 80]);
      toast({ title: "Haptic pulse sent" });
    } else {
      toast({ title: "Haptic not supported", variant: "destructive" });
    }
  };

  const requestPush = async () => {
    if (!("Notification" in window)) {
      toast({ title: "Push not supported", variant: "destructive" });
      return;
    }
    const p = await Notification.requestPermission();
    if (p === "granted") {
      update("push", true);
      new Notification("FitFusion", { body: "Push notifications enabled." });
    }
  };

  const rows: Array<{
    k: keyof Prefs;
    icon: React.ReactNode;
    title: string;
    desc: string;
    action?: React.ReactNode;
  }> = [
    { k: "push", icon: <Bell className="h-4 w-4" />, title: "Push notifications", desc: "Real-time workout & recovery alerts.", action: (
      <Button size="sm" variant="ghost" onClick={requestPush}>Request permission</Button>
    ) },
    { k: "emailWeekly", icon: <Mail className="h-4 w-4" />, title: "Weekly email digest", desc: "Weekly progress recap every Sunday." },
    { k: "emailMonthly", icon: <Mail className="h-4 w-4" />, title: "Monthly email report", desc: "Deep-dive analytics on the 1st." },
    { k: "sound", icon: <Volume2 className="h-4 w-4" />, title: "In-app sound", desc: "Timer chimes and confirmation sounds." },
    { k: "haptic", icon: <Vibrate className="h-4 w-4" />, title: "Haptic feedback", desc: "Vibrate on interactions (mobile).", action: (
      <Button size="sm" variant="ghost" onClick={testHaptic}>Test</Button>
    ) },
  ];

  return (
    <Card className="liquid-glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Granular control over what interrupts you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between rounded-xl border border-white/10 bg-background/30 backdrop-blur p-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">{r.icon}</div>
              <div className="min-w-0">
                <Label className="text-sm font-medium">{r.title}</Label>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {r.action}
              <Switch checked={prefs[r.k]} onCheckedChange={(v) => update(r.k, v)} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

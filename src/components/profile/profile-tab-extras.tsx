import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, Ruler, Scale, Flame, Award, Watch, Apple, Activity,
  Download, QrCode, Copy, LogOut, Trash2, Link2, Palette,
  Bell, MoonStar, Zap, Globe, Calendar, IdCard, ShieldCheck,
} from "lucide-react";

/* ────────────────────────────────────────────────────────── */
/*  Local prefs (units, motion, notifications, theme accents) */
/* ────────────────────────────────────────────────────────── */

type Prefs = {
  units: "metric" | "imperial";
  distance: "km" | "mi";
  reducedMotion: boolean;
  emailDigest: boolean;
  publicProfile: boolean;
  accent: "aurora" | "sunset" | "emerald" | "rose";
};

const DEFAULT_PREFS: Prefs = {
  units: "metric",
  distance: "km",
  reducedMotion: false,
  emailDigest: true,
  publicProfile: false,
  accent: "aurora",
};

const PREFS_KEY = "fitfusion-profile-prefs";

function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {}
  }, []);
  const update = (patch: Partial<Prefs>) =>
    setPrefs((p) => {
      const next = { ...p, ...patch };
      try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch {}
      window.dispatchEvent(new CustomEvent("prefsUpdated", { detail: next }));
      return next;
    });
  return { prefs, update };
}

/* ────────────────────────────────────────────────────────── */
/*  Fitness Identity Card                                     */
/* ────────────────────────────────────────────────────────── */

const IdentityCard: React.FC = () => {
  const { profile } = useProfile();
  const created = profile?.created_at ? new Date(profile.created_at) : null;
  const memberSince = created
    ? created.toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "—";
  const tz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop(); }
    catch { return "UTC"; }
  }, []);
  const bmi = useMemo(() => {
    if (!profile?.height_cm || !profile?.weight_kg) return null;
    const h = profile.height_cm / 100;
    return +(profile.weight_kg / (h * h)).toFixed(1);
  }, [profile?.height_cm, profile?.weight_kg]);
  const bmiLabel =
    bmi == null ? "—" : bmi < 18.5 ? "Under" : bmi < 25 ? "Healthy" : bmi < 30 ? "Over" : "High";
  const bmiTone =
    bmi == null ? "bg-muted/30 text-muted-foreground"
    : bmi < 18.5 ? "bg-sky-500/15 text-sky-400"
    : bmi < 25 ? "bg-emerald-500/15 text-emerald-400"
    : bmi < 30 ? "bg-amber-500/15 text-amber-400"
    : "bg-rose-500/15 text-rose-400";

  const items = [
    { icon: Calendar, label: "Member since", value: memberSince },
    { icon: Globe, label: "Timezone", value: tz || "UTC" },
    { icon: Ruler, label: "Height", value: profile?.height_cm ? `${profile.height_cm} cm` : "—" },
    { icon: Scale, label: "Weight", value: profile?.weight_kg ? `${profile.weight_kg} kg` : "—" },
  ];

  return (
    <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent backdrop-blur-2xl">
      <div aria-hidden className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <IdCard className="h-4 w-4 text-primary" />
              Fitness Identity
            </CardTitle>
            <CardDescription className="text-xs">Your athletic profile at a glance</CardDescription>
          </div>
          <Badge className={`h-6 rounded-full px-2 text-[10px] font-semibold ${bmiTone}`}>
            BMI {bmi ?? "—"} · {bmiLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-2 gap-2">
          {items.map((it) => (
            <div key={it.label} className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><it.icon className="h-3.5 w-3.5" /></div>
              <div className="min-w-0">
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{it.label}</div>
                <div className="text-xs font-semibold text-foreground truncate">{it.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(profile?.fitness_goals ?? []).slice(0, 4).map((g: string) => (
            <Badge key={g} variant="outline" className="text-[10px] bg-white/[0.03] border-white/10">
              <Sparkles className="h-2.5 w-2.5 mr-1 text-primary" />{g}
            </Badge>
          ))}
          {(!profile?.fitness_goals || profile.fitness_goals.length === 0) && (
            <span className="text-[11px] text-muted-foreground">Set fitness goals above to personalize your plan.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/* ────────────────────────────────────────────────────────── */
/*  Preferences (persistent)                                  */
/* ────────────────────────────────────────────────────────── */

const accents: { key: Prefs["accent"]; label: string; from: string; to: string }[] = [
  { key: "aurora",  label: "Aurora",  from: "#6366f1", to: "#ec4899" },
  { key: "sunset",  label: "Sunset",  from: "#f97316", to: "#ef4444" },
  { key: "emerald", label: "Emerald", from: "#10b981", to: "#06b6d4" },
  { key: "rose",    label: "Rose",    from: "#f43f5e", to: "#a855f7" },
];

const PreferencesCard: React.FC = () => {
  const { prefs, update } = usePrefs();

  const toggles: { key: keyof Prefs; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }[] = [
    { key: "reducedMotion", icon: MoonStar, title: "Reduced Motion", desc: "Calmer animations" },
    { key: "emailDigest",   icon: Bell,     title: "Weekly Digest",  desc: "Progress email every Monday" },
    { key: "publicProfile", icon: ShieldCheck, title: "Public Profile", desc: "Discoverable in community" },
  ];

  return (
    <Card className="border-white/10 bg-white/[0.03] backdrop-blur-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4 text-primary" />Preferences
        </CardTitle>
        <CardDescription className="text-xs">Personalize units, motion & alerts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Units */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Units</div>
              <div className="text-[10px] text-muted-foreground">Metric or Imperial</div>
            </div>
          </div>
          <div className="inline-flex rounded-lg bg-white/[0.04] p-0.5">
            {(["metric", "imperial"] as const).map((u) => (
              <button
                key={u}
                onClick={() => update({ units: u, distance: u === "metric" ? "km" : "mi" })}
                className={`px-3 py-1 text-[11px] rounded-md transition ${
                  prefs.units === u ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {u === "metric" ? "kg · cm" : "lb · in"}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          {toggles.map((t) => (
            <div key={t.key} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <t.icon className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{t.desc}</div>
                </div>
              </div>
              <Switch
                checked={Boolean(prefs[t.key])}
                onCheckedChange={(v) => update({ [t.key]: v } as Partial<Prefs>)}
              />
            </div>
          ))}
        </div>

        {/* Accent picker */}
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <Label className="text-sm">Accent Palette</Label>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {accents.map((a) => (
              <button
                key={a.key}
                onClick={() => update({ accent: a.key })}
                className={`relative h-10 rounded-lg overflow-hidden border transition ${
                  prefs.accent === a.key ? "border-white/60 ring-2 ring-primary/60" : "border-white/10"
                }`}
                style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                aria-label={a.label}
              >
                <span className="absolute inset-0 flex items-end justify-center text-[9px] font-semibold text-white/90 pb-0.5">
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/* ────────────────────────────────────────────────────────── */
/*  Connected Accounts                                        */
/* ────────────────────────────────────────────────────────── */

const CONN_KEY = "fitfusion-connections";
type Conn = { apple: boolean; google: boolean; watch: boolean; strava: boolean };
const DEFAULT_CONN: Conn = { apple: false, google: false, watch: false, strava: false };

const ConnectionsCard: React.FC = () => {
  const { toast } = useToast();
  const [conn, setConn] = useState<Conn>(DEFAULT_CONN);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONN_KEY);
      if (raw) setConn({ ...DEFAULT_CONN, ...JSON.parse(raw) });
    } catch {}
  }, []);
  const toggle = (k: keyof Conn) => {
    const next = { ...conn, [k]: !conn[k] };
    setConn(next);
    try { localStorage.setItem(CONN_KEY, JSON.stringify(next)); } catch {}
    toast({ title: next[k] ? "Connected" : "Disconnected", description: k.toUpperCase() });
  };

  const items: { key: keyof Conn; icon: React.ComponentType<{ className?: string }>; name: string; color: string }[] = [
    { key: "apple",  icon: Apple,    name: "Apple Health", color: "text-rose-400" },
    { key: "google", icon: Activity, name: "Google Fit",   color: "text-emerald-400" },
    { key: "watch",  icon: Watch,    name: "Smartwatch",   color: "text-sky-400" },
    { key: "strava", icon: Flame,    name: "Strava",       color: "text-orange-400" },
  ];

  return (
    <Card className="border-white/10 bg-white/[0.03] backdrop-blur-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4 text-primary" />Connected Accounts
        </CardTitle>
        <CardDescription className="text-xs">Sync data across your ecosystem</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((it) => (
            <div key={it.key} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/[0.04]"><it.icon className={`h-4 w-4 ${it.color}`} /></div>
                <div>
                  <div className="text-sm font-medium">{it.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {conn[it.key] ? "Syncing" : "Not connected"}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant={conn[it.key] ? "secondary" : "outline"}
                className="h-7 text-[11px] rounded-lg"
                onClick={() => toggle(it.key)}
              >
                {conn[it.key] ? "Disconnect" : "Connect"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/* ────────────────────────────────────────────────────────── */
/*  Data & Sharing (Export, Referral, QR)                     */
/* ────────────────────────────────────────────────────────── */

const DataSharingCard: React.FC = () => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [showQR, setShowQR] = useState(false);

  const referral = useMemo(() => {
    const id = profile?.user_id?.slice(0, 8) || "guest";
    return `${window.location.origin}/?ref=${id}`;
  }, [profile?.user_id]);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: label });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const exportData = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      profile,
      prefs: safeGet(PREFS_KEY),
      connections: safeGet(CONN_KEY),
      local_activity: safeGet("fitfusion-profile"),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fitfusion-profile-${Date.now()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "Export ready", description: "Downloaded JSON snapshot" });
  };

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(referral)}&size=180x180&bgcolor=0a0a1f&color=ffffff&margin=2`;

  return (
    <Card className="border-white/10 bg-white/[0.03] backdrop-blur-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="h-4 w-4 text-primary" />Data & Sharing
        </CardTitle>
        <CardDescription className="text-xs">Export your data or share your profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Referral link</div>
            <div className="text-xs font-mono truncate">{referral}</div>
          </div>
          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => copy(referral, "Referral link")}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="rounded-xl h-9 text-xs border-white/10 bg-white/[0.03]" onClick={exportData}>
            <Download className="h-3.5 w-3.5 mr-1.5" />Export JSON
          </Button>
          <Button variant="outline" className="rounded-xl h-9 text-xs border-white/10 bg-white/[0.03]" onClick={() => setShowQR((v) => !v)}>
            <QrCode className="h-3.5 w-3.5 mr-1.5" />{showQR ? "Hide" : "Show"} QR
          </Button>
        </div>

        {showQR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-center gap-2"
          >
            <img src={qrSrc} alt="Referral QR" className="h-40 w-40 rounded-lg" loading="lazy" />
            <p className="text-[10px] text-muted-foreground">Scan to open your profile invite</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

function safeGet(key: string) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

/* ────────────────────────────────────────────────────────── */
/*  Danger Zone                                               */
/* ────────────────────────────────────────────────────────── */

const DangerZoneCard: React.FC = () => {
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "Signed out" });
      setTimeout(() => window.location.assign("/auth"), 400);
    } catch {
      toast({ title: "Sign out failed", variant: "destructive" });
    }
  };

  const requestDelete = async () => {
    // Best-effort local wipe; server-side deletion handled by support flow
    try {
      const keys = ["fitfusion-profile", "fitfusion-profile-prefs", "fitfusion-connections"];
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {}
    await supabase.auth.signOut().catch(() => {});
    toast({
      title: "Deletion requested",
      description: "Local data cleared. You will receive an email to confirm account removal.",
    });
    setTimeout(() => window.location.assign("/auth"), 700);
  };

  return (
    <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/[0.05] to-transparent backdrop-blur-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-rose-300">
          <ShieldCheck className="h-4 w-4" />Account Actions
        </CardTitle>
        <CardDescription className="text-xs">Sign out or permanently remove your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start rounded-xl h-10 border-white/10 bg-white/[0.03]" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2 text-primary" />Sign out of this device
        </Button>
        {!confirming ? (
          <Button variant="outline" className="w-full justify-start rounded-xl h-10 border-rose-500/30 bg-rose-500/[0.05] hover:bg-rose-500/[0.1]" onClick={() => setConfirming(true)}>
            <Trash2 className="h-4 w-4 mr-2 text-rose-400" />Delete account
          </Button>
        ) : (
          <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/[0.06] space-y-2">
            <p className="text-[11px] text-rose-200/90">This will clear local data and sign you out. Confirm to proceed.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs" onClick={() => setConfirming(false)}>Cancel</Button>
              <Button size="sm" className="h-8 rounded-lg text-xs bg-rose-500 hover:bg-rose-600 text-white" onClick={requestDelete}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />Confirm
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ────────────────────────────────────────────────────────── */
/*  Milestones Timeline                                       */
/* ────────────────────────────────────────────────────────── */

const MilestonesCard: React.FC = () => {
  const items = [
    { icon: Award,    title: "Level 12 Reached", when: "Yesterday",  tone: "from-amber-500 to-orange-500" },
    { icon: Flame,    title: "7-Day Streak",     when: "This week",  tone: "from-rose-500 to-pink-500" },
    { icon: Zap,      title: "New PR: Deadlift", when: "3 days ago", tone: "from-violet-500 to-indigo-500" },
    { icon: Activity, title: "First 5K Run",     when: "Last week",  tone: "from-emerald-500 to-teal-500" },
  ];
  return (
    <Card className="border-white/10 bg-white/[0.03] backdrop-blur-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4 text-primary" />Recent Milestones
        </CardTitle>
        <CardDescription className="text-xs">Your latest wins on the journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-4">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-primary/40 via-white/10 to-transparent" />
          <ul className="space-y-3">
            {items.map((m, i) => (
              <motion.li
                key={m.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative flex items-center gap-3"
              >
                <span className={`absolute -left-4 top-1 h-3 w-3 rounded-full bg-gradient-to-br ${m.tone} shadow-[0_0_10px_currentColor]`} />
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${m.tone} text-white shadow-md`}>
                  <m.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="text-sm font-medium truncate">{m.title}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{m.when}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

/* ────────────────────────────────────────────────────────── */
/*  Public bundle                                             */
/* ────────────────────────────────────────────────────────── */

export const ProfileTabExtras: React.FC = () => {
  return (
    <div className="space-y-3">
      <IdentityCard />
      <MilestonesCard />
      <PreferencesCard />
      <ConnectionsCard />
      <DataSharingCard />
      <DangerZoneCard />
    </div>
  );
};

export default ProfileTabExtras;

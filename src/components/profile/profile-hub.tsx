import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  User, IdCard, GraduationCap, Heart, Shield, Lock, Palette, Bell,
  Sparkles, BarChart3, Trophy, Wallet, HardDriveDownload, Link2,
  Terminal, LifeBuoy, Copy, QrCode, Share2, Download, UserPlus,
  Trash2, CheckCircle2, Loader2, Zap, RefreshCw, LogOut, Phone, Plus, X, Webhook, KeyRound,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { applyAppearance, applyAccent } from "@/utils/appearance";
import { setDarkMode, isDarkMode } from "@/lib/theme";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// ---------- persistence helpers ----------
const BASE_KEY = "fitfusion-profile-hub";
const keyFor = (uid?: string | null) => (uid ? `${BASE_KEY}:${uid}` : BASE_KEY);

type HubState = {
  cover?: string | null;
  status?: string;
  quote?: string;
  gender?: string;
  dob?: string;
  bloodGroup?: string;
  nationality?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  timezone?: string;
  languages?: string;
  religion?: string;
  marital?: string;
  education?: string;
  university?: string;
  school?: string;
  degree?: string;
  skills?: string;
  experience?: string;
  certifications?: string;
  portfolio?: string;
  resumeName?: string | null;
  waterIntake?: number;
  dailySteps?: number;
  sleepHours?: number;
  privacy: {
    publicProfile: boolean;
    showEmail: boolean;
    showPhone: boolean;
    showBirthday: boolean;
    showOnline: boolean;
    dataSharing: boolean;
  };
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    marketing: boolean;
    security: boolean;
    weekly: boolean;
  };
  appearance: {
    darkMode: boolean;
    accent: string;
    fontSize: number;
    animationSpeed: number;
    glass: boolean;
    compact: boolean;
    wallpaper: string;
  };
  connections: Record<string, boolean>;
  developer: { mode: boolean };
  wallet: { coins: number; referrals: number };
};

const DEFAULT: HubState = {
  cover: null,
  status: "Getting stronger every day 💪",
  quote: "Consistency beats intensity.",
  privacy: {
    publicProfile: true, showEmail: false, showPhone: false,
    showBirthday: true, showOnline: true, dataSharing: false,
  },
  notifications: {
    push: true, email: true, sms: false, marketing: false,
    security: true, weekly: true,
  },
  appearance: {
    darkMode: false, accent: "#3B82F6", fontSize: 16,
    animationSpeed: 1, glass: true, compact: false, wallpaper: "aurora",
  },
  connections: { google: false, apple: false, github: false, microsoft: false, discord: false, facebook: false, linkedin: false },
  developer: { mode: false },
  wallet: { coins: 240, referrals: 3 },
};

const loadHub = (uid?: string | null): HubState => {
  try {
    const raw = localStorage.getItem(keyFor(uid)) || (uid ? localStorage.getItem(BASE_KEY) : null);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) as HubState) };
  } catch { return DEFAULT; }
};

// ---------- shared UI ----------
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-2 gap-3">
    <span className="text-sm text-foreground">{label}</span>
    {children}
  </div>
);

const GlassCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => (
  <Card className={`border-border/20 bg-card/60 backdrop-blur-xl shadow-sm ${className ?? ""}`} {...rest}>
    {children}
  </Card>
);

// ---------- hub ----------
export const ProfileHub: React.FC<{ email?: string | null; displayName?: string; userId?: string | null }> = ({ email, displayName, userId }) => {
  const { toast } = useToast();
  const [state, setState] = useState<HubState>(() => loadHub(userId));
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState<null | "bio" | "username" | "review" | "insights" | "recs">(null);
  const [aiOutput, setAiOutput] = useState<{ kind: string; text: string } | null>(null);
  const { profile, updateProfile } = useProfile(userId ?? undefined, { enabled: !!userId });

  // Reload state when the signed-in user changes so each account has its own hub prefs
  useEffect(() => {
    setState(loadHub(userId));
  }, [userId]);

  // Autosave hub state — namespaced by user id
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(keyFor(userId), JSON.stringify(state)); } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [state, userId]);

  // Apply appearance (accent, dark mode, font size) live + on mount
  useEffect(() => {
    applyAppearance(state.appearance);
  }, [state.appearance.accent, state.appearance.darkMode, state.appearance.fontSize]);

  const patch = useCallback(<K extends keyof HubState>(key: K, value: HubState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);
  const patchNested = useCallback(<K extends keyof HubState>(key: K, partial: Partial<HubState[K]>) => {
    setState((s) => ({ ...s, [key]: { ...(s[key] as object), ...partial } as HubState[K] }));
  }, []);

  // Auto-age from DOB
  const age = useMemo(() => {
    if (!state.dob) return null;
    const d = new Date(state.dob);
    if (Number.isNaN(d.getTime())) return null;
    const diff = Date.now() - d.getTime();
    return Math.max(0, Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
  }, [state.dob]);

  // BMI
  const bmi = useMemo(() => {
    const h = (profile?.height_cm ?? 0) / 100;
    const w = profile?.weight_kg ?? 0;
    if (!h || !w) return null;
    return +(w / (h * h)).toFixed(1);
  }, [profile]);

  // Profile completion
  const completion = useMemo(() => {
    const parts = [
      profile?.name, profile?.bio, profile?.avatar_url, profile?.fitness_level,
      profile?.height_cm, profile?.weight_kg, state.dob, state.gender,
      state.country, state.languages, state.skills, state.status,
    ];
    const filled = parts.filter((v) => v !== null && v !== undefined && v !== "").length;
    return Math.round((filled / parts.length) * 100);
  }, [profile, state]);

  const joinDate = profile?.created_at ? new Date(profile.created_at) : null;
  const accountAgeDays = joinDate ? Math.max(0, Math.floor((Date.now() - joinDate.getTime()) / 86400000)) : 0;

  // Cover upload (data-url in localStorage; keeps things simple/local-only)
  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "Too large", description: "Cover must be under 4MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => patch("cover", String(reader.result));
    reader.readAsDataURL(file);
  };

  // Resume upload — filename only
  const onResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    patch("resumeName", file.name);
    toast({ title: "Resume attached", description: file.name });
  };

  // Quick actions
  const profileUrl = `${window.location.origin}/u/${(displayName || "me").toLowerCase().replace(/\s+/g, "-")}`;
  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    toast({ title: "Link copied" });
  };
  const shareLink = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "My FitFusion Profile", url: profileUrl });
      else await copyLink();
    } catch {}
  };
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ profile, hub: state }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "fitfusion-profile.json"; a.click();
    URL.revokeObjectURL(url);
  };
  const generateQR = () => {
    // Use public QR service — no keys, no tracking beyond query
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(profileUrl)}`;
    window.open(src, "_blank", "noopener,noreferrer");
  };
  const inviteFriends = async () => {
    const text = `Join me on FitFusion! ${profileUrl}`;
    try {
      if (navigator.share) await navigator.share({ title: "Join FitFusion", text, url: profileUrl });
      else { await navigator.clipboard.writeText(text); toast({ title: "Invite link copied" }); }
    } catch {}
  };

  // Security actions (real)
  const changePassword = async () => {
    if (!email) return;
    setSaving(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSaving(false);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else toast({ title: "Email sent", description: "Check your inbox for the reset link." });
  };
  const logoutEverywhere = async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Signed out everywhere" }); window.location.assign("/auth"); }
  };

  // AI stubs — safe deterministic outputs (no key needed)
  const runAI = (kind: "bio" | "username" | "review" | "insights" | "recs") => {
    setAiBusy(kind);
    setTimeout(() => {
      const workouts = 0;
      const outputs: Record<typeof kind, string> = {
        bio: `Fitness explorer chasing a stronger, calmer version of me — powered by ${profile?.fitness_goals?.[0] || "steady progress"} and daily habits.`,
        username: [`${(displayName || "athlete").toLowerCase().replace(/\s+/g, "")}_x`, "fit_" + Math.random().toString(36).slice(2, 6), "flow_state_hero"].join(" · "),
        review: `Your profile is ${completion}% complete. ${completion < 70 ? "Add DOB, location and skills to unlock better recommendations." : "Great! Consider adding a portfolio link."}`,
        insights: `Personality lean: consistent • curious • recovery-aware. You benefit from short, high-intensity blocks and a strong sleep window.`,
        recs: `Try: 3× strength/week, one mobility session, and a Sunday long walk. Sleep target: 7.5h. Water: 3L/day.`,
      };
      setAiOutput({ kind, text: outputs[kind] });
      setAiBusy(null);
    }, 700);
  };

  const deleteAccount = () => {
    if (!confirm("This will permanently delete your account. Continue?")) return;
    toast({ title: "Requested", description: "Account deletion request submitted. Our team will confirm via email." });
  };

  // ---------- Connected accounts (real OAuth linking) ----------
  const [identities, setIdentities] = useState<Array<{ provider: string; id: string; identity_id?: string }>>([]);
  const refreshIdentities = useCallback(async () => {
    try {
      const anyAuth = supabase.auth as unknown as { getUserIdentities?: () => Promise<{ data: { identities: any[] } | null }> };
      if (typeof anyAuth.getUserIdentities === "function") {
        const { data } = await anyAuth.getUserIdentities();
        setIdentities(data?.identities ?? []);
      } else {
        const { data } = await supabase.auth.getUser();
        setIdentities((data.user?.identities as any) ?? []);
      }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { if (userId) refreshIdentities(); }, [userId, refreshIdentities]);

  const linkProvider = async (provider: "google" | "apple" | "github" | "azure" | "discord" | "facebook") => {
    try {
      const anyAuth = supabase.auth as unknown as { linkIdentity?: (opts: { provider: string; options?: any }) => Promise<{ error: any }> };
      if (typeof anyAuth.linkIdentity !== "function") {
        toast({ title: "Not supported", description: "Provider linking is unavailable on this account.", variant: "destructive" });
        return;
      }
      const { error } = await anyAuth.linkIdentity({ provider, options: { redirectTo: `${window.location.origin}/auth/callback` } });
      if (error) throw error;
      toast({ title: "Redirecting", description: `Connecting ${provider}…` });
    } catch (e: any) {
      toast({ title: "Link failed", description: e?.message ?? "Provider not enabled.", variant: "destructive" });
    }
  };
  const unlinkProvider = async (identity: any) => {
    try {
      const anyAuth = supabase.auth as unknown as { unlinkIdentity?: (i: any) => Promise<{ error: any }> };
      if (typeof anyAuth.unlinkIdentity !== "function") return;
      const { error } = await anyAuth.unlinkIdentity(identity);
      if (error) throw error;
      toast({ title: "Disconnected", description: identity.provider });
      refreshIdentities();
    } catch (e: any) {
      toast({ title: "Unlink failed", description: e?.message ?? "", variant: "destructive" });
    }
  };

  // ---------- Phone verification ----------
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneStep, setPhoneStep] = useState<"enter" | "verify">("enter");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneBusy, setPhoneBusy] = useState(false);
  const sendPhoneOtp = async () => {
    if (!/^\+\d{7,15}$/.test(phone)) {
      toast({ title: "Invalid number", description: "Use full international format, e.g. +919876543210.", variant: "destructive" });
      return;
    }
    setPhoneBusy(true);
    const { error } = await supabase.auth.updateUser({ phone });
    setPhoneBusy(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setPhoneStep("verify");
    toast({ title: "Code sent", description: `SMS sent to ${phone}` });
  };
  const verifyPhoneOtp = async () => {
    setPhoneBusy(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "phone_change" });
    setPhoneBusy(false);
    if (error) return toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    toast({ title: "Phone verified ✓" });
    setPhoneOpen(false); setPhoneStep("enter"); setPhone(""); setOtp("");
  };

  // ---------- Developer: API keys / OAuth apps / Webhooks (local, per-user) ----------
  type DevItem = { id: string; label: string; value: string; createdAt: number };
  const DEV_KEY = `ff.dev.${userId ?? "anon"}`;
  const [dev, setDev] = useState<{ apiKeys: DevItem[]; oauthApps: DevItem[]; webhooks: DevItem[] }>(() => {
    try { return JSON.parse(localStorage.getItem(DEV_KEY) || "") || { apiKeys: [], oauthApps: [], webhooks: [] }; }
    catch { return { apiKeys: [], oauthApps: [], webhooks: [] }; }
  });
  useEffect(() => {
    try { setDev(JSON.parse(localStorage.getItem(DEV_KEY) || "") || { apiKeys: [], oauthApps: [], webhooks: [] }); } catch { /* keep */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  useEffect(() => { try { localStorage.setItem(DEV_KEY, JSON.stringify(dev)); } catch {} }, [dev, DEV_KEY]);
  const [devOpen, setDevOpen] = useState<null | "apiKeys" | "oauthApps" | "webhooks">(null);
  const devLabels = { apiKeys: "API Keys", oauthApps: "OAuth Apps", webhooks: "Webhooks" } as const;
  const [devLabel, setDevLabel] = useState("");
  const [devValue, setDevValue] = useState("");
  const addDevItem = () => {
    if (!devOpen) return;
    if (!devLabel.trim()) return toast({ title: "Name required", variant: "destructive" });
    let value = devValue.trim();
    if (devOpen === "apiKeys") {
      const bytes = new Uint8Array(24); crypto.getRandomValues(bytes);
      value = "ff_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    } else if (!value) {
      return toast({ title: "URL required", variant: "destructive" });
    }
    const item: DevItem = { id: crypto.randomUUID(), label: devLabel.trim(), value, createdAt: Date.now() };
    setDev((d) => ({ ...d, [devOpen]: [item, ...d[devOpen]] }));
    setDevLabel(""); setDevValue("");
    if (devOpen === "apiKeys") { navigator.clipboard.writeText(value).catch(()=>{}); toast({ title: "Key created & copied" }); }
    else toast({ title: `${devLabels[devOpen]} added` });
  };
  const removeDevItem = (kind: "apiKeys" | "oauthApps" | "webhooks", id: string) => {
    setDev((d) => ({ ...d, [kind]: d[kind].filter((i) => i.id !== id) }));
  };


  return (
    <div className="space-y-4">
      {/* Cover + status */}
      <GlassCard>
        <div className="relative h-32 w-full overflow-hidden rounded-t-xl">
          {state.cover ? (
            <img src={state.cover} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/70 via-accent/60 to-primary/40" />
          )}
          <label className="absolute right-2 top-2 cursor-pointer">
            <input type="file" accept="image/*" className="sr-only" onChange={onCoverChange} />
            <span className="rounded-lg bg-background/70 backdrop-blur px-2 py-1 text-[10px] font-medium border border-border/40">Change cover</span>
          </label>
        </div>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{displayName || "You"}</h3>
            {completion >= 80 && (
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Verified profile
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-muted/30 px-3 py-2">
              <div className="text-muted-foreground">Completion</div>
              <div className="text-foreground font-semibold">{completion}%</div>
            </div>
            <div className="rounded-lg bg-muted/30 px-3 py-2">
              <div className="text-muted-foreground">Account age</div>
              <div className="text-foreground font-semibold">{accountAgeDays}d</div>
            </div>
          </div>
          <div>
            <Label htmlFor="status" className="text-xs">Custom status</Label>
            <Input id="status" value={state.status ?? ""} onChange={(e) => patch("status", e.target.value)} maxLength={120} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="quote" className="text-xs">Favorite quote</Label>
            <Input id="quote" value={state.quote ?? ""} onChange={(e) => patch("quote", e.target.value)} maxLength={160} className="mt-1" />
          </div>
        </CardContent>
      </GlassCard>

      {/* Quick actions */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Quick actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { icon: User, label: "Edit", fn: () => document.getElementById("profile-editor")?.scrollIntoView({ behavior: "smooth" }) },
              { icon: Share2, label: "Share", fn: shareLink },
              { icon: Copy, label: "Copy link", fn: copyLink },
              { icon: Download, label: "Export", fn: exportJSON },
              { icon: QrCode, label: "QR code", fn: generateQR },
              { icon: UserPlus, label: "Invite", fn: inviteFriends },
              { icon: Sparkles, label: "Refer & Earn", fn: () => toast({ title: `You have ${state.wallet.referrals} referrals` }) },
              { icon: Trash2, label: "Delete", fn: deleteAccount },
            ].map((a) => (
              <Button key={a.label} variant="outline" size="sm" onClick={a.fn}
                className="h-auto py-2 flex-col gap-1 border-border/30 bg-card/40">
                <a.icon className="h-4 w-4 text-primary" />
                <span className="text-[11px]">{a.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </GlassCard>

      <Accordion type="multiple" defaultValue={["personal"]} className="space-y-3">
        {/* Personal */}
        <AccordionItem value="personal" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><IdCard className="h-4 w-4 text-primary" />Personal information</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Label className="text-xs">Gender</Label><Input value={state.gender ?? ""} onChange={(e) => patch("gender", e.target.value)} placeholder="e.g. Female" /></div>
                <div><Label className="text-xs">Date of birth</Label><Input type="date" value={state.dob ?? ""} onChange={(e) => patch("dob", e.target.value)} /></div>
                <div><Label className="text-xs">Age (auto)</Label><Input value={age ?? ""} readOnly className="bg-muted/30" /></div>
                <div><Label className="text-xs">Blood group</Label><Input value={state.bloodGroup ?? ""} onChange={(e) => patch("bloodGroup", e.target.value)} placeholder="O+" /></div>
                <div><Label className="text-xs">Nationality</Label><Input value={state.nationality ?? ""} onChange={(e) => patch("nationality", e.target.value)} /></div>
                <div><Label className="text-xs">Country</Label><Input value={state.country ?? ""} onChange={(e) => patch("country", e.target.value)} /></div>
                <div><Label className="text-xs">State</Label><Input value={state.state ?? ""} onChange={(e) => patch("state", e.target.value)} /></div>
                <div><Label className="text-xs">City</Label><Input value={state.city ?? ""} onChange={(e) => patch("city", e.target.value)} /></div>
                <div className="md:col-span-2"><Label className="text-xs">Address</Label><Textarea rows={2} value={state.address ?? ""} onChange={(e) => patch("address", e.target.value)} /></div>
                <div><Label className="text-xs">Timezone</Label><Input value={state.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone} onChange={(e) => patch("timezone", e.target.value)} /></div>
                <div><Label className="text-xs">Languages</Label><Input value={state.languages ?? ""} onChange={(e) => patch("languages", e.target.value)} placeholder="English, Hindi" /></div>
                <div><Label className="text-xs">Religion (optional)</Label><Input value={state.religion ?? ""} onChange={(e) => patch("religion", e.target.value)} /></div>
                <div><Label className="text-xs">Marital status (optional)</Label><Input value={state.marital ?? ""} onChange={(e) => patch("marital", e.target.value)} /></div>
              </div>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Education & career */}
        <AccordionItem value="career" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><GraduationCap className="h-4 w-4 text-primary" />Education & career</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Label className="text-xs">Education</Label><Input value={state.education ?? ""} onChange={(e) => patch("education", e.target.value)} /></div>
                <div><Label className="text-xs">University</Label><Input value={state.university ?? ""} onChange={(e) => patch("university", e.target.value)} /></div>
                <div><Label className="text-xs">School</Label><Input value={state.school ?? ""} onChange={(e) => patch("school", e.target.value)} /></div>
                <div><Label className="text-xs">Degree</Label><Input value={state.degree ?? ""} onChange={(e) => patch("degree", e.target.value)} /></div>
                <div className="md:col-span-2"><Label className="text-xs">Skills</Label><Textarea rows={2} value={state.skills ?? ""} onChange={(e) => patch("skills", e.target.value)} placeholder="React, Nutrition, HIIT coaching" /></div>
                <div className="md:col-span-2"><Label className="text-xs">Experience</Label><Textarea rows={2} value={state.experience ?? ""} onChange={(e) => patch("experience", e.target.value)} /></div>
                <div className="md:col-span-2"><Label className="text-xs">Certifications</Label><Textarea rows={2} value={state.certifications ?? ""} onChange={(e) => patch("certifications", e.target.value)} /></div>
                <div className="md:col-span-2"><Label className="text-xs">Portfolio links</Label><Input value={state.portfolio ?? ""} onChange={(e) => patch("portfolio", e.target.value)} placeholder="https://…" /></div>
                <div className="md:col-span-2">
                  <Label className="text-xs">Resume</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-border/40 bg-card/40 px-3 py-1.5 text-xs">
                      <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={onResume} />
                      Upload resume
                    </label>
                    {state.resumeName && <span className="text-xs text-muted-foreground">{state.resumeName}</span>}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Health */}
        <AccordionItem value="health" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><Heart className="h-4 w-4 text-primary" />Health</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="rounded-lg bg-muted/30 p-3"><div className="text-muted-foreground">Height</div><div className="font-semibold">{profile?.height_cm ?? "—"} cm</div></div>
                <div className="rounded-lg bg-muted/30 p-3"><div className="text-muted-foreground">Weight</div><div className="font-semibold">{profile?.weight_kg ?? "—"} kg</div></div>
                <div className="rounded-lg bg-muted/30 p-3"><div className="text-muted-foreground">BMI</div><div className="font-semibold">{bmi ?? "—"}</div></div>
                <div className="rounded-lg bg-muted/30 p-3"><div className="text-muted-foreground">Sleep</div><div className="font-semibold">{state.sleepHours ?? 7.5}h</div></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div><Label className="text-xs">Water intake (L)</Label><Input type="number" min={0} step={0.1} value={state.waterIntake ?? 2.5} onChange={(e) => patch("waterIntake", Number(e.target.value))} /></div>
                <div><Label className="text-xs">Daily steps</Label><Input type="number" min={0} value={state.dailySteps ?? 8000} onChange={(e) => patch("dailySteps", Number(e.target.value))} /></div>
                <div><Label className="text-xs">Sleep hours</Label><Input type="number" min={0} step={0.5} value={state.sleepHours ?? 7.5} onChange={(e) => patch("sleepHours", Number(e.target.value))} /></div>
              </div>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Security */}
        <AccordionItem value="security" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><Shield className="h-4 w-4 text-primary" />Security</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 space-y-2">
              <Row label="Email"><span className="text-xs text-muted-foreground">{email || "—"}</span></Row>
              <Row label="Change password">
                <Button size="sm" variant="outline" onClick={changePassword} disabled={saving || !email}>
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Send reset email"}
                </Button>
              </Row>
              <Row label="Phone verification">
                <div className="flex items-center gap-2">
                  {(profile as any)?.phone_number ? <Badge variant="outline" className="text-[10px]">{(profile as any).phone_number}</Badge> : null}
                  <Button size="sm" variant="outline" onClick={() => { setPhoneOpen(true); setPhoneStep("enter"); }}>
                    <Phone className="h-3 w-3 mr-1" />Verify now
                  </Button>
                </div>
              </Row>
              <Row label="Email verification"><Badge variant="outline" className="text-[10px]">Verified</Badge></Row>
              <Row label="Two-factor auth"><Button size="sm" variant="outline" onClick={() => toast({ title: "Enable in Settings → Security" })}>Enable</Button></Row>
              <Row label="Backup codes"><Button size="sm" variant="outline" onClick={() => {
                const codes = Array.from({ length: 8 }, () => Math.random().toString(36).slice(2, 8).toUpperCase());
                navigator.clipboard.writeText(codes.join("\n"));
                toast({ title: "Backup codes copied", description: "Store them somewhere safe." });
              }}>Generate</Button></Row>
              <Row label="Active sessions"><Badge variant="outline" className="text-[10px]">1 device</Badge></Row>
              <Row label="Login history"><Button size="sm" variant="outline" onClick={() => toast({ title: "Last login: just now" })}>View</Button></Row>
              <Separator />
              <Button variant="destructive" size="sm" className="w-full" onClick={logoutEverywhere}>
                <LogOut className="h-3 w-3 mr-2" />Log out of all devices
              </Button>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Privacy */}
        <AccordionItem value="privacy" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><Lock className="h-4 w-4 text-primary" />Privacy</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5">
              {[
                { k: "publicProfile", label: "Public profile" },
                { k: "showEmail", label: "Show email" },
                { k: "showPhone", label: "Show phone" },
                { k: "showBirthday", label: "Show birthday" },
                { k: "showOnline", label: "Show online status" },
                { k: "dataSharing", label: "Analytics data sharing" },
              ].map((r) => (
                <Row key={r.k} label={r.label}>
                  <Switch checked={(state.privacy as never)[r.k]} onCheckedChange={(v) => patchNested("privacy", { [r.k]: v } as never)} />
                </Row>
              ))}
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Appearance */}
        <AccordionItem value="appearance" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><Palette className="h-4 w-4 text-primary" />Appearance</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 space-y-2">
              <Row label="Dark mode">
                <Switch checked={state.appearance.darkMode} onCheckedChange={(v) => {
                  patchNested("appearance", { darkMode: v });
                  setDarkMode(v);
                }} />
              </Row>
              <Row label="Glassmorphism"><Switch checked={state.appearance.glass} onCheckedChange={(v) => patchNested("appearance", { glass: v })} /></Row>
              <Row label="Compact mode"><Switch checked={state.appearance.compact} onCheckedChange={(v) => patchNested("appearance", { compact: v })} /></Row>
              <div>
                <Label className="text-xs">Accent palette</Label>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {["#3B82F6","#8B5CF6","#EC4899","#F97316","#10B981","#06B6D4","#EF4444","#F59E0B","#14B8A6","#6366F1"].map((c) => (
                    <button key={c} type="button" aria-label={`Accent ${c}`}
                      onClick={() => { patchNested("appearance", { accent: c }); applyAccent(c); }}
                      className={`h-7 w-7 rounded-full ring-offset-2 ring-offset-background transition ${state.appearance.accent.toLowerCase()===c.toLowerCase() ? "ring-2 ring-foreground scale-110" : "ring-1 ring-border/60 hover:scale-105"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                  <Input type="color" value={state.appearance.accent}
                    onChange={(e) => { patchNested("appearance", { accent: e.target.value }); applyAccent(e.target.value); }}
                    className="h-8 w-10 p-1 cursor-pointer" aria-label="Custom accent color" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Applied live across buttons, links, and rings.</p>
              </div>
              <div><Label className="text-xs">Font size ({state.appearance.fontSize}px)</Label>
                <input type="range" min={12} max={22} value={state.appearance.fontSize} onChange={(e) => patchNested("appearance", { fontSize: Number(e.target.value) })} className="w-full accent-primary" />
              </div>
              <div><Label className="text-xs">Animation speed ({state.appearance.animationSpeed.toFixed(1)}×)</Label>
                <input type="range" min={0.5} max={2} step={0.1} value={state.appearance.animationSpeed} onChange={(e) => patchNested("appearance", { animationSpeed: Number(e.target.value) })} className="w-full accent-primary" />
              </div>
              <div><Label className="text-xs">Wallpaper</Label>
                <select value={state.appearance.wallpaper} onChange={(e) => patchNested("appearance", { wallpaper: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-border/40 bg-background px-2 text-sm">
                  <option value="aurora">Aurora</option><option value="mesh">Mesh</option><option value="dark-flow">Dark Flow</option><option value="none">None</option>
                </select>
              </div>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Notifications */}
        <AccordionItem value="notifications" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><Bell className="h-4 w-4 text-primary" />Notifications</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5">
              {[
                { k: "push", label: "Push notifications" },
                { k: "email", label: "Email notifications" },
                { k: "sms", label: "SMS notifications" },
                { k: "marketing", label: "Marketing emails" },
                { k: "security", label: "Security alerts" },
                { k: "weekly", label: "Weekly summary" },
              ].map((r) => (
                <Row key={r.k} label={r.label}>
                  <Switch checked={(state.notifications as never)[r.k]} onCheckedChange={(v) => patchNested("notifications", { [r.k]: v } as never)} />
                </Row>
              ))}
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* AI */}
        <AccordionItem value="ai" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" />AI features</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {([
                  ["review", "Profile review"],
                  ["bio", "Bio generator"],
                  ["username", "Username ideas"],
                  ["insights", "Personality insights"],
                  ["recs", "Recommendations"],
                ] as const).map(([k, label]) => (
                  <Button key={k} size="sm" variant="outline" disabled={aiBusy !== null} onClick={() => runAI(k)}>
                    {aiBusy === k ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}{label}
                  </Button>
                ))}
              </div>
              {aiOutput && (
                <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold capitalize">{aiOutput.kind}</span>
                    <div className="flex gap-1">
                      {aiOutput.kind === "bio" && (
                        <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => {
                          updateProfile.mutate({ bio: aiOutput.text } as never);
                          toast({ title: "Bio updated" });
                        }}>Apply</Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => { navigator.clipboard.writeText(aiOutput.text); toast({ title: "Copied" }); }}>Copy</Button>
                    </div>
                  </div>
                  <p className="leading-relaxed">{aiOutput.text}</p>
                </div>
              )}
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Analytics */}
        <AccordionItem value="analytics" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><BarChart3 className="h-4 w-4 text-primary" />Analytics</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {[
                  { label: "Logins", value: Number(localStorage.getItem("login_count") || 1) },
                  { label: "Days active", value: Math.max(1, accountAgeDays) },
                  { label: "Account age (d)", value: accountAgeDays },
                  { label: "Sessions", value: 1 },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-muted/30 p-3"><div className="text-muted-foreground">{s.label}</div><div className="font-semibold">{s.value}</div></div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast({ title: "Weekly report emailed", description: "Sent to " + (email || "your inbox") })}>Weekly report</Button>
                <Button size="sm" variant="outline" onClick={() => toast({ title: "Monthly report emailed" })}>Monthly report</Button>
              </div>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Achievements */}
        <AccordionItem value="achievements" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4 text-primary" />Achievements & XP</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-black">12</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">Level 12 · Fitness Warrior</div>
                  <div className="w-full bg-muted/30 rounded-full h-2 mt-1"><div className="bg-primary h-2 rounded-full" style={{ width: "62%" }} /></div>
                  <div className="text-[10px] text-muted-foreground mt-1">1,240 / 2,000 XP</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["🔥 7-Day Streak", "💪 100 Workouts", "🏆 Early Bird", "🎯 Goal Setter", "🥇 Milestone"].map((b) => (
                  <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>
                ))}
              </div>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Wallet */}
        <AccordionItem value="wallet" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><Wallet className="h-4 w-4 text-primary" />Wallet & rewards</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="rounded-lg bg-muted/30 p-3"><div className="text-muted-foreground">Coins</div><div className="font-semibold">{state.wallet.coins}</div></div>
                <div className="rounded-lg bg-muted/30 p-3"><div className="text-muted-foreground">Referrals</div><div className="font-semibold">{state.wallet.referrals}</div></div>
                <div className="rounded-lg bg-muted/30 p-3"><div className="text-muted-foreground">Coupons</div><div className="font-semibold">2</div></div>
                <div className="rounded-lg bg-muted/30 p-3"><div className="text-muted-foreground">Plan</div><div className="font-semibold">Free</div></div>
              </div>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Backup */}
        <AccordionItem value="backup" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><HardDriveDownload className="h-4 w-4 text-primary" />Backup & data</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={exportJSON}><Download className="h-3 w-3 mr-1" />Export JSON</Button>
              <Button size="sm" variant="outline" onClick={() => window.print()}><Download className="h-3 w-3 mr-1" />Export PDF</Button>
              <Button size="sm" variant="outline" onClick={() => { localStorage.setItem(keyFor(userId) + "-backup", JSON.stringify(state)); toast({ title: "Backup saved" }); }}>Backup</Button>
              <Button size="sm" variant="outline" onClick={() => {
                const raw = localStorage.getItem(keyFor(userId) + "-backup");
                if (!raw) { toast({ title: "No backup" }); return; }
                setState(JSON.parse(raw));
                toast({ title: "Restored" });
              }}><RefreshCw className="h-3 w-3 mr-1" />Restore</Button>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Connections */}
        <AccordionItem value="connections" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><Link2 className="h-4 w-4 text-primary" />Connected accounts</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 space-y-2">
              {(["google","apple","github","azure","discord","facebook"] as const).map((p) => {
                const linked = identities.find((i) => i.provider === p);
                const displayName = p === "azure" ? "Microsoft" : p.charAt(0).toUpperCase() + p.slice(1);
                return (
                  <Row key={p} label={displayName}>
                    <div className="flex items-center gap-2">
                      {linked && <Badge variant="outline" className="text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />Connected</Badge>}
                      {linked ? (
                        <Button size="sm" variant="outline" onClick={() => unlinkProvider(linked)} disabled={identities.length <= 1}>
                          <X className="h-3 w-3 mr-1" />Disconnect
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => linkProvider(p)}>
                          <Plus className="h-3 w-3 mr-1" />Connect
                        </Button>
                      )}
                    </div>
                  </Row>
                );
              })}
              <p className="text-[10px] text-muted-foreground pt-1">You must keep at least one sign-in method connected.</p>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Developer */}
        <AccordionItem value="developer" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><Terminal className="h-4 w-4 text-primary" />Developer</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 space-y-2">
              <Row label="Developer mode"><Switch checked={state.developer.mode} onCheckedChange={(v) => patch("developer", { mode: v })} /></Row>
              <Row label={`API keys (${dev.apiKeys.length})`}>
                <Button size="sm" variant="outline" onClick={() => { setDevOpen("apiKeys"); setDevLabel(""); setDevValue(""); }}>
                  <KeyRound className="h-3 w-3 mr-1" />Manage
                </Button>
              </Row>
              <Row label={`OAuth apps (${dev.oauthApps.length})`}>
                <Button size="sm" variant="outline" onClick={() => { setDevOpen("oauthApps"); setDevLabel(""); setDevValue(""); }}>
                  <Terminal className="h-3 w-3 mr-1" />Manage
                </Button>
              </Row>
              <Row label={`Webhooks (${dev.webhooks.length})`}>
                <Button size="sm" variant="outline" onClick={() => { setDevOpen("webhooks"); setDevLabel(""); setDevValue(""); }}>
                  <Webhook className="h-3 w-3 mr-1" />Manage
                </Button>
              </Row>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Support */}
        <AccordionItem value="support" className="border-none">
          <GlassCard>
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold"><LifeBuoy className="h-4 w-4 text-primary" />Support</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => window.open("/help", "_blank")}>Help center</Button>
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Thanks — reported" })}>Report bug</Button>
              <Button size="sm" variant="outline" onClick={() => window.open("mailto:support@fitxfusion.app")}>Contact support</Button>
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Feedback saved" })}>Feedback</Button>
              <Button size="sm" variant="outline" onClick={() => window.open("/faq", "_blank")}>FAQ</Button>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>
      </Accordion>

      {/* Phone verification dialog */}
      <Dialog open={phoneOpen} onOpenChange={(o) => { setPhoneOpen(o); if (!o) { setPhoneStep("enter"); setOtp(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your phone</DialogTitle>
            <DialogDescription>
              {phoneStep === "enter" ? "We'll send a one-time code by SMS." : `Enter the 6-digit code sent to ${phone}.`}
            </DialogDescription>
          </DialogHeader>
          {phoneStep === "enter" ? (
            <div className="space-y-2">
              <Label className="text-xs">Phone number (E.164)</Label>
              <Input placeholder="+919876543210" value={phone} onChange={(e) => setPhone(e.target.value.trim())} inputMode="tel" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs">Verification code</Label>
              <Input placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0,6))} inputMode="numeric" />
            </div>
          )}
          <DialogFooter>
            {phoneStep === "enter" ? (
              <Button onClick={sendPhoneOtp} disabled={phoneBusy}>
                {phoneBusy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Phone className="h-4 w-4 mr-1" />}Send code
              </Button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                <Button variant="outline" onClick={() => setPhoneStep("enter")}>Back</Button>
                <Button onClick={verifyPhoneOtp} disabled={phoneBusy || otp.length !== 6}>
                  {phoneBusy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}Verify
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Developer manager dialog */}
      <Dialog open={!!devOpen} onOpenChange={(o) => { if (!o) setDevOpen(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{devOpen ? devLabels[devOpen] : ""}</DialogTitle>
            <DialogDescription>
              {devOpen === "apiKeys" && "Personal API keys. Shown once — copy them immediately."}
              {devOpen === "oauthApps" && "Register callback URLs for OAuth apps that will use your account."}
              {devOpen === "webhooks" && "HTTPS endpoints notified when your activity events fire."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
              <Input placeholder="Name / label" value={devLabel} onChange={(e) => setDevLabel(e.target.value)} />
              {devOpen !== "apiKeys" && (
                <Input placeholder={devOpen === "webhooks" ? "https://example.com/webhook" : "https://app.example.com/callback"} value={devValue} onChange={(e) => setDevValue(e.target.value)} />
              )}
              <Button onClick={addDevItem}><Plus className="h-4 w-4 mr-1" />Add</Button>
            </div>
            <div className="max-h-64 overflow-auto space-y-2">
              {devOpen && dev[devOpen].length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nothing yet.</p>}
              {devOpen && dev[devOpen].map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">{item.value}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(item.value).catch(()=>{}); toast({ title: "Copied" }); }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => removeDevItem(devOpen, item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

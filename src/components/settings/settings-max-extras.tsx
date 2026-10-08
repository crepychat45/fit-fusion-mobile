import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { safeJsonParse } from "@/lib/safe-storage";
import { APP_VERSION } from "@/lib/app-version";
import {
  BellPlus, Clipboard, Cpu, EyeOff, HardDrive, KeyRound, MessageSquareText, Ruler,
  ScreenShare, Share2, Smartphone, Type, UserRound,
} from "lucide-react";

/* ------------------------------ helpers ------------------------------ */

const isNative = () => Capacitor.isNativePlatform();

function usePersisted<T extends Record<string, unknown>>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => ({ ...initial, ...safeJsonParse<Partial<T>>(localStorage.getItem(key), {}) }));
  const update = useCallback((patch: Partial<T>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage blocked */ }
      return next;
    });
  }, [key]);
  return [state, update] as const;
}

export async function copyText(text: string) {
  if (isNative()) {
    const { Clipboard } = await import("@capacitor/clipboard");
    await Clipboard.write({ string: text });
    return;
  }
  await navigator.clipboard.writeText(text);
}

async function shareContent(data: { title: string; text: string; url: string }) {
  if (isNative()) {
    const { Share } = await import("@capacitor/share");
    await Share.share({ ...data, dialogTitle: data.title });
    return "shared";
  }
  if (navigator.share) { await navigator.share(data); return "shared"; }
  await copyText(data.url);
  return "copied";
}

async function openExternal(url: string) {
  if (isNative()) {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url });
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function Section({ icon: Icon, title, desc, children }: { icon: React.ElementType; title: string; desc: string; children: React.ReactNode }) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-primary" />{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

/* ------------------------------ Account ------------------------------ */

export function AccountMaxExtras() {
  const { toast } = useToast();
  const [info, setInfo] = useState<{ id: string; email?: string; provider?: string; created?: string; last?: string } | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setInfo({ id: u.id, email: u.email, provider: u.app_metadata?.provider, created: u.created_at, last: u.last_sign_in_at });
    });
  }, []);
  if (!info) return <Section icon={UserRound} title="Account details" desc="Sign in to see your account details.">{null}</Section>;
  const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "—");
  return (
    <Section icon={UserRound} title="Account details" desc="Read straight from your signed-in account.">
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between gap-2"><span className="text-muted-foreground">Email</span><span className="truncate">{info.email ?? "—"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Sign-in method</span><Badge variant="secondary">{info.provider ?? "email"}</Badge></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Member since</span><span>{fmt(info.created)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Last sign-in</span><span>{fmt(info.last)}</span></div>
      </div>
      <Button size="sm" variant="outline" onClick={async () => { await copyText(info.id); toast({ title: "Account ID copied" }); }}>
        <Clipboard className="h-4 w-4 mr-2" />Copy account ID for support
      </Button>
    </Section>
  );
}

/* ------------------------------ Security ----------------------------- */

export function SecurityMaxExtras() {
  const { toast } = useToast();
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const load = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setExpiresAt(data.session?.expires_at ? data.session.expires_at * 1000 : null);
  }, []);
  useEffect(() => { load(); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [load]);
  const left = expiresAt ? Math.max(0, Math.floor((expiresAt - now) / 1000)) : null;
  return (
    <Section icon={KeyRound} title="Session key" desc="Your sign-in key renews automatically. You can renew it now.">
      <div className="text-sm">
        {left === null ? "Not signed in" : <>Renews in <span className="font-mono">{Math.floor(left / 60)}m {left % 60}s</span></>}
      </div>
      <Button size="sm" variant="outline" disabled={left === null} onClick={async () => {
        const { error } = await supabase.auth.refreshSession();
        if (error) toast({ title: "Could not renew", description: error.message, variant: "destructive" });
        else { toast({ title: "Session renewed" }); load(); }
      }}>Renew now</Button>
    </Section>
  );
}

/* ------------------------------ Display ------------------------------ */

export function DisplayMaxExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-max-display", { textScale: 100, orientation: "any" });
  useEffect(() => { document.documentElement.style.fontSize = `${s.textScale}%`; }, [s.textScale]);
  const applyOrientation = async (o: string) => {
    set({ orientation: o });
    try {
      if (isNative()) {
        const { ScreenOrientation } = await import("@capacitor/screen-orientation");
        if (o === "any") await ScreenOrientation.unlock();
        else await ScreenOrientation.lock({ orientation: o as "portrait" | "landscape" });
      } else {
        const so = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
        if (o === "any") so.unlock?.();
        else if (so.lock) await so.lock(o);
      }
    } catch {
      toast({ title: "Not supported here", description: "Rotation lock works in the installed app or full screen." });
    }
  };
  return (
    <Section icon={Type} title="Text size & rotation" desc="Scale all text and lock screen rotation.">
      <Label>Text size: {s.textScale}%</Label>
      <Slider min={85} max={130} step={5} value={[s.textScale]} onValueChange={([v]) => set({ textScale: v })} />
      <Label>Screen rotation</Label>
      <Select value={s.orientation} onValueChange={applyOrientation}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Auto-rotate</SelectItem>
          <SelectItem value="portrait">Portrait</SelectItem>
          <SelectItem value="landscape">Landscape</SelectItem>
        </SelectContent>
      </Select>
    </Section>
  );
}

/* ------------------------------ Privacy ------------------------------ */

export function PrivacyMaxExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted("fitfusion-max-privacy", { blurOnLeave: false });
  useEffect(() => {
    if (!s.blurOnLeave) return;
    const onVis = () => document.body.classList.toggle("ff-privacy-blur", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", () => document.body.classList.add("ff-privacy-blur"));
    const unblur = () => document.body.classList.remove("ff-privacy-blur");
    window.addEventListener("focus", unblur);
    return () => { document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", unblur); unblur(); };
  }, [s.blurOnLeave]);
  return (
    <Section icon={EyeOff} title="Hide screen when away" desc="Blurs the app when you switch to another app or tab.">
      <div className="flex items-center justify-between">
        <Label htmlFor="blur-leave">Blur when leaving the app</Label>
        <Switch id="blur-leave" checked={s.blurOnLeave} onCheckedChange={(v) => set({ blurOnLeave: v })} />
      </div>
      <Button size="sm" variant="outline" onClick={async () => { try { await copyText(" "); toast({ title: "Clipboard cleared" }); } catch { toast({ title: "Clipboard blocked", variant: "destructive" }); } }}>
        Clear clipboard
      </Button>
    </Section>
  );
}

/* ---------------------------- Notifications --------------------------- */

export function NotificationMaxExtras() {
  const { toast } = useToast();
  const [minutes, setMinutes] = useState(30);
  const [title, setTitle] = useState("Time to move!");
  const schedule = async () => {
    const at = new Date(Date.now() + minutes * 60_000);
    try {
      if (isNative()) {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display !== "granted") throw new Error("Permission denied");
        await LocalNotifications.schedule({ notifications: [{ id: Date.now() % 2_000_000_000, title, body: "FitxFusion reminder", schedule: { at } }] });
        toast({ title: "Reminder set", description: at.toLocaleTimeString() });
      } else {
        if (!("Notification" in window)) throw new Error("Notifications not supported");
        const p = await Notification.requestPermission();
        if (p !== "granted") throw new Error("Permission denied");
        setTimeout(() => new Notification(title, { body: "FitxFusion reminder", icon: "/favicon.ico" }), minutes * 60_000);
        toast({ title: "Reminder set", description: `${at.toLocaleTimeString()} — keep this tab open on web.` });
      }
    } catch (e) {
      toast({ title: "Could not set reminder", description: (e as Error).message, variant: "destructive" });
    }
  };
  return (
    <Section icon={BellPlus} title="Quick reminder" desc="Schedule a one-off reminder. On the phone app it fires even when closed.">
      <Input value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} aria-label="Reminder text" />
      <Label>In {minutes} minutes</Label>
      <Slider min={1} max={240} step={1} value={[minutes]} onValueChange={([v]) => setMinutes(v)} />
      <Button size="sm" onClick={schedule} disabled={!title.trim()}>Set reminder</Button>
    </Section>
  );
}

/* -------------------------------- Units ------------------------------- */

const CONVERSIONS = {
  "kg→lb": (v: number) => v * 2.20462, "lb→kg": (v: number) => v / 2.20462,
  "cm→in": (v: number) => v / 2.54, "in→cm": (v: number) => v * 2.54,
  "km→mi": (v: number) => v * 0.621371, "mi→km": (v: number) => v / 0.621371,
  "kcal→kJ": (v: number) => v * 4.184, "°C→°F": (v: number) => v * 9 / 5 + 32,
} as const;

export function UnitsMaxExtras() {
  const [mode, setMode] = useState<keyof typeof CONVERSIONS>("kg→lb");
  const [val, setVal] = useState("70");
  const n = parseFloat(val);
  const out = Number.isFinite(n) ? CONVERSIONS[mode](n).toFixed(2) : "—";
  return (
    <Section icon={Ruler} title="Unit converter" desc="Convert weight, length, distance, energy and temperature.">
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} aria-label="Value" />
        <Select value={mode} onValueChange={(v) => setMode(v as keyof typeof CONVERSIONS)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{Object.keys(CONVERSIONS).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="text-2xl font-semibold">{out} <span className="text-sm text-muted-foreground">{mode.split("→")[1]}</span></div>
    </Section>
  );
}

/* -------------------------------- Chat -------------------------------- */

export function ChatMaxExtras() {
  const { toast } = useToast();
  const [s, set] = usePersisted<{ replies: string[] }>("fitfusion-max-quick-replies", { replies: ["On my way to the gym 💪", "Great workout!", "Let's train tomorrow?"] });
  const [draft, setDraft] = useState("");
  return (
    <Section icon={MessageSquareText} title="Quick replies" desc="Save phrases you send often. Tap one to copy it.">
      <div className="flex flex-wrap gap-2">
        {s.replies.map((r, i) => (
          <Badge key={i} variant="secondary" className="cursor-pointer gap-1 py-1" onClick={async () => { await copyText(r); toast({ title: "Copied" }); }}>
            {r}
            <button aria-label="Remove" className="ml-1 opacity-60" onClick={(e) => { e.stopPropagation(); set({ replies: s.replies.filter((_, j) => j !== i) }); }}>×</button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={draft} maxLength={120} placeholder="New quick reply" onChange={(e) => setDraft(e.target.value)} />
        <Button size="sm" disabled={!draft.trim() || s.replies.length >= 12} onClick={() => { set({ replies: [...s.replies, draft.trim()] }); setDraft(""); }}>Add</Button>
      </div>
    </Section>
  );
}

/* -------------------------------- Data -------------------------------- */

export function DataMaxExtras() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const items = useMemo(() => {
    const rows: { key: string; bytes: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      rows.push({ key: k, bytes: (localStorage.getItem(k)?.length ?? 0) * 2 });
    }
    return rows.sort((a, b) => b.bytes - a.bytes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
  const total = items.reduce((a, b) => a + b.bytes, 0);
  const protectedKey = (k: string) => k.startsWith("sb-") || k === "theme";
  return (
    <Section icon={HardDrive} title="Device storage breakdown" desc={`${items.length} saved items · ${(total / 1024).toFixed(1)} KB on this device`}>
      <div className="max-h-56 overflow-y-auto space-y-1 text-xs">
        {items.slice(0, 40).map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-2">
            <span className="truncate font-mono">{r.key}</span>
            <span className="flex items-center gap-2 shrink-0">
              {(r.bytes / 1024).toFixed(1)} KB
              <Button size="sm" variant="ghost" className="h-6 px-2" disabled={protectedKey(r.key)}
                onClick={() => { localStorage.removeItem(r.key); setTick((t) => t + 1); toast({ title: "Removed", description: r.key }); }}>
                Clear
              </Button>
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Sign-in and theme items are protected.</p>
    </Section>
  );
}

/* ------------------------------ Developer ------------------------------ */

const PLUGINS = ["App", "Haptics", "Device", "Network", "Camera", "Geolocation", "LocalNotifications", "PushNotifications",
  "StatusBar", "SplashScreen", "Keyboard", "Share", "Clipboard", "Browser", "ScreenOrientation", "BluetoothLe", "NativeBiometric"];

export function DeveloperMaxExtras() {
  const platform = Capacitor.getPlatform();
  return (
    <Section icon={Cpu} title="Native capabilities" desc={`Platform: ${platform}${isNative() ? " (phone app)" : " (browser)"}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {PLUGINS.map((p) => {
          const ok = isNative() ? Capacitor.isPluginAvailable(p) : false;
          return <div key={p} className="flex items-center justify-between rounded-md border px-2 py-1"><span>{p}</span><Badge variant={ok ? "default" : "outline"}>{ok ? "ready" : isNative() ? "missing" : "web"}</Badge></div>;
        })}
      </div>
      {!isNative() && <p className="text-xs text-muted-foreground">In the browser, web versions of these features are used where available.</p>}
    </Section>
  );
}

/* -------------------------------- About -------------------------------- */

export function AboutMaxExtras() {
  const { toast } = useToast();
  const url = "https://fitxfusion.lovable.app";
  return (
    <Section icon={Share2} title="Share FitxFusion" desc={`Version ${APP_VERSION}`}>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={async () => {
          try { const r = await shareContent({ title: "FitxFusion", text: "Train with me on FitxFusion", url }); if (r === "copied") toast({ title: "Link copied" }); }
          catch { /* user cancelled */ }
        }}><Share2 className="h-4 w-4 mr-2" />Share app</Button>
        <Button size="sm" variant="outline" onClick={() => openExternal(url)}><ScreenShare className="h-4 w-4 mr-2" />Open website</Button>
        <Button size="sm" variant="outline" onClick={async () => { await copyText(`FitxFusion ${APP_VERSION} · ${Capacitor.getPlatform()} · ${navigator.userAgent}`); toast({ title: "Version info copied" }); }}>
          <Smartphone className="h-4 w-4 mr-2" />Copy version info
        </Button>
      </div>
    </Section>
  );
}

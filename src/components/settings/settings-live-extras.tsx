import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { runSecurityChecks, type SecurityCheck } from "@/lib/security-checks";
import { CheckCircle2, XCircle, ShieldCheck, LogOut, KeyRound, History, Radio, Moon, BellRing, Dumbbell, HardDrive, Loader2, Cloud, CloudOff } from "lucide-react";

type Category = "privacy_settings" | "notification_settings" | "account_settings" | "security_settings";
type SyncState = "idle" | "saving" | "saved" | "error";

/** Cloud-backed preference group stored under `live` in one user_settings column, with live cross-device updates. */
function useCloudGroup<T extends Record<string, unknown>>(category: Category, defaults: T) {
  const [value, setValue] = useState<T>(defaults);
  const [sync, setSync] = useState<SyncState>("idle");
  const [remoteAt, setRemoteAt] = useState<number | null>(null);
  const uidRef = useRef<string | null>(null);
  const rowRef = useRef<Record<string, unknown>>({});
  const lastWrite = useRef(0);

  const apply = useCallback((row: Record<string, unknown> | null) => {
    const col = (row?.[category] as Record<string, unknown>) ?? {};
    rowRef.current = col;
    setValue({ ...defaults, ...((col.live as T) ?? {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      uidRef.current = uid;
      const { data: row } = await supabase.from("user_settings").select(category).eq("user_id", uid).maybeSingle();
      apply(row as Record<string, unknown> | null);
      channel = supabase
        .channel(`settings-live-${category}-${crypto.randomUUID()}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "user_settings", filter: `user_id=eq.${uid}` }, (p) => {
          if (Date.now() - lastWrite.current < 1500) return;
          apply(p.new as Record<string, unknown>);
          setRemoteAt(Date.now());
        })
        .subscribe();
    });
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [category, apply]);

  const update = async (patch: Partial<T>) => {
    const next = { ...value, ...patch };
    setValue(next);
    const uid = uidRef.current;
    if (!uid) return setSync("error");
    setSync("saving");
    lastWrite.current = Date.now();
    const merged = { ...rowRef.current, live: next };
    rowRef.current = merged;
    const { error } = await supabase.from("user_settings").upsert({ user_id: uid, [category]: merged } as never, { onConflict: "user_id" });
    setSync(error ? "error" : "saved");
  };

  const reset = () => update(defaults);
  return { value, update, reset, sync, remoteAt, signedIn: Boolean(uidRef.current) };
}

function SyncBadge({ sync, remoteAt }: { sync: SyncState; remoteAt: number | null }) {
  if (sync === "saving") return <Badge variant="outline"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Saving</Badge>;
  if (sync === "error") return <Badge variant="destructive"><CloudOff className="h-3 w-3 mr-1" />Sync failed</Badge>;
  if (remoteAt && Date.now() - remoteAt < 10000) return <Badge><Radio className="h-3 w-3 mr-1" />Updated from another device</Badge>;
  if (sync === "saved") return <Badge variant="secondary"><Cloud className="h-3 w-3 mr-1" />Saved</Badge>;
  return <Badge variant="outline"><Cloud className="h-3 w-3 mr-1" />Synced</Badge>;
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 min-h-12">
      <div className="min-w-0">
        <Label className="text-sm">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

/* ---------------- Security ---------------- */
export function SecurityLiveCenter() {
  const { toast } = useToast();
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<{ event_name: string; created_at: string }[]>([]);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  const scan = useCallback(async () => {
    setBusy(true);
    const r = await runSecurityChecks();
    setChecks(r.checks);
    setScore(r.score);
    setBusy(false);
  }, []);

  useEffect(() => {
    scan();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: rows } = await supabase
        .from("analytics_events")
        .select("event_name,created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(8);
      setHistory(rows ?? []);
    });
  }, [scan]);

  const signOut = async (scope: "others" | "global") => {
    const { error } = await supabase.auth.signOut({ scope });
    toast(error ? { title: "Couldn't sign out", description: error.message, variant: "destructive" } : { title: scope === "others" ? "Other devices signed out" : "Signed out everywhere" });
  };

  const changePassword = async () => {
    if (pw.next.length < 8) return toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
    if (pw.next !== pw.confirm) return toast({ title: "Passwords don't match", variant: "destructive" });
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (!email) return toast({ title: "Sign in first", variant: "destructive" });
    const check = await supabase.auth.signInWithPassword({ email, password: pw.current });
    if (check.error) return toast({ title: "Current password is wrong", variant: "destructive" });
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    if (error) return toast({ title: "Couldn't change password", description: error.message, variant: "destructive" });
    setPw({ current: "", next: "", confirm: "" });
    toast({ title: "Password changed" });
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Live Security Check</CardTitle>
        <CardDescription>Real checks on this device and account. Nothing here is estimated.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold w-20">{score ?? "--"}%</div>
          <Progress value={score ?? 0} className="h-2 flex-1" />
          <Button size="sm" variant="outline" onClick={scan} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-check"}</Button>
        </div>
        <ul className="space-y-2">
          {checks.map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-sm">
              {c.passed ? <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />}
              <span>{c.label}{!c.passed && <span className="block text-xs text-muted-foreground">{c.tip}</span>}</span>
            </li>
          ))}
        </ul>

        <div className="grid sm:grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => signOut("others")}><LogOut className="h-4 w-4 mr-2" />Sign out other devices</Button>
          <Button variant="destructive" onClick={() => signOut("global")}><LogOut className="h-4 w-4 mr-2" />Sign out everywhere</Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2"><KeyRound className="h-4 w-4" />Change password</p>
          <Input type="password" autoComplete="current-password" placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <Input type="password" autoComplete="new-password" placeholder="New password (8+ characters)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          <Input type="password" autoComplete="new-password" placeholder="Confirm new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          <Button onClick={changePassword} disabled={!pw.current || !pw.next} className="w-full">Update password</Button>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium flex items-center gap-2"><History className="h-4 w-4" />Recent account activity</p>
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground">No recorded activity yet.</p>
          ) : (
            history.map((h, i) => (
              <div key={i} className="flex justify-between text-xs border-b border-border/40 py-1">
                <span>{h.event_name.replace(/_/g, " ")}</span>
                <span className="text-muted-foreground">{new Date(h.created_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Privacy ---------------- */
export function PrivacyLivePanel() {
  const g = useCloudGroup("privacy_settings", { visibility: "public", messages: "everyone", hideLeaderboard: false, hideActivity: false, showOnline: true });
  return (
    <Card className="liquid-glass">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div><CardTitle>Live Privacy Controls</CardTitle><CardDescription>Saved to your account and synced to all devices.</CardDescription></div>
        <SyncBadge sync={g.sync} remoteAt={g.remoteAt} />
      </CardHeader>
      <CardContent className="divide-y divide-border/40">
        <Row label="Profile visibility">
          <Select value={g.value.visibility} onValueChange={(v) => g.update({ visibility: v })}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="public">Everyone</SelectItem><SelectItem value="contacts">Contacts</SelectItem><SelectItem value="private">Only me</SelectItem></SelectContent>
          </Select>
        </Row>
        <Row label="Who can message me">
          <Select value={g.value.messages} onValueChange={(v) => g.update({ messages: v })}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="everyone">Everyone</SelectItem><SelectItem value="contacts">Contacts</SelectItem><SelectItem value="nobody">Nobody</SelectItem></SelectContent>
          </Select>
        </Row>
        <Row label="Hide me from leaderboards"><Switch checked={g.value.hideLeaderboard} onCheckedChange={(v) => g.update({ hideLeaderboard: v })} /></Row>
        <Row label="Hide my workout activity"><Switch checked={g.value.hideActivity} onCheckedChange={(v) => g.update({ hideActivity: v })} /></Row>
        <Row label="Show when I'm online"><Switch checked={g.value.showOnline} onCheckedChange={(v) => g.update({ showOnline: v })} /></Row>
        <div className="pt-3"><Button variant="ghost" size="sm" onClick={g.reset}>Reset privacy section</Button></div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Notifications ---------------- */
export function NotificationLivePanel() {
  const { toast } = useToast();
  const g = useCloudGroup("notification_settings", { quietEnabled: false, quietFrom: "22:00", quietTo: "07:00", workouts: true, social: true, updates: true, security: true });
  const test = async () => {
    if (typeof Notification === "undefined") return toast({ title: "Notifications aren't supported here", variant: "destructive" });
    const perm = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (perm !== "granted") return toast({ title: "Notifications are blocked", description: "Allow them in your browser or phone settings.", variant: "destructive" });
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification("FitxFusion", { body: "Test notification — it works!", icon: "/icons/icon-192.png" });
    else new Notification("FitxFusion", { body: "Test notification — it works!" });
  };
  return (
    <Card className="liquid-glass">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div><CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5" />Live Notification Rules</CardTitle><CardDescription>Synced instantly to your other devices.</CardDescription></div>
        <SyncBadge sync={g.sync} remoteAt={g.remoteAt} />
      </CardHeader>
      <CardContent className="divide-y divide-border/40">
        <Row label="Quiet hours" hint="Silence alerts during these times"><Switch checked={g.value.quietEnabled} onCheckedChange={(v) => g.update({ quietEnabled: v })} /></Row>
        {g.value.quietEnabled && (
          <div className="flex items-center gap-2 py-2"><Moon className="h-4 w-4" />
            <Input type="time" className="w-28" value={g.value.quietFrom} onChange={(e) => g.update({ quietFrom: e.target.value })} />
            <span className="text-sm">to</span>
            <Input type="time" className="w-28" value={g.value.quietTo} onChange={(e) => g.update({ quietTo: e.target.value })} />
          </div>
        )}
        <Row label="Workout reminders"><Switch checked={g.value.workouts} onCheckedChange={(v) => g.update({ workouts: v })} /></Row>
        <Row label="Likes, comments & messages"><Switch checked={g.value.social} onCheckedChange={(v) => g.update({ social: v })} /></Row>
        <Row label="App updates"><Switch checked={g.value.updates} onCheckedChange={(v) => g.update({ updates: v })} /></Row>
        <Row label="Security alerts"><Switch checked={g.value.security} onCheckedChange={(v) => g.update({ security: v })} /></Row>
        <div className="pt-3 flex gap-2"><Button size="sm" onClick={test}>Send test notification</Button><Button variant="ghost" size="sm" onClick={g.reset}>Reset section</Button></div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Workout preferences ---------------- */
export function WorkoutLivePanel() {
  const g = useCloudGroup("account_settings", { restSeconds: 60, autoNext: true, voiceCues: false, countdown: 3, weightUnit: "kg" });
  return (
    <Card className="liquid-glass">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div><CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5" />Workout Preferences</CardTitle><CardDescription>Used by workout sessions on every device.</CardDescription></div>
        <SyncBadge sync={g.sync} remoteAt={g.remoteAt} />
      </CardHeader>
      <CardContent className="divide-y divide-border/40">
        <Row label="Default rest time" hint={`${g.value.restSeconds} seconds`}>
          <Select value={String(g.value.restSeconds)} onValueChange={(v) => g.update({ restSeconds: Number(v) })}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{[30, 45, 60, 90, 120, 180].map((n) => <SelectItem key={n} value={String(n)}>{n}s</SelectItem>)}</SelectContent>
          </Select>
        </Row>
        <Row label="Start countdown">
          <Select value={String(g.value.countdown)} onValueChange={(v) => g.update({ countdown: Number(v) })}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{[0, 3, 5, 10].map((n) => <SelectItem key={n} value={String(n)}>{n}s</SelectItem>)}</SelectContent>
          </Select>
        </Row>
        <Row label="Weight unit">
          <Select value={g.value.weightUnit} onValueChange={(v) => g.update({ weightUnit: v })}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="lb">lb</SelectItem></SelectContent>
          </Select>
        </Row>
        <Row label="Auto-start next exercise"><Switch checked={g.value.autoNext} onCheckedChange={(v) => g.update({ autoNext: v })} /></Row>
        <Row label="Voice cues" hint="Spoken exercise names and countdowns"><Switch checked={g.value.voiceCues} onCheckedChange={(v) => {
          g.update({ voiceCues: v });
          if (v && "speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance("Voice cues on"));
        }} /></Row>
        <div className="pt-3"><Button variant="ghost" size="sm" onClick={g.reset}>Reset section</Button></div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Storage ---------------- */
export function StorageLivePanel() {
  const { toast } = useToast();
  const [est, setEst] = useState<{ usage: number; quota: number } | null>(null);
  const [caches_, setCaches] = useState(0);
  const refresh = useCallback(async () => {
    const e = await navigator.storage?.estimate?.();
    if (e) setEst({ usage: e.usage ?? 0, quota: e.quota ?? 0 });
    if ("caches" in window) setCaches((await caches.keys()).length);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const clear = async () => {
    if ("caches" in window) await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
    await refresh();
    toast({ title: "Cache cleared", description: "Your account data is safe in the cloud." });
  };
  const mb = (n: number) => (n / 1048576).toFixed(1);
  return (
    <Card className="liquid-glass">
      <CardHeader><CardTitle className="flex items-center gap-2"><HardDrive className="h-5 w-5" />Device Storage</CardTitle><CardDescription>Measured by your browser.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {est ? (<>
          <div className="flex justify-between text-sm"><span>{mb(est.usage)} MB used</span><span className="text-muted-foreground">of {mb(est.quota)} MB</span></div>
          <Progress value={est.quota ? (est.usage / est.quota) * 100 : 0} className="h-2" />
        </>) : <p className="text-sm text-muted-foreground">Storage size isn't available on this device.</p>}
        <p className="text-xs text-muted-foreground">{caches_} offline cache{caches_ === 1 ? "" : "s"} stored</p>
        <Button variant="outline" size="sm" onClick={clear}>Clear offline cache</Button>
      </CardContent>
    </Card>
  );
}

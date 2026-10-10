import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { APP_VERSION, CURRENT_BUILD_ID, downloadAndInstall, fetchDeployedBuild, isNewer, type DeployedBuild } from "@/lib/live-updater";

const AUTO_KEY = "fitx-live-update-auto";
type Step = "idle" | "checking" | "downloading" | "installing" | "restarting";
const PCT: Record<Step, number> = { idle: 0, checking: 15, downloading: 45, installing: 80, restarting: 100 };

export function LiveUpdatePanel() {
  const [deployed, setDeployed] = useState<DeployedBuild | null>(null);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [auto, setAuto] = useState(() => localStorage.getItem(AUTO_KEY) === "1");

  const check = useCallback(async () => {
    setStep("checking"); setError(null);
    const d = await fetchDeployedBuild();
    setDeployed(d); setCheckedAt(new Date()); setStep("idle");
    if (!d) setError("Couldn't reach the server. Check your connection.");
    return d;
  }, []);

  const install = useCallback(async () => {
    try { await downloadAndInstall(setStep); } catch (e) { setError((e as Error).message); setStep("idle"); }
  }, []);

  useEffect(() => { check(); }, [check]);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(async () => { const d = await check(); if (isNewer(d)) install(); }, 5 * 60_000);
    return () => clearInterval(t);
  }, [auto, check, install]);

  const available = isNewer(deployed);
  const busy = step !== "idle";
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Download className="h-4 w-4 text-primary" />App update</CardTitle>
        <CardDescription>Compares this device with the version that is published right now.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div><div className="text-muted-foreground text-xs">On this device</div><div className="font-semibold">{APP_VERSION}</div><div className="font-mono text-[10px] text-muted-foreground">{CURRENT_BUILD_ID}</div></div>
          <div><div className="text-muted-foreground text-xs">Published</div><div className="font-semibold">{deployed?.version ?? "—"}</div><div className="font-mono text-[10px] text-muted-foreground">{deployed?.buildId ?? ""}</div></div>
        </div>
        {available ? <Badge>New update ready to download</Badge>
          : deployed ? <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" />You're up to date</Badge> : null}
        {busy && <><Progress value={PCT[step]} /><div className="text-xs text-muted-foreground capitalize">{step}…</div></>}
        {error && <div className="text-xs text-destructive">{error}</div>}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={check} disabled={busy}><RefreshCw className="h-4 w-4 mr-2" />Check now</Button>
          <Button size="sm" onClick={install} disabled={busy || !available}><Download className="h-4 w-4 mr-2" />Download & install</Button>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-upd">Install updates automatically</Label>
          <Switch id="auto-upd" checked={auto} onCheckedChange={(v) => { setAuto(v); localStorage.setItem(AUTO_KEY, v ? "1" : "0"); }} />
        </div>
        {checkedAt && <div className="text-xs text-muted-foreground">Last checked {checkedAt.toLocaleTimeString()}</div>}
      </CardContent>
    </Card>
  );
}

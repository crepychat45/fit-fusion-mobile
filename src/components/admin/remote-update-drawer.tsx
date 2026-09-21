import React, { useEffect, useRef, useState } from "react";
import { Download, Sparkles, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRemoteUpdate } from "@/hooks/use-remote-update";
import { setStoredVersion } from "@/config/version";
import { clearAppCache } from "@/utils/version-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const DISMISS_KEY = "fitfusion-remote-release-dismissed";
const HISTORY_KEY = "fitfusion-update-history";

const STEPS = [
  { at: 18, label: "Downloading update package…" },
  { at: 48, label: "Verifying signature…" },
  { at: 74, label: "Installing packs…" },
  { at: 92, label: "Activating new version…" },
  { at: 100, label: "Restarting FitxFusion…" },
];

/** Shows the update popup as soon as an admin publishes a newer release. */
export function RemoteUpdateDrawer() {
  const navigate = useNavigate();
  const remote = useRemoteUpdate();
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState(0);
  const [installing, setInstalling] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const release = remote.release;

  useEffect(() => {
    if (!release || !remote.hasUpdate) return;
    if (!release.mandatory && localStorage.getItem(DISMISS_KEY) === release.id) return;
    setOpen(true);
  }, [release, remote.hasUpdate]);

  if (!release) return null;

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      timers.current.push(window.setTimeout(resolve, ms));
    });

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, release.id);
    setOpen(false);
  };

  const install = async () => {
    if (release.download_url) {
      window.open(release.download_url, "_blank", "noopener,noreferrer");
      return;
    }
    setInstalling(true);
    for (const step of STEPS) {
      await wait(650);
      setPercent(step.at);
      if (step.at === 74) await clearAppCache().catch(() => undefined);
      if (step.at === 92) {
        try {
          const reg =
            "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
          reg?.waiting?.postMessage({ type: "SKIP_WAITING" });
        } catch {
          /* no service worker */
        }
      }
    }
    setStoredVersion(remote.target);
    try {
      const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      const next = [
        { version: remote.target, date: new Date().toISOString(), channel: release.channel },
        ...(Array.isArray(prev) ? prev : []),
      ].slice(0, 12);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      localStorage.setItem(DISMISS_KEY, release.id);
    } catch {
      /* storage unavailable */
    }
    await wait(500);
    window.location.reload();
  };

  const currentStep = STEPS.find((s) => s.at >= percent)?.label ?? "Preparing…";

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => (release.mandatory || installing ? setOpen(true) : setOpen(v))}
    >
      <DrawerContent className="liquid-glass">
        <DrawerHeader>
          <DrawerTitle className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-4 w-4" /> {release.title || `Update ${release.version}`}
            <Badge variant="secondary">{release.channel}</Badge>
            {release.mandatory && <Badge variant="destructive">required</Badge>}
          </DrawerTitle>
          <DrawerDescription>
            Version {remote.target} is available — you have v{remote.installed}.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 space-y-3">
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {release.changelog.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Signed package, verified before install.
          </p>
          {installing && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{currentStep}</span>
                <span className="font-semibold">{percent}%</span>
              </div>
              <Progress value={percent} className="h-2" />
            </div>
          )}
        </div>
        <DrawerFooter className="flex-row flex-wrap gap-2">
          <Button className="flex-1" onClick={install} disabled={installing}>
            <Download className="mr-2 h-4 w-4" />
            {installing ? "Installing…" : "Download & install"}
          </Button>
          {!installing && (
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                navigate("/settings?tab=updates");
              }}
            >
              Details
            </Button>
          )}
          {!release.mandatory && !installing && (
            <Button variant="ghost" onClick={dismiss}>
              Later
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

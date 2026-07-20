import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Smartphone, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkForUpdate, applyUpdate } from "@/utils/version-api";

export function PwaVaultPanel() {
  const { toast } = useToast();
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [swWaiting, setSwWaiting] = useState(false);
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [installed, setInstalled] = useState<boolean>(
    window.matchMedia?.("(display-mode: standalone)").matches || false,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    const bip = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", bip as any);
    window.addEventListener("appinstalled", () => setInstalled(true));

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((r) => {
        if (r?.waiting) setSwWaiting(true);
        r?.addEventListener("updatefound", () => {
          const nw = r.installing;
          nw?.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller)
              setSwWaiting(true);
          });
        });
      });
    }

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.removeEventListener("beforeinstallprompt", bip as any);
    };
  }, []);

  const install = async () => {
    if (!installEvent) {
      toast({ title: "Install prompt not available", description: "Use your browser menu → Add to Home Screen." });
      return;
    }
    installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  };

  return (
    <Card className="liquid-glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" /> PWA Vault & Offline
        </CardTitle>
        <CardDescription>Install FitFusion, monitor connectivity and service worker updates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row
          icon={online ? <Wifi className="h-4 w-4 text-emerald-500" /> : <WifiOff className="h-4 w-4 text-destructive" />}
          title="Connectivity"
          value={online ? "Online" : "Offline"}
          badgeClass={online ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30" : "bg-destructive/15 text-destructive border border-destructive/30"}
        />
        <Row
          icon={<RefreshCw className="h-4 w-4" />}
          title="Service worker"
          value={swWaiting ? "Update ready" : "Up to date"}
          badgeClass={swWaiting ? "bg-primary/15 text-primary border border-primary/30" : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"}
          action={
            swWaiting ? (
              <Button size="sm" onClick={() => applyUpdate()} className="rounded-xl">
                Apply update
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => checkForUpdate()} className="rounded-xl">
                Check
              </Button>
            )
          }
        />
        <Row
          icon={<Download className="h-4 w-4" />}
          title="Install app"
          value={installed ? "Installed" : "Available"}
          badgeClass={installed ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30" : "bg-amber-500/15 text-amber-600 border border-amber-500/30"}
          action={!installed && <Button size="sm" onClick={install} className="rounded-xl">Install</Button>}
        />
      </CardContent>
    </Card>
  );
}

function Row({ icon, title, value, badgeClass, action }: { icon: React.ReactNode; title: string; value: string; badgeClass: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-background/30 backdrop-blur p-3 gap-3 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{title}</div>
          <p className="text-xs text-muted-foreground truncate">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={badgeClass}>{value}</Badge>
        {action}
      </div>
    </div>
  );
}

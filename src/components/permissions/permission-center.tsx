import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BellRing,
  Camera,
  Mic,
  MapPin,
  Activity,
  HardDrive,
  ClipboardCopy,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  PERMISSION_KEYS,
  PermissionInfo,
  PermissionKey,
  onPermissionsChanged,
  platformLabel,
  queryAllPermissions,
  requestPermission,
  setEnabled,
} from "@/lib/permissions";

const ICONS: Record<PermissionKey, LucideIcon> = {
  notifications: Bell,
  push: BellRing,
  camera: Camera,
  microphone: Mic,
  location: MapPin,
  motion: Activity,
  storage: HardDrive,
  clipboard: ClipboardCopy,
};

function stateBadge(info: PermissionInfo) {
  if (!info.enabled) return { label: "Off in app", variant: "outline" as const };
  switch (info.state) {
    case "granted":
      return { label: "Allowed", variant: "default" as const };
    case "denied":
      return { label: "Blocked", variant: "destructive" as const };
    case "unsupported":
      return { label: "Unsupported", variant: "outline" as const };
    case "prompt":
      return { label: "Ask on use", variant: "secondary" as const };
    default:
      return { label: "Unknown", variant: "outline" as const };
  }
}

export function PermissionCenter() {
  const { toast } = useToast();
  const [items, setItems] = useState<PermissionInfo[]>([]);
  const [busy, setBusy] = useState<PermissionKey | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setItems(await queryAllPermissions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const off = onPermissionsChanged(() => void refresh());
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      off();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const toggle = async (info: PermissionInfo, next: boolean) => {
    if (!next) {
      setEnabled(info.key, false);
      toast({
        title: `${info.label} turned off`,
        description: "FitXFusion will not use it until you turn it back on.",
      });
      await refresh();
      return;
    }
    setEnabled(info.key, true);
    setBusy(info.key);
    try {
      const res = await requestPermission(info.key);
      toast({
        title: res.ok ? res.message : `${info.label} not allowed`,
        description: res.ok ? undefined : res.message,
        variant: res.ok ? undefined : "destructive",
      });
    } finally {
      setBusy(null);
      await refresh();
    }
  };

  const granted = items.filter((i) => i.active).length;
  const blocked = items.filter((i) => i.enabled && i.state === "denied").length;

  return (
    <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" /> Permission Center
        </CardTitle>
        <CardDescription>
          Control exactly what FitXFusion can access on this device. Turning a switch off blocks the
          feature app-wide, even if your device still allows it.
        </CardDescription>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <Smartphone className="h-3 w-3" /> {platformLabel()}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {granted} active
          </Badge>
          {blocked > 0 && (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <ShieldAlert className="h-3 w-3" /> {blocked} blocked by device
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading &&
          PERMISSION_KEYS.map((k) => (
            <div key={k} className="h-[62px] animate-pulse rounded-xl bg-muted/30" />
          ))}

        {items.map((info, idx) => {
          const Icon = ICONS[info.key];
          const badge = stateBadge(info);
          const unsupported = info.state === "unsupported";
          return (
            <motion.div
              key={info.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-xl border border-border/20 bg-muted/20 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <div
                    className={`mt-0.5 rounded-lg p-1.5 ${
                      info.active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{info.label}</span>
                      <Badge variant={badge.variant} className="text-[9px] px-1.5 py-0">
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="text-[11px] leading-snug text-muted-foreground">
                      {info.description}
                    </p>
                  </div>
                </div>
                <Switch
                  aria-label={`Toggle ${info.label}`}
                  checked={info.enabled && info.state !== "denied"}
                  disabled={unsupported || busy === info.key}
                  onCheckedChange={(v) => void toggle(info, v)}
                />
              </div>

              {info.enabled && info.state === "denied" && (
                <div className="mt-2 flex flex-col gap-2 rounded-lg bg-destructive/10 p-2 text-[11px] text-destructive sm:flex-row sm:items-center sm:justify-between">
                  <span>Blocked by your device or browser settings.</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px]"
                    onClick={() => void toggle(info, true)}
                  >
                    Try again
                  </Button>
                </div>
              )}

              {info.enabled && info.state === "prompt" && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2 h-7 w-full text-[11px]"
                  disabled={busy === info.key}
                  onClick={() => void toggle(info, true)}
                >
                  {busy === info.key ? "Requesting…" : `Allow ${info.label}`}
                </Button>
              )}
            </motion.div>
          );
        })}

        <Button size="sm" variant="ghost" className="w-full" onClick={() => void refresh()}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Re-check permissions
        </Button>
      </CardContent>
    </Card>
  );
}

export default PermissionCenter;

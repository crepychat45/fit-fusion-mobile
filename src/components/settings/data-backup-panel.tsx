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
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, HardDrive, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clearAppCache } from "@/utils/version-api";
import { ConfirmDialog } from "./confirm-dialog";

export function DataBackupPanel() {
  const { toast } = useToast();
  const [quota, setQuota] = useState<{ used: number; total: number } | null>(null);
  const [schedule, setSchedule] = useState<string>(() =>
    localStorage.getItem("fitfusion_backup_schedule") || "weekly"
  );
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const refreshQuota = async () => {
    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      setQuota({ used: est.usage ?? 0, total: est.quota ?? 0 });
    }
  };

  useEffect(() => { refreshQuota(); }, []);

  useEffect(() => {
    localStorage.setItem("fitfusion_backup_schedule", schedule);
  }, [schedule]);

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearAppCache();
      await refreshQuota();
      toast({ title: "Cache cleared", description: "App caches were removed. Your session is preserved." });
    } finally { setClearing(false); }
  };

  const pct = quota && quota.total ? Math.min(100, (quota.used / quota.total) * 100) : 0;
  const fmt = (b: number) => `${(b / 1024 / 1024).toFixed(1)} MB`;
  const last = localStorage.getItem("fitfusion-last-update");

  return (
    <>
      <Card className="liquid-glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" /> Data, Storage & Backup
          </CardTitle>
          <CardDescription>Cloud backup schedule and local storage management.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-background/30 backdrop-blur p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 font-medium"><HardDrive className="h-4 w-4" /> Storage used</div>
              <span className="text-muted-foreground">
                {quota ? `${fmt(quota.used)} / ${fmt(quota.total)}` : "…"}
              </span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-background/30 backdrop-blur p-3 gap-3 flex-wrap">
            <div>
              <div className="text-sm font-medium">Cloud backup schedule</div>
              <p className="text-xs text-muted-foreground">
                Last synced {last ? new Date(last).toLocaleString() : "never"}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">Active</Badge>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={refreshQuota} className="rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button variant="destructive" onClick={() => setConfirmClear(true)} disabled={clearing} className="rounded-xl">
              <Trash2 className="h-4 w-4 mr-2" /> Clear cache
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        onConfirm={handleClear}
        destructive
        title="Clear local cache?"
        description="This removes cached app data on this device. Your account and preferences on the server are preserved."
        confirmLabel="Clear cache"
      />
    </>
  );
}

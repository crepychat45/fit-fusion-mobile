import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Signal, Zap } from "lucide-react";
import { useNetworkStatus, setManualDataSaver } from "@/utils/network-adaptive";

export function NetworkAdaptiveBanner() {
  const s = useNetworkStatus();
  const forced = localStorage.getItem("fitfusion_data_saver") === "true";

  return (
    <Card className="liquid-glass border-white/10">
      <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Signal className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-medium flex items-center gap-2">
              Network-Adaptive Engine
              <Badge variant="secondary" className="text-[10px] uppercase">
                {s.effectiveType}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {s.dataSaverActive
                ? "Data Saver active — HD assets deferred."
                : "Full-quality assets enabled."}
              {s.rtt ? ` · ${s.rtt}ms RTT` : ""}
              {s.downlink ? ` · ${s.downlink} Mbps` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className={`h-4 w-4 ${s.dataSaverActive ? "text-amber-500" : "text-muted-foreground"}`} />
          <Switch checked={forced} onCheckedChange={setManualDataSaver} />
        </div>
      </CardContent>
    </Card>
  );
}

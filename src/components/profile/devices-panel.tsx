import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Watch, Smartphone, Headphones, Wifi, Battery, RefreshCw, PlugZap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Device { id: string; name: string; kind: string; icon: React.ElementType; battery: number; connected: boolean; }

const seed: Device[] = [
  { id: "watch", name: "FitFusion Watch X", kind: "Smartwatch", icon: Watch, battery: 82, connected: true },
  { id: "phone", name: "This device", kind: "Phone", icon: Smartphone, battery: 100, connected: true },
  { id: "buds", name: "Pulse Buds Pro", kind: "Audio", icon: Headphones, battery: 45, connected: false },
];

export function DevicesPanel() {
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>(seed);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true); const off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const toggle = (id: string) => {
    setDevices((ds) => ds.map((d) => d.id === id ? { ...d, connected: !d.connected } : d));
    toast({ title: "Device updated" });
  };
  const sync = () => toast({ title: "Sync started", description: "Fetching latest health data…" });

  return (
    <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base"><PlugZap className="h-4 w-4 text-primary" />Connected Devices</CardTitle>
          <CardDescription>Wearables, phones & audio linked to your account</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant={online ? "default" : "outline"} className="gap-1 text-[10px]"><Wifi className="h-3 w-3" />{online ? "Online" : "Offline"}</Badge>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={sync} aria-label="Sync all"><RefreshCw className="h-3.5 w-3.5" /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {devices.map((d) => (
          <div key={d.id} className="rounded-xl border border-border/20 bg-muted/20 p-3 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${d.connected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              <d.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{d.name}</div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                <span>{d.kind}</span>
                <span className="inline-flex items-center gap-0.5"><Battery className="h-3 w-3" />{d.battery}%</span>
              </div>
            </div>
            <Button size="sm" variant={d.connected ? "outline" : "default"} className="h-7 text-[11px]" onClick={() => toggle(d.id)}>
              {d.connected ? "Disconnect" : "Connect"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default DevicesPanel;

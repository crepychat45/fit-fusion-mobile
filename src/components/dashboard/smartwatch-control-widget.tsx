import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Watch,
  Heart,
  Activity,
  Moon,
  Bell,
  BatteryFull,
  Bluetooth,
  BluetoothConnected,
  MapPin,
  Zap,
  Settings,
  Radio,
  Wifi,
  ChevronRight,
  Droplets,
  Volume2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type WatchState = {
  connected: boolean;
  deviceName: string;
  battery: number;
  bleSignal: number;
  face: string;
  font: string;
};

const DEFAULT: WatchState = {
  connected: true,
  deviceName: "FitFusion Watch Pro",
  battery: 78,
  bleSignal: 92,
  face: "aurora",
  font: "system",
};

const loadState = (): WatchState => {
  try {
    const raw = localStorage.getItem("fitfusion.watch.state");
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
};

export const SmartwatchControlWidget: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<WatchState>(loadState);
  const [hr, setHr] = useState(72);
  const [spo2, setSpo2] = useState(98);
  const [sleep, setSleep] = useState(7.4);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    // Simulated live biometrics — updates every 4s while mounted
    const id = window.setInterval(() => {
      setHr((v) => Math.max(58, Math.min(112, v + Math.round((Math.random() - 0.5) * 6))));
      setSpo2((v) => Math.max(94, Math.min(100, v + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0))));
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onStorage = () => setState(loadState());
    window.addEventListener("storage", onStorage);
    window.addEventListener("fitfusion:watch:updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("fitfusion:watch:updated", onStorage);
    };
  }, []);

  const persist = (next: WatchState) => {
    setState(next);
    localStorage.setItem("fitfusion.watch.state", JSON.stringify(next));
    window.dispatchEvent(new Event("fitfusion:watch:updated"));
  };

  const toggleConnect = () => {
    const next = { ...state, connected: !state.connected };
    persist(next);
    toast[next.connected ? "success" : "message"](
      next.connected ? "Watch connected" : "Watch disconnected",
      { description: next.deviceName }
    );
  };

  const findMyWatch = () => {
    if (!state.connected) {
      toast.error("Connect your watch first");
      return;
    }
    setPinging(true);
    toast.success("Ringing your watch…", {
      description: "Buzzing and chiming at full volume for 15 seconds.",
    });
    window.setTimeout(() => setPinging(false), 4500);
  };

  const quickSync = () => {
    if (!state.connected) {
      toast.error("Connect your watch first");
      return;
    }
    toast.message("Syncing…", { description: "Fetching HR, SpO2, sleep and workouts." });
    window.setTimeout(() => toast.success("Sync complete", { description: "All health data up to date." }), 1400);
  };

  const hrZone = useMemo(() => {
    if (hr < 65) return { label: "Resting", tone: "text-emerald-400" };
    if (hr < 85) return { label: "Fat Burn", tone: "text-cyan-400" };
    if (hr < 105) return { label: "Cardio", tone: "text-amber-400" };
    return { label: "Peak", tone: "text-rose-400" };
  }, [hr]);

  return (
    <div className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/20 bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-md">
                <Watch className="h-5 w-5 text-primary-foreground" />
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
                  state.connected ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground truncate">Smartwatch</h2>
                <Badge className="text-[10px] bg-primary/15 text-primary border-primary/30">HUB</Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{state.deviceName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="outline"
              className={`gap-1 text-[10px] ${
                state.connected
                  ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                  : "border-border/40 text-muted-foreground"
              }`}
            >
              {state.connected ? <BluetoothConnected className="h-3 w-3" /> : <Bluetooth className="h-3 w-3" />}
              {state.connected ? "Paired" : "Off"}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Smartwatch settings"
              className="h-8 w-8 rounded-lg"
              onClick={() => navigate("/smartwatch-settings")}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status strip */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="rounded-xl bg-muted/30 border border-border/20 p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
              <BatteryFull className="h-3 w-3" /> Battery
            </div>
            <div className="text-sm font-bold text-foreground">{state.battery}%</div>
          </div>
          <div className="rounded-xl bg-muted/30 border border-border/20 p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
              <Radio className="h-3 w-3" /> Signal
            </div>
            <div className="text-sm font-bold text-foreground">{state.bleSignal}%</div>
          </div>
          <div className="rounded-xl bg-muted/30 border border-border/20 p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
              <Wifi className="h-3 w-3" /> Sync
            </div>
            <div className="text-sm font-bold text-foreground">Live</div>
          </div>
        </div>
      </div>

      {/* Live biometrics */}
      <div className="p-4 grid grid-cols-3 gap-2">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5"
        >
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Heart className="h-3 w-3 text-rose-400" /> Heart
          </div>
          <div className="text-lg font-bold text-foreground leading-tight">
            {hr}
            <span className="text-[10px] text-muted-foreground font-medium ml-1">bpm</span>
          </div>
          <div className={`text-[10px] font-medium ${hrZone.tone}`}>{hrZone.label}</div>
        </motion.div>

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-2.5">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Droplets className="h-3 w-3 text-cyan-400" /> SpO₂
          </div>
          <div className="text-lg font-bold text-foreground leading-tight">
            {spo2}
            <span className="text-[10px] text-muted-foreground font-medium ml-1">%</span>
          </div>
          <div className="text-[10px] font-medium text-cyan-400">Normal</div>
        </div>

        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-2.5">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Moon className="h-3 w-3 text-indigo-400" /> Sleep
          </div>
          <div className="text-lg font-bold text-foreground leading-tight">
            {sleep.toFixed(1)}
            <span className="text-[10px] text-muted-foreground font-medium ml-1">h</span>
          </div>
          <div className="text-[10px] font-medium text-indigo-400">Restful</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 pb-3 grid grid-cols-4 gap-2">
        <ActionTile
          icon={<MapPin className="h-4 w-4" />}
          label="Find"
          onClick={findMyWatch}
          active={pinging}
        />
        <ActionTile icon={<Zap className="h-4 w-4" />} label="Sync" onClick={quickSync} />
        <ActionTile
          icon={state.connected ? <BluetoothConnected className="h-4 w-4" /> : <Bluetooth className="h-4 w-4" />}
          label={state.connected ? "Off" : "Pair"}
          onClick={toggleConnect}
        />
        <ActionTile
          icon={<Activity className="h-4 w-4" />}
          label="Workout"
          onClick={() => navigate("/workouts?quick=true")}
        />
      </div>

      {/* Face + settings CTA */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => navigate("/smartwatch-settings")}
          className="w-full rounded-xl border border-border/20 bg-muted/20 hover:bg-muted/30 transition-colors p-3 flex items-center gap-3 text-left"
        >
          <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-primary via-accent to-primary shadow-inner flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
            <Sparkles className="h-4 w-4 text-primary-foreground relative z-10" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">Watch face: {state.face}</div>
            <div className="text-[10px] text-muted-foreground truncate">
              Font: {state.font} · Customize faces, fonts & more
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </div>

      <AnimatePresence>
        {pinging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-4"
          >
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="text-xs text-foreground">Watch is ringing — listen for the chime.</span>
              <Bell className="h-3.5 w-3.5 text-amber-400 ml-auto animate-swing" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}> = ({ icon, label, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-colors ${
      active
        ? "border-primary/40 bg-primary/15 text-primary"
        : "border-border/20 bg-muted/20 hover:bg-muted/30 text-foreground"
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default SmartwatchControlWidget;

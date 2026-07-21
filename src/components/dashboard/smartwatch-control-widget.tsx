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
  Play,
  Square,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BUILT_IN_FACES,
  FONTS,
  EVT,
  loadCustomFaces,
  loadState,
  loadWorkout,
  saveState,
  saveWorkout,
  sensorHub,
  startWorkout,
  stopWorkout,
  type SensorReading,
  type WatchState,
  type WorkoutSession,
} from "@/lib/smartwatch";
import { WatchFacePreview } from "@/components/smartwatch/watch-face-preview";

export const SmartwatchControlWidget: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<WatchState>(loadState);
  const [reading, setReading] = useState<SensorReading>(sensorHub.current);
  const [workout, setWorkout] = useState<WorkoutSession | null>(loadWorkout);
  const [pinging, setPinging] = useState(false);
  const [now, setNow] = useState(new Date());
  const customFaces = useMemo(() => loadCustomFaces(), [state.face]);
  const allFaces = useMemo(() => [...BUILT_IN_FACES, ...customFaces], [customFaces]);
  const activeFace = allFaces.find((f) => f.id === state.face) ?? BUILT_IN_FACES[0];
  const activeFont = FONTS.find((f) => f.id === state.font) ?? FONTS[0];

  useEffect(() => {
    sensorHub.start();
    const unsub = sensorHub.subscribe(setReading);
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    const sync = () => {
      setState(loadState());
      setWorkout(loadWorkout());
    };
    window.addEventListener("storage", sync);
    window.addEventListener(EVT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVT, sync);
    };
  }, []);

  // Live workout duration + rolling stats
  useEffect(() => {
    if (!workout?.active) return;
    const id = window.setInterval(() => {
      setWorkout((w) => {
        if (!w?.active) return w;
        const duration = Math.floor((Date.now() - w.startedAt) / 1000);
        const r = sensorHub.current;
        const next = {
          ...w,
          duration,
          avgHr: Math.round((w.avgHr * duration + r.hr) / (duration + 1)),
          maxHr: Math.max(w.maxHr, r.hr),
          calories: +(w.calories + 0.15).toFixed(1),
          steps: w.steps + Math.floor(Math.random() * 3),
          distance: +(w.distance + 0.003).toFixed(3),
        };
        saveWorkout(next);
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [workout?.active]);

  const toggleConnect = () => {
    const next = { ...state, connected: !state.connected, lastSync: Date.now() };
    saveState(next);
    setState(next);
    toast[next.connected ? "success" : "message"](
      next.connected ? "Watch connected" : "Watch disconnected",
      { description: state.deviceName }
    );
  };

  const findMyWatch = () => {
    if (!state.connected) return toast.error("Connect your watch first");
    setPinging(true);
    toast.success("Ringing your watch…", { description: "Buzzing and chiming at full volume." });
    window.setTimeout(() => setPinging(false), 4500);
  };

  const quickSync = () => {
    if (!state.connected) return toast.error("Connect your watch first");
    toast.message("Syncing…", { description: "Fetching HR, SpO₂, sleep and workouts." });
    window.setTimeout(() => {
      const next = { ...state, lastSync: Date.now(), battery: Math.min(100, state.battery + 1) };
      saveState(next);
      setState(next);
      toast.success("Sync complete", { description: "All health data up to date." });
    }, 1300);
  };

  const toggleWorkout = () => {
    if (!state.connected) return toast.error("Connect your watch first");
    if (workout?.active) {
      const ended = stopWorkout(workout);
      setWorkout(null);
      toast.success("Workout saved", {
        description: `${Math.floor(ended.duration / 60)}m · ${Math.round(ended.calories)} kcal`,
      });
    } else {
      const w = startWorkout("run");
      setWorkout(w);
      toast.success("Workout started", { description: "Live tracking active on your watch." });
    }
  };

  const hrZone = useMemo(() => {
    if (reading.hr < 65) return { label: "Resting", tone: "text-emerald-400" };
    if (reading.hr < 85) return { label: "Fat Burn", tone: "text-cyan-400" };
    if (reading.hr < 105) return { label: "Cardio", tone: "text-amber-400" };
    return { label: "Peak", tone: "text-rose-400" };
  }, [reading.hr]);

  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours() % 12;

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
                <Badge className="text-[10px] bg-primary/15 text-primary border-primary/30">LIVE</Badge>
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
            <div className="text-sm font-bold text-foreground">
              {Math.max(0, Math.round((Date.now() - state.lastSync) / 1000))}s
            </div>
          </div>
        </div>
      </div>

      {/* LIVE watch face (shared preview component — matches Settings) */}
      <div className="p-4 flex items-center gap-4">
        <WatchFacePreview
          face={activeFace}
          fontId={activeFont.id}
          size={128}
          onClick={() => navigate("/smartwatch-settings")}
          ariaLabel="Open smartwatch settings"
        />


        {/* Right column: live biometrics */}
        <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }}
            className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-2"
          >
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Heart className="h-3 w-3 text-rose-400" /> Heart
            </div>
            <div className="text-base font-bold text-foreground leading-tight">
              {reading.hr}
              <span className="text-[10px] text-muted-foreground font-medium ml-1">bpm</span>
            </div>
            <div className={`text-[9px] font-medium ${hrZone.tone}`}>{hrZone.label}</div>
          </motion.div>

          <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-2">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Droplets className="h-3 w-3 text-cyan-400" /> SpO₂
            </div>
            <div className="text-base font-bold text-foreground leading-tight">
              {reading.spo2}
              <span className="text-[10px] text-muted-foreground font-medium ml-1">%</span>
            </div>
            <div className="text-[9px] font-medium text-cyan-400">Normal</div>
          </div>

          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-2">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Activity className="h-3 w-3 text-emerald-400" /> Steps
            </div>
            <div className="text-base font-bold text-foreground leading-tight tabular-nums">
              {reading.steps.toLocaleString()}
            </div>
            <div className="text-[9px] font-medium text-emerald-400">{reading.distance.toFixed(2)} km</div>
          </div>

          <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-2">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Moon className="h-3 w-3 text-indigo-400" /> Stress
            </div>
            <div className="text-base font-bold text-foreground leading-tight">{reading.stress}</div>
            <div className="text-[9px] font-medium text-indigo-400">{reading.temperature}°C</div>
          </div>
        </div>
      </div>

      {/* Active workout banner */}
      <AnimatePresence>
        {workout?.active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-3"
          >
            <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Activity className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-foreground">
                  {workout.type.toUpperCase()} · {formatDuration(workout.duration)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Avg {workout.avgHr} bpm · Max {workout.maxHr} · {Math.round(workout.calories)} kcal · {workout.distance.toFixed(2)} km
                </div>
              </div>
              <Button size="sm" variant="destructive" className="h-8" onClick={toggleWorkout}>
                <Square className="h-3 w-3 mr-1" /> Stop
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick actions */}
      <div className="px-4 pb-3 grid grid-cols-5 gap-2">
        <ActionTile icon={<MapPin className="h-4 w-4" />} label="Find" onClick={findMyWatch} active={pinging} />
        <ActionTile icon={<Zap className="h-4 w-4" />} label="Sync" onClick={quickSync} />
        <ActionTile
          icon={<Phone className="h-4 w-4" />}
          label="Dial"
          onClick={() => navigate("/smartwatch-settings")}
        />
        <ActionTile
          icon={state.connected ? <BluetoothConnected className="h-4 w-4" /> : <Bluetooth className="h-4 w-4" />}
          label={state.connected ? "Off" : "Pair"}
          onClick={toggleConnect}
        />
        <ActionTile
          icon={workout?.active ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          label={workout?.active ? "Stop" : "Start"}
          onClick={toggleWorkout}
          active={workout?.active}
        />
      </div>

      {/* Face + settings CTA */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => navigate("/smartwatch-settings")}
          className="w-full rounded-xl border border-border/20 bg-muted/20 hover:bg-muted/30 transition-colors p-3 flex items-center gap-3 text-left"
        >
          <div
            className="relative h-11 w-11 rounded-full shadow-inner flex items-center justify-center overflow-hidden"
            style={
              activeFace.image
                ? { backgroundImage: `url(${activeFace.image})`, backgroundSize: "cover" }
                : undefined
            }
          >
            {!activeFace.image && (
              <div className={`absolute inset-0 bg-gradient-to-br ${activeFace.gradient}`} />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
            <span className="relative z-10 text-[9px] font-bold text-white">{timeStr}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">Watch face: {activeFace.name}</div>
            <div className="text-[10px] text-muted-foreground truncate">
              {activeFont.name} · Manage faces, upload images & more
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </div>

      <AnimatePresence>
        {pinging && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-4">
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

const AnalogFace: React.FC<{ hours: number; minutes: number; seconds: number; accent: string }> = ({
  hours,
  minutes,
  seconds,
  accent,
}) => {
  const hourDeg = (hours + minutes / 60) * 30;
  const minDeg = (minutes + seconds / 60) * 6;
  const secDeg = seconds * 6;
  return (
    <svg viewBox="0 0 100 100" className="h-20 w-20">
      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      {[...Array(12)].map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="8"
          x2="50"
          y2="14"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.5"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <line x1="50" y1="50" x2="50" y2="26" stroke="#fff" strokeWidth="3" strokeLinecap="round" transform={`rotate(${hourDeg} 50 50)`} />
      <line x1="50" y1="50" x2="50" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round" transform={`rotate(${minDeg} 50 50)`} />
      <line x1="50" y1="54" x2="50" y2="12" stroke={accent} strokeWidth="1.2" strokeLinecap="round" transform={`rotate(${secDeg} 50 50)`} />
      <circle cx="50" cy="50" r="2.5" fill={accent} />
    </svg>
  );
};

const formatDuration = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
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

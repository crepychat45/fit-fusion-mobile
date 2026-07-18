import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  Watch,
  Palette,
  Type,
  MapPin,
  Heart,
  Droplets,
  Moon,
  Activity,
  Bell,
  BatteryLow,
  ShieldCheck,
  Bluetooth,
  BluetoothConnected,
  Upload,
  Check,
  Sparkles,
  Volume2,
  Vibrate,
  Wifi,
  Radio,
  Trash2,
} from "lucide-react";

/* ---------- Types & persistence ---------- */

type Face = { id: string; name: string; gradient: string; accent: string; style: "analog" | "digital" | "hybrid" };

const BUILT_IN_FACES: Face[] = [
  { id: "aurora", name: "Aurora", gradient: "from-fuchsia-500 via-purple-500 to-indigo-500", accent: "#a855f7", style: "hybrid" },
  { id: "ember", name: "Ember", gradient: "from-orange-500 via-rose-500 to-red-600", accent: "#f97316", style: "digital" },
  { id: "abyss", name: "Abyss", gradient: "from-slate-900 via-slate-800 to-slate-700", accent: "#38bdf8", style: "analog" },
  { id: "glacier", name: "Glacier", gradient: "from-sky-400 via-cyan-500 to-teal-500", accent: "#22d3ee", style: "digital" },
  { id: "forest", name: "Forest", gradient: "from-emerald-500 via-green-600 to-teal-700", accent: "#10b981", style: "analog" },
  { id: "solar", name: "Solar", gradient: "from-amber-400 via-yellow-500 to-orange-500", accent: "#facc15", style: "hybrid" },
  { id: "noir", name: "Noir", gradient: "from-zinc-900 via-zinc-800 to-zinc-900", accent: "#e5e5e5", style: "digital" },
  { id: "rose", name: "Rose Quartz", gradient: "from-rose-300 via-pink-400 to-fuchsia-500", accent: "#f472b6", style: "hybrid" },
];

const FONTS = [
  { id: "system", name: "System", css: "system-ui, sans-serif" },
  { id: "inter", name: "Inter", css: "'Inter', sans-serif" },
  { id: "space", name: "Space Grotesk", css: "'Space Grotesk', sans-serif" },
  { id: "mono", name: "Mono", css: "'JetBrains Mono', ui-monospace, monospace" },
  { id: "serif", name: "Serif", css: "'Playfair Display', serif" },
  { id: "rounded", name: "Rounded", css: "'Nunito', sans-serif" },
];

type Settings = {
  connected: boolean;
  deviceName: string;
  face: string;
  customFaceColor: string;
  font: string;
  brightness: number;
  alwaysOn: boolean;
  raiseToWake: boolean;
  hapticStrength: number;
  hrEnabled: boolean;
  hrHighAlert: number;
  hrLowAlert: number;
  spo2Enabled: boolean;
  spo2Continuous: boolean;
  sleepTracking: boolean;
  sleepGoalHours: number;
  autoWorkoutDetect: boolean;
  workoutGpsHighAccuracy: boolean;
  notifications: boolean;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
  batterySaver: boolean;
  ringVolume: number;
  privacyLocalOnly: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  connected: true,
  deviceName: "FitFusion Watch Pro",
  face: "aurora",
  customFaceColor: "#a855f7",
  font: "system",
  brightness: 70,
  alwaysOn: true,
  raiseToWake: true,
  hapticStrength: 60,
  hrEnabled: true,
  hrHighAlert: 160,
  hrLowAlert: 45,
  spo2Enabled: true,
  spo2Continuous: false,
  sleepTracking: true,
  sleepGoalHours: 8,
  autoWorkoutDetect: true,
  workoutGpsHighAccuracy: true,
  notifications: true,
  quietHours: true,
  quietStart: "22:00",
  quietEnd: "07:00",
  batterySaver: false,
  ringVolume: 80,
  privacyLocalOnly: false,
};

const KEY = "fitfusion.watch.settings";
const CUSTOM_FACES_KEY = "fitfusion.watch.customFaces";

const loadSettings = (): Settings => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const loadCustomFaces = (): Face[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_FACES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/* ---------- Page ---------- */

const SmartwatchSettings: React.FC = () => {
  const navigate = useNavigate();
  const [s, setS] = useState<Settings>(loadSettings);
  const [customFaces, setCustomFaces] = useState<Face[]>(loadCustomFaces);
  const [newFaceName, setNewFaceName] = useState("");
  const [newFaceColor, setNewFaceColor] = useState("#a855f7");
  const [pinging, setPinging] = useState(false);

  const allFaces = useMemo(() => [...BUILT_IN_FACES, ...customFaces], [customFaces]);
  const activeFace = allFaces.find((f) => f.id === s.face) ?? BUILT_IN_FACES[0];
  const activeFont = FONTS.find((f) => f.id === s.font) ?? FONTS[0];

  const update = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    const next = { ...s, [k]: v };
    setS(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    // Broadcast a subset to the homepage widget
    const summary = {
      connected: next.connected,
      deviceName: next.deviceName,
      battery: 78,
      bleSignal: 92,
      face: next.face,
      font: FONTS.find((f) => f.id === next.font)?.name ?? "System",
    };
    localStorage.setItem("fitfusion.watch.state", JSON.stringify(summary));
    window.dispatchEvent(new Event("fitfusion:watch:updated"));
  };

  useEffect(() => {
    // Ensure the homepage widget syncs on mount
    update("face", s.face);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCustomFace = () => {
    if (!newFaceName.trim()) {
      toast.error("Name your face first");
      return;
    }
    const id = `custom-${Date.now()}`;
    const face: Face = {
      id,
      name: newFaceName.trim(),
      gradient: "from-primary via-accent to-primary",
      accent: newFaceColor,
      style: "hybrid",
    };
    const next = [...customFaces, face];
    setCustomFaces(next);
    localStorage.setItem(CUSTOM_FACES_KEY, JSON.stringify(next));
    setNewFaceName("");
    toast.success("Custom face created", { description: face.name });
  };

  const removeCustom = (id: string) => {
    const next = customFaces.filter((f) => f.id !== id);
    setCustomFaces(next);
    localStorage.setItem(CUSTOM_FACES_KEY, JSON.stringify(next));
    if (s.face === id) update("face", "aurora");
    toast.message("Custom face removed");
  };

  const findWatch = () => {
    if (!s.connected) return toast.error("Connect your watch first");
    setPinging(true);
    toast.success("Ringing your watch…", { description: `Volume ${s.ringVolume}%` });
    window.setTimeout(() => setPinging(false), 4000);
  };

  const factoryReset = () => {
    localStorage.removeItem(KEY);
    localStorage.removeItem(CUSTOM_FACES_KEY);
    setS(DEFAULT_SETTINGS);
    setCustomFaces([]);
    toast.success("Watch reset to defaults");
  };

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-background pb-28">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border/20">
          <div className="flex items-center gap-2 px-4 py-3">
            <Button variant="ghost" size="icon" aria-label="Back" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Watch className="h-5 w-5 text-primary" />
              <h1 className="text-base font-bold text-foreground">Smartwatch Settings</h1>
            </div>
            <Badge className="ml-auto text-[10px]" variant="outline">
              {s.connected ? (
                <><BluetoothConnected className="h-3 w-3 mr-1" />Paired</>
              ) : (
                <><Bluetooth className="h-3 w-3 mr-1" />Off</>
              )}
            </Badge>
          </div>
        </div>

        <div className="relative z-10 space-y-4 px-4 pt-4">
          {/* Watch preview */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl shadow-lg p-5"
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className={`relative h-48 w-48 rounded-[2rem] bg-gradient-to-br ${activeFace.gradient} shadow-2xl flex items-center justify-center overflow-hidden`}
              >
                <div className="absolute inset-2 rounded-[1.6rem] bg-black/50 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center gap-1">
                  <div
                    className="text-4xl font-bold text-white tabular-nums"
                    style={{ fontFamily: activeFont.css, color: activeFace.accent }}
                  >
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="text-[11px] text-white/80" style={{ fontFamily: activeFont.css }}>
                    {new Date().toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-white/70">
                    <Heart className="h-3 w-3" /> 72
                    <Droplets className="h-3 w-3 ml-1" /> 98%
                    <Activity className="h-3 w-3 ml-1" /> 6.2k
                  </div>
                </div>
                <div className="absolute -inset-6 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)] pointer-events-none" />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-foreground">{activeFace.name}</div>
                <div className="text-xs text-muted-foreground">
                  {activeFace.style} · {activeFont.name}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Device */}
          <Section icon={<Watch className="h-4 w-4" />} title="Device">
            <Row label="Device name">
              <Input
                value={s.deviceName}
                onChange={(e) => update("deviceName", e.target.value)}
                className="h-9 max-w-[220px]"
              />
            </Row>
            <Row label="Connection">
              <Switch checked={s.connected} onCheckedChange={(v) => update("connected", v)} />
            </Row>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <Stat icon={<BatteryLow className="h-3 w-3" />} label="Battery" value="78%" />
              <Stat icon={<Radio className="h-3 w-3" />} label="Signal" value="92%" />
              <Stat icon={<Wifi className="h-3 w-3" />} label="Sync" value="Live" />
            </div>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={findWatch}
              disabled={pinging}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {pinging ? "Ringing…" : "Find My Watch"}
            </Button>
          </Section>

          {/* Watch faces */}
          <Section icon={<Palette className="h-4 w-4" />} title="Watch Faces">
            <div className="grid grid-cols-4 gap-2">
              {allFaces.map((f) => {
                const selected = f.id === s.face;
                return (
                  <button
                    key={f.id}
                    onClick={() => update("face", f.id)}
                    className={`relative aspect-square rounded-2xl bg-gradient-to-br ${f.gradient} p-1 shadow-md ${
                      selected ? "ring-2 ring-primary" : ""
                    }`}
                    aria-label={`Select ${f.name}`}
                  >
                    <div className="absolute inset-1.5 rounded-xl bg-black/40 flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-white/90 truncate px-1">
                        {f.name}
                      </span>
                    </div>
                    {selected && (
                      <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 shadow">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    {f.id.startsWith("custom-") && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustom(f.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            removeCustom(f.id);
                          }
                        }}
                        className="absolute -top-1 -left-1 bg-destructive rounded-full p-0.5 shadow cursor-pointer"
                        aria-label={`Delete ${f.name}`}
                      >
                        <Trash2 className="h-3 w-3 text-destructive-foreground" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Custom faces */}
          <Section icon={<Sparkles className="h-4 w-4" />} title="Create Custom Face">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="cf-name" className="text-xs w-14 shrink-0">Name</Label>
                <Input
                  id="cf-name"
                  placeholder="Neon Pulse"
                  value={newFaceName}
                  onChange={(e) => setNewFaceName(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="cf-color" className="text-xs w-14 shrink-0">Accent</Label>
                <input
                  id="cf-color"
                  type="color"
                  value={newFaceColor}
                  onChange={(e) => setNewFaceColor(e.target.value)}
                  className="h-9 w-14 rounded-md border border-border/40 bg-transparent cursor-pointer"
                />
                <span className="text-xs text-muted-foreground font-mono">{newFaceColor}</span>
              </div>
              <Button onClick={addCustomFace} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Save Custom Face
              </Button>
            </div>
          </Section>

          {/* Fonts */}
          <Section icon={<Type className="h-4 w-4" />} title="Fonts">
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map((f) => {
                const selected = f.id === s.font;
                return (
                  <button
                    key={f.id}
                    onClick={() => update("font", f.id)}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border/30 bg-muted/20 hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className="text-lg font-bold text-foreground"
                      style={{ fontFamily: f.css }}
                    >
                      Aa 12:34
                    </div>
                    <div className="text-[11px] text-muted-foreground">{f.name}</div>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Display */}
          <Section icon={<Sparkles className="h-4 w-4" />} title="Display">
            <SliderRow
              label="Brightness"
              value={s.brightness}
              onChange={(v) => update("brightness", v)}
              suffix="%"
            />
            <Row label="Always-on display">
              <Switch checked={s.alwaysOn} onCheckedChange={(v) => update("alwaysOn", v)} />
            </Row>
            <Row label="Raise to wake">
              <Switch checked={s.raiseToWake} onCheckedChange={(v) => update("raiseToWake", v)} />
            </Row>
            <SliderRow
              label="Haptic strength"
              value={s.hapticStrength}
              onChange={(v) => update("hapticStrength", v)}
              suffix="%"
              icon={<Vibrate className="h-3.5 w-3.5" />}
            />
          </Section>

          {/* Heart Rate */}
          <Section icon={<Heart className="h-4 w-4 text-rose-400" />} title="Heart Rate">
            <Row label="Continuous monitoring">
              <Switch checked={s.hrEnabled} onCheckedChange={(v) => update("hrEnabled", v)} />
            </Row>
            <SliderRow
              label="High alert"
              value={s.hrHighAlert}
              min={100}
              max={200}
              onChange={(v) => update("hrHighAlert", v)}
              suffix=" bpm"
            />
            <SliderRow
              label="Low alert"
              value={s.hrLowAlert}
              min={30}
              max={70}
              onChange={(v) => update("hrLowAlert", v)}
              suffix=" bpm"
            />
          </Section>

          {/* SpO2 */}
          <Section icon={<Droplets className="h-4 w-4 text-cyan-400" />} title="Blood Oxygen (SpO₂)">
            <Row label="Enabled">
              <Switch checked={s.spo2Enabled} onCheckedChange={(v) => update("spo2Enabled", v)} />
            </Row>
            <Row label="Continuous night measurements">
              <Switch checked={s.spo2Continuous} onCheckedChange={(v) => update("spo2Continuous", v)} />
            </Row>
          </Section>

          {/* Sleep */}
          <Section icon={<Moon className="h-4 w-4 text-indigo-400" />} title="Sleep">
            <Row label="Sleep tracking">
              <Switch checked={s.sleepTracking} onCheckedChange={(v) => update("sleepTracking", v)} />
            </Row>
            <SliderRow
              label="Nightly goal"
              value={s.sleepGoalHours}
              min={4}
              max={12}
              step={0.5}
              onChange={(v) => update("sleepGoalHours", v)}
              suffix=" h"
            />
          </Section>

          {/* Workouts */}
          <Section icon={<Activity className="h-4 w-4 text-emerald-400" />} title="Workouts">
            <Row label="Auto workout detection">
              <Switch
                checked={s.autoWorkoutDetect}
                onCheckedChange={(v) => update("autoWorkoutDetect", v)}
              />
            </Row>
            <Row label="High-accuracy GPS">
              <Switch
                checked={s.workoutGpsHighAccuracy}
                onCheckedChange={(v) => update("workoutGpsHighAccuracy", v)}
              />
            </Row>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/workouts?quick=true")}
            >
              <Activity className="h-4 w-4 mr-2" />
              Start Workout from Watch
            </Button>
          </Section>

          {/* Notifications */}
          <Section icon={<Bell className="h-4 w-4" />} title="Notifications">
            <Row label="Show notifications">
              <Switch checked={s.notifications} onCheckedChange={(v) => update("notifications", v)} />
            </Row>
            <Row label="Quiet hours">
              <Switch checked={s.quietHours} onCheckedChange={(v) => update("quietHours", v)} />
            </Row>
            {s.quietHours && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <Label className="text-xs">Start</Label>
                  <Input
                    type="time"
                    value={s.quietStart}
                    onChange={(e) => update("quietStart", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">End</Label>
                  <Input
                    type="time"
                    value={s.quietEnd}
                    onChange={(e) => update("quietEnd", e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            )}
            <SliderRow
              label="Ring volume"
              value={s.ringVolume}
              onChange={(v) => update("ringVolume", v)}
              suffix="%"
              icon={<Volume2 className="h-3.5 w-3.5" />}
            />
          </Section>

          {/* Battery & Privacy */}
          <Section icon={<ShieldCheck className="h-4 w-4" />} title="Battery & Privacy">
            <Row label="Battery saver mode">
              <Switch checked={s.batterySaver} onCheckedChange={(v) => update("batterySaver", v)} />
            </Row>
            <Row label="Store health data locally only">
              <Switch
                checked={s.privacyLocalOnly}
                onCheckedChange={(v) => update("privacyLocalOnly", v)}
              />
            </Row>
            <Button variant="destructive" className="w-full" onClick={factoryReset}>
              <Trash2 className="h-4 w-4 mr-2" />
              Reset Watch to Defaults
            </Button>
          </Section>
        </div>
      </div>
    </MainLayout>
  );
};

/* ---------- Small building blocks ---------- */

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden"
  >
    <div className="px-4 py-3 border-b border-border/20 flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</div>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </motion.div>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs text-foreground">{label}</span>
    {children}
  </div>
);

const SliderRow: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  icon?: React.ReactNode;
}> = ({ label, value, onChange, min = 0, max = 100, step = 1, suffix = "", icon }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs text-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-xs font-semibold text-muted-foreground tabular-nums">
        {value}
        {suffix}
      </span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0])}
    />
  </div>
);

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-xl bg-muted/30 border border-border/20 p-2 text-center">
    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
      {icon} {label}
    </div>
    <div className="text-sm font-bold text-foreground">{value}</div>
  </div>
);

export default SmartwatchSettings;

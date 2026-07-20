import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Play,
  Square,
  RadioTower,
  Loader2,
  ImagePlus,
  Timer,
  Flame,
  Footprints,
} from "lucide-react";
import {
  BUILT_IN_FACES,
  FONTS,
  SETTINGS_KEY,
  CUSTOM_FACES_KEY,
  EVT,
  scanDevices,
  saveCustomFaces,
  loadCustomFaces,
  loadState,
  loadWorkout,
  saveState,
  saveWorkout,
  sensorHub,
  startWorkout,
  stopWorkout,
  type DiscoveredDevice,
  type SensorReading,
  type WatchFace,
  type WatchState,
  type WorkoutSession,
  type WorkoutType,
} from "@/lib/smartwatch";
import { SmartwatchSettingsExtras } from "@/components/smartwatch/smartwatch-settings-extras";

type Settings = {
  face: string;
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
  stressAlerts: boolean;
  stepGoal: number;
  waterReminders: boolean;
  standReminders: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  face: "aurora",
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
  stressAlerts: true,
  stepGoal: 10000,
  waterReminders: true,
  standReminders: true,
};

const loadSettings = (): Settings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const WORKOUT_TYPES: { id: WorkoutType; label: string; icon: React.ReactNode }[] = [
  { id: "run", label: "Run", icon: <Footprints className="h-4 w-4" /> },
  { id: "walk", label: "Walk", icon: <Activity className="h-4 w-4" /> },
  { id: "cycle", label: "Cycle", icon: <Activity className="h-4 w-4" /> },
  { id: "strength", label: "Strength", icon: <Activity className="h-4 w-4" /> },
  { id: "yoga", label: "Yoga", icon: <Activity className="h-4 w-4" /> },
  { id: "hiit", label: "HIIT", icon: <Flame className="h-4 w-4" /> },
];

const SmartwatchSettings: React.FC = () => {
  const navigate = useNavigate();
  const [s, setS] = useState<Settings>(loadSettings);
  const [watchState, setWatchState] = useState<WatchState>(loadState);
  const [customFaces, setCustomFaces] = useState<WatchFace[]>(loadCustomFaces);
  const [reading, setReading] = useState<SensorReading>(sensorHub.current);
  const [workout, setWorkout] = useState<WorkoutSession | null>(loadWorkout);
  const [newFaceName, setNewFaceName] = useState("");
  const [newFaceColor, setNewFaceColor] = useState("#a855f7");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);
  const [pairOpen, setPairOpen] = useState(false);
  const [pairStep, setPairStep] = useState<"scan" | "select" | "connecting" | "syncing" | "done">("scan");
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DiscoveredDevice | null>(null);
  const [pairProgress, setPairProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const allFaces = useMemo(() => [...BUILT_IN_FACES, ...customFaces], [customFaces]);
  const activeFace = allFaces.find((f) => f.id === s.face) ?? BUILT_IN_FACES[0];
  const activeFont = FONTS.find((f) => f.id === s.font) ?? FONTS[0];

  useEffect(() => {
    sensorHub.start();
    const unsub = sensorHub.subscribe(setReading);
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const sync = () => {
      setWatchState(loadState());
      setWorkout(loadWorkout());
    };
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Persist settings + broadcast face/font to homepage widget
  const update = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    const next = { ...s, [k]: v };
    setS(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    if (k === "face" || k === "font") {
      const w = loadState();
      saveState({ ...w, face: next.face, font: next.font });
      setWatchState(loadState());
    }
  };

  // Live workout tick
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

  /* ------- Pairing / Sync flow ------- */
  const openPair = async () => {
    setPairOpen(true);
    setPairStep("scan");
    setDevices([]);
    setSelectedDevice(null);
    setPairProgress(0);
    const found = await scanDevices();
    setDevices(found);
    setPairStep("select");
  };

  const selectAndPair = async (d: DiscoveredDevice) => {
    setSelectedDevice(d);
    setPairStep("connecting");
    setPairProgress(0);
    for (let i = 1; i <= 40; i++) {
      await new Promise((r) => setTimeout(r, 30));
      setPairProgress(i * 2.5);
    }
    setPairStep("syncing");
    setPairProgress(0);
    for (let i = 1; i <= 40; i++) {
      await new Promise((r) => setTimeout(r, 40));
      setPairProgress(i * 2.5);
    }
    const next: WatchState = {
      ...loadState(),
      connected: true,
      paired: true,
      deviceName: d.name,
      deviceModel: d.model,
      bleSignal: Math.max(60, 100 + d.rssi),
      lastSync: Date.now(),
    };
    saveState(next);
    setWatchState(next);
    setPairStep("done");
    toast.success("Watch paired", { description: `${d.name} · synced` });
  };

  /* ------- Real HR ------- */
  const tryRealHr = async () => {
    toast.message("Requesting Bluetooth heart rate…");
    const ok = await sensorHub.connectRealHeartRate();
    if (ok) toast.success("Live heart rate connected");
    else toast.error("Not available", { description: "Web Bluetooth or a heart rate sensor is required." });
  };

  /* ------- Face uploads ------- */
  const onPickImage = () => fileRef.current?.click();
  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return toast.error("Image must be under 3 MB");
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addCustomFace = () => {
    if (!newFaceName.trim()) return toast.error("Name your face first");
    const id = `custom-${Date.now()}`;
    const face: WatchFace = {
      id,
      name: newFaceName.trim(),
      gradient: "from-primary via-accent to-primary",
      accent: newFaceColor,
      style: uploadedImage ? "digital" : "hybrid",
      image: uploadedImage ?? undefined,
    };
    const next = [...customFaces, face];
    setCustomFaces(next);
    saveCustomFaces(next);
    setNewFaceName("");
    setUploadedImage(null);
    toast.success("Custom face created", { description: face.name });
  };

  const removeCustom = (id: string) => {
    const next = customFaces.filter((f) => f.id !== id);
    setCustomFaces(next);
    saveCustomFaces(next);
    if (s.face === id) update("face", "aurora");
    toast.message("Custom face removed");
  };

  /* ------- Workout ------- */
  const toggleWorkout = (type: WorkoutType = "run") => {
    if (workout?.active) {
      const ended = stopWorkout(workout);
      setWorkout(null);
      toast.success("Workout saved", {
        description: `${Math.floor(ended.duration / 60)}m · ${Math.round(ended.calories)} kcal · ${ended.distance.toFixed(2)} km`,
      });
    } else {
      const w = startWorkout(type);
      setWorkout(w);
      toast.success(`${type.toUpperCase()} started`, { description: "Live tracking active on your watch." });
    }
  };

  const findWatch = () => {
    if (!watchState.connected) return toast.error("Connect your watch first");
    setPinging(true);
    toast.success("Ringing your watch…", { description: `Volume ${s.ringVolume}%` });
    window.setTimeout(() => setPinging(false), 4000);
  };

  const factoryReset = () => {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(CUSTOM_FACES_KEY);
    setS(DEFAULT_SETTINGS);
    setCustomFaces([]);
    saveCustomFaces([]);
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
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/more");
                }
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Watch className="h-5 w-5 text-primary" />
              <h1 className="text-base font-bold text-foreground">Smartwatch</h1>
            </div>
            <Badge className="ml-auto text-[10px]" variant="outline">
              {watchState.connected ? (
                <><BluetoothConnected className="h-3 w-3 mr-1" />Paired</>
              ) : (
                <><Bluetooth className="h-3 w-3 mr-1" />Off</>
              )}
            </Badge>
          </div>
        </div>

        <div className="relative z-10 space-y-4 px-4 pt-4">
          {/* Live Watch Preview */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl shadow-lg p-5"
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative h-48 w-48 rounded-[2rem] shadow-2xl overflow-hidden"
                style={
                  activeFace.image
                    ? { backgroundImage: `url(${activeFace.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : undefined
                }
              >
                {!activeFace.image && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${activeFace.gradient}`} />
                )}
                <div className="absolute inset-2 rounded-[1.6rem] bg-black/50 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center gap-1">
                  <div
                    className="text-4xl font-bold tabular-nums"
                    style={{ fontFamily: activeFont.css, color: activeFace.accent }}
                  >
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="text-[11px] text-white/80" style={{ fontFamily: activeFont.css }}>
                    {new Date().toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-white/80">
                    <Heart className="h-3 w-3" /> {reading.hr}
                    <Droplets className="h-3 w-3 ml-1" /> {reading.spo2}%
                    <Activity className="h-3 w-3 ml-1" /> {(reading.steps / 1000).toFixed(1)}k
                  </div>
                </div>
                <div className="absolute -inset-6 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)] pointer-events-none" />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-foreground">{activeFace.name}</div>
                <div className="text-xs text-muted-foreground">
                  {activeFace.style} · {activeFont.name} · fw {watchState.firmwareVersion}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Device / Pairing */}
          <Section icon={<Watch className="h-4 w-4" />} title="Device">
            <div className="grid grid-cols-3 gap-2">
              <Stat icon={<BatteryLow className="h-3 w-3" />} label="Battery" value={`${watchState.battery}%`} />
              <Stat icon={<Radio className="h-3 w-3" />} label="Signal" value={`${watchState.bleSignal}%`} />
              <Stat icon={<Wifi className="h-3 w-3" />} label="Last sync" value={`${Math.round((Date.now() - watchState.lastSync) / 1000)}s`} />
            </div>
            <Row label="Device name">
              <Input
                value={watchState.deviceName}
                onChange={(e) => {
                  const next = { ...watchState, deviceName: e.target.value };
                  saveState(next);
                  setWatchState(next);
                }}
                className="h-9 max-w-[220px]"
              />
            </Row>
            <Row label="Connection">
              <Switch
                checked={watchState.connected}
                onCheckedChange={(v) => {
                  const next = { ...watchState, connected: v, lastSync: Date.now() };
                  saveState(next);
                  setWatchState(next);
                }}
              />
            </Row>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={openPair}>
                <RadioTower className="h-4 w-4 mr-2" />
                Pair / Sync
              </Button>
              <Button variant="outline" onClick={findWatch} disabled={pinging}>
                <MapPin className="h-4 w-4 mr-2" />
                {pinging ? "Ringing…" : "Find Watch"}
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={tryRealHr}>
              <Heart className="h-4 w-4 mr-2 text-rose-400" />
              Connect Real HR Sensor (BLE)
            </Button>
          </Section>

          {/* Workout tracking */}
          <Section icon={<Activity className="h-4 w-4 text-emerald-400" />} title="Workout Tracking">
            {workout?.active ? (
              <>
                <div className="rounded-xl border border-primary/40 bg-primary/10 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        {workout.type.toUpperCase()} · <span className="text-primary">LIVE</span>
                      </div>
                      <div className="text-2xl font-bold text-foreground tabular-nums mt-1">
                        {formatDuration(workout.duration)}
                      </div>
                    </div>
                    <Timer className="h-8 w-8 text-primary/60" />
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <MiniStat label="Avg HR" value={`${workout.avgHr}`} />
                    <MiniStat label="Max HR" value={`${workout.maxHr}`} />
                    <MiniStat label="kcal" value={`${Math.round(workout.calories)}`} />
                    <MiniStat label="km" value={workout.distance.toFixed(2)} />
                  </div>
                </div>
                <Button variant="destructive" className="w-full" onClick={() => toggleWorkout()}>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Workout
                </Button>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Start a live workout — HR, calories and distance stream from the watch.</p>
                <div className="grid grid-cols-3 gap-2">
                  {WORKOUT_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => toggleWorkout(t.id)}
                      className="flex flex-col items-center gap-1 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/30 p-2.5 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{t.icon}</div>
                      <span className="text-[11px] font-medium text-foreground">{t.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            <Row label="Auto workout detection">
              <Switch checked={s.autoWorkoutDetect} onCheckedChange={(v) => update("autoWorkoutDetect", v)} />
            </Row>
            <Row label="High-accuracy GPS">
              <Switch checked={s.workoutGpsHighAccuracy} onCheckedChange={(v) => update("workoutGpsHighAccuracy", v)} />
            </Row>
          </Section>

          {/* Face Management */}
          <Section icon={<Palette className="h-4 w-4" />} title="Watch Faces">
            <div className="grid grid-cols-4 gap-2">
              {allFaces.map((f) => {
                const selected = f.id === s.face;
                return (
                  <button
                    key={f.id}
                    onClick={() => update("face", f.id)}
                    className={`relative aspect-square rounded-2xl p-1 shadow-md overflow-hidden ${
                      selected ? "ring-2 ring-primary" : ""
                    }`}
                    style={
                      f.image
                        ? { backgroundImage: `url(${f.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : undefined
                    }
                    aria-label={`Select ${f.name}`}
                  >
                    {!f.image && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient}`} />
                    )}
                    <div className="absolute inset-1.5 rounded-xl bg-black/40 flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-white/90 truncate px-1">
                        {f.name}
                      </span>
                    </div>
                    {selected && (
                      <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 shadow z-10">
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
                        className="absolute -top-1 -left-1 bg-destructive rounded-full p-0.5 shadow cursor-pointer z-10"
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

          {/* Face Builder + Upload */}
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
              <div className="flex items-center gap-2">
                <Label className="text-xs w-14 shrink-0">Image</Label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImage} />
                <Button variant="outline" size="sm" onClick={onPickImage} className="flex-1">
                  <ImagePlus className="h-4 w-4 mr-1.5" />
                  {uploadedImage ? "Change image" : "Upload watch face image"}
                </Button>
                {uploadedImage && (
                  <div
                    className="h-9 w-9 rounded-md border border-border/40 bg-cover bg-center"
                    style={{ backgroundImage: `url(${uploadedImage})` }}
                  />
                )}
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
                    <div className="text-lg font-bold text-foreground" style={{ fontFamily: f.css }}>
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
            <SliderRow label="Brightness" value={s.brightness} onChange={(v) => update("brightness", v)} suffix="%" />
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

          {/* Health */}
          <Section icon={<Heart className="h-4 w-4 text-rose-400" />} title="Heart Rate">
            <Row label="Continuous monitoring">
              <Switch checked={s.hrEnabled} onCheckedChange={(v) => update("hrEnabled", v)} />
            </Row>
            <SliderRow label="High alert" value={s.hrHighAlert} min={100} max={200} onChange={(v) => update("hrHighAlert", v)} suffix=" bpm" />
            <SliderRow label="Low alert" value={s.hrLowAlert} min={30} max={70} onChange={(v) => update("hrLowAlert", v)} suffix=" bpm" />
          </Section>

          <Section icon={<Droplets className="h-4 w-4 text-cyan-400" />} title="Blood Oxygen (SpO₂)">
            <Row label="Enabled">
              <Switch checked={s.spo2Enabled} onCheckedChange={(v) => update("spo2Enabled", v)} />
            </Row>
            <Row label="Continuous night measurements">
              <Switch checked={s.spo2Continuous} onCheckedChange={(v) => update("spo2Continuous", v)} />
            </Row>
          </Section>

          <Section icon={<Moon className="h-4 w-4 text-indigo-400" />} title="Sleep">
            <Row label="Sleep tracking">
              <Switch checked={s.sleepTracking} onCheckedChange={(v) => update("sleepTracking", v)} />
            </Row>
            <SliderRow label="Nightly goal" value={s.sleepGoalHours} min={4} max={12} step={0.5} onChange={(v) => update("sleepGoalHours", v)} suffix=" h" />
          </Section>

          <Section icon={<Flame className="h-4 w-4 text-orange-400" />} title="Activity Goals">
            <SliderRow label="Daily steps" value={s.stepGoal} min={2000} max={25000} step={500} onChange={(v) => update("stepGoal", v)} />
            <Row label="Water reminders">
              <Switch checked={s.waterReminders} onCheckedChange={(v) => update("waterReminders", v)} />
            </Row>
            <Row label="Hourly stand reminders">
              <Switch checked={s.standReminders} onCheckedChange={(v) => update("standReminders", v)} />
            </Row>
            <Row label="Stress alerts">
              <Switch checked={s.stressAlerts} onCheckedChange={(v) => update("stressAlerts", v)} />
            </Row>
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
                  <Input type="time" value={s.quietStart} onChange={(e) => update("quietStart", e.target.value)} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs">End</Label>
                  <Input type="time" value={s.quietEnd} onChange={(e) => update("quietEnd", e.target.value)} className="h-9" />
                </div>
              </div>
            )}
            <SliderRow label="Ring volume" value={s.ringVolume} onChange={(v) => update("ringVolume", v)} suffix="%" icon={<Volume2 className="h-3.5 w-3.5" />} />
          </Section>

          {/* Battery & Privacy */}
          <Section icon={<ShieldCheck className="h-4 w-4" />} title="Battery & Privacy">
            <Row label="Battery saver mode">
              <Switch checked={s.batterySaver} onCheckedChange={(v) => update("batterySaver", v)} />
            </Row>
            <Row label="Store health data locally only">
              <Switch checked={s.privacyLocalOnly} onCheckedChange={(v) => update("privacyLocalOnly", v)} />
            </Row>
            <Button variant="destructive" className="w-full" onClick={factoryReset}>
              <Trash2 className="h-4 w-4 mr-2" />
              Reset Watch to Defaults
            </Button>
          </Section>

          {/* NEW: Dialer, Security, SOS, Medical ID, Advanced Health, Complications, Alarms, Apps */}
          <SmartwatchSettingsExtras />
        </div>
      </div>

      {/* Pairing dialog */}
      <Dialog open={pairOpen} onOpenChange={setPairOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RadioTower className="h-5 w-5 text-primary" />
              Pair &amp; Sync
            </DialogTitle>
          </DialogHeader>
          <AnimatePresence mode="wait">
            {pairStep === "scan" && (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6 text-center space-y-3">
                <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
                <p className="text-sm text-foreground font-medium">Scanning for nearby devices…</p>
                <p className="text-xs text-muted-foreground">Make sure your watch is powered on and nearby.</p>
              </motion.div>
            )}
            {pairStep === "select" && (
              <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 py-2">
                <p className="text-xs text-muted-foreground mb-2">Found {devices.length} device(s):</p>
                {devices.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => selectAndPair(d)}
                    className="w-full rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/30 p-3 flex items-center gap-3 text-left transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Watch className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{d.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{d.model} · {d.rssi} dBm</div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      <Bluetooth className="h-3 w-3 mr-1" />BLE
                    </Badge>
                  </button>
                ))}
                <Button variant="ghost" className="w-full" onClick={openPair}>
                  Rescan
                </Button>
              </motion.div>
            )}
            {(pairStep === "connecting" || pairStep === "syncing") && (
              <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6 space-y-3">
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {pairStep === "connecting" ? "Pairing" : "Syncing data"} — {selectedDevice?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pairStep === "connecting" ? "Establishing secure BLE channel…" : "Fetching HR, SpO₂, sleep and workouts…"}
                  </p>
                </div>
                <Progress value={pairProgress} className="h-2" />
                <div className="text-center text-xs text-muted-foreground tabular-nums">{Math.round(pairProgress)}%</div>
              </motion.div>
            )}
            {pairStep === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center space-y-3">
                <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <Check className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-foreground">Paired &amp; synced</p>
                <p className="text-xs text-muted-foreground">{selectedDevice?.name} is ready to go.</p>
                <Button className="w-full" onClick={() => setPairOpen(false)}>Done</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

/* ---------- Small building blocks ---------- */

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
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
        {value.toLocaleString()}
        {suffix}
      </span>
    </div>
    <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
  </div>
);

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="rounded-xl bg-muted/30 border border-border/20 p-2 text-center">
    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
      {icon} {label}
    </div>
    <div className="text-sm font-bold text-foreground">{value}</div>
  </div>
);

const MiniStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg bg-black/20 border border-white/10 p-1.5 text-center">
    <div className="text-[9px] text-muted-foreground">{label}</div>
    <div className="text-xs font-bold text-foreground tabular-nums">{value}</div>
  </div>
);

const formatDuration = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
};

export default SmartwatchSettings;

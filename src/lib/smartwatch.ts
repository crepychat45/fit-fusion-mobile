// Shared smartwatch state, pairing/sync flow, sensor hub, workout tracking

export type WatchFace = {
  id: string;
  name: string;
  gradient: string;
  accent: string;
  style: "analog" | "digital" | "hybrid";
  image?: string; // dataURL for uploaded faces
  imageFit?: "cover" | "contain"; // how uploaded image fills the watch screen
};

export const BUILT_IN_FACES: WatchFace[] = [
  { id: "aurora", name: "Aurora", gradient: "from-fuchsia-500 via-purple-500 to-indigo-500", accent: "#a855f7", style: "hybrid" },
  { id: "ember", name: "Ember", gradient: "from-orange-500 via-rose-500 to-red-600", accent: "#f97316", style: "digital" },
  { id: "abyss", name: "Abyss", gradient: "from-slate-900 via-slate-800 to-slate-700", accent: "#38bdf8", style: "analog" },
  { id: "glacier", name: "Glacier", gradient: "from-sky-400 via-cyan-500 to-teal-500", accent: "#22d3ee", style: "digital" },
  { id: "forest", name: "Forest", gradient: "from-emerald-500 via-green-600 to-teal-700", accent: "#10b981", style: "analog" },
  { id: "solar", name: "Solar", gradient: "from-amber-400 via-yellow-500 to-orange-500", accent: "#facc15", style: "hybrid" },
  { id: "noir", name: "Noir", gradient: "from-zinc-900 via-zinc-800 to-zinc-900", accent: "#e5e5e5", style: "digital" },
  { id: "rose", name: "Rose Quartz", gradient: "from-rose-300 via-pink-400 to-fuchsia-500", accent: "#f472b6", style: "hybrid" },
  { id: "midnight", name: "Midnight", gradient: "from-slate-950 via-blue-950 to-indigo-950", accent: "#60a5fa", style: "analog" },
  { id: "sunset", name: "Sunset", gradient: "from-orange-400 via-pink-500 to-purple-600", accent: "#fb923c", style: "hybrid" },
  { id: "ocean", name: "Ocean", gradient: "from-blue-600 via-cyan-500 to-teal-400", accent: "#06b6d4", style: "digital" },
  { id: "carbon", name: "Carbon", gradient: "from-neutral-900 via-neutral-800 to-neutral-900", accent: "#f59e0b", style: "analog" },
  { id: "neon", name: "Neon Pulse", gradient: "from-lime-400 via-emerald-500 to-cyan-500", accent: "#22c55e", style: "digital" },
  { id: "royal", name: "Royal", gradient: "from-indigo-700 via-purple-700 to-blue-800", accent: "#c084fc", style: "hybrid" },
  { id: "cherry", name: "Cherry", gradient: "from-red-500 via-pink-600 to-rose-700", accent: "#fb7185", style: "digital" },
  { id: "mint", name: "Mint Fresh", gradient: "from-green-300 via-teal-400 to-emerald-500", accent: "#5eead4", style: "hybrid" },
  { id: "galaxy", name: "Galaxy", gradient: "from-purple-900 via-fuchsia-800 to-indigo-900", accent: "#e879f9", style: "analog" },
  { id: "titanium", name: "Titanium", gradient: "from-zinc-500 via-zinc-400 to-zinc-600", accent: "#0ea5e9", style: "analog" },
  { id: "sakura", name: "Sakura", gradient: "from-pink-200 via-rose-300 to-pink-400", accent: "#ec4899", style: "hybrid" },
  { id: "arctic", name: "Arctic", gradient: "from-white via-sky-100 to-blue-200", accent: "#0284c7", style: "digital" },
  { id: "lava", name: "Lava", gradient: "from-red-700 via-orange-600 to-yellow-500", accent: "#ef4444", style: "digital" },
  { id: "matrix", name: "Matrix", gradient: "from-black via-green-950 to-emerald-900", accent: "#22c55e", style: "digital" },
  { id: "champagne", name: "Champagne", gradient: "from-yellow-100 via-amber-200 to-yellow-300", accent: "#d97706", style: "analog" },
  { id: "cyberpunk", name: "Cyberpunk", gradient: "from-fuchsia-600 via-cyan-500 to-yellow-400", accent: "#f0abfc", style: "digital" },
  // New styles ↓
  { id: "nebula", name: "Nebula", gradient: "from-violet-600 via-fuchsia-500 to-rose-500", accent: "#c084fc", style: "hybrid" },
  { id: "aurora-borealis", name: "Aurora Borealis", gradient: "from-emerald-400 via-teal-500 to-indigo-600", accent: "#34d399", style: "digital" },
  { id: "obsidian", name: "Obsidian", gradient: "from-black via-zinc-900 to-slate-900", accent: "#f43f5e", style: "analog" },
  { id: "platinum", name: "Platinum", gradient: "from-slate-200 via-slate-300 to-slate-400", accent: "#0f172a", style: "analog" },
  { id: "gold-rush", name: "Gold Rush", gradient: "from-yellow-500 via-amber-500 to-orange-600", accent: "#fbbf24", style: "hybrid" },
  { id: "ocean-deep", name: "Ocean Deep", gradient: "from-blue-950 via-cyan-900 to-teal-800", accent: "#22d3ee", style: "hybrid" },
  { id: "volcano", name: "Volcano", gradient: "from-red-900 via-orange-700 to-yellow-600", accent: "#fb923c", style: "digital" },
  { id: "monochrome", name: "Monochrome", gradient: "from-neutral-200 via-neutral-500 to-neutral-800", accent: "#ffffff", style: "digital" },
  { id: "iron-hud", name: "Iron HUD", gradient: "from-red-700 via-yellow-500 to-red-900", accent: "#facc15", style: "digital" },
  { id: "stealth", name: "Stealth", gradient: "from-black via-zinc-950 to-neutral-900", accent: "#22c55e", style: "digital" },
  { id: "prism", name: "Prism", gradient: "from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-600", accent: "#ffffff", style: "hybrid" },
  { id: "dune", name: "Dune", gradient: "from-amber-800 via-orange-600 to-yellow-700", accent: "#fef3c7", style: "analog" },
  { id: "tokyo-night", name: "Tokyo Night", gradient: "from-indigo-950 via-purple-900 to-pink-800", accent: "#f0abfc", style: "digital" },
  { id: "emerald-dream", name: "Emerald Dream", gradient: "from-emerald-900 via-green-700 to-lime-500", accent: "#a7f3d0", style: "hybrid" },
  { id: "rose-gold", name: "Rose Gold", gradient: "from-rose-300 via-amber-200 to-pink-400", accent: "#fda4af", style: "analog" },
  { id: "arctic-fox", name: "Arctic Fox", gradient: "from-sky-200 via-blue-300 to-indigo-400", accent: "#1e3a8a", style: "analog" },
  { id: "electric-blue", name: "Electric Blue", gradient: "from-blue-500 via-indigo-600 to-cyan-400", accent: "#22d3ee", style: "digital" },
  { id: "sakura-night", name: "Sakura Night", gradient: "from-pink-500 via-purple-700 to-slate-900", accent: "#f9a8d4", style: "hybrid" },
  { id: "retro-wave", name: "Retro Wave", gradient: "from-pink-500 via-purple-500 to-cyan-400", accent: "#f472b6", style: "digital" },
  { id: "biohazard", name: "Biohazard", gradient: "from-lime-400 via-green-600 to-black", accent: "#84cc16", style: "hybrid" },
  { id: "royal-purple", name: "Royal Purple", gradient: "from-purple-800 via-violet-700 to-fuchsia-600", accent: "#e9d5ff", style: "analog" },
  // v7.4 face pack ↓
  { id: "hologram", name: "Hologram", gradient: "from-cyan-300 via-fuchsia-400 to-indigo-500", accent: "#67e8f9", style: "hybrid" },
  { id: "graphite", name: "Graphite", gradient: "from-neutral-800 via-zinc-700 to-slate-900", accent: "#fb7185", style: "analog" },
  { id: "coral-reef", name: "Coral Reef", gradient: "from-teal-300 via-cyan-400 to-orange-300", accent: "#fdba74", style: "hybrid" },
  { id: "solar-flare", name: "Solar Flare", gradient: "from-yellow-300 via-orange-500 to-red-600", accent: "#fde047", style: "digital" },
  { id: "midnight-forest", name: "Midnight Forest", gradient: "from-emerald-900 via-slate-900 to-green-800", accent: "#4ade80", style: "analog" },
  { id: "candy-pop", name: "Candy Pop", gradient: "from-pink-300 via-fuchsia-400 to-violet-400", accent: "#f472b6", style: "digital" },
  { id: "stellar", name: "Stellar", gradient: "from-slate-900 via-blue-800 to-fuchsia-700", accent: "#a5b4fc", style: "hybrid" },
  { id: "amber-lux", name: "Amber Lux", gradient: "from-amber-600 via-yellow-400 to-orange-500", accent: "#78350f", style: "analog" },
  { id: "porsche", name: "Racing", gradient: "from-red-600 via-black to-red-800", accent: "#facc15", style: "hybrid" },
  { id: "pastel-mint", name: "Pastel Mint", gradient: "from-emerald-200 via-teal-200 to-sky-200", accent: "#0f766e", style: "digital" },
  { id: "sunrise", name: "Sunrise", gradient: "from-yellow-200 via-orange-300 to-rose-400", accent: "#f97316", style: "analog" },
  { id: "deep-space", name: "Deep Space", gradient: "from-black via-purple-950 to-slate-950", accent: "#818cf8", style: "digital" },
  { id: "quartz", name: "Quartz", gradient: "from-white via-pink-100 to-purple-200", accent: "#a855f7", style: "analog" },
  { id: "gunmetal", name: "Gunmetal", gradient: "from-slate-700 via-zinc-800 to-slate-900", accent: "#38bdf8", style: "digital" },
  { id: "aurora-mint", name: "Aurora Mint", gradient: "from-teal-300 via-emerald-400 to-cyan-500", accent: "#a7f3d0", style: "hybrid" },
];

export const FONTS = [
  { id: "system", name: "System", css: "system-ui, sans-serif" },
  { id: "inter", name: "Inter", css: "'Inter', sans-serif" },
  { id: "space", name: "Space Grotesk", css: "'Space Grotesk', sans-serif" },
  { id: "mono", name: "Mono", css: "'JetBrains Mono', ui-monospace, monospace" },
  { id: "serif", name: "Serif", css: "'Playfair Display', serif" },
  { id: "rounded", name: "Rounded", css: "'Nunito', sans-serif" },
];

export const STATE_KEY = "fitfusion.watch.state";
export const SETTINGS_KEY = "fitfusion.watch.settings";
export const CUSTOM_FACES_KEY = "fitfusion.watch.customFaces";
export const WORKOUT_KEY = "fitfusion.watch.workout";
export const EVT = "fitfusion:watch:updated";

export type WatchState = {
  connected: boolean;
  paired: boolean;
  deviceName: string;
  deviceModel: string;
  battery: number;
  bleSignal: number;
  face: string;
  font: string;
  lastSync: number;
  firmwareVersion: string;
};

export const DEFAULT_STATE: WatchState = {
  connected: true,
  paired: true,
  deviceName: "FitFusion Watch Pro",
  deviceModel: "FFW-Pro Series 3",
  battery: 78,
  bleSignal: 92,
  face: "aurora",
  font: "system",
  lastSync: Date.now(),
  firmwareVersion: "7.1.0",
};

export const loadState = (): WatchState => {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
};

export const saveState = (s: WatchState) => {
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(EVT));
};

/* ---------- Custom faces ---------- */

export const loadCustomFaces = (): WatchFace[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_FACES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCustomFaces = (faces: WatchFace[]) => {
  localStorage.setItem(CUSTOM_FACES_KEY, JSON.stringify(faces));
  window.dispatchEvent(new Event(EVT));
};

/* ---------- Pairing flow ---------- */

export type PairingStep = "idle" | "scanning" | "found" | "pairing" | "syncing" | "done" | "error";

export type DiscoveredDevice = { id: string; name: string; model: string; rssi: number };

const MOCK_DEVICES: DiscoveredDevice[] = [
  { id: "ffw-pro-3", name: "FitFusion Watch Pro", model: "FFW-Pro Series 3", rssi: -42 },
  { id: "ffw-air-2", name: "FitFusion Air 2", model: "FFW-Air Series 2", rssi: -58 },
  { id: "ffw-lite", name: "FitFusion Lite", model: "FFW-Lite", rssi: -71 },
];

// Attempts Web Bluetooth if available, otherwise returns mock devices after a delay
export const scanDevices = async (): Promise<DiscoveredDevice[]> => {
  const nav = navigator as Navigator & { bluetooth?: { requestDevice: (opts: unknown) => Promise<{ name?: string; id: string }> } };
  if (nav.bluetooth) {
    try {
      const dev = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["heart_rate", "battery_service"],
      });
      return [
        {
          id: dev.id,
          name: dev.name || "Unknown Watch",
          model: "BLE Device",
          rssi: -50,
        },
      ];
    } catch {
      // fall through to mock
    }
  }
  await new Promise((r) => setTimeout(r, 1500));
  return MOCK_DEVICES;
};

/* ---------- Sensor hub (simulated + optional real HR) ---------- */

export type SensorReading = {
  hr: number;
  spo2: number;
  steps: number;
  calories: number;
  distance: number; // km
  stress: number; // 0-100
  temperature: number; // °C
  timestamp: number;
};

const DEFAULT_READING: SensorReading = {
  hr: 72,
  spo2: 98,
  steps: 6200,
  calories: 340,
  distance: 4.8,
  stress: 28,
  temperature: 36.6,
  timestamp: Date.now(),
};

type Listener = (r: SensorReading) => void;

class SensorHub {
  private reading: SensorReading = DEFAULT_READING;
  private listeners = new Set<Listener>();
  private timer: number | null = null;
  private realHrCleanup: (() => void) | null = null;

  start() {
    if (this.timer !== null) return;
    this.timer = window.setInterval(() => {
      this.reading = {
        ...this.reading,
        hr: clamp(this.reading.hr + Math.round((Math.random() - 0.5) * 6), 55, 130),
        spo2: clamp(this.reading.spo2 + (Math.random() > 0.75 ? (Math.random() > 0.5 ? 1 : -1) : 0), 94, 100),
        steps: this.reading.steps + Math.floor(Math.random() * 8),
        calories: this.reading.calories + Math.random() * 0.4,
        distance: this.reading.distance + Math.random() * 0.006,
        stress: clamp(this.reading.stress + Math.round((Math.random() - 0.5) * 4), 5, 90),
        temperature: +(36.4 + Math.random() * 0.6).toFixed(1),
        timestamp: Date.now(),
      };
      this.emit();
    }, 2000);
  }

  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.realHrCleanup) {
      this.realHrCleanup();
      this.realHrCleanup = null;
    }
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    l(this.reading);
    return () => this.listeners.delete(l);
  }

  get current() {
    return this.reading;
  }

  private emit() {
    this.listeners.forEach((l) => l(this.reading));
  }

  // Try to connect a real Bluetooth heart rate sensor (Web Bluetooth API)
  async connectRealHeartRate(): Promise<boolean> {
    const nav = navigator as Navigator & {
      bluetooth?: {
        requestDevice: (opts: unknown) => Promise<{
          gatt?: {
            connect: () => Promise<{
              getPrimaryService: (s: string) => Promise<{
                getCharacteristic: (c: string) => Promise<{
                  startNotifications: () => Promise<{ addEventListener: (t: string, cb: (e: Event) => void) => void; removeEventListener: (t: string, cb: (e: Event) => void) => void }>;
                }>;
              }>;
            }>;
          };
        }>;
      };
    };
    if (!nav.bluetooth) return false;
    try {
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
      });
      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService("heart_rate");
      const char = await service.getCharacteristic("heart_rate_measurement");
      const notifier = await char.startNotifications();
      const handler = (event: Event) => {
        const target = event.target as unknown as { value?: DataView };
        const value = target.value;
        if (!value) return;
        const flags = value.getUint8(0);
        const hr = flags & 0x1 ? value.getUint16(1, true) : value.getUint8(1);
        this.reading = { ...this.reading, hr, timestamp: Date.now() };
        this.emit();
      };
      notifier.addEventListener("characteristicvaluechanged", handler);
      this.realHrCleanup = () => notifier.removeEventListener("characteristicvaluechanged", handler);
      return true;
    } catch {
      return false;
    }
  }
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const sensorHub = new SensorHub();

/* ---------- Workout tracking ---------- */

export type WorkoutType = "run" | "walk" | "cycle" | "strength" | "yoga" | "hiit";

export type WorkoutSession = {
  id: string;
  type: WorkoutType;
  startedAt: number;
  endedAt?: number;
  duration: number; // seconds
  avgHr: number;
  maxHr: number;
  calories: number;
  steps: number;
  distance: number;
  active: boolean;
};

export const loadWorkout = (): WorkoutSession | null => {
  try {
    const raw = localStorage.getItem(WORKOUT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveWorkout = (w: WorkoutSession | null) => {
  if (w) localStorage.setItem(WORKOUT_KEY, JSON.stringify(w));
  else localStorage.removeItem(WORKOUT_KEY);
  window.dispatchEvent(new Event(EVT));
};

export const startWorkout = (type: WorkoutType): WorkoutSession => {
  const r = sensorHub.current;
  const w: WorkoutSession = {
    id: `w-${Date.now()}`,
    type,
    startedAt: Date.now(),
    duration: 0,
    avgHr: r.hr,
    maxHr: r.hr,
    calories: 0,
    steps: 0,
    distance: 0,
    active: true,
  };
  saveWorkout(w);
  return w;
};

export const stopWorkout = (w: WorkoutSession): WorkoutSession => {
  const ended = { ...w, endedAt: Date.now(), active: false };
  saveWorkout(null);
  return ended;
};

/* ---------- Dialer, Contacts, Security, Alarms, Complications ---------- */
// These keys use the fitfusion- prefix so they auto-mirror to Supabase via local-storage-sync.

const DIALER_KEY = "fitfusion-watch-dialer";
const SECURITY_KEY = "fitfusion-watch-security";
const ALARMS_KEY = "fitfusion-watch-alarms";
const COMPLICATIONS_KEY = "fitfusion-watch-complications";
const ADVANCED_KEY = "fitfusion-watch-advanced";

export type WatchContact = {
  id: string;
  name: string;
  number: string;
  favorite: boolean;
  emoji?: string;
};

export type CallLogEntry = {
  id: string;
  name: string;
  number: string;
  type: "incoming" | "outgoing" | "missed";
  timestamp: number;
  duration: number;
};

export type DialerState = {
  contacts: WatchContact[];
  callLog: CallLogEntry[];
  emergencyNumber: string;
  quickDialEnabled: boolean;
  voiceAssistEnabled: boolean;
  showCallerPhoto: boolean;
};

export const DEFAULT_DIALER: DialerState = {
  contacts: [
    { id: "c1", name: "Emergency Services", number: "112", favorite: true, emoji: "🚨" },
    { id: "c2", name: "Home", number: "+91 98765 43210", favorite: true, emoji: "🏠" },
    { id: "c3", name: "Coach", number: "+91 87654 32109", favorite: false, emoji: "🏋️" },
    { id: "c4", name: "Doctor", number: "+91 76543 21098", favorite: true, emoji: "🩺" },
  ],
  callLog: [],
  emergencyNumber: "112",
  quickDialEnabled: true,
  voiceAssistEnabled: false,
  showCallerPhoto: true,
};

export const loadDialer = (): DialerState => {
  try {
    const raw = localStorage.getItem(DIALER_KEY);
    return raw ? { ...DEFAULT_DIALER, ...JSON.parse(raw) } : DEFAULT_DIALER;
  } catch {
    return DEFAULT_DIALER;
  }
};

export const saveDialer = (d: DialerState) => {
  localStorage.setItem(DIALER_KEY, JSON.stringify(d));
  window.dispatchEvent(new Event(EVT));
};

export type SecurityConfig = {
  passcodeEnabled: boolean;
  passcode: string; // hashed
  autoLockMinutes: number;
  biometricUnlock: boolean;
  wristDetection: boolean;
  encryptionEnabled: boolean;
  appLock: boolean;
  lockOnRemoval: boolean;
  findMyWatchEnabled: boolean;
  remoteWipeEnabled: boolean;
  sosCountdown: number;
  fallDetection: boolean;
  crashDetection: boolean;
  emergencyContacts: string[];
  shareLocationOnSOS: boolean;
  medicalId: {
    bloodType: string;
    allergies: string;
    conditions: string;
    medications: string;
    organDonor: boolean;
  };
  hidePreviewsWhenLocked: boolean;
  panicWipeSequence: boolean;
};

export const DEFAULT_SECURITY: SecurityConfig = {
  passcodeEnabled: false,
  passcode: "",
  autoLockMinutes: 5,
  biometricUnlock: true,
  wristDetection: true,
  encryptionEnabled: true,
  appLock: false,
  lockOnRemoval: true,
  findMyWatchEnabled: true,
  remoteWipeEnabled: false,
  sosCountdown: 5,
  fallDetection: true,
  crashDetection: true,
  emergencyContacts: [],
  shareLocationOnSOS: true,
  medicalId: {
    bloodType: "",
    allergies: "",
    conditions: "",
    medications: "",
    organDonor: false,
  },
  hidePreviewsWhenLocked: true,
  panicWipeSequence: false,
};

export const loadSecurity = (): SecurityConfig => {
  try {
    const raw = localStorage.getItem(SECURITY_KEY);
    return raw ? { ...DEFAULT_SECURITY, ...JSON.parse(raw) } : DEFAULT_SECURITY;
  } catch {
    return DEFAULT_SECURITY;
  }
};

export const saveSecurity = (s: SecurityConfig) => {
  localStorage.setItem(SECURITY_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(EVT));
};

// Simple non-cryptographic passcode hash (client-side obfuscation only).
export const hashPasscode = (code: string) => {
  let h = 0;
  for (let i = 0; i < code.length; i++) {
    h = ((h << 5) - h + code.charCodeAt(i)) | 0;
  }
  return `ff_${Math.abs(h).toString(36)}`;
};

export type WatchAlarm = {
  id: string;
  label: string;
  time: string; // HH:MM
  days: number[]; // 0-6, Sun-Sat
  enabled: boolean;
  vibrate: boolean;
  sound: string;
  smartWake: boolean;
};

export const loadAlarms = (): WatchAlarm[] => {
  try {
    const raw = localStorage.getItem(ALARMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveAlarms = (a: WatchAlarm[]) => {
  localStorage.setItem(ALARMS_KEY, JSON.stringify(a));
  window.dispatchEvent(new Event(EVT));
};

export type ComplicationSlot = "top" | "bottom" | "left" | "right";
export type ComplicationType =
  | "heart"
  | "steps"
  | "calories"
  | "battery"
  | "weather"
  | "date"
  | "timer"
  | "music"
  | "workout"
  | "spo2"
  | "sleep"
  | "stress";

export const COMPLICATION_LIBRARY: { id: ComplicationType; label: string }[] = [
  { id: "heart", label: "Heart Rate" },
  { id: "steps", label: "Steps" },
  { id: "calories", label: "Calories" },
  { id: "battery", label: "Battery" },
  { id: "weather", label: "Weather" },
  { id: "date", label: "Date" },
  { id: "timer", label: "Timer" },
  { id: "music", label: "Music" },
  { id: "workout", label: "Workout" },
  { id: "spo2", label: "SpO₂" },
  { id: "sleep", label: "Sleep" },
  { id: "stress", label: "Stress" },
];

export type Complications = Record<ComplicationSlot, ComplicationType>;

export const DEFAULT_COMPLICATIONS: Complications = {
  top: "date",
  bottom: "steps",
  left: "heart",
  right: "battery",
};

export const loadComplications = (): Complications => {
  try {
    const raw = localStorage.getItem(COMPLICATIONS_KEY);
    return raw ? { ...DEFAULT_COMPLICATIONS, ...JSON.parse(raw) } : DEFAULT_COMPLICATIONS;
  } catch {
    return DEFAULT_COMPLICATIONS;
  }
};

export const saveComplications = (c: Complications) => {
  localStorage.setItem(COMPLICATIONS_KEY, JSON.stringify(c));
  window.dispatchEvent(new Event(EVT));
};

export type AdvancedSettings = {
  ecgEnabled: boolean;
  bloodPressureEnabled: boolean;
  skinTemperatureEnabled: boolean;
  menstrualTracking: boolean;
  hydrationTracking: boolean;
  hydrationGoalMl: number;
  breathingReminders: boolean;
  mindfulnessMinutes: number;
  noiseAlerts: boolean;
  noiseThresholdDb: number;
  handwashDetection: boolean;
  bedtimeMode: boolean;
  altitudeAlerts: boolean;
  uvAlerts: boolean;
  weatherLocation: string;
  weatherUnits: "metric" | "imperial";
  mediaControls: boolean;
  cameraRemote: boolean;
  flashlight: boolean;
  walkieTalkie: boolean;
  cardWallet: boolean;
  contactlessPayments: boolean;
};

export const DEFAULT_ADVANCED: AdvancedSettings = {
  ecgEnabled: true,
  bloodPressureEnabled: true,
  skinTemperatureEnabled: true,
  menstrualTracking: false,
  hydrationTracking: true,
  hydrationGoalMl: 2500,
  breathingReminders: true,
  mindfulnessMinutes: 5,
  noiseAlerts: true,
  noiseThresholdDb: 85,
  handwashDetection: false,
  bedtimeMode: true,
  altitudeAlerts: false,
  uvAlerts: true,
  weatherLocation: "Auto",
  weatherUnits: "metric",
  mediaControls: true,
  cameraRemote: true,
  flashlight: true,
  walkieTalkie: false,
  cardWallet: true,
  contactlessPayments: true,
};

export const loadAdvanced = (): AdvancedSettings => {
  try {
    const raw = localStorage.getItem(ADVANCED_KEY);
    return raw ? { ...DEFAULT_ADVANCED, ...JSON.parse(raw) } : DEFAULT_ADVANCED;
  } catch {
    return DEFAULT_ADVANCED;
  }
};

export const saveAdvanced = (a: AdvancedSettings) => {
  localStorage.setItem(ADVANCED_KEY, JSON.stringify(a));
  window.dispatchEvent(new Event(EVT));
};

export const triggerEmergencySOS = (config: SecurityConfig): Promise<void> => {
  return new Promise((resolve) => {
    // Simulated SOS trigger; would dispatch to native/emergency APIs on real device.
    const payload = {
      number: config.emergencyContacts[0] || "112",
      shareLocation: config.shareLocationOnSOS,
      medicalId: config.medicalId,
      timestamp: Date.now(),
    };
    console.info("[FitFusion SOS] Triggered", payload);
    setTimeout(resolve, 500);
  });
};


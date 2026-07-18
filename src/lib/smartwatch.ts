// Shared smartwatch state, pairing/sync flow, sensor hub, workout tracking

export type WatchFace = {
  id: string;
  name: string;
  gradient: string;
  accent: string;
  style: "analog" | "digital" | "hybrid";
  image?: string; // dataURL for uploaded faces
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

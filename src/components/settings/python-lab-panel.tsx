import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Play, Square, Trash2, Download, Copy, RotateCcw, PackageCheck, Terminal,
  Timer, Save, History, Cpu, FileCode2, Sparkles,
} from "lucide-react";

/* ------------------------------ persistence ------------------------------ */

const SETTINGS_KEY = "fitfusion-python-lab";
const SCRIPTS_KEY = "fitfusion-python-scripts";
const PYODIDE_VERSION = "0.27.7";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

interface PythonLabSettings {
  autoLoadRuntime: boolean;
  preloadNumpy: boolean;
  keepHistory: boolean;
  wrapOutput: boolean;
  fontSize: number;
  timeoutSeconds: number;
  lastCode: string;
}

const DEFAULT_SETTINGS: PythonLabSettings = {
  autoLoadRuntime: false,
  preloadNumpy: false,
  keepHistory: true,
  wrapOutput: true,
  fontSize: 13,
  timeoutSeconds: 20,
  lastCode: "",
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback)) return Array.isArray(parsed) ? (parsed as T) : fallback;
    return parsed && typeof parsed === "object" ? { ...(fallback as object), ...parsed } as T : fallback;
  } catch {
    return fallback;
  }
}

/* -------------------------------- snippets -------------------------------- */

interface Snippet { id: string; name: string; description: string; code: string; needsNumpy?: boolean }

const SNIPPETS: Snippet[] = [
  {
    id: "bmi",
    name: "BMI & body metrics",
    description: "Body mass index with category and healthy weight range.",
    code: `weight_kg = 74.5
height_cm = 178

bmi = weight_kg / (height_cm / 100) ** 2

def category(v):
    if v < 18.5: return "Underweight"
    if v < 25: return "Normal"
    if v < 30: return "Overweight"
    return "Obese"

low = 18.5 * (height_cm / 100) ** 2
high = 24.9 * (height_cm / 100) ** 2

print(f"BMI: {bmi:.1f} ({category(bmi)})")
print(f"Healthy range: {low:.1f} kg - {high:.1f} kg")
`,
  },
  {
    id: "tdee",
    name: "BMR / TDEE calculator",
    description: "Mifflin-St Jeor energy expenditure with activity multipliers.",
    code: `sex = "male"          # "male" or "female"
weight_kg = 74.5
height_cm = 178
age = 29
activity = "moderate"  # sedentary | light | moderate | active | athlete

bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + (5 if sex == "male" else -161)
mult = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725, "athlete": 1.9}
tdee = bmr * mult[activity]

print(f"BMR : {bmr:.0f} kcal/day")
print(f"TDEE: {tdee:.0f} kcal/day")
for goal, delta in (("Cut", -0.20), ("Maintain", 0.0), ("Bulk", 0.12)):
    print(f"  {goal:<9}: {tdee * (1 + delta):.0f} kcal")
`,
  },
  {
    id: "onerm",
    name: "1RM & training percentages",
    description: "Epley/Brzycki one-rep max plus a full percentage table.",
    code: `weight = 100.0
reps = 6

epley = weight * (1 + reps / 30)
brzycki = weight * 36 / (37 - reps)
one_rm = (epley + brzycki) / 2

print(f"Epley  : {epley:.1f} kg")
print(f"Brzycki: {brzycki:.1f} kg")
print(f"Est 1RM: {one_rm:.1f} kg\\n")

for pct in range(95, 55, -5):
    print(f"{pct}% -> {one_rm * pct / 100:6.1f} kg")
`,
  },
  {
    id: "macros",
    name: "Macro split planner",
    description: "Protein / fat / carb grams from calories and body weight.",
    code: `calories = 2450
weight_kg = 74.5
protein_g_per_kg = 2.0
fat_pct = 0.25

protein_g = weight_kg * protein_g_per_kg
fat_g = calories * fat_pct / 9
carbs_g = (calories - protein_g * 4 - fat_g * 9) / 4

for name, grams, kcal in (
    ("Protein", protein_g, protein_g * 4),
    ("Fat", fat_g, fat_g * 9),
    ("Carbs", carbs_g, carbs_g * 4),
):
    print(f"{name:<8} {grams:6.0f} g  {kcal:6.0f} kcal  ({kcal / calories * 100:4.1f}%)")
`,
  },
  {
    id: "pace",
    name: "Run pace & splits",
    description: "Convert distance and time into pace, speed and split table.",
    code: `distance_km = 10.0
minutes = 52
seconds = 30

total_s = minutes * 60 + seconds
pace_s = total_s / distance_km
speed = distance_km / (total_s / 3600)

print(f"Pace : {int(pace_s // 60)}:{int(pace_s % 60):02d} min/km")
print(f"Speed: {speed:.2f} km/h\\n")
for km in range(1, int(distance_km) + 1):
    t = pace_s * km
    print(f"km {km:2d} -> {int(t // 60):02d}:{int(t % 60):02d}")
`,
  },
  {
    id: "overload",
    name: "Progressive overload plan",
    description: "Generate a 8-week linear progression block.",
    code: `start_weight = 80.0
weekly_increase = 2.5
sets, reps = 4, 8

total_volume = 0
for week in range(1, 9):
    w = start_weight + weekly_increase * (week - 1)
    volume = w * sets * reps
    total_volume += volume
    deload = " (deload)" if week == 8 else ""
    print(f"Week {week}: {w:5.1f} kg x {sets}x{reps} = {volume:6.0f} kg{deload}")

print(f"\\nBlock volume: {total_volume:,.0f} kg")
`,
  },
  {
    id: "stats",
    name: "Workout stats with NumPy",
    description: "Trend, mean and moving average over session data.",
    needsNumpy: true,
    code: `import numpy as np

sessions = np.array([32, 41, 38, 47, 52, 49, 58, 61, 57, 66])

print("Sessions :", sessions.tolist())
print(f"Mean     : {sessions.mean():.1f} min")
print(f"Std dev  : {sessions.std():.1f}")
print(f"Best/Worst: {sessions.max()} / {sessions.min()}")

slope, intercept = np.polyfit(np.arange(len(sessions)), sessions, 1)
print(f"Trend    : {slope:+.2f} min per session")

window = 3
ma = np.convolve(sessions, np.ones(window) / window, mode="valid")
print("3-session moving avg:", [round(float(v), 1) for v in ma])
`,
  },
  {
    id: "hydration",
    name: "Hydration & sweat rate",
    description: "Fluid needs based on body weight, duration and climate.",
    code: `weight_kg = 74.5
workout_minutes = 75
climate = "hot"   # temperate | hot | humid

base_ml = weight_kg * 33
rate = {"temperate": 500, "hot": 850, "humid": 950}[climate]
during_ml = rate * (workout_minutes / 60)

print(f"Daily baseline : {base_ml:.0f} ml")
print(f"During session : {during_ml:.0f} ml")
print(f"Total target   : {base_ml + during_ml:.0f} ml")
print(f"Sip plan       : {during_ml / (workout_minutes / 15):.0f} ml every 15 min")
`,
  },
];

/* -------------------------------- component -------------------------------- */

type RuntimeState = "idle" | "loading" | "ready" | "running" | "error";

interface SavedScript { id: string; name: string; code: string; savedAt: string }

/** Python packages Pyodide can install on demand, keyed by import name. */
const AVAILABLE_PACKAGES: Record<string, string> = {
  numpy: "numpy",
  pandas: "pandas",
  scipy: "scipy",
  sympy: "sympy",
  matplotlib: "matplotlib",
  sklearn: "scikit-learn",
  statistics: "",
  micropip: "micropip",
  regex: "regex",
  pytz: "pytz",
  dateutil: "python-dateutil",
  PIL: "Pillow",
};

/** Scan source for `import x` / `from x import ...` and map to installable wheels. */
export function detectPackages(source: string): string[] {
  const found = new Set<string>();
  const re = /^\s*(?:import\s+([A-Za-z_][\w.]*)|from\s+([A-Za-z_][\w.]*)\s+import)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const root = (m[1] || m[2] || "").split(".")[0];
    const wheel = AVAILABLE_PACKAGES[root];
    if (wheel) found.add(wheel);
  }
  return Array.from(found);
}

declare global {
  interface Window { loadPyodide?: (opts: { indexURL: string }) => Promise<any> }
}

export function PythonLabPanel() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PythonLabSettings>(() => readJson(SETTINGS_KEY, DEFAULT_SETTINGS));
  const [scripts, setScripts] = useState<SavedScript[]>(() => readJson<SavedScript[]>(SCRIPTS_KEY, []));
  const [code, setCode] = useState<string>(() => {
    const s = readJson(SETTINGS_KEY, DEFAULT_SETTINGS);
    return s.lastCode || SNIPPETS[0].code;
  });
  const [output, setOutput] = useState<string>("");
  const [state, setState] = useState<RuntimeState>("idle");
  const [progress, setProgress] = useState(0);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [packages, setPackages] = useState<string[]>([]);
  const [scriptName, setScriptName] = useState("");

  const pyodideRef = useRef<any>(null);
  const cancelRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const patchSettings = useCallback((p: Partial<PythonLabSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...p };
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* noop */ }
      window.dispatchEvent(new CustomEvent("fitfusion-settings-changed", { detail: { key: SETTINGS_KEY, value: next } }));
      return next;
    });
  }, []);

  // Persist code (debounced) so the editor survives navigation.
  useEffect(() => {
    const t = window.setTimeout(() => patchSettings({ lastCode: code }), 600);
    return () => window.clearTimeout(t);
  }, [code, patchSettings]);

  const appendOutput = useCallback((line: string) => {
    setOutput((prev) => (prev ? `${prev}\n${line}` : line));
  }, []);

  const loadScript = useCallback((src: string) => new Promise<void>((resolve, reject) => {
    if (window.loadPyodide) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[data-pyodide="1"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Pyodide")));
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.dataset.pyodide = "1";
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("Failed to load Pyodide from CDN"));
    document.head.appendChild(el);
  }), []);

  const initRuntime = useCallback(async (): Promise<any> => {
    if (pyodideRef.current) return pyodideRef.current;
    setState("loading");
    setProgress(15);
    try {
      await loadScript(`${PYODIDE_URL}pyodide.js`);
      setProgress(45);
      if (!window.loadPyodide) throw new Error("Pyodide loader unavailable");
      const py = await window.loadPyodide({ indexURL: PYODIDE_URL });
      setProgress(80);
      py.setStdout({ batched: (s: string) => appendOutput(s) });
      py.setStderr({ batched: (s: string) => appendOutput(s) });
      pyodideRef.current = py;
      if (settings.preloadNumpy) {
        await py.loadPackage("numpy");
        setPackages((p) => (p.includes("numpy") ? p : [...p, "numpy"]));
      }
      setProgress(100);
      if (mountedRef.current) setState("ready");
      return py;
    } catch (err) {
      if (mountedRef.current) {
        setState("error");
        appendOutput(`[runtime] ${err instanceof Error ? err.message : String(err)}`);
      }
      throw err;
    }
  }, [appendOutput, loadScript, settings.preloadNumpy]);

  useEffect(() => {
    if (settings.autoLoadRuntime && !pyodideRef.current && state === "idle") {
      initRuntime().catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.autoLoadRuntime]);

  const runCode = useCallback(async () => {
    if (state === "running" || state === "loading") return;
    cancelRef.current = false;
    setOutput("");
    let py: any;
    try {
      py = await initRuntime();
    } catch {
      toast({ title: "Python runtime unavailable", description: "Check your connection and try again.", variant: "destructive" });
      return;
    }
    setState("running");
    const started = performance.now();
    try {
      // Auto-install every supported package the snippet imports.
      const needed = detectPackages(code).filter((pkg) => !packages.includes(pkg));
      if (needed.length) {
        appendOutput(`[packages] installing ${needed.join(", ")}...`);
        await py.loadPackage(needed);
        setPackages((p) => Array.from(new Set([...p, ...needed])));
        appendOutput("[packages] ready");
      }
      const exec = py.runPythonAsync(code);
      const timeout = new Promise((_, reject) =>
        window.setTimeout(() => reject(new Error(`Execution exceeded ${settings.timeoutSeconds}s timeout`)), settings.timeoutSeconds * 1000),
      );
      const result = await Promise.race([exec, timeout]);
      if (result !== undefined && result !== null) appendOutput(String(result));
      if (!cancelRef.current) appendOutput("[done]");
    } catch (err) {
      appendOutput(`[error] ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      const ms = Math.round(performance.now() - started);
      if (mountedRef.current) {
        setLastDuration(ms);
        setState("ready");
        if (settings.keepHistory) {
          const history = readJson<{ code: string; at: string }[]>("fitfusion-python-history", []);
          const next = [{ code, at: new Date().toISOString() }, ...history].slice(0, 20);
          try { localStorage.setItem("fitfusion-python-history", JSON.stringify(next)); } catch { /* noop */ }
        }
      }
    }
  }, [appendOutput, code, initRuntime, packages, settings.keepHistory, settings.timeoutSeconds, state, toast]);

  const resetRuntime = useCallback(() => {
    cancelRef.current = true;
    pyodideRef.current = null;
    setPackages([]);
    setState("idle");
    setProgress(0);
    setOutput("");
    setLastDuration(null);
    toast({ title: "Runtime reset", description: "A fresh Python interpreter will start on the next run." });
  }, [toast]);

  const saveScript = useCallback(() => {
    const name = scriptName.trim() || `Script ${scripts.length + 1}`;
    const next = [{ id: crypto.randomUUID(), name, code, savedAt: new Date().toISOString() }, ...scripts].slice(0, 25);
    setScripts(next);
    try { localStorage.setItem(SCRIPTS_KEY, JSON.stringify(next)); } catch { /* noop */ }
    setScriptName("");
    toast({ title: "Script saved", description: name });
  }, [code, scriptName, scripts, toast]);

  const deleteScript = useCallback((id: string) => {
    const next = scripts.filter((s) => s.id !== id);
    setScripts(next);
    try { localStorage.setItem(SCRIPTS_KEY, JSON.stringify(next)); } catch { /* noop */ }
  }, [scripts]);

  const downloadCode = useCallback(() => {
    const blob = new Blob([code], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitfusion-script-${Date.now()}.py`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code]);

  const copyOutput = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output || "");
      toast({ title: "Output copied" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  }, [output, toast]);

  const statusBadge = useMemo(() => {
    const map: Record<RuntimeState, { label: string; className: string }> = {
      idle: { label: "Runtime idle", className: "bg-muted text-muted-foreground" },
      loading: { label: "Loading runtime", className: "bg-amber-500/15 text-amber-600" },
      ready: { label: "Runtime ready", className: "bg-emerald-500/15 text-emerald-600" },
      running: { label: "Running", className: "bg-primary/15 text-primary" },
      error: { label: "Runtime error", className: "bg-destructive/15 text-destructive" },
    };
    return map[state];
  }, [state]);

  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void runCode();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = `${code.slice(0, start)}    ${code.slice(end)}`;
      setCode(next);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 4; });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-xl bg-card/60 border-border/50">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCode2 className="h-4 w-4 text-primary" />
                Python Lab
              </CardTitle>
              <CardDescription>
                Run real Python 3 in the app (Pyodide {PYODIDE_VERSION}) for fitness math, data checks and scripting.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusBadge.className} variant="secondary">{statusBadge.label}</Badge>
              {lastDuration !== null && (
                <Badge variant="outline" className="gap-1">
                  <Timer className="h-3 w-3" />{lastDuration} ms
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {state === "loading" && <Progress value={progress} className="h-1.5" />}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void runCode()} disabled={state === "running" || state === "loading"}>
              <Play className="h-4 w-4 mr-1.5" />
              {state === "running" ? "Running..." : "Run (Ctrl+Enter)"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => void initRuntime()} disabled={state !== "idle" && state !== "error"}>
              <Cpu className="h-4 w-4 mr-1.5" />Load runtime
            </Button>
            <Button size="sm" variant="outline" onClick={resetRuntime}>
              <RotateCcw className="h-4 w-4 mr-1.5" />Reset
            </Button>
            <Button size="sm" variant="outline" onClick={() => setOutput("")}>
              <Square className="h-4 w-4 mr-1.5" />Clear output
            </Button>
            <Button size="sm" variant="outline" onClick={downloadCode}>
              <Download className="h-4 w-4 mr-1.5" />Export .py
            </Button>
          </div>

          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={onEditorKeyDown}
            spellCheck={false}
            rows={14}
            aria-label="Python code editor"
            className="font-mono leading-relaxed resize-y"
            style={{ fontSize: `${settings.fontSize}px` }}
          />

          <div className="rounded-xl border border-border/50 bg-muted/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" />Output
              </span>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => void copyOutput()} disabled={!output}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <pre
              className={`text-xs font-mono max-h-72 overflow-auto ${settings.wrapOutput ? "whitespace-pre-wrap break-words" : "whitespace-pre"}`}
            >
              {output || "Run a script to see output here."}
            </pre>
          </div>

          {packages.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <PackageCheck className="h-3.5 w-3.5" />
              Loaded packages: {packages.join(", ")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-card/60 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Fitness script library
          </CardTitle>
          <CardDescription>Load a ready-made calculator into the editor and tweak the inputs.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {SNIPPETS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setCode(s.code); toast({ title: "Loaded", description: s.name }); }}
              className="text-left rounded-xl border border-border/50 bg-card/40 p-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{s.name}</span>
                {s.needsNumpy && <Badge variant="outline" className="text-[10px]">numpy</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">{s.description}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-card/60 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-primary" />
            Saved scripts
          </CardTitle>
          <CardDescription>Keep your own scripts on this device and reload them anytime.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              placeholder="Script name"
              aria-label="Script name"
            />
            <Button size="sm" onClick={saveScript}>
              <Save className="h-4 w-4 mr-1.5" />Save
            </Button>
          </div>
          {scripts.length === 0 ? (
            <p className="text-xs text-muted-foreground">No saved scripts yet.</p>
          ) : (
            <div className="space-y-2">
              {scripts.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-card/40 p-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(s.savedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="h-8" onClick={() => setCode(s.code)}>Load</Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => deleteScript(s.id)} aria-label={`Delete ${s.name}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-card/60 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="h-4 w-4 text-primary" />
            Python Lab settings
          </CardTitle>
          <CardDescription>These preferences are saved on this device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            ["autoLoadRuntime", "Preload runtime", "Start the Python interpreter as soon as this panel opens."],
            ["preloadNumpy", "Preload NumPy", "Fetch NumPy with the runtime so data scripts run instantly."],
            ["keepHistory", "Keep run history", "Store the last 20 executed scripts locally."],
            ["wrapOutput", "Wrap long output", "Soft-wrap console lines instead of scrolling sideways."],
          ] as const).map(([key, title, desc]) => (
            <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/40 p-3">
              <div className="min-w-0">
                <Label className="text-sm font-medium">{title}</Label>
                <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
              </div>
              <Switch
                checked={settings[key]}
                onCheckedChange={(v) => patchSettings({ [key]: v } as Partial<PythonLabSettings>)}
                aria-label={title}
              />
            </div>
          ))}

          <div className="rounded-xl border border-border/50 bg-card/40 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Editor font size</Label>
              <span className="text-xs text-muted-foreground">{settings.fontSize}px</span>
            </div>
            <Slider
              value={[settings.fontSize]}
              min={11}
              max={20}
              step={1}
              onValueChange={([v]) => patchSettings({ fontSize: v })}
              aria-label="Editor font size"
            />
          </div>

          <div className="rounded-xl border border-border/50 bg-card/40 p-3 space-y-2">
            <Label className="text-sm font-medium">Execution timeout</Label>
            <Select
              value={String(settings.timeoutSeconds)}
              onValueChange={(v) => patchSettings({ timeoutSeconds: Number(v) })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 60, 120].map((s) => (
                  <SelectItem key={s} value={String(s)}>{s} seconds</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Long-running scripts stop automatically to keep the app responsive.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PythonLabPanel;

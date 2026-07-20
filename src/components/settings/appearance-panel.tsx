import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Monitor, Contrast, Palette, Type, Sparkles } from "lucide-react";
import { applyAccent, applyFontSize } from "@/utils/appearance";
import { useToast } from "@/hooks/use-toast";

type Theme = "light" | "dark" | "system" | "high-contrast";
const ACCENTS = [
  { key: "blue", label: "Blue", hex: "#2563EB" },
  { key: "emerald", label: "Emerald", hex: "#10B981" },
  { key: "purple", label: "Purple", hex: "#8B5CF6" },
  { key: "amber", label: "Amber", hex: "#F59E0B" },
];

const STORAGE_KEY = "fitfusion_appearance";

interface Prefs {
  theme: Theme;
  accent: string;
  fontSize: number;
  reduceMotion: boolean;
}

function load(): Prefs {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (v) return v;
  } catch { /* ignore */ }
  return { theme: "system", accent: "#2563EB", fontSize: 16, reduceMotion: false };
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("hc");
  if (theme === "high-contrast") root.classList.add("hc");
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches) ||
    theme === "high-contrast";
  root.classList.toggle("dark", dark);
}

function applyReduceMotion(on: boolean) {
  document.documentElement.dataset.reduceMotion = on ? "true" : "false";
}

export function AppearancePanel() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(load);

  useEffect(() => {
    applyTheme(prefs.theme);
    applyAccent(prefs.accent);
    applyFontSize(prefs.fontSize);
    applyReduceMotion(prefs.reduceMotion);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch { /* ignore */ }
  }, [prefs]);

  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) =>
    setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <Card className="liquid-glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Appearance & Customization
        </CardTitle>
        <CardDescription>Theme, accent color, typography and motion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Palette className="h-4 w-4" /> Theme</Label>
          <RadioGroup
            value={prefs.theme}
            onValueChange={(v) => update("theme", v as Theme)}
            className="grid grid-cols-2 md:grid-cols-4 gap-2"
          >
            {[
              { v: "light", label: "Light", icon: Sun },
              { v: "dark", label: "Dark", icon: Moon },
              { v: "system", label: "System", icon: Monitor },
              { v: "high-contrast", label: "High Contrast", icon: Contrast },
            ].map(({ v, label, icon: Icon }) => (
              <label
                key={v}
                htmlFor={`theme-${v}`}
                className="cursor-pointer rounded-xl border border-white/10 bg-background/30 backdrop-blur p-3 flex items-center gap-2 hover:bg-background/50 has-[:checked]:border-primary has-[:checked]:bg-primary/10"
              >
                <RadioGroupItem id={`theme-${v}`} value={v} className="sr-only" />
                <Icon className="h-4 w-4" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Palette className="h-4 w-4" /> Accent color</Label>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                onClick={() => update("accent", a.hex)}
                className={`rounded-xl border px-3 py-2 flex items-center gap-2 backdrop-blur transition ${
                  prefs.accent === a.hex
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-background/30 hover:bg-background/50"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ background: a.hex }}
                />
                <span className="text-sm">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Type className="h-4 w-4" /> Font size ({prefs.fontSize}px)
          </Label>
          <Slider
            min={14}
            max={20}
            step={1}
            value={[prefs.fontSize]}
            onValueChange={([v]) => update("fontSize", v)}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-background/30 backdrop-blur p-3">
          <div>
            <Label>Reduce motion</Label>
            <p className="text-xs text-muted-foreground">
              Disables non-essential animations across the app.
            </p>
          </div>
          <Switch
            checked={prefs.reduceMotion}
            onCheckedChange={(v) => update("reduceMotion", v)}
          />
        </div>

        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => {
            const defaults = { theme: "system" as Theme, accent: "#2563EB", fontSize: 16, reduceMotion: false };
            setPrefs(defaults);
            toast({ title: "Appearance reset" });
          }}
        >
          Reset to defaults
        </Button>
      </CardContent>
    </Card>
  );
}

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Mic, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { applyAccent } from "@/utils/appearance";
import { setManualDataSaver } from "@/utils/network-adaptive";
import { clearAppCache } from "@/utils/version-api";
import { setTheme as persistTheme } from "@/lib/theme";

type Intent =
  | { kind: "theme"; value: "light" | "dark" | "system" }
  | { kind: "accent"; hex: string }
  | { kind: "data-saver"; on: boolean }
  | { kind: "clear-cache" }
  | { kind: "schedule-update"; hour: number; minute: number }
  | { kind: "unknown" };

const ACCENT_MAP: Record<string, string> = {
  blue: "#2563EB",
  emerald: "#10B981",
  green: "#10B981",
  purple: "#8B5CF6",
  violet: "#8B5CF6",
  amber: "#F59E0B",
  orange: "#F59E0B",
};

function parse(text: string): Intent {
  const t = text.toLowerCase();
  if (/\b(dark|night)\s*mode\b/.test(t)) return { kind: "theme", value: "dark" };
  if (/\blight\s*mode\b/.test(t)) return { kind: "theme", value: "light" };
  if (/\bsystem\s*(theme|mode)\b/.test(t)) return { kind: "theme", value: "system" };
  for (const [k, hex] of Object.entries(ACCENT_MAP))
    if (new RegExp(`\\b${k}\\b`).test(t) && /accent|color|colour/.test(t))
      return { kind: "accent", hex };
  if (/data\s*saver|low\s*data/.test(t))
    return { kind: "data-saver", on: !/off|disable/.test(t) };
  if (/clear\s*(cache|storage)/.test(t)) return { kind: "clear-cache" };
  const time = t.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/);
  if (time && /update|schedul/.test(t)) {
    let h = parseInt(time[1], 10);
    const m = parseInt(time[2] ?? "0", 10);
    if (time[3] === "pm" && h < 12) h += 12;
    if (time[3] === "am" && h === 12) h = 0;
    return { kind: "schedule-update", hour: h, minute: m };
  }
  return { kind: "unknown" };
}

export function SettingsCopilot() {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  const applyTheme = (v: "light" | "dark" | "system") => {
    persistTheme(v);
    try {
      const prev = JSON.parse(localStorage.getItem("fitfusion_appearance") || "{}");
      localStorage.setItem("fitfusion_appearance", JSON.stringify({ ...prev, theme: v }));
    } catch { /* ignore */ }
  };

  const run = async () => {
    if (!q.trim()) return;
    setBusy(true);
    try {
      const intent = parse(q);
      switch (intent.kind) {
        case "theme":
          applyTheme(intent.value);
          toast({ title: `Theme set to ${intent.value}` });
          break;
        case "accent":
          applyAccent(intent.hex);
          toast({ title: `Accent updated` });
          break;
        case "data-saver":
          setManualDataSaver(intent.on);
          toast({ title: `Data saver ${intent.on ? "enabled" : "disabled"}` });
          break;
        case "clear-cache":
          await clearAppCache();
          toast({ title: "Cache cleared" });
          break;
        case "schedule-update":
          localStorage.setItem(
            "fitfusion_update_schedule",
            JSON.stringify({ hour: intent.hour, minute: intent.minute })
          );
          toast({
            title: `Update scheduled`,
            description: `Daily at ${String(intent.hour).padStart(2, "0")}:${String(intent.minute).padStart(2, "0")}.`,
          });
          break;
        default:
          toast({
            title: "Command not recognized",
            description: "Try: “enable dark mode”, “set accent to purple”, or “clear cache”.",
            variant: "destructive",
          });
      }
      setQ("");
    } finally { setBusy(false); }
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast({ title: "Voice not supported" }); return; }
    const rec = new SR();
    rec.lang = "en-US";
    rec.onresult = (e: any) => setQ(e.results[0][0].transcript);
    rec.start();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-background/40 backdrop-blur-2xl p-3">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder='Try: "enable dark mode and set accent to purple"'
          className="border-white/10 bg-background/30"
        />
        <Button variant="ghost" size="icon" onClick={startVoice} aria-label="Voice">
          <Mic className="h-4 w-4" />
        </Button>
        <Button onClick={run} disabled={busy} className="rounded-xl">
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Settings Copilot · natural-language commands run locally, no data leaves your device.
      </p>
    </div>
  );
}

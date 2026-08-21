import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Play, Pause, RotateCcw, Repeat, Gauge, Timer, Video, Volume2, VolumeX,
  SkipBack, SkipForward, ListVideo, Bookmark, Flame, Maximize2,
} from "lucide-react";
import { workoutVideos } from "@/data/workout-videos";

type LibVideo = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  category?: string;
  level?: string;
  description?: string;
};

const STORE = "fitfusion-video-lab";

type LabPrefs = {
  speed: number;
  loop: boolean;
  muted: boolean;
  mirror: boolean;
  autoAdvance: boolean;
  intervalWork: number;
  intervalRest: number;
  saved: string[];
};

const DEFAULTS: LabPrefs = {
  speed: 1,
  loop: true,
  muted: true,
  mirror: false,
  autoAdvance: true,
  intervalWork: 40,
  intervalRest: 20,
  saved: [],
};

function loadPrefs(): LabPrefs {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? { ...DEFAULTS, ...parsed } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export const WorkoutVideoLab: React.FC = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [prefs, setPrefs] = useState<LabPrefs>(loadPrefs);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [query, setQuery] = useState("");
  const [pct, setPct] = useState(0);

  // interval trainer
  const [intervalOn, setIntervalOn] = useState(false);
  const [phase, setPhase] = useState<"work" | "rest">("work");
  const [remaining, setRemaining] = useState(DEFAULTS.intervalWork);
  const [rounds, setRounds] = useState(0);

  const library = useMemo<LibVideo[]>(
    () => (workoutVideos as unknown as LibVideo[]).filter(Boolean),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return library;
    return library.filter(
      (v) =>
        v.title?.toLowerCase().includes(q) ||
        v.category?.toLowerCase().includes(q) ||
        v.level?.toLowerCase().includes(q),
    );
  }, [library, query]);

  const current = filtered[Math.min(index, Math.max(filtered.length - 1, 0))];

  const persist = useCallback((patch: Partial<LabPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORE, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // apply prefs to element
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.playbackRate = prefs.speed;
    el.loop = prefs.loop;
    el.muted = prefs.muted;
  }, [prefs.speed, prefs.loop, prefs.muted, current?.id]);

  // interval timer
  useEffect(() => {
    if (!intervalOn) return;
    const t = window.setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        setPhase((p) => {
          const nextPhase = p === "work" ? "rest" : "work";
          if (nextPhase === "work") setRounds((n) => n + 1);
          setRemaining(nextPhase === "work" ? prefs.intervalWork : prefs.intervalRest);
          try {
            navigator.vibrate?.(nextPhase === "work" ? [60, 40, 60] : 40);
          } catch {
            /* ignore */
          }
          return nextPhase;
        });
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [intervalOn, prefs.intervalWork, prefs.intervalRest]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => {
        toast({ title: "Playback blocked", description: "Tap the video to start." });
      });
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const step = (dir: 1 | -1) => {
    if (!filtered.length) return;
    setIndex((i) => (i + dir + filtered.length) % filtered.length);
    setPct(0);
  };

  const seek = (sec: number) => {
    const el = videoRef.current;
    if (el) el.currentTime = Math.max(0, el.currentTime + sec);
  };

  const toggleSaved = (id: string) => {
    const saved = prefs.saved.includes(id) ? prefs.saved.filter((s) => s !== id) : [...prefs.saved, id];
    persist({ saved });
    toast({ title: prefs.saved.includes(id) ? "Removed from video list" : "Saved to video list" });
  };

  const goFullscreen = () => {
    const el = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => undefined);
    else el.webkitEnterFullscreen?.();
  };

  if (!current) return null;

  return (
    <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="h-4 w-4 text-primary" />
          Video Training Lab
          <Badge variant="outline" className="ml-auto text-[10px]">{filtered.length} clips</Badge>
        </CardTitle>
        <CardDescription>Form player with speed control, mirror mode, loop and an interval trainer.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative overflow-hidden rounded-xl border border-border/40 bg-black/80">
          <video
            ref={videoRef}
            key={current.id}
            src={current.videoUrl}
            poster={current.thumbnailUrl}
            playsInline
            className={`aspect-video w-full object-cover ${prefs.mirror ? "scale-x-[-1]" : ""}`}
            onClick={togglePlay}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              if (el.duration) setPct((el.currentTime / el.duration) * 100);
            }}
            onEnded={() => {
              if (prefs.autoAdvance && !prefs.loop) step(1);
            }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-white/80">
              <span className="truncate pr-2">{current.title}</span>
              <span>{current.duration ?? ""}</span>
            </div>
            <Progress value={pct} className="h-1" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => step(-1)} aria-label="Previous video">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => seek(-10)} aria-label="Back 10 seconds">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={togglePlay} className="gap-2">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "Pause" : "Play"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => seek(10)} aria-label="Forward 10 seconds">
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => persist({ muted: !prefs.muted })} aria-label="Toggle mute">
            {prefs.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={goFullscreen} aria-label="Fullscreen">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={prefs.saved.includes(current.id) ? "default" : "outline"}
            onClick={() => toggleSaved(current.id)}
            className="gap-1"
          >
            <Bookmark className="h-4 w-4" />
            {prefs.saved.length}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm"><Gauge className="h-4 w-4" /> Playback speed</Label>
              <span className="text-xs font-medium">{prefs.speed.toFixed(2)}x</span>
            </div>
            <Slider
              value={[prefs.speed]}
              min={0.25}
              max={2}
              step={0.25}
              onValueChange={([v]) => persist({ speed: v })}
            />
          </div>

          <div className="space-y-2 rounded-xl border border-border/40 p-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm"><Repeat className="h-4 w-4" /> Loop clip</Label>
              <Switch checked={prefs.loop} onCheckedChange={(v) => persist({ loop: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Mirror mode</Label>
              <Switch checked={prefs.mirror} onCheckedChange={(v) => persist({ mirror: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Auto-advance</Label>
              <Switch checked={prefs.autoAdvance} onCheckedChange={(v) => persist({ autoAdvance: v })} />
            </div>
          </div>
        </div>

        {/* Interval trainer */}
        <div className="rounded-xl border border-border/40 p-3">
          <div className="mb-3 flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm"><Timer className="h-4 w-4" /> Interval trainer</Label>
            <Badge variant={phase === "work" ? "default" : "secondary"}>
              {intervalOn ? `${phase.toUpperCase()} · ${remaining}s` : "Idle"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Work (s)</Label>
              <Input
                type="number"
                min={5}
                max={300}
                value={prefs.intervalWork}
                onChange={(e) => persist({ intervalWork: Math.max(5, Number(e.target.value) || 5) })}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Rest (s)</Label>
              <Input
                type="number"
                min={5}
                max={300}
                value={prefs.intervalRest}
                onChange={(e) => persist({ intervalRest: Math.max(5, Number(e.target.value) || 5) })}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                if (intervalOn) {
                  setIntervalOn(false);
                } else {
                  setPhase("work");
                  setRemaining(prefs.intervalWork);
                  setIntervalOn(true);
                }
              }}
            >
              {intervalOn ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {intervalOn ? "Stop" : "Start intervals"}
            </Button>
            <Badge variant="outline" className="gap-1">
              <Flame className="h-3 w-3" /> {rounds} rounds
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setRounds(0);
                setPhase("work");
                setRemaining(prefs.intervalWork);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Playlist */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ListVideo className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search video library..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIndex(0);
              }}
              className="h-9"
            />
          </div>
          <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
            {filtered.map((v, i) => (
              <motion.button
                key={v.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIndex(i);
                  setPct(0);
                }}
                className={`overflow-hidden rounded-lg border text-left transition-colors ${
                  v.id === current.id ? "border-primary bg-primary/10" : "border-border/40 bg-card/50"
                }`}
              >
                {v.thumbnailUrl && (
                  <img src={v.thumbnailUrl} alt={v.title} loading="lazy" className="aspect-video w-full object-cover" />
                )}
                <div className="p-2">
                  <p className="line-clamp-1 text-xs font-medium">{v.title}</p>
                  <p className="text-[10px] text-muted-foreground">{v.level ?? v.category}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutVideoLab;

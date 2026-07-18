import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, IdCard, Sparkles, Flame, Dumbbell, Trophy, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface FitnessIDCardProps {
  name: string;
  email?: string;
  avatarUrl?: string | null;
  memberSince?: string;
  level?: number;
  workouts?: number;
  streak?: number;
  calories?: number;
  fitnessScore?: number;
  goal?: string;
  memberId?: string;
}

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string));

const toDataURL = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const FitnessIDCard: React.FC<FitnessIDCardProps> = ({
  name,
  email,
  avatarUrl,
  memberSince,
  level = 1,
  workouts = 0,
  streak = 0,
  calories = 0,
  fitnessScore = 0,
  goal = "Stay Fit",
  memberId,
}) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const safeName = truncate(name || "Athlete", 20);
  const safeEmail = truncate(email || "FitFusion Member", 34);
  const safeGoal = truncate(goal, 18);
  const id = memberId || `FX-${(name || "USER").replace(/\s+/g, "").slice(0, 3).toUpperCase()}-${String(workouts).padStart(4, "0")}`;
  const since = memberSince || new Date().getFullYear().toString();

  const buildSVG = async (): Promise<string> => {
    const avatarData = avatarUrl ? await toDataURL(avatarUrl) : null;
    const W = 1080, H = 640;
    const avatar = avatarData
      ? `<clipPath id="clip"><circle cx="140" cy="230" r="80"/></clipPath>
         <image href="${avatarData}" x="60" y="150" width="160" height="160" clip-path="url(#clip)" preserveAspectRatio="xMidYMid slice"/>`
      : `<circle cx="140" cy="230" r="80" fill="url(#g2)"/>
         <text x="140" y="250" text-anchor="middle" font-family="Inter,Arial" font-size="56" font-weight="800" fill="#fff">${escapeXml(initials)}</text>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0b1220"/>
          <stop offset="50%" stop-color="#111a2e"/>
          <stop offset="100%" stop-color="#1a2647"/>
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2563EB"/>
          <stop offset="100%" stop-color="#FB923C"/>
        </linearGradient>
        <linearGradient id="g3" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#10B981"/>
          <stop offset="100%" stop-color="#2563EB"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" rx="36" fill="url(#g1)"/>
      <circle cx="900" cy="80" r="220" fill="#2563EB" opacity="0.18"/>
      <circle cx="1000" cy="600" r="260" fill="#FB923C" opacity="0.12"/>
      <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="30" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1.5"/>

      <g font-family="Inter,Arial" fill="#fff">
        <text x="60" y="80" font-size="22" font-weight="700" letter-spacing="4" fill="#93c5fd">FITXFUSION</text>
        <text x="60" y="115" font-size="16" fill="rgba(255,255,255,0.6)" letter-spacing="2">OFFICIAL FITNESS ID</text>

        ${avatar}
        <circle cx="140" cy="230" r="86" fill="none" stroke="url(#g2)" stroke-width="4"/>

        <text x="260" y="200" font-size="42" font-weight="800">${escapeXml(safeName)}</text>
        <text x="260" y="235" font-size="18" fill="rgba(255,255,255,0.65)">${escapeXml(safeEmail)}</text>

        <rect x="260" y="255" width="260" height="34" rx="17" fill="rgba(37,99,235,0.25)" stroke="rgba(147,197,253,0.4)"/>
        <text x="390" y="278" text-anchor="middle" font-size="15" font-weight="700" fill="#dbeafe">⚡ LEVEL ${level} • ${escapeXml(safeGoal)}</text>

        <g transform="translate(60,360)">
          <rect x="0" y="0" width="960" height="140" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)"/>
          ${[
            { label: "WORKOUTS", value: String(workouts), color: "#93c5fd" },
            { label: "STREAK", value: `${streak}d`, color: "#fbbf24" },
            { label: "CALORIES", value: `${Math.round(calories / 1000)}k`, color: "#f97316" },
            { label: "SCORE", value: String(fitnessScore), color: "#34d399" },
          ]
            .map(
              (s, i) => `
            <g transform="translate(${i * 240 + 20},0)">
              <text x="110" y="55" text-anchor="middle" font-size="44" font-weight="800" fill="${s.color}">${s.value}</text>
              <text x="110" y="95" text-anchor="middle" font-size="14" letter-spacing="3" fill="rgba(255,255,255,0.55)">${s.label}</text>
            </g>`
            )
            .join("")}
        </g>

        <text x="60" y="560" font-size="13" letter-spacing="3" fill="rgba(255,255,255,0.5)">MEMBER ID</text>
        <text x="60" y="590" font-size="22" font-weight="700" fill="#fff" font-family="monospace">${escapeXml(id)}</text>

        <text x="${W - 60}" y="560" text-anchor="end" font-size="13" letter-spacing="3" fill="rgba(255,255,255,0.5)">MEMBER SINCE</text>
        <text x="${W - 60}" y="590" text-anchor="end" font-size="22" font-weight="700" fill="#fff">${escapeXml(since)}</text>

        <rect x="${W - 220}" y="60" width="160" height="44" rx="22" fill="url(#g3)"/>
        <text x="${W - 140}" y="88" text-anchor="middle" font-size="16" font-weight="800" fill="#0b1220">VERIFIED ✓</text>
      </g>
    </svg>`;
  };

  const renderPNG = async (scale = 2): Promise<Blob | null> => {
    const svg = await buildSVG();
    const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("svg load failed"));
      img.src = dataUrl;
    });
    const W = 1080 * scale;
    const H = 640 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    // @ts-ignore
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, W, H);
    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png", 1.0)
    );
  };

  const buildFilename = () => {
    const slug =
      (name || "user")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "user";
    const date = new Date().toISOString().slice(0, 10);
    return `fitxfusion-id-${slug}-${date}.png`;
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const blob = await renderPNG(2);
      if (!blob) throw new Error("render failed");
      triggerDownload(blob, buildFilename());
      toast({ title: "Downloaded HD", description: "Fitness ID (2160×1280) saved to your device." });
    } catch {
      toast({ title: "Download failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await renderPNG(2);
      if (!blob) throw new Error("render failed");
      const filename = buildFilename();
      const file = new File([blob], filename, { type: "image/png" });
      const text = `${name} • Level ${level} • ${workouts} workouts • ${streak}-day streak 🔥 — FitXFusion`;

      // @ts-ignore
      const canShareFiles = typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] });
      if (canShareFiles) {
        try {
          await navigator.share({ title: "My FitXFusion ID", text, files: [file] });
          return;
        } catch (err: any) {
          if (err?.name === "AbortError") return;
        }
      }

      if (typeof navigator !== "undefined" && (navigator as any).share) {
        try {
          await (navigator as any).share({ title: "My FitXFusion ID", text, url: window.location.origin });
          triggerDownload(blob, filename);
          toast({ title: "Image downloaded", description: "Attach it to your share if needed." });
          return;
        } catch (err: any) {
          if (err?.name === "AbortError") return;
        }
      }

      try {
        await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      } catch {}
      triggerDownload(blob, filename);
      toast({ title: "Ready to share", description: "Image downloaded and caption copied." });
    } catch {
      toast({ title: "Share failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-card/60 backdrop-blur-xl overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/15">
              <IdCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Fitness ID Card</h3>
              <p className="text-[10px] text-muted-foreground">Share your athlete identity</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Sparkles className="h-3 w-3" />Official
          </Badge>
        </div>

        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[1080/640]"
          style={{
            background:
              "linear-gradient(135deg, #0b1220 0%, #111a2e 50%, #1a2647 100%)",
          }}
        >
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-orange-500/20 blur-3xl" />

          <div className="relative h-full p-4 sm:p-5 flex flex-col text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-blue-300">FITXFUSION</div>
                <div className="text-[9px] sm:text-[10px] tracking-[0.25em] text-white/60 mt-0.5">OFFICIAL FITNESS ID</div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 text-[9px] sm:text-[10px] font-bold text-slate-900">
                VERIFIED ✓
              </div>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-orange-400 p-[2px]">
                  <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg sm:text-xl font-black">{initials}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-lg font-extrabold truncate">{name || "Athlete"}</div>
                <div className="text-[10px] sm:text-xs text-white/60 truncate">{email || "FitFusion Member"}</div>
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/25 border border-blue-300/30 text-[9px] sm:text-[10px] font-bold text-blue-100">
                  <Zap className="h-2.5 w-2.5" />LVL {level} • {goal}
                </div>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-4 gap-1.5 rounded-xl bg-white/[0.06] border border-white/10 p-2">
              {[
                { icon: Dumbbell, label: "Workouts", value: workouts, color: "text-blue-300" },
                { icon: Flame, label: "Streak", value: `${streak}d`, color: "text-amber-300" },
                { icon: Sparkles, label: "Cal", value: `${Math.round(calories / 1000)}k`, color: "text-orange-300" },
                { icon: Trophy, label: "Score", value: fitnessScore, color: "text-emerald-300" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-sm sm:text-lg font-black ${s.color}`}>{s.value}</div>
                  <div className="text-[8px] sm:text-[9px] tracking-widest text-white/50">{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-end justify-between text-[9px] sm:text-[10px]">
              <div>
                <div className="tracking-[0.25em] text-white/40">MEMBER ID</div>
                <div className="font-mono font-bold text-white">{id}</div>
              </div>
              <div className="text-right">
                <div className="tracking-[0.25em] text-white/40">SINCE</div>
                <div className="font-bold text-white">{since}</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleDownload} disabled={busy} className="rounded-xl h-10">
            <Download className="h-4 w-4 mr-1.5" />Download
          </Button>
          <Button onClick={handleShare} disabled={busy} variant="outline" className="rounded-xl h-10">
            <Share2 className="h-4 w-4 mr-1.5" />Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FitnessIDCard;

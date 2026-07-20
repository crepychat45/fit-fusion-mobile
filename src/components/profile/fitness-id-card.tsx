import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download, Share2, IdCard, Sparkles, Flame, Dumbbell, Trophy, Zap,
  RotateCw, Copy, QrCode, ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  userId?: string | null;
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
  userId,
}) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [flipped, setFlipped] = useState(false);
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
  const id =
    memberId ||
    (userId
      ? `FX-${userId.replace(/-/g, "").slice(0, 8).toUpperCase()}`
      : `FX-${(name || "USER").replace(/\s+/g, "").slice(0, 3).toUpperCase()}-${String(workouts).padStart(4, "0")}`);
  const since = memberSince || new Date().getFullYear().toString();

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profile${userId ? `?u=${encodeURIComponent(userId)}` : ""}`
    : "";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(shareUrl)}`;

  const buildSVG = async (side: "front" | "back" = "front"): Promise<string> => {
    const W = 1080, H = 640;
    const defs = `
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
      </defs>`;

    if (side === "back") {
      const qrData = await toDataURL(qrSrc);
      const benefits = [
        "⚡ Level " + level + " Athlete",
        "🔥 " + streak + "-day streak",
        "💪 " + workouts + " workouts logged",
        "🏆 Score " + fitnessScore + "/100",
      ];
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        ${defs}
        <rect width="${W}" height="${H}" rx="36" fill="url(#g1)"/>
        <circle cx="900" cy="80" r="220" fill="#2563EB" opacity="0.18"/>
        <circle cx="1000" cy="600" r="260" fill="#FB923C" opacity="0.12"/>
        <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="30" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1.5"/>
        <g font-family="Inter,Arial" fill="#fff">
          <text x="60" y="80" font-size="22" font-weight="700" letter-spacing="4" fill="#93c5fd">FITXFUSION</text>
          <text x="60" y="115" font-size="16" fill="rgba(255,255,255,0.6)" letter-spacing="2">SCAN TO CONNECT</text>
          <rect x="60" y="150" width="260" height="260" rx="18" fill="#ffffff"/>
          ${qrData ? `<image href="${qrData}" x="80" y="170" width="220" height="220"/>` : ""}
          <text x="60" y="450" font-size="14" letter-spacing="2" fill="rgba(255,255,255,0.55)">SHARE PROFILE</text>
          <text x="60" y="480" font-size="20" font-weight="700" fill="#fff">${escapeXml(truncate(shareUrl, 42))}</text>
          <g transform="translate(400,150)">
            <text x="0" y="30" font-size="26" font-weight="800" fill="#fff">Athlete Profile</text>
            <text x="0" y="60" font-size="16" fill="rgba(255,255,255,0.6)">Verified FitXFusion Member</text>
            ${benefits.map((b, i) => `
              <g transform="translate(0,${100 + i * 46})">
                <rect x="0" y="-24" width="620" height="36" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)"/>
                <text x="16" y="0" font-size="18" fill="#e5e7eb">${escapeXml(b)}</text>
              </g>`).join("")}
          </g>
          <text x="60" y="595" font-size="13" letter-spacing="3" fill="rgba(255,255,255,0.4)">MEMBER ID • ${escapeXml(id)}</text>
          <text x="${W - 60}" y="595" text-anchor="end" font-size="13" letter-spacing="3" fill="rgba(255,255,255,0.4)">SINCE ${escapeXml(since)}</text>
        </g>
      </svg>`;
    }

    const avatarData = avatarUrl ? await toDataURL(avatarUrl) : null;
    const avatar = avatarData
      ? `<clipPath id="clip"><circle cx="140" cy="230" r="80"/></clipPath>
         <image href="${avatarData}" x="60" y="150" width="160" height="160" clip-path="url(#clip)" preserveAspectRatio="xMidYMid slice"/>`
      : `<circle cx="140" cy="230" r="80" fill="url(#g2)"/>
         <text x="140" y="250" text-anchor="middle" font-family="Inter,Arial" font-size="56" font-weight="800" fill="#fff">${escapeXml(initials)}</text>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${defs}
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

  const renderBlob = async (
    format: "png" | "jpeg" = "png",
    scale = 2,
    side: "front" | "back" = flipped ? "back" : "front",
  ): Promise<Blob | null> => {
    const svg = await buildSVG(side);
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
    if (format === "jpeg") {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);
    }
    ctx.imageSmoothingEnabled = true;
    // @ts-ignore
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, W, H);
    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    return await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), mime, 0.95));
  };

  const buildFilename = (ext: string, side: string) => {
    const slug =
      (name || "user")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "user";
    const date = new Date().toISOString().slice(0, 10);
    return `fitxfusion-id-${side}-${slug}-${date}.${ext}`;
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

  const handleDownload = async (format: "png" | "jpeg", side: "front" | "back" | "both") => {
    setBusy(true);
    try {
      if (side === "both") {
        for (const s of ["front", "back"] as const) {
          const blob = await renderBlob(format, 2, s);
          if (blob) triggerDownload(blob, buildFilename(format, s));
        }
        toast({ title: "Downloaded HD", description: `Both sides saved (${format.toUpperCase()}).` });
      } else {
        const blob = await renderBlob(format, 2, side);
        if (!blob) throw new Error("render failed");
        triggerDownload(blob, buildFilename(format, side));
        toast({ title: "Downloaded HD", description: `Fitness ID ${side} saved.` });
      }
    } catch {
      toast({ title: "Download failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await renderBlob("png", 2);
      if (!blob) throw new Error("render failed");
      const filename = buildFilename("png", flipped ? "back" : "front");
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
          await (navigator as any).share({ title: "My FitXFusion ID", text, url: shareUrl });
          triggerDownload(blob, filename);
          return;
        } catch (err: any) {
          if (err?.name === "AbortError") return;
        }
      }
      try { await navigator.clipboard.writeText(`${text} ${shareUrl}`); } catch {}
      triggerDownload(blob, filename);
      toast({ title: "Ready to share", description: "Image downloaded and caption copied." });
    } catch {
      toast({ title: "Share failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied", description: shareUrl });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
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
              <p className="text-[10px] text-muted-foreground">Tap card to flip · QR to share</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] gap-1">
              <Sparkles className="h-3 w-3" />Official
            </Badge>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setFlipped((f) => !f)} aria-label="Flip card">
              <RotateCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div
          className="relative aspect-[1080/640] cursor-pointer [perspective:1200px]"
          onClick={() => setFlipped((f) => !f)}
        >
          <motion.div
            ref={cardRef}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 [transform-style:preserve-3d]"
          >
            {/* FRONT */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 [backface-visibility:hidden]"
              style={{ background: "linear-gradient(135deg, #0b1220 0%, #111a2e 50%, #1a2647 100%)" }}
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
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/25 border border-blue-300/30 text-[9px] sm:text-[10px] font-bold text-blue-100 max-w-full">
                      <Zap className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">LVL {level} • {goal}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-4 gap-1 sm:gap-1.5 rounded-xl bg-white/[0.06] border border-white/10 p-1.5 sm:p-2">
                  {[
                    { icon: Dumbbell, label: "Workouts", value: String(workouts), color: "text-blue-300" },
                    { icon: Flame, label: "Streak", value: `${streak}d`, color: "text-amber-300" },
                    { icon: Sparkles, label: "Cal", value: `${Math.round(calories / 1000)}k`, color: "text-orange-300" },
                    { icon: Trophy, label: "Score", value: String(fitnessScore), color: "text-emerald-300" },
                  ].map((s) => (
                    <div key={s.label} className="text-center min-w-0 px-0.5">
                      <div className={`text-[13px] sm:text-lg font-black leading-none truncate ${s.color}`}>{s.value}</div>
                      <div className="text-[7px] sm:text-[9px] tracking-[0.15em] sm:tracking-widest text-white/50 mt-0.5 truncate">{s.label.toUpperCase()}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-end justify-between gap-2 text-[9px] sm:text-[10px]">
                  <div className="min-w-0">
                    <div className="tracking-[0.25em] text-white/40">MEMBER ID</div>
                    <div className="font-mono font-bold text-white truncate">{id}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="tracking-[0.25em] text-white/40">SINCE</div>
                    <div className="font-bold text-white">{since}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* BACK */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 [backface-visibility:hidden] [transform:rotateY(180deg)]"
              style={{ background: "linear-gradient(135deg, #0b1220 0%, #111a2e 50%, #1a2647 100%)" }}
            >
              <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-primary/25 blur-3xl" />
              <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-emerald-500/20 blur-3xl" />

              <div className="relative h-full p-4 sm:p-5 flex flex-col text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-blue-300">FITXFUSION</div>
                    <div className="text-[9px] sm:text-[10px] tracking-[0.25em] text-white/60 mt-0.5">SCAN TO CONNECT</div>
                  </div>
                  <QrCode className="h-4 w-4 text-white/60" />
                </div>

                <div className="flex-1 flex items-center gap-3 sm:gap-5 mt-3 min-h-0">
                  <div className="shrink-0 bg-white p-1.5 sm:p-2 rounded-xl">
                    <img
                      src={qrSrc}
                      alt="Share QR code"
                      loading="lazy"
                      className="h-24 w-24 sm:h-32 sm:w-32 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5">
                    <div className="text-sm sm:text-base font-extrabold truncate">Athlete Profile</div>
                    <div className="text-[10px] sm:text-xs text-white/60">Verified FitXFusion Member</div>
                    <div className="grid gap-1 text-[10px] sm:text-xs">
                      <div className="rounded-md bg-white/5 border border-white/10 px-2 py-1 truncate">⚡ Level {level} Athlete</div>
                      <div className="rounded-md bg-white/5 border border-white/10 px-2 py-1 truncate">🔥 {streak}-day streak</div>
                      <div className="rounded-md bg-white/5 border border-white/10 px-2 py-1 truncate">🏆 Score {fitnessScore}/100</div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-end justify-between gap-2 text-[9px] sm:text-[10px]">
                  <div className="min-w-0">
                    <div className="tracking-[0.25em] text-white/40">MEMBER ID</div>
                    <div className="font-mono font-bold text-white truncate">{id}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="tracking-[0.25em] text-white/40">SINCE</div>
                    <div className="font-bold text-white">{since}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={busy} className="rounded-xl h-10">
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Download</span>
                <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem onClick={() => handleDownload("png", "front")}>Front · PNG (HD)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("png", "back")}>Back · PNG (HD)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("jpeg", "front")}>Front · JPEG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("png", "both")}>Both sides · PNG</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleShare} disabled={busy} variant="outline" className="rounded-xl h-10">
            <Share2 className="h-4 w-4 mr-1" />Share
          </Button>
          <Button onClick={handleCopyLink} variant="outline" className="rounded-xl h-10">
            <Copy className="h-4 w-4 mr-1" />Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FitnessIDCard;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { EnhancedAuthForm } from "./enhanced-auth-form";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { EnhancedErrorBoundary } from "@/components/enhanced-error-handling";
import {
  Activity,
  Shield,
  Zap,
  Heart,
  TrendingUp,
  Sparkles,
  Fingerprint,
  Lock,
  Globe2,
  Star,
} from "lucide-react";

// Guard against open-redirect via ?next=https://evil.example
function safeNext(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

const TESTIMONIALS = [
  { name: "Ava R.", role: "Marathoner", quote: "The adaptive coach reads my recovery better than I do." },
  { name: "Kenji T.", role: "Powerlifter", quote: "Every plan feels handcrafted. My PRs jumped in 6 weeks." },
  { name: "Priya S.", role: "Yoga Teacher", quote: "Beautiful, calm, and it just… works. Zero friction." },
  { name: "Marco L.", role: "Cyclist", quote: "The HUD makes training feel like a video game — in the best way." },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, loading } = useEnhancedAuth();

  // Cursor-tracking orb
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const orbX = useTransform(smx, (v) => `${v * 100}%`);
  const orbY = useTransform(smy, (v) => `${v * 100}%`);

  const containerRef = useRef<HTMLDivElement>(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Detect low-power conditions once — respect reduced-motion, small screens, and coarse pointers
  const [lite, setLite] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 768px)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lowMem = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4;
    const lowCPU = (navigator as any).hardwareConcurrency && (navigator as any).hardwareConcurrency <= 4;
    setLite(reduce || (small && coarse) || lowMem || lowCPU);
  }, []);

  useEffect(() => {
    if (user && !loading) navigate(next ?? "/");
  }, [user, loading, navigate, next]);

  useEffect(() => {
    const id = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 5200);
    return () => clearInterval(id);
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (lite) return;
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const handleAuthSuccess = () => navigate(next ?? "/");

  const particles = useMemo(
    () =>
      Array.from({ length: lite ? 0 : 18 }).map((_, i) => ({
        id: i,
        size: 2 + (i % 5),
        left: (i * 53) % 100,
        top: (i * 37) % 100,
        delay: i * 0.35,
        duration: 6 + (i % 6),
      })),
    [lite]
  );


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 rounded-full border-[3px] border-primary border-t-transparent"
        />
      </div>
    );
  }

  if (user) return null;

  return (
    <EnhancedErrorBoundary>
      <div
        ref={containerRef}
        onMouseMove={handleMove}
        className="min-h-screen relative overflow-hidden bg-background"
      >
        {/* ── Liquid Aurora Backdrop ─────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.20),transparent_55%),radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.18),transparent_55%),radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.14),transparent_55%)]" />

          {/* Cursor-follow orb */}
          <motion.div
            aria-hidden
            className="absolute w-[520px] h-[520px] rounded-full blur-[110px] opacity-60 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: orbX,
              top: orbY,
              background:
                "radial-gradient(circle, hsl(var(--primary)/0.55), hsl(var(--accent)/0.35) 40%, transparent 70%)",
            }}
          />

          {/* Aurora ribbons — skipped on low-end devices */}
          {!lite && (
            <>
              <motion.div
                aria-hidden
                animate={{ x: [0, 60, -30, 0], y: [0, -40, 20, 0], rotate: [0, 8, -6, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-40 -left-20 w-[560px] h-[420px] rounded-[50%] blur-[90px] opacity-70 will-change-transform"
                style={{
                  background:
                    "conic-gradient(from 90deg at 50% 50%, hsl(var(--primary)/0.45), hsl(var(--accent)/0.35), hsl(var(--primary)/0.45))",
                }}
              />
              <motion.div
                aria-hidden
                animate={{ x: [0, -50, 30, 0], y: [0, 30, -20, 0], rotate: [0, -10, 6, 0] }}
                transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-40 -right-24 w-[600px] h-[440px] rounded-[50%] blur-[100px] opacity-60 will-change-transform"
                style={{
                  background:
                    "conic-gradient(from 210deg at 50% 50%, hsl(var(--accent)/0.4), hsl(var(--primary)/0.35), hsl(var(--accent)/0.4))",
                }}
              />
            </>
          )}


          {/* Floating particles */}
          {particles.map((p) => (
            <motion.span
              key={p.id}
              aria-hidden
              className="absolute rounded-full bg-primary/50"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                top: `${p.top}%`,
                filter: "blur(0.5px)",
              }}
              animate={{ y: [0, -34, 0], opacity: [0.2, 0.95, 0.2] }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            }}
          />

          {/* Noise vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,hsl(var(--background))_100%)]" />
        </div>

        {/* ── Mobile Brand Header ───────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden pt-8 pb-2 text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.35)]">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 180, delay: 0.15 }}
              className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg"
            >
              <Activity className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              FitFusion
            </span>
            <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-medium text-primary/90 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-2.5 w-2.5" /> v7
            </span>
          </div>
        </motion.header>

        {/* ── Main ──────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
            {/* Desktop branding */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="hidden md:flex flex-col space-y-7"
            >
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.25, stiffness: 160 }}
                    className="relative p-4 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent shadow-2xl"
                  >
                    <Activity className="h-10 w-10 text-primary-foreground" />
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-primary/40"
                      animate={{ scale: [1, 1.28, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                    />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                      FitFusion
                    </h1>
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mt-1">
                      <Sparkles className="h-3 w-3" />
                      AI-Powered Fitness · Liquid Glass v7
                    </div>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  Sign in to your adaptive coach. Every workout, every recovery — tuned to you in real time.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, title: "Zero-Knowledge", desc: "End-to-end encrypted" },
                  { icon: Zap, title: "Adaptive AI", desc: "Plans that evolve" },
                  { icon: Heart, title: "Whole Wellness", desc: "HR · Sleep · Mood" },
                  { icon: TrendingUp, title: "Live Insights", desc: "PRs & momentum" },
                ].map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.08 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    className="group relative p-4 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/10 to-accent/10" />
                    <f.icon className="h-6 w-6 text-primary mb-2 relative" />
                    <h3 className="font-semibold text-foreground relative">{f.title}</h3>
                    <p className="text-xs text-muted-foreground relative">{f.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Rotating testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="relative p-5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 overflow-hidden min-h-[112px]"
              >
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonialIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="text-sm text-foreground/90 italic leading-relaxed">
                      "{TESTIMONIALS[testimonialIdx].quote}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      — {TESTIMONIALS[testimonialIdx].name} · {TESTIMONIALS[testimonialIdx].role}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10"
              >
                {[
                  { v: "50K+", l: "Active users" },
                  { v: "500+", l: "Workouts" },
                  { v: "4.9★", l: "Rated" },
                ].map((s, i) => (
                  <React.Fragment key={s.l}>
                    {i > 0 && <div className="w-px h-8 bg-border/40" />}
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                        {s.v}
                      </div>
                      <div className="text-xs text-muted-foreground">{s.l}</div>
                    </div>
                  </React.Fragment>
                ))}
              </motion.div>
            </motion.div>

            {/* Auth Form — Liquid Glass Capsule */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full relative"
            >
              {/* Rotating aurora ring */}
              <motion.div
                aria-hidden
                className="absolute -inset-4 rounded-[2rem] opacity-70 blur-2xl pointer-events-none"
                style={{
                  background:
                    "conic-gradient(from 0deg, hsl(var(--primary)/0.55), hsl(var(--accent)/0.45), transparent 40%, hsl(var(--primary)/0.55))",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              />
              {/* Counter-rotating inner ring */}
              <motion.div
                aria-hidden
                className="absolute -inset-1 rounded-[1.9rem] opacity-40 blur-md pointer-events-none"
                style={{
                  background:
                    "conic-gradient(from 180deg, hsl(var(--accent)/0.5), transparent 30%, hsl(var(--primary)/0.4), transparent 70%, hsl(var(--accent)/0.5))",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />
              {/* Glow ring */}
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/40 via-accent/30 to-primary/40 opacity-60 blur-md" />

              <div className="relative rounded-3xl bg-background/60 backdrop-blur-2xl border border-white/15 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.5)] p-1 overflow-hidden">
                {/* Shine sweep */}
                <motion.div
                  aria-hidden
                  className="absolute inset-y-0 -left-1/3 w-1/3 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, hsl(var(--foreground)/0.10), transparent)",
                  }}
                  animate={{ x: ["0%", "500%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                />

                {/* Top status bar */}
                <div className="relative flex items-center justify-between px-5 pt-4 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_hsl(var(--primary))]" />
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                      Secure Channel
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Lock className="h-3 w-3 text-primary" /> TLS 1.3
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Globe2 className="h-3 w-3 text-accent" /> Global
                    </span>
                  </div>
                </div>

                <div className="relative rounded-[calc(1.5rem-4px)] bg-background/40 backdrop-blur-xl">
                  <EnhancedAuthForm onSuccess={handleAuthSuccess} />
                </div>

                {/* Bottom trust bar */}
                <div className="relative flex items-center justify-center gap-4 px-5 py-3 border-t border-white/5 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Fingerprint className="h-3.5 w-3.5 text-primary" /> Biometric ready
                  </span>
                  <span className="h-3 w-px bg-border/40" />
                  <span className="inline-flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-accent" /> SOC 2 aligned
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-4 text-center text-xs text-muted-foreground relative z-10"
        >
          <p>© 2026 FitFusion. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/terms-of-service" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="/help" className="hover:text-foreground transition-colors">
              Help
            </a>
          </div>
        </motion.footer>
      </div>
    </EnhancedErrorBoundary>
  );
}

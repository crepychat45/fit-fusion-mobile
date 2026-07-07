import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { EnhancedAuthForm } from "./enhanced-auth-form";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { EnhancedErrorBoundary } from "@/components/enhanced-error-handling";
import { Activity, Shield, Zap, Heart, TrendingUp, Sparkles } from "lucide-react";

// Guard against open-redirect via ?next=https://evil.example
function safeNext(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, loading } = useEnhancedAuth();

  useEffect(() => {
    if (user && !loading) navigate(next ?? "/");
  }, [user, loading, navigate, next]);

  const handleAuthSuccess = () => navigate(next ?? "/");

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
      <div className="min-h-screen relative overflow-hidden bg-background">
        {/* ── Liquid Glass Aurora Backdrop ──────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Deep gradient wash */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.15),transparent_55%),radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.12),transparent_55%)]" />

          {/* Aurora ribbons */}
          <motion.div
            aria-hidden
            animate={{ x: [0, 60, -30, 0], y: [0, -40, 20, 0], rotate: [0, 8, -6, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-20 w-[560px] h-[420px] rounded-[50%] blur-[90px] opacity-70"
            style={{ background: "conic-gradient(from 90deg at 50% 50%, hsl(var(--primary)/0.45), hsl(var(--accent)/0.35), hsl(var(--primary)/0.45))" }}
          />
          <motion.div
            aria-hidden
            animate={{ x: [0, -50, 30, 0], y: [0, 30, -20, 0], rotate: [0, -10, 6, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 -right-24 w-[600px] h-[440px] rounded-[50%] blur-[100px] opacity-60"
            style={{ background: "conic-gradient(from 210deg at 50% 50%, hsl(var(--accent)/0.4), hsl(var(--primary)/0.35), hsl(var(--accent)/0.4))" }}
          />

          {/* Floating particles */}
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute rounded-full bg-primary/40"
              style={{
                width: 3 + (i % 4),
                height: 3 + (i % 4),
                left: `${(i * 73) % 100}%`,
                top: `${(i * 41) % 100}%`,
                filter: "blur(0.5px)",
              }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.9, 0.2] }}
              transition={{
                duration: 6 + (i % 5),
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
        </div>

        {/* ── Mobile Brand Header ───────────────────────────────────── */}
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
          </div>
        </motion.header>

        {/* ── Main ──────────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
            {/* Desktop branding */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="hidden md:flex flex-col space-y-8"
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
                      animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                    />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                      FitFusion
                    </h1>
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mt-1">
                      <Sparkles className="h-3 w-3" />
                      AI-Powered Fitness
                    </div>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  Transform your journey with adaptive workouts, smart tracking, and a coach that learns you.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, title: "Secure", desc: "256-bit encrypted" },
                  { icon: Zap, title: "Smart AI", desc: "Adaptive plans" },
                  { icon: Heart, title: "Wellness", desc: "Full tracking" },
                  { icon: TrendingUp, title: "Progress", desc: "Live insights" },
                ].map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.08 }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="group relative p-4 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/10 to-accent/10" />
                    <f.icon className="h-6 w-6 text-primary mb-2 relative" />
                    <h3 className="font-semibold text-foreground relative">{f.title}</h3>
                    <p className="text-xs text-muted-foreground relative">{f.desc}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
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

            {/* Auth Form — liquid glass container */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full relative"
            >
              {/* Rotating aurora ring (new in v7.0) */}
              <motion.div
                aria-hidden
                className="absolute -inset-4 rounded-[2rem] opacity-70 blur-2xl pointer-events-none"
                style={{
                  background:
                    "conic-gradient(from 0deg, hsl(var(--primary)/0.5), hsl(var(--accent)/0.4), transparent 40%, hsl(var(--primary)/0.5))",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
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
                      "linear-gradient(90deg, transparent, hsl(var(--foreground)/0.08), transparent)",
                  }}
                  animate={{ x: ["0%", "500%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                />
                <div className="relative rounded-[calc(1.5rem-4px)] bg-background/40 backdrop-blur-xl">
                  <EnhancedAuthForm onSuccess={handleAuthSuccess} />
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
            <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/terms-of-service" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/help" className="hover:text-foreground transition-colors">Help</a>
          </div>
        </motion.footer>
      </div>
    </EnhancedErrorBoundary>
  );
}

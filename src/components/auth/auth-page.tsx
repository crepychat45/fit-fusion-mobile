import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { EnhancedAuthForm } from "./enhanced-auth-form";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { EnhancedErrorBoundary } from "@/components/enhanced-error-handling";
import { Activity, Shield, Zap, Heart, Dumbbell, TrendingUp } from "lucide-react";

// Validate that `next` is a same-origin relative path we can safely redirect
// to. Prevents open-redirect via `?next=https://evil.example`.
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
    if (user && !loading) {
      navigate(next ?? "/");
    }
  }, [user, loading, navigate, next]);

  const handleAuthSuccess = () => {
    navigate(next ?? "/");
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 rounded-full border-3 border-primary border-t-transparent"
        />
      </div>
    );
  }

  if (user) return null;

  return (
    <EnhancedErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          />
        </div>

        {/* Mobile Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden p-4 pt-8 text-center relative z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="p-2.5 bg-primary/90 backdrop-blur-md rounded-xl border border-primary/30 shadow-lg"
            >
              <Activity className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">FitFusion</h1>
          </div>
          <p className="text-sm text-muted-foreground">Your Personal Fitness Journey</p>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center">
            {/* Desktop Left Side - Branding */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden md:flex flex-col flex-1 space-y-8"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className="p-3.5 bg-primary/90 backdrop-blur-xl rounded-2xl shadow-xl border border-primary/30"
                  >
                    <Activity className="h-10 w-10 text-primary-foreground" />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl font-bold text-foreground">FitFusion</h1>
                    <p className="text-sm text-muted-foreground">AI-Powered Fitness</p>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  Transform your fitness journey with AI-powered workouts, smart tracking, and personalized coaching.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, title: "Secure", desc: "256-bit encryption", color: "from-blue-500/20 to-blue-600/10" },
                  { icon: Zap, title: "Smart AI", desc: "Personalized plans", color: "from-amber-500/20 to-orange-600/10" },
                  { icon: Heart, title: "Health", desc: "Complete tracking", color: "from-rose-500/20 to-pink-600/10" },
                  { icon: TrendingUp, title: "Progress", desc: "Real-time sync", color: "from-emerald-500/20 to-green-600/10" },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className={`p-4 rounded-xl bg-gradient-to-br ${feature.color} backdrop-blur-xl border border-border/30 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <feature.icon className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Stats bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-6 p-4 rounded-xl bg-card/50 backdrop-blur-xl border border-border/30"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">50K+</div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                </div>
                <div className="w-px h-8 bg-border/50" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-xs text-muted-foreground">Workouts</div>
                </div>
                <div className="w-px h-8 bg-border/50" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4.9★</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Auth Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full md:flex-1"
            >
              <EnhancedAuthForm onSuccess={handleAuthSuccess} />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
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

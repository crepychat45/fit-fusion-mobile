import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, MotionValue } from "framer-motion";
import {
  Home,
  Dumbbell,
  BarChart3,
  User,
  MessageCircle,
  Plus,
  Settings,
  Trophy,
  Shield,
  Brain,
  Bell,
  Mic,
  Calculator,
  Apple,
  TrendingUp,
  FolderLock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileAIAssistant } from "@/components/mobile/mobile-ai-assistant";
import { MobileSecurityCenter } from "@/components/mobile/mobile-security-center";
import { prefetchRoute } from "@/utils/route-prefetch";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/workouts", icon: Dumbbell, label: "Workouts" },
  { href: "/progress", icon: BarChart3, label: "Progress" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/profile", icon: User, label: "Profile" },
];

/**
 * Dock-style icon that magnifies based on horizontal proximity to the pointer,
 * inspired by the macOS dock. Uses transform-only animations for smoothness.
 */
function DockIcon({
  mouseX,
  href,
  icon: Icon,
  label,
  isActive,
}: {
  mouseX: MotionValue<number>;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizePx = useTransform(distance, [-100, 0, 100], [44, 60, 44]);

  return (
    <Link
      ref={ref}
      to={href}
      onMouseEnter={() => prefetchRoute(href)}
      onTouchStart={() => prefetchRoute(href)}
      className="flex flex-col items-center justify-end gap-0.5 flex-1"
    >
      <motion.div
        style={{ width: sizePx, height: sizePx }}
        whileTap={{ scale: 0.85 }}
        className={cn(
          "relative flex items-center justify-center rounded-2xl transition-colors duration-300 border",
          isActive
            ? "bg-gradient-to-br from-primary/40 to-accent/30 border-primary/40 shadow-lg shadow-primary/20"
            : "bg-card/50 border-border/30 hover:bg-muted/50"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="dock-glow"
            className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <Icon
          className={cn(
            "relative h-5 w-5 transition-colors",
            isActive ? "text-primary" : "text-foreground/70"
          )}
        />
        {isActive && (
          <motion.span
            layoutId="dock-dot"
            className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary"
          />
        )}
      </motion.div>
      <span
        className={cn(
          "text-[9px] font-semibold tracking-wide transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function MobileNav() {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [notifications] = useState(3);
  const mouseX = useMotionValue(Infinity);

  const additionalItems = [
    { href: "/tools", icon: Calculator, label: "Tools" },
    { href: "/progress-tracker", icon: TrendingUp, label: "Tracker" },
    { href: "/nutrition", icon: Apple, label: "Nutrition" },
    { href: "/vault", icon: FolderLock, label: "Vault" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/subscription", icon: Trophy, label: "Premium" },
  ];

  const quickActions = [
    { id: "ai-assistant", icon: Brain, label: "AI Coach", action: () => setShowAIAssistant(true), badge: "NEW" },
    { id: "security", icon: Shield, label: "Security", action: () => setShowSecurity(true), badge: null },
    { id: "voice", icon: Mic, label: "Voice", action: () => setShowAIAssistant(true), badge: null },
    { id: "notifications", icon: Bell, label: "Alerts", action: () => (window.location.href = "/notifications"), badge: notifications > 0 ? notifications.toString() : null },
  ];

  return (
    <>
      {/* Liquid Glass Dock */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed bottom-0 left-0 right-0 z-50 mobile-nav-safe pointer-events-none"
      >
        <div className="flex justify-center px-3 pb-3 pointer-events-none">
          <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className="pointer-events-auto relative flex items-end gap-1 px-3 pt-2 pb-2 rounded-3xl border border-white/20 bg-card/60 backdrop-blur-2xl shadow-2xl shadow-black/20"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(var(--card)/0.7), hsl(var(--card)/0.4))",
            }}
          >
            {/* Liquid highlight */}
            <div className="absolute inset-x-4 top-1 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {navItems.map((item) => (
              <DockIcon
                key={item.href}
                mouseX={mouseX}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.href}
              />
            ))}

            {/* More Button */}
            <button
              onClick={() => setShowMore(true)}
              className="flex flex-col items-center justify-end gap-0.5 flex-1"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="flex items-center justify-center w-11 h-11 rounded-2xl bg-card/50 border border-border/30 hover:bg-muted/50 transition-colors"
              >
                <Plus className="h-5 w-5 text-foreground/70" />
              </motion.div>
              <span className="text-[9px] font-semibold tracking-wide text-muted-foreground">More</span>
            </button>
          </motion.div>
        </div>
      </motion.nav>

      {/* More Menu - Glass Bottom Sheet */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 400 }}
              className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-white/20 bg-card/90 backdrop-blur-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-6" />
              <h3 className="text-lg font-bold text-foreground mb-5 text-center">More Options</h3>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={action.action}
                    className="relative flex flex-col items-center p-4 rounded-2xl border border-white/20 bg-muted/30 backdrop-blur-sm hover:bg-muted/50 transition-all duration-200"
                  >
                    {action.badge && (
                      <Badge className="absolute -top-1.5 -right-1.5 text-[10px] px-1.5 py-0 h-5 bg-primary text-primary-foreground border-0">
                        {action.badge}
                      </Badge>
                    )}
                    <div className="p-2.5 rounded-xl bg-primary/10 mb-2">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {additionalItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} to={item.href} onClick={() => setShowMore(false)} onMouseEnter={() => prefetchRoute(item.href)} onTouchStart={() => prefetchRoute(item.href)}>
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="flex flex-col items-center p-3 rounded-2xl border border-white/20 bg-muted/20 hover:bg-muted/40 transition-all duration-200"
                      >
                        <div className="p-2 rounded-xl bg-accent/30 mb-2">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <span className="text-xs font-medium text-foreground">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>

              <Button
                onClick={() => setShowMore(false)}
                className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileAIAssistant isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} />
      <MobileSecurityCenter isOpen={showSecurity} onClose={() => setShowSecurity(false)} />
    </>
  );
}

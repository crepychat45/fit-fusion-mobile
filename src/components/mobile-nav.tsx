import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, MotionValue, useSpring } from "framer-motion";
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
  Sparkles,
  Zap,
  Search,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileAIAssistant } from "@/components/mobile/mobile-ai-assistant";
import { MobileSecurityCenter } from "@/components/mobile/mobile-security-center";
import { FitnessFusionLogo } from "@/components/fitness-fusion-logo";
import { prefetchRoute } from "@/utils/route-prefetch";

const navItems = [
  { href: "/", icon: Home, label: "Home", color: "from-blue-500 to-cyan-500" },
  { href: "/workouts", icon: Dumbbell, label: "Workouts", color: "from-orange-500 to-red-500" },
  { href: "/progress", icon: BarChart3, label: "Progress", color: "from-green-500 to-emerald-500" },
  { href: "/chat", icon: MessageCircle, label: "Chat", color: "from-purple-500 to-pink-500" },
  { href: "/profile", icon: User, label: "Profile", color: "from-indigo-500 to-blue-500" },
];

function DockIcon({
  mouseX,
  href,
  icon: Icon,
  label,
  color,
  isActive,
}: {
  mouseX: MotionValue<number>;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  isActive: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeRaw = useTransform(distance, [-120, 0, 120], [40, 60, 40]);
  const liftRaw = useTransform(distance, [-120, 0, 120], [0, -8, 0]);
  const sizePx = useSpring(sizeRaw, { mass: 0.1, stiffness: 180, damping: 14 });
  const lift = useSpring(liftRaw, { mass: 0.1, stiffness: 180, damping: 14 });

  return (
    <Link
      ref={ref}
      to={href}
      onMouseEnter={() => prefetchRoute(href)}
      onTouchStart={() => prefetchRoute(href)}
      className="flex flex-col items-center justify-end gap-0.5 flex-1"
      aria-label={label}
    >
      <motion.div
        style={{ width: sizePx, height: sizePx, y: lift }}
        whileTap={{ scale: 0.82 }}
        className={cn(
          "relative flex items-center justify-center rounded-2xl transition-colors duration-300 border overflow-hidden",
          isActive
            ? "border-white/30 shadow-lg shadow-primary/30"
            : "bg-card/50 border-border/30 hover:bg-muted/50"
        )}
      >
        {isActive && (
          <>
            <motion.div
              layoutId="dock-active-bg"
              className={cn("absolute inset-0 bg-gradient-to-br", color)}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
            <motion.div
              layoutId="dock-glow"
              className="absolute -inset-2 rounded-3xl bg-primary/30 blur-xl"
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                boxShadow: [
                  "inset 0 0 0 1px rgba(255,255,255,0.2)",
                  "inset 0 0 0 1px rgba(255,255,255,0.5)",
                  "inset 0 0 0 1px rgba(255,255,255,0.2)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </>
        )}
        <Icon
          className={cn(
            "relative h-5 w-5 transition-colors drop-shadow-sm",
            isActive ? "text-white" : "text-foreground/70"
          )}
        />
        {isActive && (
          <motion.span
            layoutId="dock-dot"
            className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
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
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showQuickLaunch, setShowQuickLaunch] = useState(false);
  const [notifications] = useState(3);
  const [pulse, setPulse] = useState(false);
  const mouseX = useMotionValue(Infinity);

  // Ambient pulse every 8s to hint at the center logo action
  useEffect(() => {
    const id = window.setInterval(() => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 1200);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  const additionalItems = [
    { href: "/tools", icon: Calculator, label: "Tools" },
    { href: "/progress-tracker", icon: TrendingUp, label: "Tracker" },
    { href: "/nutrition", icon: Apple, label: "Nutrition" },
    { href: "/vault", icon: FolderLock, label: "Vault" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/subscription", icon: Trophy, label: "Premium" },
  ];

  const quickActions = [
    { id: "ai-assistant", icon: Brain, label: "AI Coach", action: () => { setShowQuickLaunch(false); setShowAIAssistant(true); }, badge: "NEW" },
    { id: "security", icon: Shield, label: "Security", action: () => { setShowQuickLaunch(false); setShowSecurity(true); }, badge: null },
    { id: "voice", icon: Mic, label: "Voice", action: () => { setShowQuickLaunch(false); setShowAIAssistant(true); }, badge: null },
    { id: "quick-workout", icon: Play, label: "Start", action: () => { setShowQuickLaunch(false); navigate("/workouts"); }, badge: null },
    { id: "search", icon: Search, label: "Search", action: () => { setShowQuickLaunch(false); navigate("/settings"); }, badge: null },
    { id: "notifications", icon: Bell, label: "Alerts", action: () => { setShowQuickLaunch(false); navigate("/notifications"); }, badge: notifications > 0 ? notifications.toString() : null },
  ];

  const moreActions = [
    { id: "ai-assistant", icon: Brain, label: "AI Coach", action: () => setShowAIAssistant(true), badge: "NEW" },
    { id: "security", icon: Shield, label: "Security", action: () => setShowSecurity(true), badge: null },
    { id: "voice", icon: Mic, label: "Voice", action: () => setShowAIAssistant(true), badge: null },
    { id: "notifications", icon: Bell, label: "Alerts", action: () => navigate("/notifications"), badge: notifications > 0 ? notifications.toString() : null },
  ];

  // Split nav: 2 items | logo | 3 items → put logo in center
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

  return (
    <>
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed bottom-0 left-0 right-0 z-50 mobile-nav-safe pointer-events-none"
      >
        <div className="flex justify-center px-3 pb-3 pointer-events-none">
          <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className="pointer-events-auto relative flex items-end gap-1 px-3 pt-3 pb-2 rounded-3xl border border-white/20 bg-card/60 backdrop-blur-2xl shadow-2xl shadow-black/30"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(var(--card)/0.75), hsl(var(--card)/0.4))",
            }}
          >
            {/* Liquid top highlight */}
            <div className="absolute inset-x-4 top-1 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
            {/* Bottom soft shadow */}
            <div className="absolute inset-x-6 -bottom-2 h-3 bg-black/40 blur-xl rounded-full pointer-events-none" />

            {leftItems.map((item) => (
              <DockIcon
                key={item.href}
                mouseX={mouseX}
                href={item.href}
                icon={item.icon}
                label={item.label}
                color={item.color}
                isActive={location.pathname === item.href}
              />
            ))}

            {/* CENTER LOGO — Quick Launch trigger */}
            <div className="flex flex-col items-center justify-end gap-0.5 flex-1">
              <motion.button
                onClick={() => setShowQuickLaunch(true)}
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.08 }}
                animate={pulse ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 1.2 }}
                className="relative -mt-6"
                aria-label="Quick launch"
              >
                {/* Rotating conic glow */}
                <motion.div
                  className="absolute -inset-2 rounded-full opacity-70 blur-md"
                  style={{
                    background:
                      "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--primary)))",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                {/* Solid glass ring */}
                <div className="relative rounded-full p-[2px] bg-gradient-to-br from-white/40 to-white/5 shadow-xl shadow-primary/40">
                  <div className="rounded-full bg-card/80 backdrop-blur-xl p-1.5">
                    <FitnessFusionLogo size="sm" variant="glass" animated />
                  </div>
                </div>
                {/* Orbit spark */}
                <motion.span
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "50% 28px" }}
                >
                  <Sparkles className="h-3 w-3 text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.9)]" />
                </motion.span>
              </motion.button>
              <span className="text-[9px] font-bold tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FITX
              </span>
            </div>

            {rightItems.map((item) => (
              <DockIcon
                key={item.href}
                mouseX={mouseX}
                href={item.href}
                icon={item.icon}
                label={item.label}
                color={item.color}
                isActive={location.pathname === item.href}
              />
            ))}

            {/* More Button */}
            <button
              onClick={() => setShowMore(true)}
              className="flex flex-col items-center justify-end gap-0.5 flex-1"
              aria-label="More"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center justify-center w-11 h-11 rounded-2xl bg-card/50 border border-border/30 hover:bg-muted/50 transition-colors"
              >
                <Plus className="h-5 w-5 text-foreground/70" />
              </motion.div>
              <span className="text-[9px] font-semibold tracking-wide text-muted-foreground">More</span>
            </button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Quick Launch Radial Menu — opens from center logo */}
      <AnimatePresence>
        {showQuickLaunch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/70 backdrop-blur-md flex items-end justify-center pb-32"
            onClick={() => setShowQuickLaunch(false)}
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.4, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="relative rounded-3xl border border-white/20 bg-card/90 backdrop-blur-2xl p-6 shadow-2xl mx-4 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center mb-4">
                <FitnessFusionLogo size="md" variant="glass" animated />
              </div>
              <h3 className="text-center text-sm font-semibold text-foreground mb-4">Quick Launch</h3>
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map((action, i) => (
                  <motion.button
                    key={action.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 20 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={action.action}
                    className="relative flex flex-col items-center p-3 rounded-2xl border border-white/20 bg-muted/30 hover:bg-muted/50 transition-all"
                  >
                    {action.badge && (
                      <Badge className="absolute -top-1.5 -right-1.5 text-[9px] px-1.5 py-0 h-4 bg-primary text-primary-foreground border-0">
                        {action.badge}
                      </Badge>
                    )}
                    <div className="p-2 rounded-xl bg-primary/10 mb-1.5">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-medium text-foreground">{action.label}</span>
                  </motion.button>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                <Zap className="h-3 w-3 text-yellow-400" />
                Tap anywhere to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* More Menu */}
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
                {moreActions.map((action) => (
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

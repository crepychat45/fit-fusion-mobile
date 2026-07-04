import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  MotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
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
  Flame,
  Target,
  LogOut,
  CreditCard,
  Lock,
  X,
  Timer,
  Activity,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MobileAIAssistant } from "@/components/mobile/mobile-ai-assistant";
import { MobileSecurityCenter } from "@/components/mobile/mobile-security-center";
import { FitnessFusionLogo } from "@/components/fitness-fusion-logo";
import { prefetchRoute } from "@/utils/route-prefetch";

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

/** Very subtle haptic feedback (Android only, silently ignored elsewhere). */
const haptic = (ms = 10) => {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(ms);
    }
  } catch {
    /* noop */
  }
};

/** Detect coarse pointer (mobile / touch) once — used to skip mouse tracking. */
const useIsTouchDevice = () => {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    setTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setTouch(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return touch;
};

/** Track document visibility so we can pause idle animations. */
const useDocumentVisible = () => {
  const [visible, setVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );
  useEffect(() => {
    const handler = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);
  return visible;
};

/* ------------------------------------------------------------------ */
/*  Nav data                                                           */
/* ------------------------------------------------------------------ */

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string; // tailwind gradient stops
  accent: string; // hsl accent for navbar tint per page
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", icon: Home, label: "Home", color: "from-blue-500 to-cyan-500", accent: "217 91% 60%" },
  { href: "/workouts", icon: Dumbbell, label: "Workouts", color: "from-orange-500 to-red-500", accent: "24 95% 53%" },
  { href: "/progress", icon: BarChart3, label: "Progress", color: "from-green-500 to-emerald-500", accent: "160 84% 39%" },
  { href: "/chat", icon: MessageCircle, label: "Chat", color: "from-purple-500 to-pink-500", accent: "271 91% 65%" },
  { href: "/profile", icon: User, label: "Profile", color: "from-indigo-500 to-blue-500", accent: "239 84% 67%" },
];

const ADDITIONAL_ITEMS = [
  { href: "/tools", icon: Calculator, label: "Tools" },
  { href: "/progress-tracker", icon: TrendingUp, label: "Tracker" },
  { href: "/nutrition", icon: Apple, label: "Nutrition" },
  { href: "/vault", icon: FolderLock, label: "Vault" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/subscription", icon: Trophy, label: "Premium" },
] as const;

/** Long-press context menus per route. */
const LONG_PRESS_MENUS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; to?: string; run?: () => void }[]> = {
  "/workouts": [
    { label: "Quick Workout", icon: Play, to: "/workouts?mode=quick" },
    { label: "HIIT", icon: Flame, to: "/workouts?type=hiit" },
    { label: "Strength", icon: Dumbbell, to: "/workouts?type=strength" },
    { label: "Yoga", icon: Leaf, to: "/workouts?type=yoga" },
    { label: "Stretch", icon: Activity, to: "/workouts?type=stretch" },
  ],
  "/profile": [
    { label: "Settings", icon: Settings, to: "/settings" },
    { label: "Subscription", icon: CreditCard, to: "/subscription" },
    { label: "Privacy", icon: Lock, to: "/settings?tab=privacy" },
    { label: "Logout", icon: LogOut, to: "/logout" },
  ],
  "/chat": [
    { label: "New Chat", icon: MessageCircle, to: "/chat?new=1" },
    { label: "AI Coach", icon: Brain, to: "/chat?coach=1" },
    { label: "Notifications", icon: Bell, to: "/notifications" },
  ],
};

/* ------------------------------------------------------------------ */
/*  DockIcon — memoized + long-press support                           */
/* ------------------------------------------------------------------ */

interface DockIconProps {
  mouseX: MotionValue<number>;
  item: NavItem;
  isActive: boolean;
  enableMagnify: boolean;
  onLongPress?: (item: NavItem, rect: DOMRect) => void;
  progress?: number; // 0..100 optional ring
}

const DockIcon = memo(function DockIcon({
  mouseX,
  item,
  isActive,
  enableMagnify,
  onLongPress,
  progress,
}: DockIconProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const navigate = useNavigate();

  // Magnification (desktop only) — cheap: transform + spring
  const distance = useTransform(mouseX, (val) => {
    if (!enableMagnify || val === Infinity) return 0;
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - b.x - b.width / 2;
  });
  const sizeRaw = useTransform(distance, [-120, 0, 120], [40, enableMagnify ? 60 : 44, 40]);
  const liftRaw = useTransform(distance, [-120, 0, 120], [0, enableMagnify ? -8 : 0, 0]);
  const sizePx = useSpring(sizeRaw, { mass: 0.1, stiffness: 180, damping: 14 });
  const lift = useSpring(liftRaw, { mass: 0.1, stiffness: 180, damping: 14 });

  const startLongPress = useCallback(() => {
    if (!onLongPress) return;
    longPressed.current = false;
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      haptic(15);
      const rect = ref.current?.getBoundingClientRect();
      if (rect) onLongPress(item, rect);
    }, 450);
  }, [item, onLongPress]);

  const cancelLongPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (longPressed.current) {
        e.preventDefault();
        longPressed.current = false;
        return;
      }
      haptic(8);
      // Let router handle actual navigation (Link default)
    },
    [],
  );

  const Icon = item.icon;
  const showRing = typeof progress === "number" && progress > 0 && item.href === "/workouts";

  return (
    <Link
      ref={ref}
      to={item.href}
      onMouseEnter={() => prefetchRoute(item.href)}
      onTouchStart={(e) => {
        prefetchRoute(item.href);
        startLongPress();
      }}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      onTouchCancel={cancelLongPress}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onClick={handleClick}
      className="flex flex-col items-center justify-end gap-0.5 flex-1 min-w-0 basis-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-2xl"
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
    >
      <motion.div
        style={{ width: sizePx, height: sizePx, y: lift, willChange: "transform" }}
        whileTap={{ scale: 0.82 }}
        className={cn(
          "relative flex items-center justify-center rounded-2xl border overflow-hidden",
          isActive
            ? "border-white/30 shadow-lg shadow-primary/30"
            : "bg-card/50 border-border/30 hover:bg-muted/50",
        )}
      >
        {/* Workout progress ring (SVG, no continuous animation) */}
        {showRing && (
          <svg
            className="absolute inset-0 -rotate-90 pointer-events-none"
            viewBox="0 0 44 44"
            aria-hidden="true"
          >
            <circle cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
            <motion.circle
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke="url(#dockRing)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 20}
              initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - progress! / 100) }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="dockRing" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {isActive && (
          <>
            <motion.div
              layoutId="dock-active-bg"
              className={cn("absolute inset-0 bg-gradient-to-br", item.color)}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
            <motion.div
              layoutId="dock-glow"
              className="absolute -inset-2 rounded-3xl bg-primary/30 blur-xl"
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
          </>
        )}
        <Icon
          className={cn(
            "relative h-5 w-5 drop-shadow-sm",
            isActive ? "text-white" : "text-foreground/70",
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
          "text-[9px] font-semibold tracking-wide max-w-full truncate leading-none",
          isActive ? "text-primary" : "text-muted-foreground",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
});

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const SUGGESTIONS = [
  { icon: "💪", text: "Continue today's workout" },
  { icon: "🔥", text: "Streak: keep the momentum going" },
  { icon: "🥗", text: "Log your next meal" },
  { icon: "🤖", text: "AI has a new recommendation" },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isTouch = useIsTouchDevice();
  const reduceMotion = useReducedMotion();
  const pageVisible = useDocumentVisible();

  const [showMore, setShowMore] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showQuickLaunch, setShowQuickLaunch] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [longPressMenu, setLongPressMenu] = useState<{
    item: NavItem;
    rect: DOMRect;
  } | null>(null);

  // Dynamic state: notifications & AI new badge
  const [notifications, setNotifications] = useState(0);
  const [notificationType, setNotificationType] = useState<
    "message" | "workout" | "goal" | "ai" | null
  >(null);
  const [showAiNew, setShowAiNew] = useState(true);

  // Workout progress ring — reads from localStorage; refreshes on focus/route change
  const [workoutProgress, setWorkoutProgress] = useState(0);

  // Scroll morph (Apple-style dock compact on scroll down)
  const [compact, setCompact] = useState(false);

  // Context-aware suggestion
  const [suggestionIdx, setSuggestionIdx] = useState<number | null>(null);

  const mouseX = useMotionValue(Infinity);
  const enableMagnify = !isTouch && !reduceMotion;

  /* -------- Hydrate persisted flags -------- */
  useEffect(() => {
    try {
      setShowAiNew(localStorage.getItem("nav.ai.opened") !== "1");
      const raw = localStorage.getItem("nav.notifications");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.count === "number") setNotifications(parsed.count);
        if (parsed.type) setNotificationType(parsed.type);
      }
      const wp = Number(localStorage.getItem("workout.progress") || 0);
      if (!Number.isNaN(wp)) setWorkoutProgress(Math.max(0, Math.min(100, wp)));
    } catch {
      /* ignore */
    }
  }, [location.pathname]);

  /* -------- Ambient pulse on center logo (paused when hidden / reduced motion) -------- */
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (!pageVisible || reduceMotion) return;
    const id = window.setInterval(() => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 1200);
    }, 12000);
    return () => window.clearInterval(id);
  }, [pageVisible, reduceMotion]);

  /* -------- Apple-style scroll morph -------- */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          const goingDown = y > lastY && y > 40;
          setCompact(goingDown);
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* -------- Context-aware suggestion (visible once per session, auto-hide) -------- */
  useEffect(() => {
    if (reduceMotion) return;
    const seen = sessionStorage.getItem("nav.suggested");
    if (seen) return;
    const showTimer = window.setTimeout(() => {
      setSuggestionIdx(Math.floor(Math.random() * SUGGESTIONS.length));
      sessionStorage.setItem("nav.suggested", "1");
      window.setTimeout(() => setSuggestionIdx(null), 5000);
    }, 3500);
    return () => window.clearTimeout(showTimer);
  }, [reduceMotion]);

  /* -------- Horizontal swipe navigation between main tabs -------- */
  useEffect(() => {
    if (!isTouch) return;
    let sx = 0;
    let sy = 0;
    let sTime = 0;
    const routes = NAV_ITEMS.map((i) => i.href);

    const start = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      sTime = Date.now();
    };
    const end = (e: TouchEvent) => {
      if (!sTime) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      const dt = Date.now() - sTime;
      sTime = 0;
      // Horizontal, quick, not vertical scroll
      if (dt > 500) return;
      if (Math.abs(dx) < 80 || Math.abs(dy) > 60) return;
      // Ignore swipes that start on interactive scroll-x elements
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-no-swipe], input, textarea, [contenteditable='true']")) return;

      const idx = routes.indexOf(location.pathname);
      if (idx === -1) return;
      const next = dx < 0 ? idx + 1 : idx - 1;
      if (next < 0 || next >= routes.length) return;
      haptic(10);
      navigate(routes[next]);
    };

    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchend", end, { passive: true });
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchend", end);
    };
  }, [isTouch, location.pathname, navigate]);

  /* -------- Dynamic accent color per page -------- */
  const activeItem = useMemo(
    () => NAV_ITEMS.find((i) => i.href === location.pathname) ?? NAV_ITEMS[0],
    [location.pathname],
  );

  /* -------- Memoized handlers / arrays -------- */
  const openAI = useCallback(() => {
    setShowQuickLaunch(false);
    setShowAIAssistant(true);
    if (showAiNew) {
      try {
        localStorage.setItem("nav.ai.opened", "1");
      } catch {}
      setShowAiNew(false);
    }
  }, [showAiNew]);

  const openVoice = useCallback(() => {
    setShowQuickLaunch(false);
    haptic(10);
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      // Fallback — open AI assistant with mic hint
      setShowAIAssistant(true);
      return;
    }
    try {
      const rec = new SR();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (ev: any) => {
        const q = ev.results[0][0].transcript;
        setSearchQuery(q);
        setShowSearch(true);
      };
      rec.onerror = () => setShowAIAssistant(true);
      rec.start();
    } catch {
      setShowAIAssistant(true);
    }
  }, []);

  const quickActions = useMemo(
    () => [
      { id: "ai-assistant", icon: Brain, label: "AI Coach", action: openAI, badge: showAiNew ? "NEW" : null },
      { id: "security", icon: Shield, label: "Security", action: () => { setShowQuickLaunch(false); setShowSecurity(true); }, badge: null as string | null },
      { id: "voice", icon: Mic, label: "Voice", action: openVoice, badge: null },
      { id: "quick-workout", icon: Play, label: "Start", action: () => { setShowQuickLaunch(false); navigate("/workouts"); }, badge: null },
      { id: "search", icon: Search, label: "Search", action: () => { setShowQuickLaunch(false); setShowSearch(true); }, badge: null },
      { id: "notifications", icon: Bell, label: "Alerts", action: () => { setShowQuickLaunch(false); navigate("/notifications"); }, badge: notifications > 0 ? String(notifications) : null },
    ],
    [openAI, openVoice, navigate, notifications, showAiNew],
  );

  const moreActions = useMemo(
    () => [
      { id: "ai-assistant", icon: Brain, label: "AI Coach", action: openAI, badge: showAiNew ? "NEW" : null },
      { id: "security", icon: Shield, label: "Security", action: () => setShowSecurity(true), badge: null as string | null },
      { id: "voice", icon: Mic, label: "Voice", action: openVoice, badge: null },
      { id: "notifications", icon: Bell, label: "Alerts", action: () => navigate("/notifications"), badge: notifications > 0 ? String(notifications) : null },
    ],
    [openAI, openVoice, navigate, notifications, showAiNew],
  );

  const [leftItems, rightItems] = useMemo(
    () => [NAV_ITEMS.slice(0, 2), NAV_ITEMS.slice(2)] as const,
    [],
  );

  const handleLongPress = useCallback((item: NavItem, rect: DOMRect) => {
    if (!LONG_PRESS_MENUS[item.href]) return;
    setLongPressMenu({ item, rect });
  }, []);

  const notificationIcon = useMemo(() => {
    switch (notificationType) {
      case "workout": return Timer;
      case "goal": return Target;
      case "ai": return Sparkles;
      default: return Bell;
    }
  }, [notificationType]);

  /* ---------------------------------------------------------------- */
  return (
    <>
      {/* Context-aware suggestion above navbar */}
      <AnimatePresence>
        {suggestionIdx !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-24 z-40 px-3 py-1.5 rounded-full border border-white/20 bg-card/85 backdrop-blur-xl text-xs font-medium text-foreground shadow-lg flex items-center gap-1.5 pointer-events-none"
            role="status"
            aria-live="polite"
          >
            <span aria-hidden>{SUGGESTIONS[suggestionIdx].icon}</span>
            {SUGGESTIONS[suggestionIdx].text}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          scale: compact ? 0.94 : 1,
        }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed bottom-0 left-0 right-0 z-50 mobile-nav-safe pointer-events-none"
        style={
          {
            // dynamic accent CSS variable — safe fallback
            ["--nav-accent" as any]: activeItem.accent,
          } as React.CSSProperties
        }
      >
        <div className="flex justify-center px-2 pb-3 pointer-events-none">
          <motion.div
            onMouseMove={enableMagnify ? (e) => mouseX.set(e.pageX) : undefined}
            onMouseLeave={enableMagnify ? () => mouseX.set(Infinity) : undefined}
            animate={{
              opacity: compact ? 0.86 : 1,
            }}
            transition={{ duration: 0.25 }}
            className={cn(
              "pointer-events-auto relative flex items-end gap-0.5 px-2 pt-3 pb-2 rounded-3xl border shadow-2xl shadow-black/30 transition-[backdrop-filter,border-color] duration-300 w-full max-w-[440px]",
              compact ? "backdrop-blur-xl border-white/10" : "backdrop-blur-2xl border-white/20",
            )}
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(var(--card)/0.78), hsl(var(--card)/0.42)), radial-gradient(120% 80% at 50% 0%, hsl(var(--nav-accent)/0.18), transparent 60%)",
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
                item={item}
                isActive={location.pathname === item.href}
                enableMagnify={enableMagnify}
                onLongPress={handleLongPress}
                progress={item.href === "/workouts" ? workoutProgress : undefined}
              />
            ))}

            {/* CENTER LOGO — Dynamic Island expansion trigger */}
            <div className="flex flex-col items-center justify-end gap-0.5 flex-1 min-w-[52px]">
              <motion.button
                onClick={() => {
                  haptic(12);
                  setShowQuickLaunch(true);
                }}
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.08 }}
                animate={pulse ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 1.2 }}
                className="relative -mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full"
                aria-label="Open quick launch"
                aria-expanded={showQuickLaunch}
              >
                {/* Rotating conic glow — paused when hidden or reduced motion */}
                <motion.div
                  className="absolute -inset-2 rounded-full opacity-70 blur-md"
                  style={{
                    background:
                      "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--primary)))",
                    willChange: "transform",
                  }}
                  animate={pageVisible && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 8, repeat: pageVisible && !reduceMotion ? Infinity : 0, ease: "linear" }}
                />
                {/* Solid glass ring */}
                <div className="relative rounded-full p-[2px] bg-gradient-to-br from-white/40 to-white/5 shadow-xl shadow-primary/40">
                  <div className="rounded-full bg-card/80 backdrop-blur-xl p-1.5">
                    <FitnessFusionLogo size="sm" variant="glass" animated={pageVisible && !reduceMotion} />
                  </div>
                </div>
                {/* Orbit spark */}
                {pageVisible && !reduceMotion && (
                  <motion.span
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 pointer-events-none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "50% 28px", willChange: "transform" }}
                  >
                    <Sparkles className="h-3 w-3 text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.9)]" />
                  </motion.span>
                )}
              </motion.button>
              <span className="text-[9px] font-bold tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FITX
              </span>
            </div>

            {rightItems.map((item) => (
              <DockIcon
                key={item.href}
                mouseX={mouseX}
                item={item}
                isActive={location.pathname === item.href}
                enableMagnify={enableMagnify}
                onLongPress={handleLongPress}
              />
            ))}

            {/* More Button with smart notification badge */}
            <button
              onClick={() => {
                haptic(8);
                setShowMore(true);
              }}
              className="flex flex-col items-center justify-end gap-0.5 flex-1 min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-2xl"
              aria-label="More options"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-card/50 border border-border/30 hover:bg-muted/50 transition-colors"
              >
                <Plus className="h-5 w-5 text-foreground/70" />
                {notifications > 0 && (
                  <SmartNotificationBadge
                    count={notifications}
                    Icon={notificationIcon}
                  />
                )}
              </motion.div>
              <span className="text-[9px] font-semibold tracking-wide text-muted-foreground">
                More
              </span>
            </button>
          </motion.div>
        </div>
      </motion.nav>

      {/* -------- Long-press floating context menu -------- */}
      <AnimatePresence>
        {longPressMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] bg-background/50 backdrop-blur-sm"
            onClick={() => setLongPressMenu(null)}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                left: Math.min(
                  Math.max(12, longPressMenu.rect.left + longPressMenu.rect.width / 2 - 110),
                  window.innerWidth - 232,
                ),
                bottom: window.innerHeight - longPressMenu.rect.top + 8,
                width: 220,
              }}
              className="rounded-2xl border border-white/20 bg-card/95 backdrop-blur-2xl shadow-2xl p-1.5"
              role="menu"
            >
              {LONG_PRESS_MENUS[longPressMenu.item.href]?.map((entry) => {
                const EntryIcon = entry.icon;
                return (
                  <button
                    key={entry.label}
                    onClick={() => {
                      haptic(10);
                      setLongPressMenu(null);
                      if (entry.to) navigate(entry.to);
                      entry.run?.();
                    }}
                    role="menuitem"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 active:bg-muted transition-colors text-left"
                  >
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <EntryIcon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {entry.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------- Quick Launch — Apple Vision Pro-style outward burst -------- */}
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
              role="dialog"
              aria-label="Quick launch"
            >
              <div className="flex items-center justify-center mb-4">
                <FitnessFusionLogo size="md" variant="glass" animated={!reduceMotion} />
              </div>
              <h3 className="text-center text-sm font-semibold text-foreground mb-4">
                Quick Launch
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map((action, i) => {
                  // Radial outward burst from center
                  const cols = 3;
                  const col = i % cols;
                  const row = Math.floor(i / cols);
                  const fromX = (col - 1) * -40;
                  const fromY = (row - 0.5) * -40;
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ scale: 0, opacity: 0, x: fromX, y: fromY }}
                      animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                      transition={{
                        delay: i * 0.04,
                        type: "spring",
                        stiffness: 420,
                        damping: 22,
                      }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        haptic(10);
                        action.action();
                      }}
                      className="relative flex flex-col items-center p-3 rounded-2xl border border-white/20 bg-muted/30 hover:bg-muted/50 transition-all min-h-[64px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      {action.badge && (
                        <Badge className="absolute -top-1.5 -right-1.5 text-[9px] px-1.5 py-0 h-4 bg-primary text-primary-foreground border-0">
                          {action.badge}
                        </Badge>
                      )}
                      <div className="p-2 rounded-xl bg-primary/10 mb-1.5">
                        <action.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-[10px] font-medium text-foreground">
                        {action.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                <Zap className="h-3 w-3 text-yellow-400" />
                Tap anywhere to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------- Search Overlay -------- */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-xl flex items-start justify-center pt-24 px-4"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="w-full max-w-md rounded-3xl border border-white/20 bg-card/95 backdrop-blur-2xl shadow-2xl p-4"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Search FitFusion"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workouts, meals, tools…"
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      setShowSearch(false);
                      navigate(`/workouts?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-1 rounded-lg hover:bg-muted/60"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { label: "Workouts", to: "/workouts", icon: Dumbbell },
                  { label: "Nutrition", to: "/nutrition", icon: Apple },
                  { label: "Progress", to: "/progress", icon: BarChart3 },
                  { label: "Vault", to: "/vault", icon: FolderLock },
                ].map((s) => (
                  <button
                    key={s.to}
                    onClick={() => {
                      setShowSearch(false);
                      navigate(s.to);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/60 text-left"
                  >
                    <s.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------- More Menu -------- */}
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
              role="dialog"
              aria-label="More options"
            >
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-6" />
              <h3 className="text-lg font-bold text-foreground mb-5 text-center">
                More Options
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {moreActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      haptic(8);
                      action.action();
                    }}
                    className="relative flex flex-col items-center p-4 rounded-2xl border border-white/20 bg-muted/30 backdrop-blur-sm hover:bg-muted/50 transition-all duration-200 min-h-[80px]"
                  >
                    {action.badge && (
                      <Badge className="absolute -top-1.5 -right-1.5 text-[10px] px-1.5 py-0 h-5 bg-primary text-primary-foreground border-0">
                        {action.badge}
                      </Badge>
                    )}
                    <div className="p-2.5 rounded-xl bg-primary/10 mb-2">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {action.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {ADDITIONAL_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setShowMore(false)}
                      onMouseEnter={() => prefetchRoute(item.href)}
                      onTouchStart={() => prefetchRoute(item.href)}
                    >
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="flex flex-col items-center p-3 rounded-2xl border border-white/20 bg-muted/20 hover:bg-muted/40 transition-all duration-200 min-h-[72px]"
                      >
                        <div className="p-2 rounded-xl bg-accent/30 mb-2">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          {item.label}
                        </span>
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

      <MobileAIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
      <MobileSecurityCenter
        isOpen={showSecurity}
        onClose={() => setShowSecurity(false)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Smart notification badge — animated appearance                     */
/* ------------------------------------------------------------------ */

const SmartNotificationBadge = memo(function SmartNotificationBadge({
  count,
  Icon,
}: {
  count: number;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-red-500 to-pink-500 border border-white/40 flex items-center justify-center shadow-lg shadow-red-500/40"
      aria-label={`${count} notifications`}
    >
      {count > 1 ? (
        <span className="text-[9px] font-bold text-white leading-none">
          {count > 9 ? "9+" : count}
        </span>
      ) : (
        <Icon className="h-2.5 w-2.5 text-white" />
      )}
    </motion.div>
  );
});

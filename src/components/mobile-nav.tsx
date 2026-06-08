import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Zap,
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

export function MobileNav() {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [notifications] = useState(3);

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
      {/* Frosted Glass Navigation Bar */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed bottom-0 left-0 right-0 z-50 mobile-nav-safe"
      >
        {/* Glass backdrop */}
        <div className="mx-3 mb-3 rounded-2xl border border-border/30 bg-card/70 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} to={item.href} className="flex-1" onMouseEnter={() => prefetchRoute(item.href)} onTouchStart={() => prefetchRoute(item.href)}>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all duration-300",
                      isActive
                        ? "bg-primary/15"
                        : "hover:bg-muted/40"
                    )}
                  >
                    <div className={cn(
                      "relative p-1.5 rounded-lg transition-all duration-300",
                      isActive && "bg-primary/20"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5 transition-colors duration-300",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      {isActive && (
                        <motion.div
                          layoutId="nav-glow"
                          className="absolute inset-0 rounded-lg bg-primary/10 blur-md"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold tracking-wide transition-colors duration-300",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="w-5 h-0.5 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}

            {/* More Button */}
            <button
              onClick={() => setShowMore(true)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-muted-foreground hover:bg-muted/40 transition-all duration-300"
            >
              <div className="p-1.5 rounded-lg">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold tracking-wide">More</span>
            </button>
          </div>
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
              className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-border/30 bg-card/90 backdrop-blur-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-6" />
              <h3 className="text-lg font-bold text-foreground mb-5 text-center">More Options</h3>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={action.action}
                    className="relative flex flex-col items-center p-4 rounded-2xl border border-border/20 bg-muted/30 backdrop-blur-sm hover:bg-muted/50 transition-all duration-200"
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

              {/* Navigation Items */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {additionalItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} to={item.href} onClick={() => setShowMore(false)} onMouseEnter={() => prefetchRoute(item.href)} onTouchStart={() => prefetchRoute(item.href)}>
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="flex flex-col items-center p-3 rounded-2xl border border-border/20 bg-muted/20 hover:bg-muted/40 transition-all duration-200"
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

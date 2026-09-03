import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  Bell,
  Palette,
  MessageSquare,
  Smartphone,
  CreditCard,
  HelpCircle,
  Info,
  Download,
  Settings as SettingsIcon,
  ChevronRight,
  Crown,
  Lock,
  Eye,
  Volume2,
  Globe,
  Zap,
  Database,
  Code,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SettingsNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  showMobileMenu: boolean;
  onMobileMenuToggle: () => void;
}

const settingsCategories = [
  {
    id: "account",
    title: "Account",
    icon: User,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    description: "Manage your profile and personal information",
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-50",
    description: "Privacy settings and security options",
  },
  {
    id: "display",
    title: "Display",
    icon: Palette,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    description: "Theme, colors, and visual preferences",
  },
  {
    id: "privacy",
    title: "Privacy",
    icon: Lock,
    color: "text-red-500",
    bgColor: "bg-red-50",
    description: "Control your data and privacy settings",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    description: "Manage notification preferences and timing",
  },
  {
    id: "units",
    title: "Units & Format",
    icon: Globe,
    color: "text-teal-500",
    bgColor: "bg-teal-50",
    description: "Set measurement units and regional formats",
  },
  {
    id: "chat",
    title: "Chat Settings",
    icon: MessageSquare,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    description: "Configure chat preferences and notifications",
  },
  {
    id: "updates",
    title: "Updates",
    icon: Download,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    description: "App updates and version management",
  },
  {
    id: "enhanced",
    title: "Enhanced Validation",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    description: "Advanced settings validation",
  },
  {
    id: "developer",
    title: "Developer",
    icon: Code,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    description: "Developer tools and debugging options",
  },
  {
    id: "data",
    title: "Data Management",
    icon: Database,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
    description: "Manage your data and logout options",
  },
  {
    id: "about",
    title: "About",
    icon: Info,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    description: "App information and version details",
  },
];

export function SettingsNavigation({
  activeTab,
  onTabChange,
  showMobileMenu,
  onMobileMenuToggle,
}: SettingsNavigationProps) {
  const location = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  // Mobile Menu Overlay — crystal glass drawer
  const MobileMenu = () => (
    <AnimatePresence>
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-background/40 backdrop-blur-md md:hidden"
          onClick={onMobileMenuToggle}
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="crystal-glass absolute left-0 top-0 h-full w-[19rem] overflow-y-auto rounded-r-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="crystal-text text-lg font-bold">Settings Menu</h2>
                  <p className="text-xs text-muted-foreground">
                    {settingsCategories.length} sections
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Close settings menu"
                  onClick={onMobileMenuToggle}
                >
                  ✕
                </Button>
              </div>

              <div className="crystal-divider mb-4" />

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                {settingsCategories.map((category) => {
                  const isActive = activeTab === category.id;
                  const CategoryIcon = category.icon;

                  return (
                    <motion.div key={category.id} variants={itemVariants}>
                      <button
                        type="button"
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => {
                          onTabChange(category.id);
                          onMobileMenuToggle();
                        }}
                        className={cn(
                          "crystal-glass crystal-sheen w-full overflow-hidden rounded-2xl p-3 text-left flex items-center gap-3",
                          isActive && "crystal-glass-active",
                        )}
                      >
                        <span
                          className={cn(
                            "rounded-xl p-2",
                            isActive ? "bg-primary/15" : "bg-muted/60",
                          )}
                        >
                          <CategoryIcon
                            className={cn(
                              "h-5 w-5",
                              isActive ? "text-primary" : category.color,
                            )}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "crystal-text block text-sm font-semibold",
                              isActive && "text-primary",
                            )}
                          >
                            {category.title}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {category.description}
                          </span>
                        </span>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Desktop/Tablet Navigation — crystal glass grid
  const DesktopMenu = () => (
    <div className="hidden md:block">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-3 xl:grid-cols-5"
      >
        {settingsCategories.map((category) => {
          const isActive = activeTab === category.id;
          const CategoryIcon = category.icon;

          return (
            <motion.button
              key={category.id}
              type="button"
              variants={itemVariants}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onTabChange(category.id)}
              className={cn(
                "crystal-glass crystal-sheen group relative overflow-hidden rounded-2xl p-4 text-center",
                isActive && "crystal-glass-active",
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <span
                  className={cn(
                    "rounded-2xl p-3 transition-transform duration-300 group-hover:-translate-y-0.5",
                    isActive ? "bg-primary/15" : "bg-muted/60",
                  )}
                >
                  <CategoryIcon
                    className={cn(
                      "h-6 w-6",
                      isActive ? "text-primary" : category.color,
                    )}
                  />
                </span>
                <span>
                  <span
                    className={cn(
                      "crystal-text block text-sm font-semibold",
                      isActive && "text-primary",
                    )}
                  >
                    {category.title}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
                    {category.description}
                  </span>
                </span>
                <span className="h-1 w-full overflow-hidden rounded-full bg-transparent">
                  {isActive && (
                    <motion.span
                      layoutId="activeIndicator"
                      className="block h-1 w-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                  )}
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );

  return (
    <>
      <MobileMenu />
      <DesktopMenu />
    </>
  );
}

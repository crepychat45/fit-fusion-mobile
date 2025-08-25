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

  // Mobile Menu Overlay
  const MobileMenu = () => (
    <AnimatePresence>
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onMobileMenuToggle}
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Settings Menu</h2>
                <Button variant="ghost" size="sm" onClick={onMobileMenuToggle}>
                  ✕
                </Button>
              </div>

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
                      <motion.button
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onTabChange(category.id);
                          onMobileMenuToggle();
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 text-left",
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <div className={cn("p-2 rounded-lg", category.bgColor)}>
                          <CategoryIcon
                            className={cn("h-5 w-5", category.color)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {category.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {category.description}
                          </div>
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-primary rounded-full"
                          />
                        )}
                      </motion.button>
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

  // Desktop/Tablet Navigation
  const DesktopMenu = () => (
    <div className="hidden md:block">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4"
      >
        {settingsCategories.map((category) => {
          const isActive = activeTab === category.id;
          const CategoryIcon = category.icon;

          return (
            <motion.div key={category.id} variants={itemVariants}>
              <Card
                className={cn(
                  "overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg",
                  isActive && "ring-2 ring-primary shadow-lg",
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTabChange(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <motion.div
                        className={cn(
                          "p-3 rounded-xl transition-all duration-200",
                          isActive ? "bg-primary/20" : category.bgColor,
                        )}
                        whileHover={{ rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CategoryIcon
                          className={cn(
                            "h-6 w-6",
                            isActive ? "text-primary" : category.color,
                          )}
                        />
                      </motion.div>
                      <div>
                        <h3
                          className={cn(
                            "font-semibold text-sm",
                            isActive ? "text-primary" : "text-foreground",
                          )}
                        >
                          {category.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      </div>

                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="w-full h-1 bg-primary rounded-full"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </div>
                  </CardContent>
                </motion.div>
              </Card>
            </motion.div>
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

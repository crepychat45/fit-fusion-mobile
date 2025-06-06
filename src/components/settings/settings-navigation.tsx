
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
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const settingsCategories = [
  {
    title: "Account",
    icon: User,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    items: [
      { href: "/profile", icon: User, label: "Profile Settings", description: "Edit your personal information" },
      { href: "/subscription", icon: Crown, label: "Subscription", description: "Manage your premium plan", badge: "Pro" },
    ]
  },
  {
    title: "Privacy & Security",
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-50",
    items: [
      { href: "/privacy", icon: Lock, label: "Privacy Settings", description: "Control your privacy preferences" },
      { href: "/settings", icon: Shield, label: "Security Center", description: "Two-factor auth and security" },
    ]
  },
  {
    title: "App Experience",
    icon: Palette,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    items: [
      { href: "/settings", icon: Palette, label: "Display Settings", description: "Theme, colors, and layout" },
      { href: "/notifications", icon: Bell, label: "Notifications", description: "Manage your alerts" },
      { href: "/settings", icon: Volume2, label: "Sound Settings", description: "Audio preferences" },
      { href: "/settings", icon: Globe, label: "Language", description: "Choose your language" },
    ]
  },
  {
    title: "Devices & Integrations",
    icon: Smartphone,
    color: "text-orange-500", 
    bgColor: "bg-orange-50",
    items: [
      { href: "/wearables", icon: Smartphone, label: "Wearable Devices", description: "Connect your smartwatch" },
      { href: "/settings", icon: Zap, label: "Third-party Apps", description: "Connected services" },
    ]
  },
  {
    title: "Support & Info",
    icon: HelpCircle,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    items: [
      { href: "/help", icon: HelpCircle, label: "Help Center", description: "Get help and support" },
      { href: "/export-data", icon: Download, label: "Export Data", description: "Download your information" },
      { href: "/settings", icon: Info, label: "About FitFusion", description: "App info and version" },
    ]
  }
];

export function SettingsNavigation() {
  const location = useLocation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Account");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const categoryVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 p-4"
    >
      {settingsCategories.map((category, categoryIndex) => {
        const isExpanded = expandedCategory === category.title;
        const CategoryIcon = category.icon;
        
        return (
          <motion.div key={category.title} variants={categoryVariants}>
            <Card className="overflow-hidden hover-lift">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="cursor-pointer"
                onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className={cn("p-2 rounded-lg", category.bgColor)}
                        whileHover={{ rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CategoryIcon className={cn("h-5 w-5", category.color)} />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-sm">{category.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {category.items.length} setting{category.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </CardContent>
              </motion.div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border/50 bg-muted/20">
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="p-2 space-y-1"
                      >
                        {category.items.map((item, itemIndex) => {
                          const isActive = location.pathname === item.href;
                          const ItemIcon = item.icon;
                          
                          return (
                            <motion.div key={item.href} variants={itemVariants}>
                              <Link to={item.href}>
                                <motion.div
                                  whileHover={{ x: 4, backgroundColor: "rgba(139, 92, 246, 0.05)" }}
                                  whileTap={{ scale: 0.98 }}
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-lg transition-all duration-200",
                                    isActive 
                                      ? "bg-primary/10 text-primary border border-primary/20" 
                                      : "hover:bg-muted/50"
                                  )}
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <ItemIcon className={cn(
                                      "h-4 w-4 flex-shrink-0",
                                      isActive ? "text-primary" : "text-muted-foreground"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">
                                          {item.label}
                                        </span>
                                        {item.badge && (
                                          <Badge variant="outline" className="text-xs">
                                            {item.badge}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {item.description}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0 ml-2" />
                                </motion.div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        );
      })}

      {/* Quick Actions */}
      <motion.div variants={categoryVariants}>
        <Card className="bg-gradient-to-br from-primary/5 to-purple-50 border-primary/20">
          <CardContent className="p-4">
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-flex p-3 bg-primary/10 rounded-full mb-3"
              >
                <SettingsIcon className="h-6 w-6 text-primary" />
              </motion.div>
              <h3 className="font-semibold text-sm mb-1">Need Help?</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Our support team is here to help you get the most out of FitFusion
              </p>
              <Link to="/help">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-xs bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium"
                >
                  Contact Support
                </motion.button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

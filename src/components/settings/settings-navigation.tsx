
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Settings, 
  Shield, 
  Palette, 
  MessageSquare, 
  Download, 
  Code, 
  Database,
  Info,
  Sparkles
} from "lucide-react";

interface TabInfo {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: string;
  color: string;
}

interface SettingsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showMobileMenu: boolean;
  onMobileMenuToggle: () => void;
}

const tabs: TabInfo[] = [
  {
    id: "account",
    label: "Account",
    icon: Settings,
    description: "Personal info & preferences",
    color: "text-blue-600"
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Authentication & privacy",
    badge: "Enhanced",
    color: "text-green-600"
  },
  {
    id: "display",
    label: "Display",
    icon: Palette,
    description: "Theme & appearance",
    color: "text-purple-600"
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: Shield,
    description: "Data & permissions",
    color: "text-orange-600"
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    description: "Messaging preferences",
    badge: "AI",
    color: "text-pink-600"
  },
  {
    id: "updates",
    label: "Updates",
    icon: Download,
    description: "Version management",
    badge: "5.0.2",
    color: "text-indigo-600"
  },
  {
    id: "enhanced",
    label: "Enhanced",
    icon: Sparkles,
    description: "Advanced features",
    badge: "Pro",
    color: "text-yellow-600"
  },
  {
    id: "developer",
    label: "Developer",
    icon: Code,
    description: "Debug & testing",
    color: "text-red-600"
  },
  {
    id: "data",
    label: "Data",
    icon: Database,
    description: "Export & management",
    color: "text-cyan-600"
  },
  {
    id: "about",
    label: "About",
    icon: Info,
    description: "App information",
    color: "text-gray-600"
  }
];

export function SettingsNavigation({ activeTab, onTabChange, showMobileMenu, onMobileMenuToggle }: SettingsNavigationProps) {
  return (
    <>
      {/* Desktop Navigation */}
      <div className="border-b bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 hidden md:block">
        <div className="max-w-screen-xl mx-auto px-4">
          <ScrollArea className="w-full">
            <div className="flex items-center py-2 space-x-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                  <span className="font-medium">{tab.label}</span>
                  {tab.badge && (
                    <Badge 
                      variant={activeTab === tab.id ? "secondary" : "outline"} 
                      className="text-xs px-1.5 py-0.5"
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onMobileMenuToggle}
        >
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="bg-white dark:bg-gray-900 w-80 h-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
              <h2 className="font-semibold text-lg">Navigation</h2>
            </div>
            
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-4 space-y-1">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      activeTab === tab.id 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <tab.icon className={`h-5 w-5 ${
                        activeTab === tab.id ? 'text-white' : tab.color
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{tab.label}</div>
                      <div className={`text-xs ${
                        activeTab === tab.id ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                    {tab.badge && (
                      <Badge 
                        variant={activeTab === tab.id ? "secondary" : "outline"} 
                        className="text-xs"
                      >
                        {tab.badge}
                      </Badge>
                    )}
                  </motion.button>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

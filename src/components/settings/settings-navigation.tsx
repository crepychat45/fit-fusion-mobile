
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
  Sparkles,
  X
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

      {/* Mobile Navigation Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white dark:bg-gray-900 w-full max-w-sm h-full shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Settings</h2>
                  <p className="text-xs text-muted-foreground">Navigation</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onMobileMenuToggle}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Navigation Items */}
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-2">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 mb-1 ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 active:scale-95'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white/20 shadow-inner' 
                        : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200'
                    }`}>
                      <tab.icon className={`h-5 w-5 ${
                        activeTab === tab.id ? 'text-white' : tab.color
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${
                        activeTab === tab.id ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {tab.label}
                      </div>
                      <div className={`text-xs truncate ${
                        activeTab === tab.id ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                    {tab.badge && (
                      <Badge 
                        variant={activeTab === tab.id ? "secondary" : "outline"} 
                        className={`text-xs flex-shrink-0 ${
                          activeTab === tab.id 
                            ? 'bg-white/20 text-white border-white/30' 
                            : ''
                        }`}
                      >
                        {tab.badge}
                      </Badge>
                    )}
                  </motion.button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        </div>
      )}
    </>
  );
}

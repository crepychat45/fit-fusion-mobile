import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Bug,
  Shield,
  Zap,
  Heart,
  Brain,
  Smartphone,
  Download,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Rocket,
} from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  features: Array<{
    type: "new" | "improved" | "fixed" | "security";
    title: string;
    description: string;
    icon: any;
  }>;
}

const changelog: ChangelogEntry[] = [
  {
    version: "5.0.4",
    date: "January 23, 2025",
    type: "patch",
    features: [
      {
        type: "fixed",
        title: "Profile Tab Error Resolution",
        description: "Fixed critical error preventing profile tab from loading properly",
        icon: Bug,
      },
      {
        type: "improved",
        title: "Device Info Visibility",
        description: "Enhanced device information display with proper color contrast for better visibility",
        icon: Smartphone,
      },
      {
        type: "security",
        title: "Enhanced Error Handling",
        description: "Improved error recovery system with better user feedback and automatic retries",
        icon: Shield,
      },
      {
        type: "new",
        title: "Version Changelog",
        description: "Added comprehensive changelog system to track app updates and new features",
        icon: Info,
      },
    ],
  },
  {
    version: "5.0.3",
    date: "January 22, 2025",
    type: "minor",
    features: [
      {
        type: "new",
        title: "AI-Powered Insights",
        description: "Advanced machine learning algorithms provide personalized workout recommendations",
        icon: Brain,
      },
      {
        type: "improved",
        title: "Liquid Glass UI Design",
        description: "Stunning new interface with advanced glass morphism effects and animations",
        icon: Sparkles,
      },
      {
        type: "new",
        title: "Smart Notifications",
        description: "Intelligent notification system that adapts to your schedule and preferences",
        icon: Zap,
      },
      {
        type: "improved",
        title: "Enhanced Mobile Experience",
        description: "Optimized mobile interface with improved touch interactions and responsiveness",
        icon: Smartphone,
      },
    ],
  },
  {
    version: "5.0.2",
    date: "January 20, 2025",
    type: "patch",
    features: [
      {
        type: "fixed",
        title: "Performance Optimizations",
        description: "Resolved memory leaks and improved app loading times by 40%",
        icon: Rocket,
      },
      {
        type: "security",
        title: "Security Enhancements",
        description: "Updated authentication system with biometric support and enhanced encryption",
        icon: Shield,
      },
      {
        type: "improved",
        title: "Workout Tracking",
        description: "More accurate exercise detection and calorie calculations",
        icon: Heart,
      },
    ],
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "new":
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-200";
    case "improved":
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200";
    case "fixed":
      return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-200";
    case "security":
      return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200";
  }
};

const getVersionTypeColor = (type: string) => {
  switch (type) {
    case "major":
      return "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200";
    case "minor":
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200";
    case "patch":
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200";
  }
};

interface VersionChangelogProps {
  currentVersion?: string;
  showDialog?: boolean;
  onClose?: () => void;
}

export function VersionChangelog({ 
  currentVersion = "5.0.4", 
  showDialog = false, 
  onClose 
}: VersionChangelogProps) {
  const [isOpen, setIsOpen] = useState(showDialog);
  const [hasSeenVersion, setHasSeenVersion] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("fitfusion-last-seen-version");
    if (lastSeenVersion !== currentVersion) {
      setHasSeenVersion(false);
      // Auto-show changelog for new versions
      setTimeout(() => setIsOpen(true), 2000);
    } else {
      setHasSeenVersion(true);
    }
  }, [currentVersion]);

  const markVersionAsSeen = () => {
    localStorage.setItem("fitfusion-last-seen-version", currentVersion);
    setHasSeenVersion(true);
    setIsOpen(false);
    onClose?.();
  };

  const latestEntry = changelog[0];
  const isCurrentVersionLatest = latestEntry.version === currentVersion;

  return (
    <>
      {/* Changelog Trigger Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="relative">
            <Info className="h-4 w-4 mr-2" />
            What's New
            {!hasSeenVersion && isCurrentVersionLatest && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              What's New in FitFusion
              <Badge className={getVersionTypeColor(latestEntry.type)}>
                v{currentVersion}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {changelog.map((entry, index) => (
                <motion.div
                  key={entry.version}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${
                    entry.version === currentVersion 
                      ? "ring-2 ring-primary ring-offset-2 bg-primary/5" 
                      : ""
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">
                            Version {entry.version}
                          </CardTitle>
                          <Badge className={getVersionTypeColor(entry.type)}>
                            {entry.type}
                          </Badge>
                          {entry.version === currentVersion && (
                            <Badge className="bg-primary text-primary-foreground">
                              Current
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {entry.date}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {entry.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index * 0.1) + (featureIndex * 0.05) }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className={`p-2 rounded-lg ${getTypeColor(feature.type)}`}>
                            <feature.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">
                                {feature.title}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getTypeColor(feature.type)}`}
                              >
                                {feature.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>

                  {index < changelog.length - 1 && (
                    <div className="flex justify-center my-6">
                      <Separator className="w-1/2" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              You're running the latest version
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              {!hasSeenVersion && (
                <Button onClick={markVersionAsSeen}>
                  <Star className="h-4 w-4 mr-2" />
                  Got it!
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Hook for checking version updates
export function useVersionCheck() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("5.0.4");

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("fitfusion-last-seen-version");
    const latestVersion = changelog[0].version;
    
    setCurrentVersion(latestVersion);
    setHasUpdate(lastSeenVersion !== latestVersion);
  }, []);

  const markAsSeen = () => {
    localStorage.setItem("fitfusion-last-seen-version", currentVersion);
    setHasUpdate(false);
  };

  return {
    hasUpdate,
    currentVersion,
    markAsSeen,
  };
}
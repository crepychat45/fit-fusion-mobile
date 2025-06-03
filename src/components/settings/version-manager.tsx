
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Package, 
  Clock, 
  Zap,
  Shield,
  Sparkles,
  Info
} from "lucide-react";
import { useSettings } from "@/contexts/settings-context";
import { motion, AnimatePresence } from "framer-motion";

interface UpdateInfo {
  version: string;
  releaseDate: string;
  features: string[];
  improvements: string[];
  fixes: string[];
  size: string;
  priority: "low" | "medium" | "high" | "critical";
}

export function VersionManager() {
  const { toast } = useToast();
  const { appVersion, setAppVersion } = useSettings();
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);

  const currentVersion = appVersion;
  const latestVersion = "4.9.2";

  const updateInfo: UpdateInfo = {
    version: "4.9.2",
    releaseDate: "2025-01-03",
    features: [
      "Enhanced AI-powered workout recommendations",
      "Advanced biometric authentication",
      "Real-time group fitness challenges",
      "Smart nutrition tracking with barcode scanning",
      "Offline workout mode with sync"
    ],
    improvements: [
      "50% faster app startup time",
      "Improved battery optimization",
      "Enhanced security protocols",
      "Better accessibility features",
      "Smoother animations and transitions"
    ],
    fixes: [
      "Fixed workout timer synchronization issues",
      "Resolved chat notification bugs",
      "Fixed progress chart data accuracy",
      "Improved memory usage optimization",
      "Fixed dark mode theme inconsistencies"
    ],
    size: "12.8 MB",
    priority: "high"
  };

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    setIsChecking(true);
    setLastCheck(new Date());
    
    try {
      // Simulate checking for updates
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const needsUpdate = compareVersions(currentVersion, latestVersion) < 0;
      
      if (needsUpdate) {
        setAvailableUpdate(updateInfo);
        toast({
          title: "Update Available!",
          description: `FitFusion ${latestVersion} is ready to install.`,
        });
      } else {
        toast({
          title: "You're up to date!",
          description: "You have the latest version of FitFusion.",
        });
      }
    } catch (error) {
      toast({
        title: "Update check failed",
        description: "Unable to check for updates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const installUpdate = async () => {
    if (!availableUpdate) return;
    
    setIsUpdating(true);
    setUpdateProgress(0);
    
    try {
      // Simulate update process with realistic progress
      const stages = [
        { message: "Downloading update...", progress: 25 },
        { message: "Verifying package integrity...", progress: 50 },
        { message: "Installing new features...", progress: 75 },
        { message: "Finalizing installation...", progress: 90 },
        { message: "Update complete!", progress: 100 }
      ];
      
      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUpdateProgress(stage.progress);
        
        toast({
          title: stage.message,
          description: `${stage.progress}% complete`,
        });
      }
      
      // Update the version
      setAppVersion(availableUpdate.version);
      setAvailableUpdate(null);
      
      toast({
        title: "Update installed successfully!",
        description: `FitFusion has been updated to version ${availableUpdate.version}.`,
      });
      
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to install update. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
      setUpdateProgress(0);
    }
  };

  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-600";
      case "high": return "bg-orange-600";
      case "medium": return "bg-yellow-600";
      case "low": return "bg-green-600";
      default: return "bg-blue-600";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical": return AlertTriangle;
      case "high": return Zap;
      case "medium": return Package;
      case "low": return CheckCircle;
      default: return Info;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Version Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Version Information
              </CardTitle>
              <CardDescription>Current app version and update status</CardDescription>
            </div>
            <Badge variant="outline" className="text-lg font-mono px-4 py-2">
              v{currentVersion}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {lastCheck ? (
                `Last checked: ${lastCheck.toLocaleString()}`
              ) : (
                "Never checked for updates"
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkForUpdates}
              disabled={isChecking}
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Check for Updates
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Update Card */}
      <AnimatePresence>
        {availableUpdate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-orange-600" />
                      Update Available
                    </CardTitle>
                    <CardDescription>
                      FitFusion {availableUpdate.version} is ready to install
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="default" 
                      className={`${getPriorityColor(availableUpdate.priority)} text-white`}
                    >
                      {React.createElement(getPriorityIcon(availableUpdate.priority), { className: "h-3 w-3 mr-1" })}
                      {availableUpdate.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {availableUpdate.size}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isUpdating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Installing update...</span>
                      <span>{updateProgress}%</span>
                    </div>
                    <Progress value={updateProgress} className="h-2" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Released: {new Date(availableUpdate.releaseDate).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowChangelog(!showChangelog)}
                    >
                      {showChangelog ? "Hide" : "View"} Changelog
                    </Button>
                    <Button 
                      onClick={installUpdate}
                      disabled={isUpdating}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Install Update
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {showChangelog && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-green-600 flex items-center gap-1">
                            <Sparkles className="h-4 w-4" />
                            New Features
                          </h4>
                          <ul className="text-xs space-y-1">
                            {availableUpdate.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-blue-600 flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            Improvements
                          </h4>
                          <ul className="text-xs space-y-1">
                            {availableUpdate.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-orange-600 flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            Bug Fixes
                          </h4>
                          <ul className="text-xs space-y-1">
                            {availableUpdate.fixes.map((fix, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                {fix}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Update Preferences
          </CardTitle>
          <CardDescription>
            Configure how you receive and install updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Automatic updates ensure you always have the latest features and security improvements.
              Updates are installed during off-peak hours to minimize disruption.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium">Update Channel</h4>
              <p className="text-sm text-muted-foreground">
                Currently on: <strong>Stable</strong>
              </p>
              <Badge variant="outline" className="text-xs">Recommended</Badge>
            </div>
            
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium">Auto-Update</h4>
              <p className="text-sm text-muted-foreground">
                Status: <strong>Enabled</strong>
              </p>
              <Badge variant="default" className="text-xs bg-green-600">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

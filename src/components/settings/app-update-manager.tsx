
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Smartphone,
  Clock,
  FileText,
  Zap,
  Star,
  Shield,
  Gift
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface UpdateInfo {
  version: string;
  releaseDate: string;
  changelog: string[];
  size: string;
  mandatory: boolean;
  securityUpdate: boolean;
}

export function AppUpdateManager() {
  const { toast } = useToast();
  
  // Get current version from localStorage to sync with other components
  const [currentVersion, setCurrentVersion] = useState(() => {
    return localStorage.getItem('fitfusion-app-version') || "4.7.0";
  });
  
  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(() => {
    const stored = localStorage.getItem('fitfusion-last-update-check');
    return stored ? new Date(stored) : null;
  });
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(() => {
    const saved = localStorage.getItem('fitfusion-auto-update');
    return saved !== 'false';
  });

  // Mock update data with enhanced features
  const mockUpdate: UpdateInfo = {
    version: "4.9.2",
    releaseDate: "2024-06-03",
    changelog: [
      "🤖 Revolutionary AI-powered workout generation with machine learning",
      "🔒 Enhanced security features with end-to-end encryption and biometric auth",
      "💬 Advanced chat functionality with real-time messaging and file sharing",
      "🛡️ Comprehensive privacy controls and data management system",
      "⚡ Performance optimizations reducing load times by 40%",
      "🎨 Modern UI/UX redesign with accessibility improvements",
      "📱 Better mobile responsiveness and offline functionality",
      "🔧 Advanced developer tools and debugging options",
      "📊 Enhanced analytics and progress tracking features",
      "🌐 Multi-language support and localization improvements"
    ],
    size: "18.7 MB",
    mandatory: false,
    securityUpdate: true
  };

  // Listen for version updates from other components
  useEffect(() => {
    const handleVersionUpdate = (event: CustomEvent) => {
      setCurrentVersion(event.detail);
      // Check if we still have an update available
      if (event.detail === mockUpdate.version) {
        setAvailableUpdate(null);
      }
    };

    window.addEventListener('versionUpdated', handleVersionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('versionUpdated', handleVersionUpdate as EventListener);
    };
  }, [mockUpdate.version]);

  useEffect(() => {
    // Auto-check for updates on component mount
    if (autoUpdateEnabled) {
      checkForUpdates();
    }
    
    // Set up periodic checks every hour
    const interval = setInterval(() => {
      if (autoUpdateEnabled) {
        checkForUpdates(true); // Silent check
      }
    }, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, [autoUpdateEnabled]);

  const checkForUpdates = async (silent = false) => {
    setIsChecking(true);
    const now = new Date();
    setLastCheckTime(now);
    localStorage.setItem('fitfusion-last-update-check', now.toISOString());
    
    if (!silent) {
      toast({
        title: "🔍 Checking for updates",
        description: "Scanning for the latest version..."
      });
    }

    try {
      // Simulate API call with more realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Compare versions (simple string comparison for demo)
      const updateAvailable = currentVersion !== mockUpdate.version;
      
      if (updateAvailable) {
        setAvailableUpdate(mockUpdate);
        
        if (!silent) {
          toast({
            title: "🎉 Major Update Available!",
            description: `Version ${mockUpdate.version} includes exciting new features and security improvements.`,
          });
        }
      } else {
        setAvailableUpdate(null);
        
        if (!silent) {
          toast({
            title: "✅ You're up to date",
            description: "You have the latest version with all features.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "❌ Update check failed",
        description: "Unable to check for updates. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const downloadUpdate = async () => {
    if (!availableUpdate) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    toast({
      title: "📦 Downloading update",
      description: `Downloading version ${availableUpdate.version} (${availableUpdate.size})...`
    });

    try {
      // Simulate download with realistic progress steps
      const steps = [5, 15, 30, 45, 60, 75, 85, 95, 100];
      
      for (let step of steps) {
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
        setDownloadProgress(step);
        
        if (step === 50) {
          toast({
            title: "📥 Download progress",
            description: "Halfway there! Downloading security updates...",
          });
        }
      }
      
      toast({
        title: "✅ Download complete",
        description: "Update package verified and ready to install.",
      });
      
      // Auto-install after download
      setTimeout(() => installUpdate(), 1000);
    } catch (error) {
      toast({
        title: "❌ Download failed",
        description: "Unable to download update. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const installUpdate = async () => {
    if (!availableUpdate) return;
    
    setIsInstalling(true);
    
    toast({
      title: "⚙️ Installing update",
      description: "Installing new features and security improvements..."
    });

    try {
      // Simulate installation with status updates
      const installSteps = [
        "Preparing installation environment...",
        "Installing core updates...",
        "Updating security features...",
        "Configuring new features...",
        "Optimizing performance...",
        "Finalizing installation..."
      ];

      for (let i = 0; i < installSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        toast({
          title: installSteps[i],
          description: `Step ${i + 1} of ${installSteps.length}`,
        });
      }
      
      // Update version in localStorage and component state
      const newVersion = availableUpdate.version;
      setCurrentVersion(newVersion);
      localStorage.setItem('fitfusion-app-version', newVersion);
      localStorage.setItem('fitfusion-last-update', new Date().toISOString());
      
      // Clear the available update
      setAvailableUpdate(null);
      
      // Trigger version update event for other components
      window.dispatchEvent(new CustomEvent('versionUpdated', { detail: newVersion }));
      
      toast({
        title: "🎉 Update installed successfully!",
        description: `FitFusion has been updated to version ${newVersion} with all new features!`,
      });
      
      // Show success message with features
      setTimeout(() => {
        toast({
          title: "✨ Welcome to the new FitFusion!",
          description: "Explore the enhanced AI features, improved security, and better performance.",
        });
      }, 2000);
      
    } catch (error) {
      toast({
        title: "❌ Installation failed",
        description: "Unable to install update. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const toggleAutoUpdate = () => {
    const newValue = !autoUpdateEnabled;
    setAutoUpdateEnabled(newValue);
    localStorage.setItem('fitfusion-auto-update', newValue.toString());
    
    toast({
      title: newValue ? "🔄 Auto-update enabled" : "⏸️ Auto-update disabled",
      description: newValue 
        ? "The app will check for updates automatically every hour." 
        : "You'll need to check for updates manually."
    });
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        {availableUpdate && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 animate-pulse" />
        )}
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Update Center
          </CardTitle>
          <CardDescription>
            Keep FitFusion updated with the latest features, security improvements, and performance enhancements
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <div>
              <p className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Current Version
              </p>
              <p className="text-sm text-muted-foreground font-mono">v{currentVersion}</p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>

          {availableUpdate && (
            <Alert className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
              <Gift className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex items-center justify-between w-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <strong className="text-green-800 dark:text-green-200">
                      🎉 Major Update Available: v{availableUpdate.version}
                    </strong>
                    {availableUpdate.securityUpdate && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        <Shield className="h-3 w-3 mr-1" />
                        Security
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm mt-1 text-green-700 dark:text-green-300">
                    Released {new Date(availableUpdate.releaseDate).toLocaleDateString()} • {availableUpdate.size} • 
                    {availableUpdate.securityUpdate ? " Critical Security Update" : " Feature Update"}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowChangelog(true)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    What's New
                  </Button>
                  <Button 
                    size="sm"
                    onClick={downloadUpdate}
                    disabled={isDownloading || isInstalling}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {isDownloading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        Downloading {downloadProgress}%
                      </>
                    ) : isInstalling ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-1" />
                        Update Now
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isDownloading && (
            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
              <div className="flex justify-between text-sm font-medium">
                <span>📦 Downloading v{availableUpdate?.version}</span>
                <span>{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                {downloadProgress < 50 ? "Downloading core files..." : 
                 downloadProgress < 90 ? "Downloading security updates..." : "Verifying download..."}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                Automatic Updates
              </p>
              <p className="text-sm text-muted-foreground">
                Automatically check and notify about new updates
              </p>
            </div>
            <Button
              variant={autoUpdateEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleAutoUpdate}
              className={autoUpdateEnabled ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {autoUpdateEnabled ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Enabled
                </>
              ) : (
                "Enable"
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {lastCheckTime ? (
                <>
                  <Clock className="h-4 w-4" />
                  Last checked: {lastCheckTime.toLocaleTimeString()}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Never checked for updates
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => checkForUpdates()}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Check Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Changelog Dialog */}
      <Dialog open={showChangelog} onOpenChange={setShowChangelog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              What's New in v{availableUpdate?.version}
            </DialogTitle>
            <DialogDescription>
              Released on {availableUpdate && new Date(availableUpdate.releaseDate).toLocaleDateString()} • 
              Major update with {availableUpdate?.changelog.length} improvements
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {availableUpdate?.changelog.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowChangelog(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowChangelog(false);
                downloadUpdate();
              }}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Download className="h-4 w-4 mr-1" />
              Update to v{availableUpdate?.version}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

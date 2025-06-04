
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Clock,
  Info,
  Smartphone,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Changelog } from "./changelog";

interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  updateSize: string;
  releaseNotes: string[];
  downloadUrl: string;
  mandatory: boolean;
  lastChecked: Date;
}

export function AppUpdateManager() {
  const { toast } = useToast();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>(() => {
    const savedVersion = localStorage.getItem('fitfusion-app-version') || "4.9.1";
    return {
      currentVersion: savedVersion,
      latestVersion: "4.9.2",
      updateAvailable: savedVersion !== "4.9.2",
      updateSize: "12.4 MB",
      releaseNotes: [
        "Enhanced Profile tab with achievements and analytics",
        "Improved Settings UI with better navigation",
        "Fixed profile auto-save functionality",
        "Resolved version display issues",
        "Updated welcome message to show user name automatically"
      ],
      downloadUrl: "#",
      mandatory: false,
      lastChecked: new Date()
    };
  });
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [autoUpdate, setAutoUpdate] = useState(() => {
    const saved = localStorage.getItem('fitfusion-auto-update');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('fitfusion-auto-update', autoUpdate.toString());
  }, [autoUpdate]);

  useEffect(() => {
    // Check for updates on mount if auto-update is enabled
    if (autoUpdate && isOnline) {
      checkForUpdates();
    }
  }, [autoUpdate, isOnline]);

  // Listen for version update events
  useEffect(() => {
    const handleVersionUpdate = (event: CustomEvent) => {
      const newVersion = event.detail;
      setUpdateInfo(prev => ({
        ...prev,
        currentVersion: newVersion,
        updateAvailable: false
      }));
    };

    window.addEventListener('versionUpdated', handleVersionUpdate as EventListener);
    return () => {
      window.removeEventListener('versionUpdated', handleVersionUpdate as EventListener);
    };
  }, []);

  const checkForUpdates = async () => {
    if (!isOnline) {
      toast({
        title: "⚠️ No Internet Connection",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingUpdates(true);
    
    try {
      // Simulate API call to check for updates
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const now = new Date();
      const currentVersion = localStorage.getItem('fitfusion-app-version') || "4.9.1";
      const latestVersion = "4.9.2";
      
      setUpdateInfo(prev => ({
        ...prev,
        currentVersion,
        latestVersion,
        updateAvailable: currentVersion !== latestVersion,
        lastChecked: now
      }));

      if (currentVersion !== latestVersion) {
        toast({
          title: "🔄 Update Available",
          description: `Version ${latestVersion} is ready to download.`,
        });
      } else {
        toast({
          title: "✅ Up to Date",
          description: "You're running the latest version of the app.",
        });
      }
      
      console.log('Update check completed at:', now);
    } catch (error) {
      console.error('Update check failed:', error);
      toast({
        title: "❌ Update Check Failed",
        description: "Could not check for updates. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const downloadUpdate = async () => {
    if (!isOnline) {
      toast({
        title: "⚠️ No Internet Connection",
        description: "Internet connection required to download updates.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate installation
      toast({
        title: "📦 Installing Update",
        description: "Installing the latest version...",
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update version info and localStorage
      const newVersion = updateInfo.latestVersion;
      localStorage.setItem('fitfusion-app-version', newVersion);
      
      setUpdateInfo(prev => ({
        ...prev,
        currentVersion: newVersion,
        updateAvailable: false
      }));
      
      // Trigger version update event for other components
      window.dispatchEvent(new CustomEvent('versionUpdated', { 
        detail: newVersion 
      }));

      // Force a page refresh to ensure all components reflect the new version
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      toast({
        title: "🎉 Update Installed",
        description: `Successfully updated to version ${newVersion}! Refreshing app...`,
      });

      console.log('Update installed successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "❌ Download Failed",
        description: "Failed to download the update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const toggleAutoUpdate = () => {
    setAutoUpdate(!autoUpdate);
    toast({
      title: `Auto-Update ${!autoUpdate ? 'Enabled' : 'Disabled'}`,
      description: `Automatic updates have been ${!autoUpdate ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">App Updates</h3>
          <p className="text-sm text-muted-foreground">
            Manage app updates and view version history
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="updates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
        </TabsList>
        
        <TabsContent value="updates" className="space-y-4">
          {/* Current Version Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Current Version
                  </CardTitle>
                  <CardDescription>
                    You are running version {updateInfo.currentVersion}
                  </CardDescription>
                </div>
                
                {updateInfo.updateAvailable ? (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Update Available
                  </Badge>
                ) : (
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Up to Date
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Last checked: {updateInfo.lastChecked.toLocaleString()}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Auto-update</label>
                    <input
                      type="checkbox"
                      checked={autoUpdate}
                      onChange={toggleAutoUpdate}
                      className="rounded border-gray-300"
                    />
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={checkForUpdates}
                  disabled={isCheckingUpdates || !isOnline}
                >
                  {isCheckingUpdates ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check for Updates
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Update Available */}
          <AnimatePresence>
            {updateInfo.updateAvailable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <Download className="h-5 w-5" />
                      Update Available: v{updateInfo.latestVersion}
                    </CardTitle>
                    <CardDescription className="text-blue-600 dark:text-blue-400">
                      A new version is available with improvements and bug fixes
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {updateInfo.mandatory && (
                      <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          This is a mandatory security update and must be installed.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-medium">What's New:</h4>
                      <ul className="space-y-1 text-sm">
                        {updateInfo.releaseNotes.map((note, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Size: {updateInfo.updateSize}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          ~2 minutes
                        </span>
                      </div>
                      
                      <Button 
                        onClick={downloadUpdate}
                        disabled={isDownloading || !isOnline}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isDownloading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download Update
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Download Progress */}
                    <AnimatePresence>
                      {isDownloading && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span>Downloading update...</span>
                            <span>{downloadProgress}%</span>
                          </div>
                          <Progress value={downloadProgress} className="h-2" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Update Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Update Channel:</span>
                  <span className="ml-2 text-muted-foreground">Stable</span>
                </div>
                <div>
                  <span className="font-medium">Auto-update:</span>
                  <span className="ml-2 text-muted-foreground">
                    {autoUpdate ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Update Size:</span>
                  <span className="ml-2 text-muted-foreground">{updateInfo.updateSize}</span>
                </div>
                <div>
                  <span className="font-medium">Network:</span>
                  <span className="ml-2 text-muted-foreground">
                    {isOnline ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
              
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Updates are downloaded over WiFi to save data. Large updates may require a stable connection.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="changelog">
          <Changelog />
        </TabsContent>
      </Tabs>
    </div>
  );
}

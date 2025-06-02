
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
  Zap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface UpdateInfo {
  version: string;
  releaseDate: string;
  changelog: string[];
  size: string;
  mandatory: boolean;
}

export function AppUpdateManager() {
  const { toast } = useToast();
  const [currentVersion] = useState("4.7.0");
  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(() => {
    const saved = localStorage.getItem('fitfusion-auto-update');
    return saved !== 'false';
  });

  // Mock update data - in real app this would come from your update server
  const mockUpdate: UpdateInfo = {
    version: "4.8.0",
    releaseDate: "2024-06-03",
    changelog: [
      "Enhanced security features with end-to-end encryption",
      "New AI-powered workout recommendations",
      "Improved chat functionality with search and scroll",
      "Better privacy controls and data management",
      "Performance optimizations and bug fixes",
      "New developer tools and debugging options"
    ],
    size: "12.5 MB",
    mandatory: false
  };

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
    setLastCheckTime(new Date());
    
    if (!silent) {
      toast({
        title: "Checking for updates",
        description: "Looking for the latest version..."
      });
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Compare versions (in real app, use proper semantic versioning)
      const currentVersionNum = parseFloat(currentVersion.replace(/\./g, ''));
      const availableVersionNum = parseFloat(mockUpdate.version.replace(/\./g, ''));
      
      if (availableVersionNum > currentVersionNum) {
        setAvailableUpdate(mockUpdate);
        
        if (!silent) {
          toast({
            title: "Update Available!",
            description: `Version ${mockUpdate.version} is ready to download.`,
          });
        }
      } else {
        setAvailableUpdate(null);
        
        if (!silent) {
          toast({
            title: "You're up to date",
            description: "You have the latest version installed.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Update check failed",
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
      title: "Downloading update",
      description: `Downloading version ${availableUpdate.version}...`
    });

    try {
      // Simulate download with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setDownloadProgress(i);
      }
      
      toast({
        title: "Download complete",
        description: "Update ready to install.",
      });
      
      // Auto-install after download
      installUpdate();
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download update. Please try again.",
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
      title: "Installing update",
      description: "Installing new version. Please wait..."
    });

    try {
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update local version info
      localStorage.setItem('fitfusion-app-version', availableUpdate.version);
      localStorage.setItem('fitfusion-last-update', new Date().toISOString());
      
      // Clear the available update
      setAvailableUpdate(null);
      
      toast({
        title: "Update installed successfully!",
        description: `FitFusion has been updated to version ${availableUpdate.version}.`,
      });
      
      // In a real app, you might reload the page or restart the app
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Installation failed",
        description: "Unable to install update. Please try again.",
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
      title: newValue ? "Auto-update enabled" : "Auto-update disabled",
      description: newValue 
        ? "The app will check for updates automatically." 
        : "You'll need to check for updates manually."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Updates
          </CardTitle>
          <CardDescription>
            Keep your FitFusion app up to date with the latest features and security improvements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Current Version</p>
              <p className="text-sm text-muted-foreground">{currentVersion}</p>
            </div>
            <Badge variant="outline">Installed</Badge>
          </div>

          {availableUpdate && (
            <Alert className="border-primary/20 bg-primary/5">
              <Download className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between w-full">
                <div>
                  <strong>Update Available: v{availableUpdate.version}</strong>
                  <p className="text-sm mt-1">
                    Released {new Date(availableUpdate.releaseDate).toLocaleDateString()} • {availableUpdate.size}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowChangelog(true)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Changelog
                  </Button>
                  <Button 
                    size="sm"
                    onClick={downloadUpdate}
                    disabled={isDownloading || isInstalling}
                  >
                    {isDownloading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        Downloading...
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
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Downloading update...</span>
                <span>{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Automatic Updates</p>
              <p className="text-sm text-muted-foreground">
                Check for updates automatically in the background
              </p>
            </div>
            <Button
              variant={autoUpdateEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleAutoUpdate}
            >
              {autoUpdateEnabled ? (
                <>
                  <Zap className="h-4 w-4 mr-1" />
                  Enabled
                </>
              ) : (
                "Enable"
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {lastCheckTime ? (
                <>
                  <Clock className="h-4 w-4" />
                  Last checked: {lastCheckTime.toLocaleTimeString()}
                </>
              ) : (
                "Never checked for updates"
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

      {/* Changelog Dialog */}
      <Dialog open={showChangelog} onOpenChange={setShowChangelog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              What's New in v{availableUpdate?.version}
            </DialogTitle>
            <DialogDescription>
              Released on {availableUpdate && new Date(availableUpdate.releaseDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {availableUpdate?.changelog.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangelog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowChangelog(false);
              downloadUpdate();
            }}>
              <Download className="h-4 w-4 mr-1" />
              Update Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

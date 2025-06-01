
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Download, Calendar, Zap, Bug, Shield, RefreshCw, AlertTriangle, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    features?: string[];
    fixes?: string[];
    security?: string[];
    improvements?: string[];
  };
}

const mockChangelog: ChangelogEntry[] = [
  {
    version: "4.7.0",
    date: "2024-06-02",
    type: "minor",
    changes: {
      features: [
        "New integration framework for third-party services",
        "Enhanced chat authentication system",
        "Advanced settings validation and error handling",
        "Improved version management with auto-install"
      ],
      fixes: [
        "Fixed version update installation issues",
        "Resolved chat authentication errors",
        "Fixed settings tab validation problems",
        "Corrected app state persistence"
      ],
      security: [
        "Enhanced biometric authentication",
        "Improved session management",
        "Better error handling for auth flows"
      ],
      improvements: [
        "Better loading states across all components",
        "Optimized performance monitoring",
        "Enhanced user feedback systems"
      ]
    }
  },
  {
    version: "4.6.0",
    date: "2024-06-01",
    type: "minor",
    changes: {
      features: [
        "Enhanced security authentication flows",
        "Improved update mechanism with auto-detection",
        "New dashboard component organization"
      ],
      fixes: [
        "Fixed toast notification TypeScript errors",
        "Resolved mobile navigation alignment issues"
      ],
      improvements: [
        "Better error handling across all components",
        "Optimized loading states for better UX"
      ]
    }
  }
];

export function EnhancedVersionManager() {
  const { toast } = useToast();
  
  const [currentVersion, setCurrentVersion] = useState<string>("4.6.0");
  const [latestVersionAvailable, setLatestVersionAvailable] = useState<string>("4.7.0");
  const [updateAvailable, setUpdateAvailable] = useState(true);
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(false);
  
  useEffect(() => {
    // Auto-check for updates on component mount
    checkForUpdates();
    
    // Set up periodic update checking (every 30 minutes)
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const checkForUpdates = async () => {
    setIsCheckingUpdates(true);
    setUpdateError(null);
    
    try {
      // Simulate API call to check for updates
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLatestVersionAvailable("4.7.0");
      const hasUpdate = "4.7.0" !== currentVersion;
      setUpdateAvailable(hasUpdate);
      setLastChecked(new Date());
      
      if (hasUpdate) {
        toast({
          title: "Update Available",
          description: `Version ${latestVersionAvailable} is now available with new features and fixes!`,
        });
      } else {
        toast({
          title: "App Up to Date",
          description: "You're running the latest version of FitFusion",
        });
      }
    } catch (error) {
      setUpdateError("Failed to check for updates. Please try again.");
      toast({
        title: "Update Check Failed",
        description: "Unable to check for updates. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingUpdates(false);
    }
  };
  
  const updateVersion = async () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    setUpdateError(null);
    
    try {
      // Simulate download and installation
      const steps = [
        "Downloading update...",
        "Verifying integrity...",
        "Installing update...",
        "Updating configuration...",
        "Finalizing installation..."
      ];
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUpdateProgress((i + 1) * 20);
        
        toast({
          title: steps[i],
          description: `Progress: ${(i + 1) * 20}%`,
        });
      }
      
      // Simulate successful update
      setCurrentVersion(latestVersionAvailable);
      setUpdateAvailable(false);
      setUpdateProgress(100);
      
      // Store new version in localStorage to persist across sessions
      localStorage.setItem('app_version', latestVersionAvailable);
      
      toast({
        title: "Update Complete",
        description: `Successfully updated to version ${latestVersionAvailable}. App will refresh shortly.`,
      });
      
      // Simulate app refresh after update
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      setUpdateError("Update installation failed. Please try again.");
      toast({
        title: "Update Failed",
        description: "Failed to install update. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const forceUpdateCheck = async () => {
    setForceUpdate(true);
    await checkForUpdates();
    setForceUpdate(false);
  };
  
  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'features': return <Zap className="h-4 w-4 text-green-500" />;
      case 'fixes': return <Bug className="h-4 w-4 text-blue-500" />;
      case 'security': return <Shield className="h-4 w-4 text-red-500" />;
      case 'improvements': return <CheckCircle className="h-4 w-4 text-orange-500" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>App Version Management</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{currentVersion}</Badge>
            {updateAvailable && (
              <Badge variant="destructive" className="animate-pulse">
                Update Available
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>Manage application version, updates, and changelog</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {updateError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{updateError}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="updates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="changelog">Changelog</TabsTrigger>
            <TabsTrigger value="system">System Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="updates" className="space-y-4">
            {isUpdating ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Updating to {latestVersionAvailable}</span>
                  <span>{updateProgress}%</span>
                </div>
                <Progress value={updateProgress} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">
                  Please don't close the app during update...
                </p>
              </div>
            ) : updateAvailable ? (
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-lg">New Version Available</span>
                  <Badge variant="default" className="text-lg px-3 py-1">{latestVersionAvailable}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  A new version is available with bug fixes, new features, and security improvements.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Smartphone className="h-3 w-3" />
                  <span>Compatible with your current device</span>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Your application is up to date
                  </p>
                </div>
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                  Version {currentVersion} • Latest release
                </p>
              </div>
            )}
            
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : 'Never checked'}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={forceUpdateCheck}
                  disabled={isCheckingUpdates || forceUpdate}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${(isCheckingUpdates || forceUpdate) ? 'animate-spin' : ''}`} />
                  {isCheckingUpdates || forceUpdate ? "Checking..." : "Check Now"}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="changelog" className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-4">
              {mockChangelog.map((entry, index) => (
                <div key={entry.version} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.version === latestVersionAvailable ? "default" : "outline"}>
                        v{entry.version}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {entry.date}
                      </span>
                      {entry.version === currentVersion && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(entry.changes).map(([type, items]) => (
                      items && items.length > 0 && (
                        <div key={type}>
                          <div className="flex items-center gap-2 mb-1">
                            {getChangeIcon(type)}
                            <span className="text-sm font-medium capitalize">{type}</span>
                          </div>
                          <ul className="text-xs text-muted-foreground ml-6 space-y-1">
                            {items.map((item, itemIndex) => (
                              <li key={itemIndex}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    ))}
                  </div>
                  
                  {index < mockChangelog.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium">Current Version</p>
                <p className="text-muted-foreground">{currentVersion}</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Latest Available</p>
                <p className="text-muted-foreground">{latestVersionAvailable}</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Update Channel</p>
                <p className="text-muted-foreground">Stable</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Auto-Updates</p>
                <p className="text-muted-foreground">Enabled</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {updateAvailable && !isUpdating && (
        <CardFooter className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={updateVersion}
            disabled={isUpdating}
          >
            <Download className="h-4 w-4 mr-2" />
            Install Update
          </Button>
          <Button 
            variant="outline"
            onClick={checkForUpdates}
            disabled={isCheckingUpdates}
          >
            <RefreshCw className={`h-4 w-4 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

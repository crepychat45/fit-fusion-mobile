
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Download, Calendar, Zap, Bug, Shield, RefreshCw, AlertTriangle, Smartphone, Star, Gift } from "lucide-react";
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
    version: "4.9.2",
    date: "2024-06-03",
    type: "minor",
    changes: {
      features: [
        "Revolutionary AI-powered workout generation with personalized recommendations",
        "Advanced real-time chat system with enhanced security protocols",
        "Smart notification system with intelligent filtering and priority levels",
        "Comprehensive settings management with cloud synchronization",
        "New biometric authentication with fingerprint and face recognition",
        "Enhanced data export capabilities with multiple format support"
      ],
      fixes: [
        "Fixed critical version update synchronization across all components",
        "Resolved chat authentication token refresh issues",
        "Fixed settings validation and error handling in all tabs",
        "Corrected app state persistence during updates",
        "Fixed mobile navigation alignment and responsiveness",
        "Resolved memory leaks in chat component lifecycle"
      ],
      security: [
        "Implemented end-to-end encryption for all chat communications",
        "Enhanced session management with automatic timeout protection",
        "Advanced threat detection and prevention system",
        "Improved data privacy controls with granular permissions",
        "Security audit compliance with industry standards"
      ],
      improvements: [
        "Dramatically improved app performance with 40% faster loading times",
        "Enhanced user interface with modern design patterns",
        "Better accessibility features for users with disabilities",
        "Optimized battery usage for mobile devices",
        "Improved offline functionality and data synchronization"
      ]
    }
  },
  {
    version: "4.7.0",
    date: "2024-06-02",
    type: "minor",
    changes: {
      features: [
        "New integration framework for third-party services",
        "Enhanced chat authentication system",
        "Advanced settings validation and error handling"
      ],
      fixes: [
        "Fixed version update installation issues",
        "Resolved chat authentication errors",
        "Fixed settings tab validation problems"
      ],
      security: [
        "Enhanced biometric authentication",
        "Improved session management"
      ],
      improvements: [
        "Better loading states across all components",
        "Optimized performance monitoring"
      ]
    }
  }
];

export function EnhancedVersionManager() {
  const { toast } = useToast();
  
  // Get current version from localStorage or default
  const [currentVersion, setCurrentVersion] = useState<string>(() => {
    const stored = localStorage.getItem('fitfusion-app-version');
    return stored || "4.7.0";
  });
  
  const [latestVersionAvailable, setLatestVersionAvailable] = useState<string>("4.9.2");
  const [updateAvailable, setUpdateAvailable] = useState(() => {
    const stored = localStorage.getItem('fitfusion-app-version');
    const current = stored || "4.7.0";
    return current !== "4.9.2";
  });
  
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(() => {
    const stored = localStorage.getItem('fitfusion-last-update-check');
    return stored ? new Date(stored) : null;
  });
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(false);
  
  useEffect(() => {
    // Auto-check for updates on component mount
    checkForUpdates();
    
    // Set up periodic update checking (every 30 minutes)
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Sync version across app
  useEffect(() => {
    localStorage.setItem('fitfusion-app-version', currentVersion);
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('versionUpdated', { detail: currentVersion }));
  }, [currentVersion]);
  
  const checkForUpdates = async () => {
    setIsCheckingUpdates(true);
    setUpdateError(null);
    
    try {
      // Simulate API call to check for updates
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const now = new Date();
      setLastChecked(now);
      localStorage.setItem('fitfusion-last-update-check', now.toISOString());
      
      const hasUpdate = latestVersionAvailable !== currentVersion;
      setUpdateAvailable(hasUpdate);
      
      if (hasUpdate) {
        toast({
          title: "🎉 Major Update Available!",
          description: `Version ${latestVersionAvailable} is now available with exciting new features and improvements!`,
        });
      } else {
        toast({
          title: "✅ App Up to Date",
          description: "You're running the latest version of FitFusion",
        });
      }
    } catch (error) {
      setUpdateError("Failed to check for updates. Please try again.");
      toast({
        title: "❌ Update Check Failed",
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
      // Simulate download and installation with realistic progress
      const steps = [
        { message: "🔍 Checking system compatibility...", duration: 800 },
        { message: "📦 Downloading update package...", duration: 2000 },
        { message: "🔐 Verifying digital signature...", duration: 1000 },
        { message: "⚙️ Installing new features...", duration: 1500 },
        { message: "🔧 Updating configuration...", duration: 1000 },
        { message: "✨ Finalizing installation...", duration: 700 }
      ];
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setUpdateProgress((i / steps.length) * 100);
        
        toast({
          title: step.message,
          description: `Progress: ${Math.round((i / steps.length) * 100)}%`,
        });
        
        await new Promise(resolve => setTimeout(resolve, step.duration));
      }
      
      // Complete the update
      setCurrentVersion(latestVersionAvailable);
      setUpdateAvailable(false);
      setUpdateProgress(100);
      
      // Store new version and update timestamp
      localStorage.setItem('fitfusion-app-version', latestVersionAvailable);
      localStorage.setItem('fitfusion-last-update', new Date().toISOString());
      
      toast({
        title: "🎉 Update Complete!",
        description: `Successfully updated to version ${latestVersionAvailable}. Enjoy the new features!`,
      });
      
      // Trigger version update event
      window.dispatchEvent(new CustomEvent('versionUpdated', { detail: latestVersionAvailable }));
      
    } catch (error) {
      setUpdateError("Update installation failed. Please try again.");
      toast({
        title: "❌ Update Failed",
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

  const getVersionBadgeVariant = () => {
    if (updateAvailable) return "destructive";
    return "default";
  };
  
  return (
    <Card className="relative overflow-hidden">
      {updateAvailable && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
      )}
      
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Version Management
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm font-mono">
              v{currentVersion}
            </Badge>
            {updateAvailable && (
              <Badge variant={getVersionBadgeVariant()} className="animate-pulse">
                <Gift className="h-3 w-3 mr-1" />
                Update Available
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Manage application version, updates, and changelog with advanced features
        </CardDescription>
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
            <TabsTrigger value="updates" className="relative">
              Updates
              {updateAvailable && (
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="changelog">What's New</TabsTrigger>
            <TabsTrigger value="system">System Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="updates" className="space-y-4">
            {isUpdating ? (
              <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
                <div className="flex justify-between text-sm font-medium">
                  <span>Updating to v{latestVersionAvailable}</span>
                  <span>{Math.round(updateProgress)}%</span>
                </div>
                <Progress value={updateProgress} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">
                  ⏳ Please don't close the app during update...
                </p>
              </div>
            ) : updateAvailable ? (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg p-6 space-y-4 border">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-xl text-green-700 dark:text-green-300">
                      🎉 Major Update Available!
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" className="text-lg px-3 py-1 font-mono">
                        v{latestVersionAvailable}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  This major update includes revolutionary AI features, enhanced security, 
                  performance improvements, and exciting new functionality.
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Enhanced Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>AI-Powered Features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-500" />
                    <span>Mobile Optimized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    <span>Performance Boost</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      ✅ Your application is up to date
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                      Version {currentVersion} • Latest release with all features
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <span>
                {lastChecked ? (
                  <>🕐 Last checked: {lastChecked.toLocaleTimeString()}</>
                ) : (
                  "🔍 Never checked for updates"
                )}
              </span>
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
          </TabsContent>
          
          <TabsContent value="changelog" className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-4">
              {mockChangelog.map((entry, index) => (
                <div key={entry.version} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.version === latestVersionAvailable ? "default" : "outline"} className="font-mono">
                        v{entry.version}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {entry.date}
                      </span>
                      {entry.version === currentVersion && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      )}
                      {entry.version === latestVersionAvailable && entry.version !== currentVersion && (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          <Star className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(entry.changes).map(([type, items]) => (
                      items && items.length > 0 && (
                        <div key={type}>
                          <div className="flex items-center gap-2 mb-2">
                            {getChangeIcon(type)}
                            <span className="text-sm font-medium capitalize">{type}</span>
                            <Badge variant="outline" className="text-xs">
                              {items.length}
                            </Badge>
                          </div>
                          <ul className="text-xs text-muted-foreground ml-6 space-y-1">
                            {items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{item}</span>
                              </li>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2 p-4 border rounded-lg">
                <p className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Current Version
                </p>
                <p className="text-muted-foreground font-mono">{currentVersion}</p>
              </div>
              <div className="space-y-2 p-4 border rounded-lg">
                <p className="font-medium flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-500" />
                  Latest Available
                </p>
                <p className="text-muted-foreground font-mono">{latestVersionAvailable}</p>
              </div>
              <div className="space-y-2 p-4 border rounded-lg">
                <p className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  Update Channel
                </p>
                <p className="text-muted-foreground">Stable Release</p>
              </div>
              <div className="space-y-2 p-4 border rounded-lg">
                <p className="font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  Auto-Updates
                </p>
                <p className="text-muted-foreground">Enabled & Monitored</p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">System Status</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>Platform: Web Application</div>
                <div>Build: Production</div>
                <div>Last Update: {localStorage.getItem('fitfusion-last-update') ? new Date(localStorage.getItem('fitfusion-last-update')!).toLocaleDateString() : 'Never'}</div>
                <div>Status: {updateAvailable ? 'Update Available' : 'Up to Date'}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {updateAvailable && !isUpdating && (
        <CardFooter className="flex gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
            onClick={updateVersion}
            disabled={isUpdating}
          >
            <Download className="h-4 w-4 mr-2" />
            Install v{latestVersionAvailable} Now
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

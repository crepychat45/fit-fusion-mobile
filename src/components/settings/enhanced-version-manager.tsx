
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Download, Calendar, Zap, Bug, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  },
  {
    version: "4.5.0",
    date: "2024-05-15",
    type: "minor",
    changes: {
      features: [
        "FitFusion Chat integration",
        "Enhanced profile management"
      ],
      fixes: [
        "Fixed workout timer accuracy",
        "Resolved calendar date selection"
      ]
    }
  }
];

export function EnhancedVersionManager() {
  const { toast } = useToast();
  
  const currentVersionValue = "4.5.0" as string;
  const latestVersionValue = "4.6.0" as string;
  
  const [currentVersion] = useState<string>(currentVersionValue);
  const [latestVersionAvailable, setLatestVersionAvailable] = useState<string>(currentVersionValue);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  useEffect(() => {
    checkForUpdates();
  }, []);
  
  const checkForUpdates = async () => {
    setIsCheckingUpdates(true);
    
    // Simulate API call to check for updates
    setTimeout(() => {
      setLatestVersionAvailable(latestVersionValue);
      setUpdateAvailable(latestVersionValue !== currentVersionValue);
      setLastChecked(new Date());
      setIsCheckingUpdates(false);
      
      if (latestVersionValue !== currentVersionValue) {
        toast({
          title: "Update Available",
          description: `Version ${latestVersionValue} is now available!`,
        });
      }
    }, 2000);
  };
  
  const updateVersion = () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    
    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        const newProgress = prev + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUpdating(false);
          setUpdateAvailable(false);
          
          toast({
            title: "Update Complete",
            description: `Successfully updated to version ${latestVersionValue}`,
          });
          return 100;
        }
        
        return newProgress;
      });
    }, 500);
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
          <span>App Version</span>
          <Badge variant="outline">{currentVersion}</Badge>
        </CardTitle>
        <CardDescription>Manage application version and updates</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="updates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="changelog">Changelog</TabsTrigger>
          </TabsList>
          
          <TabsContent value="updates" className="space-y-4">
            {isUpdating ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Updating to {latestVersionAvailable}</span>
                  <span>{updateProgress}%</span>
                </div>
                <Progress value={updateProgress} />
              </div>
            ) : updateAvailable ? (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">New Version Available</span>
                  <Badge>{latestVersionAvailable}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  A new version is available with bug fixes and new features.
                </p>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Your application is up to date.
                </p>
              </div>
            )}
            
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : 'Never checked'}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={checkForUpdates}
                disabled={isCheckingUpdates}
              >
                {isCheckingUpdates ? "Checking..." : "Check Now"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="changelog" className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-4">
              {mockChangelog.map((entry, index) => (
                <div key={entry.version} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.version === latestVersionValue ? "default" : "outline"}>
                        v{entry.version}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {entry.date}
                      </span>
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
        </Tabs>
      </CardContent>
      
      {updateAvailable && !isUpdating && (
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={updateVersion}
          >
            <Download className="h-4 w-4 mr-2" />
            Update Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

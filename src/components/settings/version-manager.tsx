
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function VersionManager() {
  const { toast } = useToast();
  
  // Define versions with proper typing to avoid comparison issues
  const currentVersionValue = "4.5.0";
  const latestVersionValue = "4.6.0";
  
  const [currentVersion] = useState<string>(currentVersionValue);
  const [latestVersionAvailable, setLatestVersionAvailable] = useState<string>(currentVersionValue);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    // Simulate checking for updates
    setTimeout(() => {
      setLatestVersionAvailable(latestVersionValue);
      // Compare versions properly
      setUpdateAvailable(latestVersionValue !== currentVersionValue);
    }, 2000);
  }, []);
  
  const updateVersion = () => {
    setIsUpdating(true);
    
    // Simulate update progress
    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        const newProgress = prev + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUpdating(false);
          setLatestVersionAvailable(latestVersionValue);
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
      </CardContent>
      
      {updateAvailable && !isUpdating && (
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={updateVersion}
          >
            Update Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

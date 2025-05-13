
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { RefreshCcw } from "lucide-react";

export function VersionManager() {
  const { toast } = useToast();
  // Define versions as regular strings, not literal types
  const currentVersion = "4.5.0";
  const latestVersion = "4.6.0";
  const [latestVersionAvailable, setLatestVersion] = useState(currentVersion);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    // Simulate checking for updates
    setTimeout(() => {
      setLatestVersion(latestVersion);
      // Compare the string values explicitly
      setUpdateAvailable(latestVersion !== currentVersion);
    }, 2000);
  }, []);
  
  const updateVersion = () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    
    // Using a variable for progress tracking to avoid type issues
    let progress = 0;
    const timer = setInterval(() => {
      progress += 10;
      
      // Update state with the new progress value
      setUpdateProgress(progress);
      
      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setIsUpdating(false);
          // Update to latest version after successful update
          setLatestVersion(latestVersion);
          setUpdateAvailable(false);
          toast({
            title: "Update Complete",
            description: `Successfully updated to version ${latestVersion}`,
          });
        }, 500);
      }
    }, 500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Version Information</CardTitle>
        <CardDescription>Stay up-to-date with the latest features and improvements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Current Version</p>
            <p className="text-sm text-muted-foreground">{currentVersion}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Latest Version</p>
            <p className="text-sm text-muted-foreground">{latestVersionAvailable}</p>
          </div>
        </div>
        
        {updateAvailable ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Update Available</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={updateVersion} 
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    Updating...
                    <RefreshCcw className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Update Now"
                )}
              </Button>
            </div>
            {isUpdating && (
              <Progress value={updateProgress} />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            You are up to date!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

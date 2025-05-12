import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertTriangle, CheckCircle, Clock, Info, 
  RefreshCcw, Download, Check, ArrowUpRight
} from "lucide-react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { ChatVersion, VersionChange } from "@/types/chat";

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

interface VersionManagerProps {
  initialVersion?: ChatVersion;
}

export function VersionManager({ initialVersion }: VersionManagerProps) {
  const { toast } = useToast();
  const [versionInfo, setVersionInfo] = useState<ChatVersion>(initialVersion || {
    current: '4.5.0',
    latest: '4.5.0',
    updateAvailable: false,
    lastChecked: new Date(),
    isCheckingUpdate: false,
    updateProgress: 0,
    updateCompleted: false,
    updateInstalled: false,
    updateStatus: 'not_started',
    changelog: [
      {
        version: '4.5.0',
        date: new Date('2025-05-01'),
        changes: [
          'Enhanced mobile layouts and responsive design',
          'Fixed dark mode issues across all screens',
          'Improved chat security with end-to-end encryption',
          'Added version checking with interactive animations',
          'Performance optimizations for better speed',
          'Bug fixes related to notifications'
        ],
        isSecurityUpdate: true,
        requiresRestart: false
      },
      {
        version: '4.4.0',
        date: new Date('2025-04-15'),
        changes: [
          'Added group chat capabilities',
          'Improved attachment handling',
          'Enhanced user profiles',
          'Fixed several UI bugs in dark mode'
        ],
        isSecurityUpdate: false,
        requiresRestart: true
      },
      {
        version: '4.3.5',
        date: new Date('2025-03-28'),
        changes: [
          'Security patch for message encryption',
          'Performance improvements for large chats',
          'Fixed message delivery status indicators'
        ],
        isSecurityUpdate: true,
        requiresRestart: false
      }
    ]
  });

  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showFullChangelog, setShowFullChangelog] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [changelogDialogOpen, setChangelogDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<VersionChange | null>(null);

  // Load version info from localStorage
  useEffect(() => {
    const savedVersionInfo = localStorage.getItem('chat-version-info');
    if (savedVersionInfo) {
      try {
        const parsedInfo = JSON.parse(savedVersionInfo);
        // Convert string dates back to Date objects
        if (parsedInfo.lastChecked) {
          parsedInfo.lastChecked = new Date(parsedInfo.lastChecked);
        }
        if (parsedInfo.installationDate) {
          parsedInfo.installationDate = new Date(parsedInfo.installationDate);
        }
        if (parsedInfo.changelog) {
          parsedInfo.changelog = parsedInfo.changelog.map((change: any) => ({
            ...change,
            date: new Date(change.date)
          }));
        }
        setVersionInfo(parsedInfo);
      } catch (error) {
        console.error("Error parsing version info:", error);
      }
    }
  }, []);

  // Save version info to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chat-version-info', JSON.stringify(versionInfo));
  }, [versionInfo]);

  const checkForUpdates = () => {
    setIsCheckingUpdate(true);
    setVersionInfo(prev => ({...prev, isCheckingUpdate: true}));
    
    toast({
      title: "Checking for updates...",
      description: "Please wait while we check for the latest version.",
    });
    
    // Simulate a server call to check for updates
    setTimeout(() => {
      const newVersion = '4.6.0'; // Always have a newer version available
      const currentDate = new Date();
      
      // Add a new version to the changelog
      const newChangelog: VersionChange = {
        version: newVersion,
        date: currentDate,
        changes: [
          'Improved user interface for chat settings',
          'Enhanced security features for message encryption',
          'Fixed bugs in version management system',
          'Added support for biometric authentication',
          'Improved performance for large chat histories'
        ],
        isSecurityUpdate: true,
        requiresRestart: false
      };
      
      setVersionInfo(prev => {
        // Only add the new changelog if it doesn't already exist
        const existingChangelog = prev.changelog?.find(c => c.version === newVersion);
        const updatedChangelog = existingChangelog 
          ? prev.changelog 
          : [newChangelog, ...(prev.changelog || [])];
          
        return {
          ...prev,
          isCheckingUpdate: false,
          current: prev.current,
          latest: newVersion,
          updateAvailable: prev.current !== newVersion,
          releaseNotes: newChangelog.changes.join('. '),
          lastChecked: currentDate,
          updateStatus: 'not_started',
          changelog: updatedChangelog
        };
      });
      
      setIsCheckingUpdate(false);
      
      toast({
        title: "Update available",
        description: `Version ${newVersion} is now available with new features and improvements.`,
        variant: "default",
      });
    }, 2000);
  };

  const installUpdate = () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    setVersionInfo(prev => ({
      ...prev, 
      updateProgress: 0, 
      updateStatus: 'downloading'
    }));
    
    toast({
      title: "Installing update",
      description: `Starting download of version ${versionInfo.latest}...`,
    });
    
    // Simulate update progress
    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        const newProgress = prev + 10;
        setVersionInfo(currentInfo => ({
          ...currentInfo, 
          updateProgress: newProgress,
          updateStatus: newProgress < 50 ? 'downloading' : 'installing'
        }));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUpdating(false);
          setUpdateSuccess(true);
          
          // Important: Update the current version to match the latest version
          setVersionInfo(currentInfo => ({
            ...currentInfo, 
            updateProgress: 100,
            updateCompleted: true,
            current: currentInfo.latest || currentInfo.current,
            updateAvailable: false,
            lastChecked: new Date(),
            updateStatus: 'completed',
            updateInstalled: true,
            installationDate: new Date()
          }));
          
          toast({
            title: "Update complete",
            description: `FitFusion Chat has been updated to version ${versionInfo.latest}.`,
            variant: "default", 
          });

          // Reset update success message after 3 seconds
          setTimeout(() => {
            setUpdateSuccess(false);
            setVersionInfo(currentInfo => ({
              ...currentInfo, 
              updateCompleted: false, 
              updateProgress: 0
            }));
          }, 3000);
          
          return newProgress;
        }
        
        // Show progress toasts at specific intervals
        if (newProgress === 30) {
          toast({
            title: "Download progress: 30%",
            description: "Downloading update files...",
          });
        } else if (newProgress === 60) {
          toast({
            title: "Installing: 60%",
            description: "Preparing to install...",
          });
        } else if (newProgress === 90) {
          toast({
            title: "Installing: 90%",
            description: "Almost done...",
          });
        }
        
        return newProgress;
      });
    }, 500);
  };

  const handleViewChangelog = () => {
    setShowChangelog(!showChangelog);
  };
  
  const handleToggleFullChangelog = () => {
    setShowFullChangelog(!showFullChangelog);
  };
  
  const openChangelogDetails = (version: VersionChange) => {
    setSelectedVersion(version);
    setChangelogDialogOpen(true);
  };
  
  const setUpdateProgress = (value: number) => {
    setVersionInfo(prev => ({...prev, updateProgress: value}));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">Current version</h4>
          <p className="text-sm text-muted-foreground flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1 inline" />
            Last checked: {versionInfo.lastChecked.toLocaleDateString()} {versionInfo.lastChecked.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
          {versionInfo.updateInstalled && versionInfo.installationDate && (
            <p className="text-xs text-green-600 flex items-center mt-1">
              <CheckCircle className="h-3 w-3 mr-1 inline" />
              Installed: {versionInfo.installationDate.toLocaleDateString()} {versionInfo.installationDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "h-6 transition-all duration-300", 
              updateSuccess ? "bg-green-100 text-green-800" : "",
              versionInfo.updateAvailable ? "bg-amber-100 text-amber-800" : ""
            )}
          >
            v{versionInfo.current}
            {updateSuccess && <CheckCircle className="h-3 w-3 ml-1 text-green-600" />}
            {versionInfo.updateAvailable && !updateSuccess && <AlertTriangle className="h-3 w-3 ml-1 text-amber-600" />}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkForUpdates} 
            disabled={isCheckingUpdate || isUpdating}
            className="gap-2"
          >
            {isCheckingUpdate ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4" />
                Check for updates
              </>
            )}
          </Button>
        </div>
      </div>
      
      {versionInfo.updateAvailable && (
        <div className="mt-4 bg-muted/50 p-3 rounded-md border border-amber-200 animate-fade-in">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
              <span className="font-medium">Update available: v{versionInfo.latest}</span>
            </div>
            {isUpdating ? (
              <span className="text-xs text-muted-foreground">{versionInfo.updateProgress}%</span>
            ) : (
              <Button 
                size="sm"
                onClick={installUpdate}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Install
              </Button>
            )}
          </div>
          
          {isUpdating && (
            <div className="mt-2">
              <Progress value={versionInfo.updateProgress} className="h-2" />
              <p className="text-xs text-center mt-1">
                {versionInfo.updateStatus === 'downloading' 
                  ? 'Downloading update...' 
                  : 'Installing update...'}
              </p>
            </div>
          )}
          
          {!isUpdating && (
            <div className="mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs p-0 h-auto underline"
                onClick={handleViewChangelog}
              >
                {showChangelog ? "Hide changelog" : "View changelog"}
              </Button>
              
              {showChangelog && versionInfo.releaseNotes && (
                <div className="mt-2 text-sm bg-background/80 p-2 rounded border animate-fade-in">
                  <p className="font-medium text-xs mb-1">What's new in v{versionInfo.latest}:</p>
                  <p className="text-xs">{versionInfo.releaseNotes}</p>
                </div>
              )}
            </div>
          )}
          
          {versionInfo.updateProgress === 100 && (
            <div className="mt-2 flex items-center text-green-500 animate-fade-in">
              <Check className="h-4 w-4 mr-1" />
              <span className="text-sm">Update completed! Restarting...</span>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Version History</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-8"
            onClick={handleToggleFullChangelog}
          >
            {showFullChangelog ? "Show Less" : "Show All"}
          </Button>
        </div>
        
        <div className="space-y-3 text-sm bg-muted/50 p-3 rounded border">
          {versionInfo.changelog?.slice(0, showFullChangelog ? undefined : 2).map((version, index) => (
            <div key={index} className={index > 0 ? "pt-3 border-t" : ""}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className={version.isSecurityUpdate ? "bg-green-100 text-green-800" : ""}>
                    v{version.version}
                  </Badge>
                  {version.isSecurityUpdate && (
                    <Badge variant="secondary" className="text-[10px] h-5">Security Update</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {version.date.toLocaleDateString()}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => openChangelogDetails(version)}
                  >
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <ul className="space-y-1 list-disc list-inside text-xs ml-1">
                {version.changes.slice(0, 3).map((change, changeIndex) => (
                  <li key={changeIndex}>{change}</li>
                ))}
                {version.changes.length > 3 && (
                  <li className="text-primary cursor-pointer" onClick={() => openChangelogDetails(version)}>
                    + {version.changes.length - 3} more changes...
                  </li>
                )}
              </ul>
              
              {version.requiresRestart && (
                <p className="text-xs text-amber-600 mt-1 flex items-center">
                  <Info className="h-3.5 w-3.5 mr-1" />
                  This update requires app restart
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <Dialog 
        open={changelogDialogOpen} 
        onOpenChange={setChangelogDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Version {selectedVersion?.version}
              {selectedVersion?.isSecurityUpdate && (
                <Badge variant="outline" className="bg-green-100 text-green-800">Security Update</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Released on {selectedVersion?.date.toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <h3 className="font-medium">Changelog:</h3>
            <ul className="space-y-2 list-disc list-inside">
              {selectedVersion?.changes.map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
            
            {selectedVersion?.requiresRestart && (
              <div className="bg-amber-50 border border-amber-200 rounded p-2 text-sm flex items-start">
                <Info className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                <p>This update requires a restart of the application to take effect.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

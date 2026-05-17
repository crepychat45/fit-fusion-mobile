import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Copy,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BackupData {
  timestamp: number;
  version: string;
  size: number;
  hash: string;
  includes: string[];
}

export function SettingsBackupRestore() {
  const { toast } = useToast();
  const [backups, setBackups] = useState<BackupData[]>(() => {
    const saved = localStorage.getItem("settings-backups");
    return saved ? JSON.parse(saved) : [];
  });

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [selectedBackup, setSelectedBackup] = useState<BackupData | null>(null);

  const createBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    try {
      // Simulate backup creation
      const stages = [
        { message: "Collecting settings...", progress: 20 },
        { message: "Compressing data...", progress: 50 },
        { message: "Creating checksum...", progress: 80 },
        { message: "Finalizing backup...", progress: 100 },
      ];

      for (const stage of stages) {
        setBackupProgress(stage.progress);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Get all settings from localStorage
      const settingsToBackup = {
        account: localStorage.getItem("account-settings"),
        display: localStorage.getItem("display-settings"),
        privacy: localStorage.getItem("privacy-settings"),
        notifications: localStorage.getItem("notification-settings"),
        units: localStorage.getItem("unit-preferences"),
        app: localStorage.getItem("app-settings"),
        chat: localStorage.getItem("chat-settings"),
        theme: localStorage.getItem("theme-preference"),
      };

      const backupString = JSON.stringify(settingsToBackup);
      const backupData: BackupData = {
        timestamp: Date.now(),
        version: "6.2.5",
        size: new Blob([backupString]).size,
        hash: Math.random().toString(36).substring(7),
        includes: Object.keys(settingsToBackup).filter(
          (key) => settingsToBackup[key as keyof typeof settingsToBackup] !== null,
        ),
      };

      const newBackups = [...backups, backupData].slice(-10); // Keep last 10 backups
      setBackups(newBackups);
      localStorage.setItem("settings-backups", JSON.stringify(newBackups));
      localStorage.setItem(`backup-${backupData.hash}`, backupString);

      toast({
        title: "✅ Backup Created",
        description: `Successfully created backup (${(backupData.size / 1024).toFixed(2)} KB)`,
      });
    } catch (error) {
      console.error("Backup error:", error);
      toast({
        title: "❌ Backup Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
      setBackupProgress(0);
    }
  };

  const restoreBackup = async (backup: BackupData) => {
    const confirmed = window.confirm(
      "This will overwrite your current settings. Continue?",
    );
    if (!confirmed) return;

    setIsRestoring(true);

    try {
      const backupString = localStorage.getItem(`backup-${backup.hash}`);
      if (!backupString) {
        throw new Error("Backup data not found");
      }

      const settingsToRestore = JSON.parse(backupString);

      Object.entries(settingsToRestore).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(`${key}-settings`, value as string);
        }
      });

      toast({
        title: "✅ Restore Complete",
        description: "Settings have been restored successfully. Please refresh the page.",
      });

      // Refresh after a short delay
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: "❌ Restore Failed",
        description: "Failed to restore settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const deleteBackup = (backup: BackupData) => {
    const confirmed = window.confirm("Delete this backup permanently?");
    if (!confirmed) return;

    const newBackups = backups.filter((b) => b.hash !== backup.hash);
    setBackups(newBackups);
    localStorage.setItem("settings-backups", JSON.stringify(newBackups));
    localStorage.removeItem(`backup-${backup.hash}`);

    toast({
      title: "✅ Backup Deleted",
      description: "Backup has been permanently removed.",
    });
  };

  const downloadBackup = (backup: BackupData) => {
    const backupString = localStorage.getItem(`backup-${backup.hash}`);
    if (!backupString) {
      toast({
        title: "❌ Error",
        description: "Backup data not found.",
        variant: "destructive",
      });
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([backupString], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = `fitfusion-backup-${new Date(backup.timestamp).toISOString().split("T")[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "✅ Backup Downloaded",
      description: "Settings backup has been downloaded.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-purple-200 dark:border-purple-800">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-100/50 dark:from-purple-950/30 dark:to-pink-900/30">
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Settings Backup & Restore
          </CardTitle>
          <CardDescription>
            Create and manage backups of your application settings
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Create Backup */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Create Backup</h4>
              <Badge variant="secondary">Max 10 backups</Badge>
            </div>

            <Button
              onClick={createBackup}
              disabled={isCreatingBackup}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isCreatingBackup ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Create New Backup
                </>
              )}
            </Button>

            {isCreatingBackup && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-semibold">{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} className="h-2" />
              </motion.div>
            )}
          </div>

          {/* Backups List */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Existing Backups ({backups.length})
            </h4>

            <AnimatePresence>
              {backups.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <p>No backups created yet</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {backups.map((backup) => (
                    <motion.div
                      key={backup.hash}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-lg border border-purple-200/50 dark:border-purple-800/30 bg-purple-50/30 dark:bg-purple-950/10 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {new Date(backup.timestamp).toLocaleString()}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              v{backup.version}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Size: {(backup.size / 1024).toFixed(2)} KB • Items: {backup.includes.length}
                          </p>
                          <div className="flex gap-1 mt-2">
                            {backup.includes.map((item) => (
                              <Badge key={item} variant="secondary" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadBackup(backup)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreBackup(backup)}
                            disabled={isRestoring}
                            className="h-8 w-8 p-0"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteBackup(backup)}
                            className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Box */}
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
              Backups are stored locally in your browser. To transfer settings between devices,
              download a backup and import it on another device.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

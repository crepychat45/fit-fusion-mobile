import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database,
  Trash2,
  BarChart3,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  HardDrive,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

interface StorageInfo {
  totalItems: number;
  usedSpace: number; // in bytes
  estimatedLimit: number; // in bytes
  byCategory: Record<string, number>;
}

export function DataManagementPanel() {
  const { toast } = useToast();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    analyzeStorage();
  }, []);

  const analyzeStorage = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      const stages = [
        { message: "Scanning localStorage...", progress: 25 },
        { message: "Calculating sizes...", progress: 50 },
        { message: "Analyzing categories...", progress: 75 },
        { message: "Finalizing analysis...", progress: 100 },
      ];

      for (const stage of stages) {
        setAnalysisProgress(stage.progress);
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      let totalSize = 0;
      const byCategory: Record<string, number> = {};

      // Analyze localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        const value = localStorage.getItem(key) || "";
        const size = new Blob([value]).size;
        totalSize += size;

        // Categorize
        let category = "Other";
        if (key.includes("auth") || key.includes("token")) category = "Authentication";
        else if (key.includes("user") || key.includes("profile")) category = "User Data";
        else if (key.includes("settings")) category = "Settings";
        else if (key.includes("cache") || key.includes("temp")) category = "Cache";
        else if (key.includes("backup")) category = "Backups";

        byCategory[category] = (byCategory[category] || 0) + size;
      }

      setStorageInfo({
        totalItems: localStorage.length,
        usedSpace: totalSize,
        estimatedLimit: 5 * 1024 * 1024, // 5MB typical limit
        byCategory,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "❌ Analysis Failed",
        description: "Could not analyze storage. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const clearCategory = async (category: string) => {
    const confirmed = window.confirm(
      `Clear all ${category.toLowerCase()} data? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      let cleared = 0;
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key) continue;

        let itemCategory = "Other";
        if (key.includes("auth") || key.includes("token"))
          itemCategory = "Authentication";
        else if (key.includes("user") || key.includes("profile"))
          itemCategory = "User Data";
        else if (key.includes("settings")) itemCategory = "Settings";
        else if (key.includes("cache") || key.includes("temp"))
          itemCategory = "Cache";
        else if (key.includes("backup")) itemCategory = "Backups";

        if (itemCategory === category) {
          localStorage.removeItem(key);
          cleared++;
        }
      }

      toast({
        title: "✅ Data Cleared",
        description: `Cleared ${cleared} items from ${category.toLowerCase()}`,
      });

      // Re-analyze storage
      setTimeout(analyzeStorage, 500);
    } catch (error) {
      console.error("Clear error:", error);
      toast({
        title: "❌ Clear Failed",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    try {
      const exportData: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          exportData[key] = localStorage.getItem(key);
        }
      }

      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      element.href = URL.createObjectURL(file);
      element.download = `fitfusion-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast({
        title: "✅ Data Exported",
        description: "All data has been exported successfully.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "❌ Export Failed",
        description: "Failed to export data.",
        variant: "destructive",
      });
    }
  };

  const getStoragePercentage = () => {
    if (!storageInfo) return 0;
    return Math.round((storageInfo.usedSpace / storageInfo.estimatedLimit) * 100);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-green-200 dark:border-green-800">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-900/30">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
            Data Management
          </CardTitle>
          <CardDescription>
            Monitor and manage your application data storage
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Analyze Button */}
          <Button
            onClick={analyzeStorage}
            disabled={isAnalyzing}
            variant="outline"
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze Storage
              </>
            )}
          </Button>

          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span>Analysis Progress</span>
                <span className="font-semibold">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </motion.div>
          )}

          {storageInfo && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Storage Overview */}
              <div className="space-y-3 p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/10 dark:to-emerald-950/10 rounded-lg border border-green-200/30 dark:border-green-800/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Storage Usage</span>
                  <Badge variant="secondary" className="font-mono">
                    {formatBytes(storageInfo.usedSpace)} / {formatBytes(storageInfo.estimatedLimit)}
                  </Badge>
                </div>
                <Progress value={getStoragePercentage()} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {getStoragePercentage()}% of estimated storage limit
                </p>
              </div>

              {/* Storage Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <HardDrive className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">
                        {storageInfo.totalItems}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Items</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Clock className="h-5 w-5 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm font-semibold text-purple-600">
                        {Math.round((getStoragePercentage() / 100) * storageInfo.estimatedLimit / (1024 * 1024))}
                        MB
                      </p>
                      <p className="text-xs text-muted-foreground">Used Space</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data by Category */}
              <div className="space-y-3">
                <h4 className="font-medium">Data by Category</h4>
                <div className="space-y-2">
                  {Object.entries(storageInfo.byCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, size]) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/20 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{category}</span>
                          <Badge variant="outline" className="text-xs font-mono">
                            {formatBytes(size)}
                          </Badge>
                        </div>
                        <Progress
                          value={
                            (size / storageInfo.usedSpace) * 100
                          }
                          className="h-1.5 mb-2"
                        />
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">
                            {Math.round((size / storageInfo.usedSpace) * 100)}% of total
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => clearCategory(category)}
                            className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Export Button */}
              <Button
                onClick={exportData}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>

              {/* Info Box */}
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                  Some categories (like Authentication) should not be cleared to maintain app functionality.
                  Clear only what you're sure about.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

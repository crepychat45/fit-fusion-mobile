import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  Zap,
  Cpu,
  HardDrive,
  BarChart3,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

interface PerformanceMetrics {
  memoryUsage: number; // in MB
  cpuLoad: number; // percentage
  storageUsed: number; // in MB
  renderTime: number; // in ms
  jsHeapSize: number; // in MB
  lastGarbageCollection: Date | null;
}

export function PerformanceMetricsPanel() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    cpuLoad: 0,
    storageUsed: 0,
    renderTime: 0,
    jsHeapSize: 0,
    lastGarbageCollection: null,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState<PerformanceMetrics[]>([]);

  useEffect(() => {
    const collectMetrics = () => {
      const perfData = performance.getEntriesByType("measure");
      const navigationTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

      // Calculate render time (rough estimate)
      const renderTime = perfData.length > 0
        ? perfData[perfData.length - 1].duration
        : 16.67; // Default to ~60fps

      // Calculate storage used
      let storageUsed = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          storageUsed += new Blob([localStorage.getItem(key) || ""]).size;
        }
      }

      // Get memory info if available
      const memInfo = (performance as any).memory;
      const jsHeapSize = memInfo ? memInfo.usedJSHeapSize / 1048576 : 0; // Convert to MB

      const newMetrics: PerformanceMetrics = {
        memoryUsage: jsHeapSize,
        cpuLoad: Math.random() * 50 + 20, // Simulated CPU load
        storageUsed: storageUsed / 1048576, // Convert to MB
        renderTime: Math.min(Math.max(renderTime, 10), 50),
        jsHeapSize: jsHeapSize,
        lastGarbageCollection: new Date(),
      };

      setMetrics(newMetrics);
      setHistory((prev) => [...prev.slice(-19), newMetrics]); // Keep last 20 entries
    };

    if (isMonitoring) {
      collectMetrics();
      const interval = setInterval(collectMetrics, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      setHistory([]);
    }
  };

  const getPerformanceStatus = () => {
    if (metrics.renderTime > 40) return { status: "Poor", color: "text-red-600" };
    if (metrics.renderTime > 25) return { status: "Fair", color: "text-orange-600" };
    if (metrics.renderTime > 16.67) return { status: "Good", color: "text-yellow-600" };
    return { status: "Excellent", color: "text-green-600" };
  };

  const getStorageStatus = () => {
    const percentage = (metrics.storageUsed / 5) * 100;
    if (percentage > 80) return "critical";
    if (percentage > 60) return "warning";
    return "healthy";
  };

  const getMemoryStatus = () => {
    if (metrics.jsHeapSize > 100) return "critical";
    if (metrics.jsHeapSize > 50) return "warning";
    return "healthy";
  };

  const perfStatus = getPerformanceStatus();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-cyan-200 dark:border-cyan-800">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-100/50 dark:from-cyan-950/30 dark:to-blue-900/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Monitor real-time application performance
              </CardDescription>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMonitoring}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                isMonitoring
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </motion.button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Render Time */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200/50 dark:border-purple-800/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <p className="text-xs font-medium text-muted-foreground">Render Time</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {metrics.renderTime.toFixed(1)}ms
              </p>
              <p className={`text-xs mt-1 ${perfStatus.color}`}>
                {perfStatus.status}
              </p>
            </motion.div>

            {/* Memory */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-lg border border-blue-200/50 dark:border-blue-800/30 ${
                getMemoryStatus() === "critical"
                  ? "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20"
                  : getMemoryStatus() === "warning"
                    ? "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20"
                    : "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-medium text-muted-foreground">Memory</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {metrics.jsHeapSize.toFixed(1)}MB
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                JS Heap Size
              </p>
            </motion.div>

            {/* CPU Load */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20 border border-orange-200/50 dark:border-orange-800/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-orange-600" />
                <p className="text-xs font-medium text-muted-foreground">CPU Load</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {metrics.cpuLoad.toFixed(0)}%
              </p>
              <p className="text-xs mt-1 text-muted-foreground">Simulated</p>
            </motion.div>

            {/* Storage */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-lg border border-green-200/50 dark:border-green-800/30 ${
                getStorageStatus() === "critical"
                  ? "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20"
                  : getStorageStatus() === "warning"
                    ? "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20"
                    : "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-green-600" />
                <p className="text-xs font-medium text-muted-foreground">Storage</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {metrics.storageUsed.toFixed(2)}MB
              </p>
              <p className="text-xs mt-1 text-muted-foreground">/ 5 MB</p>
            </motion.div>
          </div>

          {/* Performance Gauges */}
          <div className="space-y-4">
            {/* Render Time Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Render Time</span>
                <Badge
                  variant={
                    metrics.renderTime > 30 ? "destructive" : "default"
                  }
                  className="text-xs"
                >
                  {metrics.renderTime.toFixed(1)}ms / 16.67ms (target)
                </Badge>
              </div>
              <Progress
                value={(metrics.renderTime / 50) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.renderTime > 16.67
                  ? "⚠️ Below target FPS (60)"
                  : "✅ Meeting target FPS"}
              </p>
            </div>

            {/* Memory Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <Badge variant={getMemoryStatus() === "critical" ? "destructive" : "secondary"}>
                  {metrics.jsHeapSize.toFixed(1)}MB
                </Badge>
              </div>
              <Progress
                value={(metrics.jsHeapSize / 150) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {getMemoryStatus() === "critical"
                  ? "⚠️ High memory usage"
                  : "✅ Healthy memory usage"}
              </p>
            </div>

            {/* Storage Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Local Storage</span>
                <Badge variant={getStorageStatus() === "critical" ? "destructive" : "secondary"}>
                  {((metrics.storageUsed / 5) * 100).toFixed(0)}%
                </Badge>
              </div>
              <Progress
                value={(metrics.storageUsed / 5) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {getStorageStatus() === "critical"
                  ? "⚠️ Storage nearly full"
                  : "✅ Storage available"}
              </p>
            </div>
          </div>

          {/* Performance Tips */}
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Performance Tips:</strong>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Keep memory usage below 100MB for smooth performance</li>
                <li>Target render time is 16.67ms for 60 FPS</li>
                <li>Clear local storage when it exceeds 80% capacity</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Monitoring Status */}
          {isMonitoring && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span className="font-medium text-sm">
                  Monitoring active ({history.length} samples)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Collecting performance data every 5 seconds...
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

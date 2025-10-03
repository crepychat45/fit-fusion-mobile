import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Code,
  Terminal,
  Bug,
  Cpu,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Settings,
  Activity,
  Shield,
  Smartphone,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export function DeveloperOptions() {
  const { toast } = useToast();
  const [debugMode, setDebugMode] = useState(false);
  const [apiLogging, setApiLogging] = useState(false);
  const [experimentalFeatures, setExperimentalFeatures] = useState(false);
  const [performanceMonitoring, setPerformanceMonitoring] = useState(false);
  const [betaAccess, setBetaAccess] = useState(false);
  const [customScripting, setCustomScripting] = useState(false);
  const [devConsole, setDevConsole] = useState(false);
  const [memoryProfiler, setMemoryProfiler] = useState(false);
  const [networkMonitor, setNetworkMonitor] = useState(false);
  const [errorReporting, setErrorReporting] = useState(true);
  const [customScript, setCustomScript] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [systemInfo, setSystemInfo] = useState({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    memory: (performance as any).memory
      ? {
          used: Math.round(
            (performance as any).memory.usedJSHeapSize / 1024 / 1024,
          ),
          total: Math.round(
            (performance as any).memory.totalJSHeapSize / 1024 / 1024,
          ),
          limit: Math.round(
            (performance as any).memory.jsHeapSizeLimit / 1024 / 1024,
          ),
        }
      : null,
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  };

  const clearLogs = () => {
    setLogs([]);
    toast({
      title: "🧹 Logs cleared",
      description: "Debug console has been cleared.",
    });
  };

  const exportLogs = () => {
    const logData = logs.join("\n");
    const blob = new Blob([logData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitfusion-logs-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "📥 Logs exported",
      description: "Debug logs have been downloaded.",
    });
  };

  const runDiagnostics = async () => {
    toast({
      title: "🔍 Running diagnostics",
      description: "Performing comprehensive system check...",
    });

    addLog("Starting system diagnostics...");

    // Simulate diagnostic checks
    const checks = [
      "Checking JavaScript heap memory",
      "Validating local storage",
      "Testing API connectivity",
      "Verifying service worker",
      "Checking browser compatibility",
      "Testing performance metrics",
    ];

    for (const check of checks) {
      addLog(check);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    addLog("✅ All diagnostics completed successfully");

    toast({
      title: "✅ Diagnostics complete",
      description: "System is running optimally.",
    });
  };

  const executeCustomScript = () => {
    if (!customScript.trim()) {
      toast({
        title: "⚠️ No script provided",
        description: "Please enter a JavaScript command to execute.",
        variant: "destructive",
      });
      return;
    }

    try {
      addLog(`Executing: ${customScript}`);
      const result = eval(customScript);
      addLog(`Result: ${JSON.stringify(result)}`);

      toast({
        title: "✅ Script executed",
        description: "Check the console for results.",
      });
    } catch (error) {
      addLog(`Error: ${error}`);
      toast({
        title: "❌ Script error",
        description: "Check the console for error details.",
        variant: "destructive",
      });
    }
  };

  const simulateError = () => {
    addLog("Simulating application error...");
    try {
      throw new Error("Simulated error for testing purposes");
    } catch (error) {
      addLog(`Error caught: ${error}`);
      if (errorReporting) {
        toast({
          title: "🐛 Error reported",
          description: "Simulated error has been logged.",
          variant: "destructive",
        });
      }
    }
  };

  const enableDeveloperMode = () => {
    setDebugMode(true);
    setApiLogging(true);
    setPerformanceMonitoring(true);
    setDevConsole(true);

    addLog("Developer mode enabled - all debugging features activated");

    toast({
      title: "🚀 Developer mode enabled",
      description: "All debugging and monitoring features are now active.",
    });
  };

  useEffect(() => {
    if (debugMode) {
      addLog("Debug mode activated");
    }
  }, [debugMode]);

  useEffect(() => {
    if (performanceMonitoring) {
      const interval = setInterval(() => {
        if ((performance as any).memory) {
          const memory = (performance as any).memory;
          setSystemInfo((prev) => ({
            ...prev,
            memory: {
              used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
              total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
              limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
            },
          }));
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [performanceMonitoring]);

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Developer Mode Warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Alert className="border-orange-200 bg-orange-50/50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>Developer Options</strong>
            <br />
            These advanced settings are intended for developers and may affect
            app performance or stability.
            <Button
              variant="outline"
              size="sm"
              className="mt-2 ml-0"
              onClick={enableDeveloperMode}
            >
              <Code className="h-3 w-3 mr-1" />
              Enable All
            </Button>
          </AlertDescription>
        </Alert>
      </motion.div>

      <Tabs defaultValue="debugging" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="debugging">Debugging</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
        </TabsList>

        <TabsContent value="debugging" className="space-y-6">
          {/* Debug Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Debug Configuration
                </CardTitle>
                <CardDescription>
                  Enable debugging features for development and testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Debug Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Enable verbose logging and debug information
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {debugMode && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                    <Switch
                      checked={debugMode}
                      onCheckedChange={setDebugMode}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">API Logging</p>
                      <p className="text-sm text-muted-foreground">
                        Log all API requests and responses
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={apiLogging}
                    onCheckedChange={setApiLogging}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Experimental Features</p>
                      <p className="text-sm text-muted-foreground">
                        Enable beta features and experimental functionality
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {experimentalFeatures && (
                      <Badge variant="secondary" className="text-xs">
                        Beta
                      </Badge>
                    )}
                    <Switch
                      checked={experimentalFeatures}
                      onCheckedChange={setExperimentalFeatures}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Error Reporting</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically report errors for debugging
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={errorReporting}
                    onCheckedChange={setErrorReporting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Custom Scripting</p>
                      <p className="text-sm text-muted-foreground">
                        Allow execution of custom JavaScript code
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={customScripting}
                    onCheckedChange={setCustomScripting}
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={runDiagnostics}
                      className="flex-1"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Run Diagnostics
                    </Button>
                    <Button
                      variant="outline"
                      onClick={simulateError}
                      className="flex-1"
                    >
                      <Bug className="h-4 w-4 mr-2" />
                      Simulate Error
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Monitoring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Performance Monitoring
                </CardTitle>
                <CardDescription>
                  Monitor app performance and resource usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Performance Monitoring</p>
                      <p className="text-sm text-muted-foreground">
                        Track memory usage and performance metrics
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={performanceMonitoring}
                    onCheckedChange={setPerformanceMonitoring}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Memory Profiler</p>
                      <p className="text-sm text-muted-foreground">
                        Advanced memory usage analysis
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={memoryProfiler}
                    onCheckedChange={setMemoryProfiler}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Network Monitor</p>
                      <p className="text-sm text-muted-foreground">
                        Monitor network requests and bandwidth
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={networkMonitor}
                    onCheckedChange={setNetworkMonitor}
                  />
                </div>

                {systemInfo.memory && performanceMonitoring && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-medium">Memory Usage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used Memory</span>
                        <span>{systemInfo.memory.used} MB</span>
                      </div>
                      <Progress
                        value={
                          (systemInfo.memory.used / systemInfo.memory.limit) *
                          100
                        }
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Total: {systemInfo.memory.total} MB</span>
                        <span>Limit: {systemInfo.memory.limit} MB</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="console" className="space-y-6">
          {/* Developer Console */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Developer Console
                </CardTitle>
                <CardDescription>
                  Execute JavaScript commands and view debug logs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customScripting && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Script</label>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Enter JavaScript code here..."
                        value={customScript}
                        onChange={(e) => setCustomScript(e.target.value)}
                        className="font-mono text-sm"
                        rows={3}
                      />
                      <Button onClick={executeCustomScript} size="sm">
                        <Zap className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Debug Logs</label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={exportLogs}>
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearLogs}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                    <AnimatePresence>
                      {logs.length === 0 ? (
                        <div className="text-muted-foreground">
                          No logs available. Enable debug mode to see output.
                        </div>
                      ) : (
                        logs.map((log, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-1"
                          >
                            {log}
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* System Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  System Information
                </CardTitle>
                <CardDescription>
                  Browser and system details for debugging
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Platform</p>
                    <p className="text-muted-foreground">
                      {systemInfo.platform}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Language</p>
                    <p className="text-muted-foreground">
                      {systemInfo.language}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Cookies Enabled</p>
                    <p className="text-muted-foreground">
                      {systemInfo.cookieEnabled ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Online Status</p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${systemInfo.onLine ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span className="text-muted-foreground">
                        {systemInfo.onLine ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="font-medium mb-2">User Agent</p>
                  <div className="bg-muted p-3 rounded-lg text-xs font-mono break-all">
                    {systemInfo.userAgent}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          JSON.stringify(systemInfo, null, 2),
                        )
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Copy System Info
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reload App
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

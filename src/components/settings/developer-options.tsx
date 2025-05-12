import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Code, Cpu, Database, FileCode2, Radio, 
  Terminal, Bug, Wrench, Download, RefreshCcw, Monitor
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DeveloperOptions() {
  const { toast } = useToast();
  const [developerOptions, setDeveloperOptions] = useState({
    debugMode: false,
    apiLogging: false,
    experimentalFeatures: false,
    performanceMonitoring: false,
    betaAccess: false,
    customScripting: false,
    verboseLogging: false,
    remoteDebugging: false,
    developerTools: false,
    networkInspector: false,
  });
  
  const [codeEditorEnabled, setCodeEditorEnabled] = useState(false);
  const [runwaysEnabled, setRunwaysEnabled] = useState(false);
  const [logsVisible, setLogsVisible] = useState(false);
  const [logData, setLogData] = useState<{time: string, level: string, message: string}[]>([]);
  const [consoleInput, setConsoleInput] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("https://api.example.com/v1");
  const [apiKey, setApiKey] = useState("");
  const [apiMethod, setApiMethod] = useState("GET");
  const [apiTestDialogOpen, setApiTestDialogOpen] = useState(false);
  const [apiTestInProgress, setApiTestInProgress] = useState(false);
  const [apiResponse, setApiResponse] = useState("");
  const [scriptContent, setScriptContent] = useState(
    '// Custom JavaScript Function\nfunction processData(data) {\n  // Add your custom logic here\n  return data.map(item => {\n    return {\n      ...item,\n      processed: true\n    };\n  });\n}'
  );
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);
  
  // Load settings from localStorage
  useEffect(() => {
    const storedOptions = localStorage.getItem("fitfusion-developer-options");
    if (storedOptions) {
      try {
        setDeveloperOptions(JSON.parse(storedOptions));
      } catch (error) {
        console.error("Error parsing developer options:", error);
      }
    }
    
    const codeEditor = localStorage.getItem("fitfusion-code-editor-enabled");
    setCodeEditorEnabled(codeEditor === "true");
    
    const runways = localStorage.getItem("fitfusion-runways-enabled");
    setRunwaysEnabled(runways === "true");
    
    // Generate sample logs
    generateSampleLogs();
  }, []);
  
  // Save options when they change
  useEffect(() => {
    localStorage.setItem("fitfusion-developer-options", JSON.stringify(developerOptions));
  }, [developerOptions]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-code-editor-enabled", codeEditorEnabled.toString());
  }, [codeEditorEnabled]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-runways-enabled", runwaysEnabled.toString());
  }, [runwaysEnabled]);
  
  const handleOptionToggle = (option: keyof typeof developerOptions, value: boolean) => {
    setDeveloperOptions(prev => ({
      ...prev,
      [option]: value
    }));
    
    toast({
      title: `${formatOptionName(option)} ${value ? 'Enabled' : 'Disabled'}`,
      description: `Developer setting updated successfully.`,
    });
    
    // Generate new log entry
    if (option === "debugMode" && value) {
      addLogEntry("Debug mode activated. Verbose logging enabled.", "info");
    }
  };
  
  const formatOptionName = (option: string) => {
    return option
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };
  
  const generateSampleLogs = () => {
    const now = new Date();
    const sampleLogs = [
      {
        time: formatTime(new Date(now.getTime() - 5000)),
        level: "info",
        message: "Application initialized successfully"
      },
      {
        time: formatTime(new Date(now.getTime() - 4500)),
        level: "debug",
        message: "Loading user preferences from local storage"
      },
      {
        time: formatTime(new Date(now.getTime() - 4000)),
        level: "info",
        message: "User preferences loaded"
      },
      {
        time: formatTime(new Date(now.getTime() - 3500)),
        level: "debug",
        message: "Initializing workout module"
      },
      {
        time: formatTime(new Date(now.getTime() - 3000)),
        level: "warn",
        message: "Network connectivity issues detected"
      },
      {
        time: formatTime(new Date(now.getTime() - 2500)),
        level: "error",
        message: "Failed to load remote configuration"
      },
      {
        time: formatTime(new Date(now.getTime() - 2000)),
        level: "info",
        message: "Using cached configuration instead"
      },
      {
        time: formatTime(new Date(now.getTime() - 1500)),
        level: "debug",
        message: "Route changed: /settings"
      },
      {
        time: formatTime(new Date(now.getTime() - 1000)),
        level: "info",
        message: "Settings page rendered"
      },
      {
        time: formatTime(new Date(now.getTime() - 500)),
        level: "debug",
        message: "Developer options component mounted"
      }
    ];
    
    setLogData(sampleLogs);
  };
  
  const addLogEntry = (message: string, level: string = "info") => {
    setLogData(prev => [
      ...prev,
      {
        time: formatTime(new Date()),
        level,
        message
      }
    ]);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };
  
  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;
    
    addLogEntry(`> ${consoleInput}`, "command");
    
    // Process command
    const commandLower = consoleInput.toLowerCase();
    if (commandLower === "clear") {
      setLogData([]);
      addLogEntry("Console cleared", "system");
    } else if (commandLower === "help") {
      addLogEntry("Available commands: clear, help, status, toggle debug", "system");
    } else if (commandLower === "status") {
      addLogEntry(`Debug mode: ${developerOptions.debugMode ? "enabled" : "disabled"}`, "system");
      addLogEntry(`API Logging: ${developerOptions.apiLogging ? "enabled" : "disabled"}`, "system");
    } else if (commandLower === "toggle debug") {
      const newValue = !developerOptions.debugMode;
      handleOptionToggle("debugMode", newValue);
      addLogEntry(`Debug mode ${newValue ? "enabled" : "disabled"}`, "system");
    } else {
      addLogEntry(`Unknown command: ${consoleInput}`, "error");
    }
    
    setConsoleInput("");
  };
  
  const handleApiTest = () => {
    setApiTestInProgress(true);
    setApiResponse("");
    
    // Simulate API request
    setTimeout(() => {
      if (apiMethod === "GET") {
        setApiResponse(JSON.stringify({
          success: true,
          data: {
            message: "API test successful",
            endpoint: apiEndpoint,
            timestamp: new Date().toISOString()
          }
        }, null, 2));
      } else {
        setApiResponse(JSON.stringify({
          success: true,
          data: {
            id: "123456",
            created: true,
            timestamp: new Date().toISOString()
          }
        }, null, 2));
      }
      
      setApiTestInProgress(false);
      
      if (developerOptions.apiLogging) {
        addLogEntry(`API ${apiMethod} request to ${apiEndpoint} completed`, "info");
      }
    }, 1500);
  };
  
  const handleRunScript = () => {
    try {
      // In a real app, this would be more secure and sandboxed
      // eslint-disable-next-line no-new-func
      const fn = new Function('return ' + scriptContent)();
      
      if (typeof fn === 'function') {
        const testData = [{ name: "Item 1" }, { name: "Item 2" }];
        const result = fn(testData);
        
        toast({
          title: "Script Executed",
          description: "Custom script ran successfully.",
        });
        
        addLogEntry(`Script executed: ${JSON.stringify(result).substring(0, 100)}`, "info");
      } else {
        throw new Error("Script does not return a function");
      }
    } catch (error: any) {
      toast({
        title: "Script Error",
        description: error.message || "Failed to execute script",
        variant: "destructive"
      });
      
      addLogEntry(`Script error: ${error.message}`, "error");
    }
    
    setScriptDialogOpen(false);
  };
  
  const handleImportDeveloperTools = () => {
    toast({
      title: "Importing Developer Tools",
      description: "Starting download of development packages...",
    });
    
    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        setDeveloperOptions(prev => ({
          ...prev,
          developerTools: true
        }));
        
        toast({
          title: "Developer Tools Installed",
          description: "Tools are now available in the developer menu.",
        });
        
        addLogEntry("Developer tools package installed successfully", "info");
      }
    }, 300);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Developer Options</CardTitle>
              <CardDescription>Advanced settings for developers</CardDescription>
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Beta
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bug className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Debug Mode</p>
                <p className="text-xs text-muted-foreground">Show debugging information in console</p>
              </div>
            </div>
            <Switch 
              checked={developerOptions.debugMode} 
              onCheckedChange={(checked) => handleOptionToggle("debugMode", checked)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">API Logging</p>
                <p className="text-xs text-muted-foreground">Log API requests and responses</p>
              </div>
            </div>
            <Switch 
              checked={developerOptions.apiLogging} 
              onCheckedChange={(checked) => handleOptionToggle("apiLogging", checked)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCode2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Code Editor</p>
                <p className="text-xs text-muted-foreground">Enable built-in code editing</p>
              </div>
            </div>
            <Switch 
              checked={codeEditorEnabled} 
              onCheckedChange={(checked) => {
                setCodeEditorEnabled(checked);
                toast({
                  title: `Code Editor ${checked ? 'Enabled' : 'Disabled'}`,
                  description: `You can ${checked ? 'now' : 'no longer'} edit code in the app.`,
                });
              }} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Runways Design</p>
                <p className="text-xs text-muted-foreground">Enable experimental UI design features</p>
              </div>
            </div>
            <Switch 
              checked={runwaysEnabled} 
              onCheckedChange={(checked) => {
                setRunwaysEnabled(checked);
                toast({
                  title: `Runways Design ${checked ? 'Enabled' : 'Disabled'}`,
                  description: `Advanced UI customization is now ${checked ? 'available' : 'disabled'}.`,
                });
              }} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Performance Monitoring</p>
                <p className="text-xs text-muted-foreground">Track app performance metrics</p>
              </div>
            </div>
            <Switch 
              checked={developerOptions.performanceMonitoring} 
              onCheckedChange={(checked) => handleOptionToggle("performanceMonitoring", checked)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Custom Scripting</p>
                <p className="text-xs text-muted-foreground">Run custom JavaScript code</p>
              </div>
            </div>
            <Switch 
              checked={developerOptions.customScripting} 
              onCheckedChange={(checked) => handleOptionToggle("customScripting", checked)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Remote Debugging</p>
                <p className="text-xs text-muted-foreground">Allow debugging from external devices</p>
              </div>
            </div>
            <Switch 
              checked={developerOptions.remoteDebugging} 
              onCheckedChange={(checked) => handleOptionToggle("remoteDebugging", checked)} 
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start space-y-4">
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLogsVisible(!logsVisible)}
            >
              {logsVisible ? "Hide Logs" : "Show Logs"}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setApiTestDialogOpen(true)}
              >
                Test API
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (developerOptions.customScripting) {
                    setScriptDialogOpen(true);
                  } else {
                    toast({
                      title: "Custom Scripting Disabled",
                      description: "Enable custom scripting to use this feature.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Code className="h-4 w-4 mr-2" />
                Script Editor
              </Button>
            </div>
          </div>
          
          {!developerOptions.developerTools && (
            <Button 
              className="w-full"
              onClick={handleImportDeveloperTools}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Import Developer Tools
            </Button>
          )}
          
          {logsVisible && (
            <div className="w-full mt-4">
              <div className="bg-black text-green-400 p-3 rounded-lg font-mono text-xs h-60 overflow-y-auto">
                {logData.map((log, index) => (
                  <div key={index} className={`mb-1 ${getLogColor(log.level)}`}>
                    <span className="opacity-70">[{log.time}]</span> {log.level.toUpperCase()}: {log.message}
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleConsoleSubmit} className="mt-2 flex gap-2">
                <Input 
                  className="font-mono text-xs bg-black text-green-400 border-green-800 placeholder-green-800"
                  placeholder="Type a command..."
                  value={consoleInput}
                  onChange={(e) => setConsoleInput(e.target.value)}
                />
                <Button type="submit" variant="outline" size="sm">Run</Button>
              </form>
            </div>
          )}
        </CardFooter>
      </Card>
      
      {/* API Test Dialog */}
      <Dialog open={apiTestDialogOpen} onOpenChange={setApiTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>API Test Console</DialogTitle>
            <DialogDescription>
              Test API endpoints and view responses
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="request">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>
            
            <TabsContent value="request" className="space-y-4">
              <div className="flex items-center gap-2">
                <Select 
                  value={apiMethod}
                  onValueChange={setApiMethod}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input 
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="API Endpoint"
                  className="flex-1"
                />
              </div>
              
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Optional API Key"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Request Body (for POST/PUT)</Label>
                <textarea 
                  className="w-full h-40 p-3 rounded-md border border-input bg-background font-mono text-sm"
                  placeholder="{ 'key': 'value' }"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="response" className="space-y-4">
              {apiTestInProgress ? (
                <div className="py-4 text-center space-y-4">
                  <RefreshCcw className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm">Making API request...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Response</Label>
                  {apiResponse ? (
                    <div className="bg-muted p-3 rounded-md border font-mono text-sm overflow-auto h-80">
                      <pre>{apiResponse}</pre>
                    </div>
                  ) : (
                    <div className="bg-muted p-3 rounded-md border h-60 flex items-center justify-center">
                      <p className="text-muted-foreground">No response yet. Send a request first.</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setApiTestDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              disabled={apiTestInProgress}
              onClick={handleApiTest}
            >
              {apiTestInProgress ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Script Editor Dialog */}
      <Dialog open={scriptDialogOpen} onOpenChange={setScriptDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>JavaScript Editor</DialogTitle>
            <DialogDescription>
              Write and execute custom JavaScript code
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <textarea 
              className="w-full h-80 p-3 rounded-md border border-input bg-muted font-mono text-sm"
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleRunScript}>
              Run Script
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to determine log entry color
function getLogColor(level: string) {
  switch (level.toLowerCase()) {
    case "error":
      return "text-red-400";
    case "warn":
      return "text-yellow-400";
    case "debug":
      return "text-blue-400";
    case "info":
      return "text-green-400";
    case "command":
      return "text-purple-400";
    case "system":
      return "text-cyan-400";
    default:
      return "text-green-400";
  }
}

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Link2Off,
  Activity,
  Heart,
  Footprints,
  Flame,
  Moon,
  Dumbbell,
  TrendingUp,
  RefreshCw,
  Check,
  Settings,
  ChevronRight,
  Zap,
  Shield,
  Clock,
  Apple,
  Smartphone,
} from "lucide-react";

interface FitnessApp {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  lastSync: string;
  dataTypes: string[];
  premium: boolean;
  syncFrequency: string;
  syncedData: {
    steps?: number;
    calories?: number;
    heartRate?: number;
    sleep?: number;
    workouts?: number;
    distance?: number;
  };
}

const fitnessApps: FitnessApp[] = [
  {
    id: "strava",
    name: "Strava",
    icon: "🏃",
    color: "from-orange-500 to-orange-600",
    connected: false,
    lastSync: "Never",
    dataTypes: ["Running", "Cycling", "Swimming", "GPS Routes", "Segments"],
    premium: false,
    syncFrequency: "Real-time",
    syncedData: {},
  },
  {
    id: "myfitnesspal",
    name: "MyFitnessPal",
    icon: "🍎",
    color: "from-blue-500 to-blue-600",
    connected: false,
    lastSync: "Never",
    dataTypes: ["Calories", "Macros", "Meals", "Water Intake", "Recipes"],
    premium: false,
    syncFrequency: "Every 15 min",
    syncedData: {},
  },
  {
    id: "apple-health",
    name: "Apple Health",
    icon: "❤️",
    color: "from-red-500 to-pink-500",
    connected: false,
    lastSync: "Never",
    dataTypes: ["Steps", "Heart Rate", "Sleep", "Workouts", "ECG", "Blood Oxygen"],
    premium: true,
    syncFrequency: "Real-time",
    syncedData: {},
  },
  {
    id: "google-fit",
    name: "Google Fit",
    icon: "💪",
    color: "from-green-500 to-emerald-500",
    connected: false,
    lastSync: "Never",
    dataTypes: ["Steps", "Heart Points", "Workouts", "Sleep", "Weight"],
    premium: false,
    syncFrequency: "Every 30 min",
    syncedData: {},
  },
  {
    id: "fitbit",
    name: "Fitbit",
    icon: "⌚",
    color: "from-teal-500 to-cyan-500",
    connected: false,
    lastSync: "Never",
    dataTypes: ["Steps", "Sleep Score", "Heart Rate Zones", "Active Minutes"],
    premium: false,
    syncFrequency: "Hourly",
    syncedData: {},
  },
  {
    id: "garmin-connect",
    name: "Garmin Connect",
    icon: "🎯",
    color: "from-purple-500 to-indigo-500",
    connected: false,
    lastSync: "Never",
    dataTypes: ["Training Load", "VO2 Max", "Recovery Time", "Race Predictor"],
    premium: true,
    syncFrequency: "Real-time",
    syncedData: {},
  },
];

export function FitnessAppIntegrations() {
  const { toast } = useToast();
  const [apps, setApps] = useState<FitnessApp[]>(() => {
    try {
      const saved = localStorage.getItem("fitness-app-integrations");
      return saved ? JSON.parse(saved) : fitnessApps;
    } catch {
      return fitnessApps;
    }
  });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<FitnessApp | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("fitness-app-integrations", JSON.stringify(apps));
    } catch (error) {
      console.error("Failed to save integrations:", error);
    }
  }, [apps]);

  const handleConnect = async (appId: string) => {
    setConnecting(appId);
    
    // Simulate OAuth connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setApps(prev => prev.map(app => 
      app.id === appId 
        ? {
            ...app,
            connected: true,
            lastSync: "Just now",
            syncedData: {
              steps: Math.floor(Math.random() * 10000) + 5000,
              calories: Math.floor(Math.random() * 500) + 300,
              heartRate: Math.floor(Math.random() * 30) + 60,
              sleep: Math.floor(Math.random() * 3) + 6,
              workouts: Math.floor(Math.random() * 5) + 1,
              distance: Math.round((Math.random() * 10 + 2) * 10) / 10,
            }
          }
        : app
    ));
    
    setConnecting(null);
    toast({
      title: "Connected Successfully",
      description: `${apps.find(a => a.id === appId)?.name} is now syncing with FitFusion`,
    });
  };

  const handleDisconnect = (appId: string) => {
    setApps(prev => prev.map(app => 
      app.id === appId 
        ? { ...app, connected: false, lastSync: "Never", syncedData: {} }
        : app
    ));
    
    toast({
      title: "Disconnected",
      description: `${apps.find(a => a.id === appId)?.name} has been disconnected`,
    });
  };

  const handleSync = async (appId: string) => {
    setSyncing(appId);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setApps(prev => prev.map(app => 
      app.id === appId 
        ? {
            ...app,
            lastSync: "Just now",
            syncedData: {
              steps: Math.floor(Math.random() * 10000) + 5000,
              calories: Math.floor(Math.random() * 500) + 300,
              heartRate: Math.floor(Math.random() * 30) + 60,
              sleep: Math.floor(Math.random() * 3) + 6,
              workouts: Math.floor(Math.random() * 5) + 1,
              distance: Math.round((Math.random() * 10 + 2) * 10) / 10,
            }
          }
        : app
    ));
    
    setSyncing(null);
    toast({
      title: "Sync Complete",
      description: "Your data has been updated",
    });
  };

  const connectedCount = apps.filter(a => a.connected).length;

  const DataIcon = ({ type }: { type: string }) => {
    switch (type.toLowerCase()) {
      case "steps":
        return <Footprints className="h-4 w-4" />;
      case "calories":
        return <Flame className="h-4 w-4" />;
      case "heart rate":
        return <Heart className="h-4 w-4" />;
      case "sleep":
        return <Moon className="h-4 w-4" />;
      case "workouts":
        return <Dumbbell className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg">
              <Link2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Fitness App Integrations</h2>
              <p className="text-sm text-muted-foreground font-normal">
                Connect your favorite fitness apps for comprehensive data sync
              </p>
            </div>
          </CardTitle>
          
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {connectedCount} Connected
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connected Apps Summary */}
        {connectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-xl border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-green-800 dark:text-green-200">
                Today's Synced Data
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => apps.filter(a => a.connected).forEach(a => handleSync(a.id))}
                className="text-green-700"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Sync All
              </Button>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { icon: Footprints, label: "Steps", value: apps.reduce((sum, a) => sum + (a.syncedData.steps || 0), 0).toLocaleString() },
                { icon: Flame, label: "Calories", value: apps.reduce((sum, a) => sum + (a.syncedData.calories || 0), 0) },
                { icon: Heart, label: "Avg HR", value: `${Math.round(apps.filter(a => a.syncedData.heartRate).reduce((sum, a) => sum + (a.syncedData.heartRate || 0), 0) / Math.max(apps.filter(a => a.syncedData.heartRate).length, 1))} bpm` },
                { icon: Moon, label: "Sleep", value: `${Math.round(apps.reduce((sum, a) => sum + (a.syncedData.sleep || 0), 0) / Math.max(connectedCount, 1))}h` },
                { icon: Dumbbell, label: "Workouts", value: apps.reduce((sum, a) => sum + (a.syncedData.workouts || 0), 0) },
                { icon: TrendingUp, label: "Distance", value: `${apps.reduce((sum, a) => sum + (a.syncedData.distance || 0), 0).toFixed(1)} km` },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                >
                  <stat.icon className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-bold text-sm">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* App List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {apps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`overflow-hidden transition-all hover:shadow-md ${
                  app.connected ? 'border-green-200 dark:border-green-800' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* App Icon */}
                      <div className={`w-14 h-14 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                        {app.icon}
                      </div>
                      
                      {/* App Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{app.name}</h4>
                          {app.premium && (
                            <Badge variant="secondary" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          {app.connected && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                              <Check className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {app.dataTypes.slice(0, 3).map(type => (
                            <span key={type} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                              {type}
                            </span>
                          ))}
                          {app.dataTypes.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{app.dataTypes.length - 3} more
                            </span>
                          )}
                        </div>
                        
                        {app.connected && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last sync: {app.lastSync}
                            </span>
                            <span className="flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              {app.syncFrequency}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {app.connected ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSync(app.id)}
                              disabled={syncing === app.id}
                            >
                              <RefreshCw className={`h-4 w-4 mr-1 ${syncing === app.id ? 'animate-spin' : ''}`} />
                              {syncing === app.id ? 'Syncing...' : 'Sync'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedApp(app);
                                setShowSettings(true);
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDisconnect(app.id)}
                            >
                              <Link2Off className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleConnect(app.id)}
                            disabled={connecting === app.id}
                            className={`bg-gradient-to-r ${app.color} text-white`}
                          >
                            {connecting === app.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <Link2 className="h-4 w-4 mr-2" />
                                Connect
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Synced Data Preview */}
                    <AnimatePresence>
                      {app.connected && Object.keys(app.syncedData).length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t"
                        >
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {Object.entries(app.syncedData).map(([key, value]) => (
                              <div key={key} className="text-center p-2 bg-muted/50 rounded-lg">
                                <DataIcon type={key} />
                                <p className="text-xs text-muted-foreground capitalize mt-1">{key}</p>
                                <p className="font-semibold text-sm">
                                  {typeof value === 'number' ? value.toLocaleString() : value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{selectedApp?.icon}</span>
                {selectedApp?.name} Settings
              </DialogTitle>
            </DialogHeader>
            
            {selectedApp && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-Sync</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync data in the background
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sync Workouts</p>
                      <p className="text-sm text-muted-foreground">
                        Import workout data from {selectedApp.name}
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Export to {selectedApp.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Send FitFusion workouts to {selectedApp.name}
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new data syncs
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Data Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.dataTypes.map(type => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                  <span>Last synced: {selectedApp.lastSync}</span>
                  <span>Sync frequency: {selectedApp.syncFrequency}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

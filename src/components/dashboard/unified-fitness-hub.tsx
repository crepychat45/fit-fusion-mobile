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
  Watch,
  Battery,
  Wifi,
  Signal,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Bluetooth,
  Target,
  Calendar,
  PlayCircle,
  PauseCircle,
  Image as ImageIcon,
  Palette,
  Monitor,
  Download,
  Star,
  Bell,
  MapPin,
  Plus,
  Vibrate,
  BellRing,
  Waves,
  Brain,
  Droplets,
  Users,
} from "lucide-react";

// Fitness Apps Data
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

const initialFitnessApps: FitnessApp[] = [
  { id: "strava", name: "Strava", icon: "🏃", color: "from-orange-500 to-orange-600", connected: false, lastSync: "Never", dataTypes: ["Running", "Cycling", "Swimming", "GPS Routes"], premium: false, syncFrequency: "Real-time", syncedData: {} },
  { id: "myfitnesspal", name: "MyFitnessPal", icon: "🍎", color: "from-blue-500 to-blue-600", connected: false, lastSync: "Never", dataTypes: ["Calories", "Macros", "Meals", "Water"], premium: false, syncFrequency: "Every 15 min", syncedData: {} },
  { id: "apple-health", name: "Apple Health", icon: "❤️", color: "from-red-500 to-pink-500", connected: false, lastSync: "Never", dataTypes: ["Steps", "Heart Rate", "Sleep", "ECG"], premium: true, syncFrequency: "Real-time", syncedData: {} },
  { id: "google-fit", name: "Google Fit", icon: "💪", color: "from-green-500 to-emerald-500", connected: false, lastSync: "Never", dataTypes: ["Steps", "Heart Points", "Workouts"], premium: false, syncFrequency: "Every 30 min", syncedData: {} },
  { id: "fitbit", name: "Fitbit", icon: "⌚", color: "from-teal-500 to-cyan-500", connected: false, lastSync: "Never", dataTypes: ["Steps", "Sleep Score", "Heart Rate Zones"], premium: false, syncFrequency: "Hourly", syncedData: {} },
  { id: "garmin-connect", name: "Garmin Connect", icon: "🎯", color: "from-purple-500 to-indigo-500", connected: false, lastSync: "Never", dataTypes: ["Training Load", "VO2 Max", "Recovery"], premium: true, syncFrequency: "Real-time", syncedData: {} },
];

// Watch Data
interface SmartWatchData {
  id: string;
  name: string;
  model: string;
  brand: string;
  connected: boolean;
  batteryLevel: number;
  signalStrength: number;
  heartRate?: number;
  steps?: number;
  calories?: number;
  lastSync: string;
  status: "connected" | "disconnected" | "syncing";
}

const initialWatches: SmartWatchData[] = [
  { id: "apple-watch", name: "Apple Watch Ultra 2", model: "49mm", brand: "Apple", connected: true, batteryLevel: 84, signalStrength: 95, heartRate: 72, steps: 8432, calories: 324, lastSync: "2 min ago", status: "connected" },
  { id: "samsung-watch", name: "Galaxy Watch 6", model: "47mm", brand: "Samsung", connected: false, batteryLevel: 32, signalStrength: 0, lastSync: "1 hour ago", status: "disconnected" },
  { id: "garmin-watch", name: "Forerunner 965", model: "Sport", brand: "Garmin", connected: true, batteryLevel: 92, signalStrength: 87, heartRate: 68, steps: 12847, calories: 425, lastSync: "Just now", status: "connected" },
];

// Watch Faces
const watchFaces = [
  { id: "digital-fitness", name: "Digital Fitness", category: "Digital", icon: "⏱️", color: "from-blue-500 to-cyan-500", popular: true },
  { id: "analog-classic", name: "Analog Classic", category: "Analog", icon: "🕐", color: "from-amber-500 to-orange-500", popular: true },
  { id: "minimal-steps", name: "Minimal Steps", category: "Minimal", icon: "👟", color: "from-green-500 to-emerald-500", popular: false },
  { id: "heart-zone", name: "Heart Zone", category: "Fitness", icon: "❤️", color: "from-red-500 to-pink-500", popular: true },
  { id: "calorie-tracker", name: "Calorie Tracker", category: "Fitness", icon: "🔥", color: "from-orange-500 to-red-500", popular: false },
  { id: "sleep-monitor", name: "Sleep Monitor", category: "Health", icon: "😴", color: "from-purple-500 to-indigo-500", popular: true },
  { id: "sports-pro", name: "Sports Pro", category: "Fitness", icon: "🏆", color: "from-yellow-500 to-amber-500", popular: false },
  { id: "nature-zen", name: "Nature Zen", category: "Lifestyle", icon: "🌿", color: "from-green-600 to-teal-500", popular: false },
];

export function UnifiedFitnessHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [apps, setApps] = useState<FitnessApp[]>(() => {
    try {
      const saved = localStorage.getItem("fitness-apps-data");
      return saved ? JSON.parse(saved) : initialFitnessApps;
    } catch { return initialFitnessApps; }
  });
  const [watches, setWatches] = useState<SmartWatchData[]>(() => {
    try {
      const saved = localStorage.getItem("smartwatch-data");
      return saved ? JSON.parse(saved) : initialWatches;
    } catch { return initialWatches; }
  });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [selectedWatchFace, setSelectedWatchFace] = useState("digital-fitness");
  const [showFindDevice, setShowFindDevice] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [isFinding, setIsFinding] = useState(false);

  useEffect(() => {
    localStorage.setItem("fitness-apps-data", JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem("smartwatch-data", JSON.stringify(watches));
  }, [watches]);

  const connectedApps = apps.filter(a => a.connected).length;
  const connectedWatches = watches.filter(w => w.connected).length;
  const totalSteps = apps.reduce((sum, a) => sum + (a.syncedData.steps || 0), 0) + watches.reduce((sum, w) => sum + (w.steps || 0), 0);
  const totalCalories = apps.reduce((sum, a) => sum + (a.syncedData.calories || 0), 0) + watches.reduce((sum, w) => sum + (w.calories || 0), 0);
  const avgHeartRate = Math.round([...apps.filter(a => a.syncedData.heartRate), ...watches.filter(w => w.heartRate)].reduce((sum, d) => sum + ((d as any).syncedData?.heartRate || (d as any).heartRate || 0), 0) / Math.max([...apps.filter(a => a.syncedData.heartRate), ...watches.filter(w => w.heartRate)].length, 1));

  const handleConnectApp = async (appId: string) => {
    setConnecting(appId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setApps(prev => prev.map(app => 
      app.id === appId ? {
        ...app, connected: true, lastSync: "Just now",
        syncedData: {
          steps: Math.floor(Math.random() * 10000) + 5000,
          calories: Math.floor(Math.random() * 500) + 300,
          heartRate: Math.floor(Math.random() * 30) + 60,
          sleep: Math.floor(Math.random() * 3) + 6,
          workouts: Math.floor(Math.random() * 5) + 1,
          distance: Math.round((Math.random() * 10 + 2) * 10) / 10,
        }
      } : app
    ));
    setConnecting(null);
    toast({ title: "Connected!", description: `${apps.find(a => a.id === appId)?.name} is now syncing` });
  };

  const handleDisconnectApp = (appId: string) => {
    setApps(prev => prev.map(app => 
      app.id === appId ? { ...app, connected: false, lastSync: "Never", syncedData: {} } : app
    ));
    toast({ title: "Disconnected", description: "App has been disconnected" });
  };

  const handleSyncAll = async () => {
    setSyncing("all");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setApps(prev => prev.map(app => app.connected ? {
      ...app, lastSync: "Just now",
      syncedData: {
        steps: Math.floor(Math.random() * 10000) + 5000,
        calories: Math.floor(Math.random() * 500) + 300,
        heartRate: Math.floor(Math.random() * 30) + 60,
        sleep: Math.floor(Math.random() * 3) + 6,
        workouts: Math.floor(Math.random() * 5) + 1,
        distance: Math.round((Math.random() * 10 + 2) * 10) / 10,
      }
    } : app));
    
    setWatches(prev => prev.map(watch => watch.connected ? {
      ...watch, lastSync: "Just now",
      heartRate: 65 + Math.floor(Math.random() * 25),
      steps: (watch.steps || 0) + Math.floor(Math.random() * 500),
      calories: (watch.calories || 0) + Math.floor(Math.random() * 50),
    } : watch));
    
    setSyncing(null);
    toast({ title: "Sync Complete", description: "All devices synchronized" });
  };

  const handleConnectWatch = async (watchId: string) => {
    setWatches(prev => prev.map(w => w.id === watchId ? { ...w, status: "syncing" as const } : w));
    await new Promise(resolve => setTimeout(resolve, 2000));
    setWatches(prev => prev.map(w => w.id === watchId ? {
      ...w, connected: true, status: "connected" as const, lastSync: "Just now",
      signalStrength: 85 + Math.floor(Math.random() * 15),
      heartRate: 65 + Math.floor(Math.random() * 20),
      steps: 5000 + Math.floor(Math.random() * 5000),
      calories: 200 + Math.floor(Math.random() * 300),
    } : w));
    toast({ title: "Watch Connected!", description: "Successfully connected to your smartwatch" });
  };

  const handleFindDevice = async () => {
    setIsFinding(true);
    toast({ title: "Finding Device...", description: "Sending signal to your watch" });
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsFinding(false);
    toast({ title: "Device Found!", description: "Your watch should be vibrating now" });
  };

  const handleApplyWatchFace = (faceId: string) => {
    setSelectedWatchFace(faceId);
    toast({ title: "Watch Face Applied!", description: `${watchFaces.find(f => f.id === faceId)?.name} is now active` });
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-500";
    if (level > 20) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Fitness Hub</h2>
              <p className="text-sm text-muted-foreground font-normal">
                Apps, Wearables & Health Data • All-in-One
              </p>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {connectedApps + connectedWatches} Connected
            </Badge>
            <Button variant="outline" size="sm" onClick={handleSyncAll} disabled={syncing === "all"}>
              <RefreshCw className={`h-4 w-4 mr-1 ${syncing === "all" ? 'animate-spin' : ''}`} />
              Sync All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats Summary */}
        {(connectedApps > 0 || connectedWatches > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-xl border"
          >
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Today's Combined Stats
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Footprints, label: "Steps", value: totalSteps.toLocaleString(), color: "text-blue-600" },
                { icon: Flame, label: "Calories", value: totalCalories, color: "text-orange-600" },
                { icon: Heart, label: "Avg HR", value: `${avgHeartRate || '--'} bpm`, color: "text-red-600" },
                { icon: Dumbbell, label: "Workouts", value: apps.reduce((sum, a) => sum + (a.syncedData.workouts || 0), 0), color: "text-purple-600" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-bold text-sm">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="apps" className="text-xs">Apps</TabsTrigger>
            <TabsTrigger value="watches" className="text-xs">Watches</TabsTrigger>
            <TabsTrigger value="faces" className="text-xs">Watch Faces</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5" />
                  <span className="font-medium">Connected Apps</span>
                </div>
                <p className="text-3xl font-bold">{connectedApps}</p>
                <p className="text-sm opacity-80">of {apps.length} available</p>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Watch className="h-5 w-5" />
                  <span className="font-medium">Smartwatches</span>
                </div>
                <p className="text-3xl font-bold">{connectedWatches}</p>
                <p className="text-sm opacity-80">of {watches.length} paired</p>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTab("apps")} className="h-auto py-3 flex-col gap-1">
                <Link2 className="h-4 w-4" />
                <span className="text-xs">Add App</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFindDevice(true)} className="h-auto py-3 flex-col gap-1">
                <MapPin className="h-4 w-4" />
                <span className="text-xs">Find Watch</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("faces")} className="h-auto py-3 flex-col gap-1">
                <Palette className="h-4 w-4" />
                <span className="text-xs">Watch Faces</span>
              </Button>
            </div>

            {/* Innovative Features */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                Smart Features
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-3 border-dashed">
                  <div className="flex items-center gap-2 mb-1">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium">Smart Alarms</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Wake up during light sleep</p>
                </Card>
                <Card className="p-3 border-dashed">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm font-medium">Hydration</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Water intake reminders</p>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Apps Tab */}
          <TabsContent value="apps">
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-3">
                {apps.map((app) => (
                  <motion.div key={app.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card className={`p-4 transition-all hover:shadow-md ${app.connected ? 'border-green-200' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center text-xl shadow-lg`}>
                          {app.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{app.name}</h4>
                            {app.premium && <Badge variant="secondary" className="text-xs"><Zap className="h-3 w-3 mr-1" />Pro</Badge>}
                            {app.connected && <Badge className="bg-green-100 text-green-700 text-xs"><Check className="h-3 w-3 mr-1" />Connected</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{app.dataTypes.slice(0, 3).join(", ")}</p>
                          {app.connected && <p className="text-xs text-muted-foreground mt-1">Last sync: {app.lastSync}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {app.connected ? (
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDisconnectApp(app.id)}>
                              <Link2Off className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => handleConnectApp(app.id)} disabled={connecting === app.id} className={`bg-gradient-to-r ${app.color} text-white`}>
                              {connecting === app.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Watches Tab */}
          <TabsContent value="watches">
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-3">
                {watches.map((watch) => (
                  <motion.div key={watch.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card className={`p-4 transition-all hover:shadow-md ${watch.connected ? 'border-green-200' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                          <Watch className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{watch.name}</h4>
                            {watch.connected ? (
                              <Badge className="bg-green-100 text-green-700 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Online</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Offline</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{watch.brand} • {watch.model}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className={`flex items-center gap-1 ${getBatteryColor(watch.batteryLevel)}`}>
                              <Battery className="h-3 w-3" />{watch.batteryLevel}%
                            </span>
                            {watch.connected && (
                              <>
                                <span className="flex items-center gap-1 text-red-500">
                                  <Heart className="h-3 w-3" />{watch.heartRate} bpm
                                </span>
                                <span className="flex items-center gap-1 text-blue-500">
                                  <Footprints className="h-3 w-3" />{watch.steps?.toLocaleString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!watch.connected && (
                            <Button size="sm" onClick={() => handleConnectWatch(watch.id)} disabled={watch.status === "syncing"}>
                              {watch.status === "syncing" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Bluetooth className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setShowAddDevice(true)}>
                  <Plus className="h-4 w-4 mr-2" />Add New Device
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Watch Faces Tab */}
          <TabsContent value="faces">
            <ScrollArea className="h-[350px] pr-4">
              <div className="grid grid-cols-2 gap-3">
                {watchFaces.map((face) => (
                  <motion.div key={face.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card 
                      className={`p-3 cursor-pointer transition-all ${selectedWatchFace === face.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'hover:shadow-md'}`}
                      onClick={() => handleApplyWatchFace(face.id)}
                    >
                      <div className={`w-full aspect-square bg-gradient-to-br ${face.color} rounded-xl flex items-center justify-center text-3xl mb-2 shadow-inner`}>
                        {face.icon}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{face.name}</p>
                          <p className="text-xs text-muted-foreground">{face.category}</p>
                        </div>
                        {face.popular && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      </div>
                      {selectedWatchFace === face.id && (
                        <Badge className="mt-2 w-full justify-center bg-blue-500">Active</Badge>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Find Device Dialog */}
        <Dialog open={showFindDevice} onOpenChange={setShowFindDevice}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Find My Device
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a device to locate. It will vibrate and play a sound.
              </p>
              {watches.filter(w => w.connected).map((watch) => (
                <Card key={watch.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Watch className="h-5 w-5" />
                      <div>
                        <p className="font-medium">{watch.name}</p>
                        <p className="text-xs text-muted-foreground">{watch.brand}</p>
                      </div>
                    </div>
                    <Button onClick={handleFindDevice} disabled={isFinding} size="sm">
                      {isFinding ? <Waves className="h-4 w-4 animate-pulse" /> : <BellRing className="h-4 w-4" />}
                      {isFinding ? "Finding..." : "Find"}
                    </Button>
                  </div>
                </Card>
              ))}
              {watches.filter(w => w.connected).length === 0 && (
                <p className="text-center text-muted-foreground py-4">No connected devices</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

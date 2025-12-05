import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Activity, Heart, Footprints, Flame, Moon, Dumbbell, TrendingUp, RefreshCw, Check, Settings,
  Watch, Battery, Wifi, Signal, CheckCircle, AlertTriangle, Smartphone, Bluetooth, Target,
  PlayCircle, Palette, Download, Star, Bell, MapPin, Plus, Brain, Droplets, Zap, Timer,
  Sparkles, Crown, Waves, Sun, CloudRain, Thermometer, Wind,
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
  syncedData: { steps?: number; calories?: number; heartRate?: number; sleep?: number; workouts?: number; distance?: number; };
}

interface SmartWatch {
  id: string;
  name: string;
  brand: string;
  connected: boolean;
  batteryLevel: number;
  signalStrength: number;
  heartRate?: number;
  steps?: number;
  calories?: number;
  lastSync: string;
}

interface WatchFace {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  popular: boolean;
  premium: boolean;
}

const fitnessApps: FitnessApp[] = [
  { id: "strava", name: "Strava", icon: "🏃", color: "from-orange-500 to-orange-600", connected: false, lastSync: "Never", dataTypes: ["Running", "Cycling", "GPS"], premium: false, syncedData: {} },
  { id: "myfitnesspal", name: "MyFitnessPal", icon: "🍎", color: "from-blue-500 to-blue-600", connected: false, lastSync: "Never", dataTypes: ["Calories", "Macros", "Meals"], premium: false, syncedData: {} },
  { id: "apple-health", name: "Apple Health", icon: "❤️", color: "from-red-500 to-pink-500", connected: false, lastSync: "Never", dataTypes: ["Steps", "Heart Rate", "Sleep"], premium: true, syncedData: {} },
  { id: "google-fit", name: "Google Fit", icon: "💪", color: "from-green-500 to-emerald-500", connected: false, lastSync: "Never", dataTypes: ["Steps", "Workouts"], premium: false, syncedData: {} },
  { id: "fitbit", name: "Fitbit", icon: "⌚", color: "from-teal-500 to-cyan-500", connected: false, lastSync: "Never", dataTypes: ["Sleep Score", "HR Zones"], premium: false, syncedData: {} },
  { id: "garmin", name: "Garmin Connect", icon: "🎯", color: "from-purple-500 to-indigo-500", connected: false, lastSync: "Never", dataTypes: ["VO2 Max", "Recovery"], premium: true, syncedData: {} },
];

const smartWatches: SmartWatch[] = [
  { id: "apple", name: "Apple Watch Ultra 2", brand: "Apple", connected: true, batteryLevel: 84, signalStrength: 95, heartRate: 72, steps: 8432, calories: 324, lastSync: "2 min ago" },
  { id: "samsung", name: "Galaxy Watch 6", brand: "Samsung", connected: false, batteryLevel: 32, signalStrength: 0, lastSync: "1 hour ago" },
  { id: "garmin", name: "Forerunner 965", brand: "Garmin", connected: true, batteryLevel: 92, signalStrength: 87, heartRate: 68, steps: 12847, calories: 425, lastSync: "Just now" },
];

const watchFaces: WatchFace[] = [
  { id: "1", name: "Fitness Pro", category: "Fitness", icon: "⌚", color: "from-blue-500 to-cyan-500", popular: true, premium: false },
  { id: "2", name: "Classic Analog", category: "Analog", icon: "🕐", color: "from-amber-500 to-orange-500", popular: true, premium: false },
  { id: "3", name: "Heart Zone", category: "Health", icon: "❤️", color: "from-red-500 to-pink-500", popular: true, premium: false },
  { id: "4", name: "Minimal Steps", category: "Minimal", icon: "👟", color: "from-green-500 to-emerald-500", popular: false, premium: false },
  { id: "5", name: "Calorie Ring", category: "Fitness", icon: "🔥", color: "from-orange-500 to-red-500", popular: false, premium: false },
  { id: "6", name: "Sleep Monitor", category: "Health", icon: "😴", color: "from-purple-500 to-indigo-500", popular: true, premium: true },
  { id: "7", name: "Sports Elite", category: "Sports", icon: "🏆", color: "from-yellow-500 to-amber-500", popular: false, premium: true },
  { id: "8", name: "Nature Zen", category: "Lifestyle", icon: "🌿", color: "from-green-600 to-teal-500", popular: false, premium: false },
  { id: "9", name: "Digital Matrix", category: "Digital", icon: "💻", color: "from-cyan-500 to-blue-600", popular: true, premium: false },
  { id: "10", name: "Astronaut", category: "Special", icon: "🚀", color: "from-gray-600 to-slate-700", popular: false, premium: true },
];

export function EnhancedFitnessHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [apps, setApps] = useState<FitnessApp[]>(() => {
    const saved = localStorage.getItem("fitness-apps-v2");
    return saved ? JSON.parse(saved) : fitnessApps;
  });
  const [watches, setWatches] = useState<SmartWatch[]>(() => {
    const saved = localStorage.getItem("smart-watches-v2");
    return saved ? JSON.parse(saved) : smartWatches;
  });
  const [selectedFace, setSelectedFace] = useState("1");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [findingDevice, setFindingDevice] = useState(false);
  const [smartAlarms, setSmartAlarms] = useState(true);
  const [hydrationReminders, setHydrationReminders] = useState(true);
  const [aiCoaching, setAiCoaching] = useState(false);
  const [faceCategory, setFaceCategory] = useState("All");

  useEffect(() => {
    localStorage.setItem("fitness-apps-v2", JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem("smart-watches-v2", JSON.stringify(watches));
  }, [watches]);

  const connectedApps = apps.filter(a => a.connected).length;
  const connectedWatches = watches.filter(w => w.connected).length;
  const totalSteps = watches.reduce((sum, w) => sum + (w.steps || 0), 0) + apps.reduce((sum, a) => sum + (a.syncedData.steps || 0), 0);
  const totalCalories = watches.reduce((sum, w) => sum + (w.calories || 0), 0) + apps.reduce((sum, a) => sum + (a.syncedData.calories || 0), 0);

  const handleConnectApp = async (appId: string) => {
    setConnecting(appId);
    await new Promise(r => setTimeout(r, 2000));
    setApps(prev => prev.map(a => a.id === appId ? { ...a, connected: true, lastSync: "Just now", syncedData: { steps: Math.floor(Math.random() * 8000) + 3000, calories: Math.floor(Math.random() * 400) + 200, heartRate: Math.floor(Math.random() * 25) + 60 } } : a));
    setConnecting(null);
    toast({ title: "✅ Connected!", description: `${apps.find(a => a.id === appId)?.name} is now syncing.` });
  };

  const handleDisconnectApp = (appId: string) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, connected: false, syncedData: {} } : a));
    toast({ title: "Disconnected", description: "App has been disconnected." });
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setApps(prev => prev.map(a => a.connected ? { ...a, lastSync: "Just now", syncedData: { ...a.syncedData, steps: (a.syncedData.steps || 0) + Math.floor(Math.random() * 500) } } : a));
    setWatches(prev => prev.map(w => w.connected ? { ...w, lastSync: "Just now", steps: (w.steps || 0) + Math.floor(Math.random() * 300), heartRate: 60 + Math.floor(Math.random() * 30) } : w));
    setSyncing(false);
    toast({ title: "🔄 Sync Complete", description: "All devices synchronized successfully." });
  };

  const handleFindDevice = async () => {
    setFindingDevice(true);
    toast({ title: "📍 Finding Device", description: "Sending signal to your watch..." });
    await new Promise(r => setTimeout(r, 3000));
    setFindingDevice(false);
    toast({ title: "✅ Device Found!", description: "Your watch should be vibrating now." });
  };

  const handleApplyFace = (faceId: string) => {
    setSelectedFace(faceId);
    toast({ title: "⌚ Watch Face Applied!", description: `${watchFaces.find(f => f.id === faceId)?.name} is now active.` });
  };

  const filteredFaces = faceCategory === "All" ? watchFaces : watchFaces.filter(f => f.category === faceCategory);
  const categories = ["All", ...new Set(watchFaces.map(f => f.category))];

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="p-2.5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Fitness Hub
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Pro</Badge>
              </h2>
              <p className="text-sm text-muted-foreground font-normal">Apps • Watches • Health Data</p>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {connectedApps + connectedWatches} Connected
            </Badge>
            <Button variant="outline" size="sm" onClick={handleSyncAll} disabled={syncing}>
              <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Summary */}
        {(connectedApps > 0 || connectedWatches > 0) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-xl border">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />Today's Stats
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Footprints, label: "Steps", value: totalSteps.toLocaleString(), color: "text-blue-600" },
                { icon: Flame, label: "Calories", value: totalCalories, color: "text-orange-600" },
                { icon: Heart, label: "Heart Rate", value: "72 bpm", color: "text-red-600" },
                { icon: Dumbbell, label: "Workouts", value: "3", color: "text-purple-600" },
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="apps" className="text-xs">Apps</TabsTrigger>
            <TabsTrigger value="watches" className="text-xs">Watches</TabsTrigger>
            <TabsTrigger value="faces" className="text-xs">Faces</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center gap-2 mb-2"><Smartphone className="h-5 w-5" /><span className="font-medium">Apps</span></div>
                <p className="text-3xl font-bold">{connectedApps}</p>
                <p className="text-sm opacity-80">of {apps.length} available</p>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center gap-2 mb-2"><Watch className="h-5 w-5" /><span className="font-medium">Watches</span></div>
                <p className="text-3xl font-bold">{connectedWatches}</p>
                <p className="text-sm opacity-80">of {watches.length} paired</p>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTab("apps")} className="h-auto py-3 flex-col gap-1">
                <Plus className="h-4 w-4" /><span className="text-xs">Add App</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleFindDevice} disabled={findingDevice} className="h-auto py-3 flex-col gap-1">
                <MapPin className={`h-4 w-4 ${findingDevice ? 'animate-ping' : ''}`} /><span className="text-xs">Find Watch</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("faces")} className="h-auto py-3 flex-col gap-1">
                <Palette className="h-4 w-4" /><span className="text-xs">Watch Faces</span>
              </Button>
            </div>

            {/* AI Features */}
            <Card className="p-4 border-dashed">
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-purple-600" />AI Smart Features
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    <div><p className="text-sm font-medium">Smart Alarms</p><p className="text-xs text-muted-foreground">Wake during light sleep</p></div>
                  </div>
                  <Switch checked={smartAlarms} onCheckedChange={setSmartAlarms} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-cyan-500" />
                    <div><p className="text-sm font-medium">Hydration Reminders</p><p className="text-xs text-muted-foreground">Stay hydrated throughout day</p></div>
                  </div>
                  <Switch checked={hydrationReminders} onCheckedChange={setHydrationReminders} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <div><p className="text-sm font-medium">AI Coaching</p><p className="text-xs text-muted-foreground">Personalized workout suggestions</p></div>
                  </div>
                  <Switch checked={aiCoaching} onCheckedChange={setAiCoaching} />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="apps">
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-3">
                {apps.map((app) => (
                  <motion.div key={app.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card className={`p-4 transition-all hover:shadow-md ${app.connected ? 'border-green-200' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center text-xl shadow-lg`}>
                          {app.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{app.name}</span>
                            {app.premium && <Crown className="h-3.5 w-3.5 text-yellow-500" />}
                            {app.connected && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{app.dataTypes.join(" • ")}</p>
                          {app.connected && <p className="text-xs text-green-600">Last sync: {app.lastSync}</p>}
                        </div>
                        <Button variant={app.connected ? "outline" : "default"} size="sm" disabled={connecting === app.id}
                          onClick={() => app.connected ? handleDisconnectApp(app.id) : handleConnectApp(app.id)}>
                          {connecting === app.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : app.connected ? "Disconnect" : "Connect"}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="watches">
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-3">
                {watches.map((watch) => (
                  <Card key={watch.id} className={`p-4 ${watch.connected ? 'border-green-200' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${watch.connected ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-muted'}`}>
                        <Watch className={`h-6 w-6 ${watch.connected ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{watch.name}</span>
                          {watch.connected && <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Active</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{watch.brand} • Last sync: {watch.lastSync}</p>
                        {watch.connected && (
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className={`flex items-center gap-1 ${watch.batteryLevel > 20 ? 'text-green-600' : 'text-red-600'}`}>
                              <Battery className="h-3 w-3" />{watch.batteryLevel}%
                            </span>
                            <span className="flex items-center gap-1 text-blue-600"><Heart className="h-3 w-3" />{watch.heartRate} bpm</span>
                            <span className="flex items-center gap-1 text-purple-600"><Footprints className="h-3 w-3" />{watch.steps?.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => watch.connected ? null : toast({ title: "Connecting...", description: "Please wait..." })}>
                        {watch.connected ? <Settings className="h-4 w-4" /> : "Pair"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="faces">
            <div className="space-y-3">
              <ScrollArea className="w-full whitespace-nowrap pb-2">
                <div className="flex gap-2">
                  {categories.map((cat) => (
                    <Button key={cat} variant={faceCategory === cat ? "default" : "outline"} size="sm" onClick={() => setFaceCategory(cat)}>
                      {cat}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
              
              <ScrollArea className="h-[280px] pr-4">
                <div className="grid grid-cols-2 gap-3">
                  {filteredFaces.map((face) => (
                    <motion.div key={face.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Card className={`p-3 cursor-pointer transition-all ${selectedFace === face.id ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'}`}
                        onClick={() => handleApplyFace(face.id)}>
                        <div className={`w-full aspect-square bg-gradient-to-br ${face.color} rounded-xl flex items-center justify-center text-4xl mb-2 relative`}>
                          {face.icon}
                          {face.premium && (
                            <div className="absolute top-1 right-1 p-1 bg-yellow-500 rounded-full">
                              <Crown className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {selectedFace === face.id && (
                            <div className="absolute bottom-1 right-1 p-1 bg-green-500 rounded-full">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{face.name}</p>
                            <p className="text-xs text-muted-foreground">{face.category}</p>
                          </div>
                          {face.popular && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

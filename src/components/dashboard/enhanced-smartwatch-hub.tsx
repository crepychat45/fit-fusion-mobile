import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import watchFacesImage from "@/assets/watch-faces-preview.jpg";
import watchWallpapersImage from "@/assets/watch-wallpapers.jpg";
import {
  Watch,
  Battery,
  Heart,
  Activity,
  Wifi,
  Settings,
  RefreshCw,
  Signal,
  Zap,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Bluetooth,
  Target,
  Calendar,
  TrendingUp,
  Shield,
  PlayCircle,
  PauseCircle,
  Image as ImageIcon,
  Palette,
  Monitor,
  Download,
  Star,
  Clock,
} from "lucide-react";

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
  distance?: number;
  activeMinutes?: number;
  lastSync: string;
  status: "connected" | "disconnected" | "syncing";
  features: string[];
  isRecording: boolean;
}

interface WorkoutData {
  name: string;
  duration: string;
  heartRate: number;
  calories: number;
  status: "active" | "paused" | "completed";
}

const mockWatchDevices: SmartWatchData[] = [
  {
    id: "apple-watch-1",
    name: "Apple Watch Ultra 2",
    model: "49mm Titanium",
    brand: "Apple",
    connected: true,
    batteryLevel: 84,
    signalStrength: 95,
    heartRate: 72,
    steps: 8432,
    calories: 324,
    distance: 5.2,
    activeMinutes: 45,
    lastSync: "2 minutes ago",
    status: "connected",
    features: [
      "GPS",
      "ECG",
      "Blood Oxygen",
      "Sleep Tracking",
      "Workout Detection",
    ],
    isRecording: true,
  },
  {
    id: "samsung-watch-1",
    name: "Galaxy Watch 6 Classic",
    model: "47mm LTE",
    brand: "Samsung",
    connected: false,
    batteryLevel: 32,
    signalStrength: 0,
    lastSync: "1 hour ago",
    status: "disconnected",
    features: [
      "GPS",
      "Heart Rate",
      "Sleep Tracking",
      "SpO2",
      "Body Composition",
    ],
    isRecording: false,
  },
  {
    id: "garmin-watch-1",
    name: "Forerunner 965",
    model: "Sport Edition",
    brand: "Garmin",
    connected: true,
    batteryLevel: 92,
    signalStrength: 87,
    heartRate: 68,
    steps: 12847,
    calories: 425,
    distance: 8.1,
    activeMinutes: 72,
    lastSync: "Just now",
    status: "connected",
    features: [
      "GPS",
      "Training Load",
      "VO2 Max",
      "Recovery Time",
      "Race Predictor",
    ],
    isRecording: false,
  },
];

const currentWorkout: WorkoutData = {
  name: "HIIT Cardio",
  duration: "18:32",
  heartRate: 142,
  calories: 184,
  status: "active",
};

export function EnhancedSmartwatchHub() {
  const [watches, setWatches] = useState<SmartWatchData[]>(mockWatchDevices);
  const [selectedWatch, setSelectedWatch] = useState<string>(
    mockWatchDevices[0]?.id || "",
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutData | null>(
    currentWorkout,
  );
  const [selectedWallpaper, setSelectedWallpaper] = useState("nature");
  const [selectedWatchFace, setSelectedWatchFace] = useState("analog");
  const [showCustomization, setShowCustomization] = useState(false);
  const [watchSettings, setWatchSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("smartwatch-settings");
      return saved
        ? JSON.parse(saved)
        : {
            notifications: true,
            heartRateMonitoring: true,
            sleepTracking: true,
            workoutAutoDetect: true,
            alwaysOnDisplay: false,
            waterReminder: true,
          };
    } catch {
      return {
        notifications: true,
        heartRateMonitoring: true,
        sleepTracking: true,
        workoutAutoDetect: true,
        alwaysOnDisplay: false,
        waterReminder: true,
      };
    }
  });
  const { toast } = useToast();

  const selectedWatchData = watches.find((w) => w.id === selectedWatch);

  const handleConnect = async (watchId: string) => {
    setWatches((prev) =>
      prev.map((watch) =>
        watch.id === watchId ? { ...watch, status: "syncing" as const } : watch,
      ),
    );

    // Simulate connection process
    setTimeout(() => {
      setWatches((prev) =>
        prev.map((watch) =>
          watch.id === watchId
            ? {
                ...watch,
                connected: true,
                status: "connected" as const,
                lastSync: "Just now",
                signalStrength: 85 + Math.floor(Math.random() * 15),
                heartRate: 65 + Math.floor(Math.random() * 20),
                steps: 5000 + Math.floor(Math.random() * 5000),
                calories: 200 + Math.floor(Math.random() * 300),
              }
            : watch,
        ),
      );

      toast({
        title: "🎉 Watch Connected!",
        description: `Successfully connected to ${watches.find((w) => w.id === watchId)?.name}`,
      });
    }, 2000);
  };

  const handleDisconnect = (watchId: string) => {
    setWatches((prev) =>
      prev.map((watch) =>
        watch.id === watchId
          ? {
              ...watch,
              connected: false,
              status: "disconnected" as const,
              signalStrength: 0,
              heartRate: undefined,
              steps: undefined,
              calories: undefined,
              isRecording: false,
            }
          : watch,
      ),
    );

    toast({
      title: "📱 Watch Disconnected",
      description: "Device has been safely disconnected",
    });
  };

  const handleSyncAll = async () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setWatches((prev) =>
        prev.map((watch) =>
          watch.connected
            ? {
                ...watch,
                lastSync: "Just now",
                batteryLevel: Math.max(
                  0,
                  Math.min(
                    100,
                    watch.batteryLevel + Math.floor(Math.random() * 5) - 2,
                  ),
                ),
                heartRate: watch.heartRate
                  ? 65 + Math.floor(Math.random() * 25)
                  : undefined,
                steps: watch.steps
                  ? watch.steps + Math.floor(Math.random() * 100)
                  : undefined,
                calories: watch.calories
                  ? watch.calories + Math.floor(Math.random() * 20)
                  : undefined,
              }
            : watch,
        ),
      );
      setIsRefreshing(false);

      toast({
        title: "🔄 Sync Complete",
        description: "All connected devices have been synchronized",
      });
    }, 1500);
  };

  const handleSettingsChange = (key: string, value: boolean) => {
    const newSettings = { ...watchSettings, [key]: value };
    setWatchSettings(newSettings);

    // Save to localStorage
    try {
      localStorage.setItem("smartwatch-settings", JSON.stringify(newSettings));
      toast({
        title: "Settings Updated",
        description: `${key.replace(/([A-Z])/g, " $1")} has been ${value ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleWorkoutAction = () => {
    if (!activeWorkout) return;

    if (activeWorkout.status === "active") {
      setActiveWorkout({ ...activeWorkout, status: "paused" });
      toast({ title: "⏸️ Workout Paused", description: "Take a breather!" });
    } else {
      setActiveWorkout({ ...activeWorkout, status: "active" });
      toast({ title: "▶️ Workout Resumed", description: "Keep pushing!" });
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-500";
    if (level > 20) return "text-yellow-500";
    return "text-red-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "apple":
        return "from-gray-500 to-gray-700";
      case "samsung":
        return "from-blue-500 to-blue-700";
      case "garmin":
        return "from-green-500 to-green-700";
      default:
        return "from-purple-500 to-purple-700";
    }
  };

  return (
    <Card className="w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Watch className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">SmartWatch Hub</h2>
              <p className="text-sm text-muted-foreground font-normal">
                Unified device management and real-time monitoring
              </p>
            </div>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              {watches.filter((w) => w.connected).length} Connected
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncAll}
              disabled={isRefreshing}
              className="bg-white/50 backdrop-blur-sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Sync All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs
          value={selectedWatch}
          onValueChange={setSelectedWatch}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {watches.map((watch) => (
              <TabsTrigger
                key={watch.id}
                value={watch.id}
                className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${watch.connected ? "bg-green-400" : "bg-red-400"}`}
                  />
                  <span className="hidden sm:inline">{watch.brand}</span>
                  <span className="sm:hidden">{watch.brand[0]}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {watches.map((watch) => (
            <TabsContent key={watch.id} value={watch.id} className="space-y-6">
              {/* Device Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border ${
                  watch.connected
                    ? "border-green-200 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20"
                    : "border-gray-200 bg-gray-50 dark:bg-gray-900"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Device Visual */}
                  <div className="relative">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${getBrandColor(watch.brand)} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <Watch className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      {getStatusIcon(watch.status)}
                    </div>
                    {watch.isRecording && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Device Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{watch.name}</h3>
                      <Badge
                        variant={watch.connected ? "default" : "secondary"}
                        className={watch.connected ? "bg-green-600" : ""}
                      >
                        {watch.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {watch.model}
                    </p>

                    {/* Key Metrics */}
                    {watch.connected && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                          <Heart className="h-4 w-4 text-red-500" />
                          <div>
                            <div className="font-semibold text-sm">
                              {watch.heartRate}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              BPM
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="font-semibold text-sm">
                              {watch.steps?.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Steps
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                          <Zap className="h-4 w-4 text-orange-500" />
                          <div>
                            <div className="font-semibold text-sm">
                              {watch.calories}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Cal
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                          <Target className="h-4 w-4 text-green-500" />
                          <div>
                            <div className="font-semibold text-sm">
                              {watch.distance}km
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Distance
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Battery & Signal */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Battery
                          className={`h-4 w-4 ${getBatteryColor(watch.batteryLevel)}`}
                        />
                        <span>{watch.batteryLevel}%</span>
                        <Progress
                          value={watch.batteryLevel}
                          className="h-2 w-16"
                        />
                      </div>

                      {watch.connected && (
                        <div className="flex items-center gap-2">
                          <Signal className="h-4 w-4 text-blue-500" />
                          <span>{watch.signalStrength}%</span>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Synced: {watch.lastSync}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {watch.connected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(watch.id)}
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        >
                          Disconnect
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Watch Settings</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {Object.entries(watchSettings).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="capitalize">
                                      {key.replace(/([A-Z])/g, " $1")}
                                    </span>
                                    <Button
                                      variant={value ? "default" : "outline"}
                                      size="sm"
                                      onClick={() =>
                                        handleSettingsChange(key, !value)
                                      }
                                    >
                                      {value ? "Enabled" : "Disabled"}
                                    </Button>
                                  </div>
                                ),
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleConnect(watch.id)}
                        disabled={watch.status === "syncing"}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {watch.status === "syncing" ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Bluetooth className="h-4 w-4 mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Features & Customization */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Features & Capabilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {watch.features.map((feature, index) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Watch Customization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Palette className="h-5 w-5 text-purple-600" />
                      Watch Customization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Watch Faces */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 h-auto p-3"
                        >
                          <Clock className="h-4 w-4" />
                          <div className="text-left">
                            <div className="font-medium">Watch Faces</div>
                            <div className="text-xs text-muted-foreground">
                              Choose from 50+ designs
                            </div>
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Choose Watch Face</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <img
                            src={watchFacesImage}
                            alt="Watch Faces"
                            className="w-full rounded-lg"
                          />
                          <div className="grid grid-cols-4 gap-2">
                            {["Digital", "Analog", "Sport", "Minimal"].map(
                              (face) => (
                                <Button key={face} variant="outline" size="sm">
                                  {face}
                                </Button>
                              ),
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Wallpapers */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 h-auto p-3"
                        >
                          <ImageIcon className="h-4 w-4" />
                          <div className="text-left">
                            <div className="font-medium">Wallpapers</div>
                            <div className="text-xs text-muted-foreground">
                              Personalize your display
                            </div>
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Choose Wallpaper</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <img
                            src={watchWallpapersImage}
                            alt="Watch Wallpapers"
                            className="w-full rounded-lg"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            {["Nature", "Abstract", "Fitness"].map(
                              (wallpaper) => (
                                <Button
                                  key={wallpaper}
                                  variant={
                                    selectedWallpaper ===
                                    wallpaper.toLowerCase()
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    setSelectedWallpaper(
                                      wallpaper.toLowerCase(),
                                    )
                                  }
                                >
                                  {wallpaper}
                                </Button>
                              ),
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Quick Settings */}
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(watchSettings).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <span className="text-xs capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <Button
                            variant={value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSettingsChange(key, !value)}
                            className="h-6 px-2"
                          >
                            {value ? "On" : "Off"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Workout & Device Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Workout */}
                {activeWorkout && watch.connected && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-600" />
                        Active Workout
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                          <h4 className="font-bold text-lg text-orange-700 dark:text-orange-400">
                            {activeWorkout.name}
                          </h4>
                          <div className="grid grid-cols-3 gap-3 mt-3">
                            <div>
                              <div className="text-2xl font-bold">
                                {activeWorkout.duration}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Duration
                              </div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-red-600">
                                {activeWorkout.heartRate}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                BPM
                              </div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-orange-600">
                                {activeWorkout.calories}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Calories
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={handleWorkoutAction}
                            className={`flex-1 ${
                              activeWorkout.status === "active"
                                ? "bg-orange-600 hover:bg-orange-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {activeWorkout.status === "active" ? (
                              <>
                                <PauseCircle className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Resume
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            End Workout
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Watch Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-blue-600" />
                      Device Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span>Model:</span>
                        <span className="font-medium">{watch.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage:</span>
                        <span className="font-medium">32GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RAM:</span>
                        <span className="font-medium">1GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>OS:</span>
                        <span className="font-medium">watchOS 10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Rating:</span>
                        <span className="font-medium">50m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GPS:</span>
                        <span className="font-medium text-green-600">
                          Active
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Companion App
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

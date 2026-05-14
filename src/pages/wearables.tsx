import React, { useState, useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import {
  ChevronLeft,
  Watch,
  Smartphone,
  HeartPulse,
  Bluetooth,
  Battery,
  BarChart2,
  RefreshCw,
  Plus,
  ChevronRight,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

// Device types with icons
const deviceTypes = [
  { id: "smartwatch", name: "Smartwatch", icon: Watch },
  { id: "fitness-band", name: "Fitness Band", icon: HeartPulse },
  { id: "smartphone", name: "Smartphone", icon: Smartphone },
];

// Connected devices
const connectedDevices = [
  {
    id: "galaxy-watch",
    name: "Galaxy Watch 4",
    type: "smartwatch",
    batteryLevel: 72,
    lastSync: "10 minutes ago",
    stats: {
      steps: 6439,
      calories: 320,
      heartRate: 68,
      distance: 4.8,
    },
    connected: true,
    image: "/galaxy-watch.png", // Placeholder
  },
  {
    id: "mi-band",
    name: "Mi Smart Band 6",
    type: "fitness-band",
    batteryLevel: 45,
    lastSync: "1 hour ago",
    stats: {
      steps: 8547,
      calories: 420,
      heartRate: 72,
      distance: 5.9,
    },
    connected: true,
    image: "/mi-band.png", // Placeholder
  },
];

// Available devices to connect
const availableDevices = [
  "Apple Watch Series 7",
  "Fitbit Versa 3",
  "Garmin Venu 2",
  "Amazfit GTS 2",
  "Samsung Galaxy Watch 5",
  "Huawei Watch GT 3",
  "Polar Vantage V2",
];

const WearablesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showAddDevice, setShowAddDevice] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<string[]>([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("all");
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  // Filter devices by type
  const filteredDevices =
    selectedDeviceType === "all"
      ? connectedDevices
      : connectedDevices.filter((device) => device.type === selectedDeviceType);

  const startDeviceScan = () => {
    setScanning(true);
    setDiscoveredDevices([]);

    // Simulate Bluetooth scanning with setTimeout
    setTimeout(() => {
      // Show a random selection of available devices
      const shuffled = [...availableDevices].sort(() => 0.5 - Math.random());
      setDiscoveredDevices(shuffled.slice(0, 3));
      setScanning(false);
    }, 3000);
  };

  const connectDevice = (deviceName: string) => {
    toast({
      title: "Device Connected",
      description: `Successfully connected to ${deviceName}`,
    });
    setShowAddDevice(false);
  };

  const viewDeviceDetails = (device: any) => {
    setSelectedDevice(device);
    setShowDeviceDetails(true);
  };

  const syncDevice = (device: any) => {
    setIsSyncing(true);

    // Simulate syncing
    setTimeout(() => {
      setIsSyncing(false);

      toast({
        title: "Device Synced",
        description: `Successfully synced data from ${device.name}`,
      });
    }, 2000);
  };

  const disconnectDevice = () => {
    if (!selectedDevice) return;

    toast({
      title: "Device Disconnected",
      description: `Successfully disconnected from ${selectedDevice.name}`,
    });

    setShowDeviceDetails(false);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-white p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">
            Wearable Devices
          </h1>
        </div>
      </div>

      {/* Connected Devices */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Connected Devices</h2>

          <Dialog open={showAddDevice} onOpenChange={setShowAddDevice}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Device
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Device</DialogTitle>
                <DialogDescription>
                  Make sure your device is in pairing mode and nearby.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                {scanning ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">
                      Scanning for devices...
                    </p>
                  </div>
                ) : (
                  <>
                    {discoveredDevices.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          {discoveredDevices.length} devices found
                        </p>
                        {discoveredDevices.map((device, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-md"
                          >
                            <div className="flex items-center">
                              <div className="bg-primary/10 p-2 rounded-full mr-3">
                                <Watch className="h-4 w-4 text-primary" />
                              </div>
                              <span>{device}</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => connectDevice(device)}
                            >
                              Connect
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          No devices found
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant={scanning ? "outline" : "default"}
                  onClick={
                    scanning ? () => setScanning(false) : startDeviceScan
                  }
                  className="w-full"
                >
                  {scanning ? "Cancel Scan" : "Scan for Devices"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar mb-4">
          <Button
            variant={selectedDeviceType === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-full whitespace-nowrap"
            onClick={() => setSelectedDeviceType("all")}
          >
            All Devices
          </Button>

          {deviceTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedDeviceType === type.id ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap flex items-center gap-1"
              onClick={() => setSelectedDeviceType(type.id)}
            >
              <type.icon className="h-3.5 w-3.5" />
              {type.name}
            </Button>
          ))}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredDevices.length > 0 ? (
            <div className="space-y-4">
              {filteredDevices.map((device) => (
                <motion.div key={device.id} variants={itemVariants}>
                  <Card
                    className="overflow-hidden border-primary/10 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => viewDeviceDetails(device)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-primary/10 p-3 rounded-full mr-3 flex items-center justify-center">
                            {device.type === "smartwatch" && (
                              <Watch className="h-5 w-5 text-primary" />
                            )}
                            {device.type === "fitness-band" && (
                              <HeartPulse className="h-5 w-5 text-primary" />
                            )}
                            {device.type === "smartphone" && (
                              <Smartphone className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{device.name}</h3>
                              <Badge
                                variant="outline"
                                className="ml-2 bg-green-100 text-green-800 border-green-200"
                              >
                                Connected
                              </Badge>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Battery className="h-3.5 w-3.5 mr-1" />
                              <span>{device.batteryLevel}%</span>
                              <span className="mx-1">•</span>
                              <span>Last sync: {device.lastSync}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="grid grid-cols-4 gap-2 mt-4">
                        <div className="text-center p-2 bg-muted/50 rounded-md">
                          <p className="text-xs text-muted-foreground">Steps</p>
                          <p className="font-medium">
                            {device.stats.steps.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-md">
                          <p className="text-xs text-muted-foreground">
                            Calories
                          </p>
                          <p className="font-medium">{device.stats.calories}</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-md">
                          <p className="text-xs text-muted-foreground">
                            Heart Rate
                          </p>
                          <p className="font-medium">
                            {device.stats.heartRate} bpm
                          </p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-md">
                          <p className="text-xs text-muted-foreground">
                            Distance
                          </p>
                          <p className="font-medium">
                            {device.stats.distance} km
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <div className="bg-primary/10 p-4 rounded-full mx-auto mb-4 inline-flex">
                <Bluetooth className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">No devices connected</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Connect a wearable device to track your workouts
              </p>
              <Button onClick={() => setShowAddDevice(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Device Details Dialog */}
      <Dialog open={showDeviceDetails} onOpenChange={setShowDeviceDetails}>
        <DialogContent className="sm:max-w-md">
          {selectedDevice && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDevice.name}</DialogTitle>
                <DialogDescription>
                  Device details and settings
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full mr-3">
                    {selectedDevice.type === "smartwatch" && (
                      <Watch className="h-5 w-5 text-primary" />
                    )}
                    {selectedDevice.type === "fitness-band" && (
                      <HeartPulse className="h-5 w-5 text-primary" />
                    )}
                    {selectedDevice.type === "smartphone" && (
                      <Smartphone className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        Connected
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Last sync: {selectedDevice.lastSync}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Battery Level</span>
                      <span className="text-sm font-medium">
                        {selectedDevice.batteryLevel}%
                      </span>
                    </div>
                    <Progress
                      value={selectedDevice.batteryLevel}
                      className="h-2"
                    />
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Today's Activity</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 p-3 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Steps
                          </span>
                          <BarChart2 className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xl font-medium mt-1">
                          {selectedDevice.stats.steps.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Heart Rate
                          </span>
                          <HeartPulse className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xl font-medium mt-1">
                          {selectedDevice.stats.heartRate} bpm
                        </p>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Calories
                          </span>
                          <span className="text-lg">🔥</span>
                        </div>
                        <p className="text-xl font-medium mt-1">
                          {selectedDevice.stats.calories}
                        </p>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Distance
                          </span>
                          <span className="text-lg">📍</span>
                        </div>
                        <p className="text-xl font-medium mt-1">
                          {selectedDevice.stats.distance} km
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setShowDeviceDetails(false);
                        navigate("/settings");
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Device Settings
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => syncDevice(selectedDevice)}
                      disabled={isSyncing}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
                      />
                      {isSyncing ? "Syncing..." : "Sync Now"}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={disconnectDevice}
                    >
                      <Bluetooth className="h-4 w-4 mr-2" />
                      Disconnect Device
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default WearablesPage;

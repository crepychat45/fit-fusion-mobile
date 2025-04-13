
import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Moon, 
  Sun, 
  VolumeX, 
  Volume2, 
  Vibrate, 
  BellRing, 
  CloudOff, 
  Wifi, 
  Smartphone, 
  Fingerprint,
  HeartPulse,
  Watch,
  Bluetooth,
  Scan
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("appearance");
  const [theme, setTheme] = useState("system");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [volume, setVolume] = useState(70);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [notificationSound, setNotificationSound] = useState("default");
  const [animations, setAnimations] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [backgroundSync, setBackgroundSync] = useState(true);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<string[]>([]);

  // Sound options for notifications
  const soundOptions = [
    { value: "default", label: "Default" },
    { value: "chime", label: "Chime" },
    { value: "bell", label: "Bell" },
    { value: "pulse", label: "Pulse" },
    { value: "custom", label: "Custom" },
  ];

  // Connected devices
  const connectedDevices = [
    { id: "1", name: "Fitbit Charge 5", type: "Fitness Tracker", status: "Connected", batteryLevel: "85%" },
    { id: "2", name: "Mi Smart Band 6", type: "Smart Band", status: "Connected", batteryLevel: "62%" }
  ];

  const handleThemeChange = (value: string) => {
    setTheme(value);
    
    if (value === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else if (value === "light") {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      // System theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
      
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    
    toast({
      title: "Theme Updated",
      description: `Theme set to ${value}`,
    });
  };

  const handleAnimationsToggle = () => {
    const newValue = !animations;
    setAnimations(newValue);
    
    // Add animations class to root body element
    if (newValue) {
      document.body.classList.remove("reduce-motion");
    } else {
      document.body.classList.add("reduce-motion");
    }
    
    toast({
      title: "Animations Setting Updated",
      description: newValue ? "Animations enabled" : "Animations disabled",
    });
  };

  const startDeviceScan = () => {
    setScanning(true);
    setDiscoveredDevices([]);
    
    // Simulate device discovery with setTimeout
    setTimeout(() => {
      setDiscoveredDevices([
        "Galaxy Watch 4",
        "Apple Watch SE",
        "Amazfit GTS 2",
        "Polar H10"
      ]);
      setScanning(false);
    }, 3000);
  };

  const connectDevice = (deviceName: string) => {
    toast({
      title: "Device Connected",
      description: `Successfully connected to ${deviceName}`,
    });
    setShowScanDialog(false);
  };

  const disconnectDevice = (deviceId: string) => {
    toast({
      title: "Device Disconnected",
      description: "Device has been disconnected successfully",
    });
  };

  const handleAutoSyncToggle = () => {
    setAutoSync(!autoSync);
    
    toast({
      title: "Auto Sync Updated",
      description: !autoSync ? "Auto sync enabled" : "Auto sync disabled",
    });
  };

  const handleBackgroundSyncToggle = () => {
    setBackgroundSync(!backgroundSync);
    
    toast({
      title: "Background Sync Updated",
      description: !backgroundSync ? "Background sync enabled" : "Background sync disabled",
    });
  };

  const handleWifiOnlyToggle = () => {
    setWifiOnly(!wifiOnly);
    
    toast({
      title: "Wifi Only Sync Updated",
      description: !wifiOnly ? "Wifi only sync enabled" : "Wifi only sync disabled",
    });
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
          <h1 className="text-xl font-bold text-white ml-2">Settings</h1>
        </div>
      </div>
      
      {/* Settings Tabs */}
      <div className="p-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="appearance">Display</TabsTrigger>
            <TabsTrigger value="sound">Sound</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Theme Settings</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="theme">App Theme</Label>
                      <RadioGroup 
                        id="theme" 
                        value={theme}
                        onValueChange={handleThemeChange}
                        className="flex gap-4 pt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="light" />
                          <Label htmlFor="light" className="flex items-center">
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="dark" />
                          <Label htmlFor="dark" className="flex items-center">
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="system" id="system" />
                          <Label htmlFor="system">System</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="animations" className="font-medium">UI Animations</Label>
                        <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
                      </div>
                      <Switch 
                        id="animations" 
                        checked={animations} 
                        onCheckedChange={handleAnimationsToggle}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="mb-2 block">Text Size</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue placeholder="Select text size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="xl">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* Sound Tab */}
          <TabsContent value="sound" className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Sound & Feedback</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="volume">Volume</Label>
                        <div className="flex items-center">
                          {volume === 0 ? (
                            <VolumeX className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Volume2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                      <Slider
                        id="volume"
                        value={[volume]}
                        max={100}
                        step={1}
                        onValueChange={(vals) => setVolume(vals[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">0%</span>
                        <span className="text-xs text-muted-foreground">100%</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hapticFeedback" className="font-medium">
                          Haptic Feedback
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Vibration feedback for actions
                        </p>
                      </div>
                      <Switch 
                        id="hapticFeedback" 
                        checked={hapticFeedback} 
                        onCheckedChange={setHapticFeedback}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="mb-2 block">Notification Sound</Label>
                      <Select 
                        value={notificationSound}
                        onValueChange={setNotificationSound}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select notification sound" />
                        </SelectTrigger>
                        <SelectContent>
                          {soundOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="workout-sounds" className="font-medium">
                          Workout Sounds
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Play sounds during workout
                        </p>
                      </div>
                      <Switch id="workout-sounds" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="voice-guidance" className="font-medium">
                          Voice Guidance
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Audio guidance during workouts
                        </p>
                      </div>
                      <Switch id="voice-guidance" defaultChecked />
                    </div>
                    
                    <Button 
                      onClick={() => {
                        // Play a sound to test current settings
                        const audio = new Audio("/notification.mp3");
                        audio.volume = volume / 100;
                        audio.play().catch(err => console.log("Audio playback prevented: ", err));
                        
                        if (hapticFeedback) {
                          // Vibrate if supported by device
                          if (navigator.vibrate) {
                            navigator.vibrate(200);
                          }
                        }
                        
                        toast({
                          title: "Sound Test",
                          description: "Testing your current sound settings",
                        });
                      }}
                      className="w-full"
                    >
                      Test Sound
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Sync & Backup</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-sync" className="font-medium">
                          Auto Sync
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically sync workout data
                        </p>
                      </div>
                      <Switch 
                        id="auto-sync" 
                        checked={autoSync}
                        onCheckedChange={handleAutoSyncToggle}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="background-sync" className="font-medium">
                          Background Sync
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Sync data while app is in background
                        </p>
                      </div>
                      <Switch 
                        id="background-sync" 
                        checked={backgroundSync}
                        onCheckedChange={handleBackgroundSyncToggle}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="wifi-only" className="font-medium">
                          WiFi Only
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Only sync when connected to WiFi
                        </p>
                      </div>
                      <Switch 
                        id="wifi-only" 
                        checked={wifiOnly}
                        onCheckedChange={handleWifiOnlyToggle}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Connected Devices</h3>
                    <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Bluetooth className="h-4 w-4" />
                          Connect
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Connect New Device</DialogTitle>
                          <DialogDescription>
                            Make sure your device is in pairing mode and nearby.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-4">
                          {scanning ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                              <p className="text-sm text-muted-foreground">Scanning for devices...</p>
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
                                        <Watch className="h-5 w-5 text-primary mr-3" />
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
                                  <p className="text-sm text-muted-foreground">No devices found</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            variant={scanning ? "outline" : "default"} 
                            onClick={scanning ? () => setScanning(false) : startDeviceScan} 
                            className="w-full"
                          >
                            {scanning ? "Cancel Scan" : "Scan for Devices"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {connectedDevices.length > 0 ? (
                    <div className="space-y-3">
                      {connectedDevices.map((device) => (
                        <div 
                          key={device.id} 
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div className="flex items-center">
                            <div className="bg-primary/10 p-2 rounded-full mr-3">
                              {device.type.includes("Fitness") ? (
                                <HeartPulse className="h-4 w-4 text-primary" />
                              ) : (
                                <Watch className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{device.name}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>{device.type}</span>
                                <span className="mx-1">•</span>
                                <span>{device.batteryLevel}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => disconnectDevice(device.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No devices connected</p>
                      <Button 
                        className="mt-2"
                        variant="outline"
                        onClick={() => setShowScanDialog(true)}
                      >
                        <Scan className="h-4 w-4 mr-2" />
                        Scan for Devices
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Wearable Preferences</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="heart-rate" className="font-medium">
                          Heart Rate Monitoring
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Continuous heart rate tracking
                        </p>
                      </div>
                      <Switch id="heart-rate" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sleep-tracking" className="font-medium">
                          Sleep Tracking
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Monitor sleep patterns
                        </p>
                      </div>
                      <Switch id="sleep-tracking" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="steps-tracking" className="font-medium">
                          Step Counting
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Track daily steps
                        </p>
                      </div>
                      <Switch id="steps-tracking" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Settings;

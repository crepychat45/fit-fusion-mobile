
import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { 
  ChevronLeft, Moon, Sun, Monitor, Volume2, VolumeX, Smartphone, 
  Eye, Clock, Bell, Settings as SettingsIcon, Heart, Dumbbell, 
  Check, PanelLeft, MessageSquare, Vibrate
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Theme settings
  const [theme, setTheme] = useState("system");
  const [textSize, setTextSize] = useState(16);
  
  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [workoutSounds, setWorkoutSounds] = useState(true);
  const [notificationSounds, setNotificationSounds] = useState(true);
  const [volume, setVolume] = useState([70]);
  const [voiceGuidance, setVoiceGuidance] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  
  // Wearable settings
  const [heartRateMonitoring, setHeartRateMonitoring] = useState(true);
  const [sleepTracking, setSleepTracking] = useState(false);
  const [stepCounting, setStepCounting] = useState(true);
  
  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    
    // Apply theme logic would go here in a real app
    document.documentElement.classList.remove("light", "dark");
    
    if (selectedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (selectedTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      // For system preference, check media query
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.add("light");
      }
    }
    
    toast({
      title: "Theme Updated",
      description: `Theme set to ${selectedTheme}.`,
    });
  };
  
  const updateTextSize = (size: number[]) => {
    setTextSize(size[0]);
    document.documentElement.style.fontSize = `${size[0]}px`;
    
    toast({
      title: "Text Size Updated",
      description: "Text size preference has been saved.",
    });
  };
  
  const testSound = () => {
    if (!soundEnabled) {
      toast({
        title: "Sound is Disabled",
        description: "Enable sound in settings to test audio.",
      });
      return;
    }
    
    const audio = new Audio("/notification-sound.mp3");
    audio.volume = volume[0] / 100;
    audio.play().catch(err => {
      console.log("Audio playback prevented: ", err);
      toast({
        title: "Sound Test Failed",
        description: "Unable to play sound. Please check your device settings.",
      });
    });
    
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate(200);
    }
  };
  
  const updateWearableSetting = (setting: string, value: boolean) => {
    toast({
      title: `${setting} ${value ? 'Enabled' : 'Disabled'}`,
      description: "Your wearable settings have been updated.",
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
      
      <Tabs defaultValue="display" className="w-full">
        <div className="px-4 pt-2 overflow-x-auto no-scrollbar">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="sound">Sound</TabsTrigger>
            <TabsTrigger value="device">Device</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Display Settings */}
        <TabsContent value="display" className="px-4 py-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Theme</h3>
              <RadioGroup 
                value={theme} 
                onValueChange={handleThemeChange}
                className="grid grid-cols-3 gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className={`border rounded-full p-3 mb-2 ${theme === 'light' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card'}`}>
                    <Sun className="h-5 w-5" />
                  </div>
                  <RadioGroupItem value="light" id="light" className="sr-only" />
                  <Label htmlFor="light" className="text-sm">Light</Label>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`border rounded-full p-3 mb-2 ${theme === 'dark' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card'}`}>
                    <Moon className="h-5 w-5" />
                  </div>
                  <RadioGroupItem value="dark" id="dark" className="sr-only" />
                  <Label htmlFor="dark" className="text-sm">Dark</Label>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`border rounded-full p-3 mb-2 ${theme === 'system' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card'}`}>
                    <Monitor className="h-5 w-5" />
                  </div>
                  <RadioGroupItem value="system" id="system" className="sr-only" />
                  <Label htmlFor="system" className="text-sm">System</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Text Size</h3>
                <span className="text-sm font-medium bg-secondary px-2 py-1 rounded">
                  {textSize}px
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">A</span>
                  <Slider 
                    value={[textSize]} 
                    min={12} 
                    max={24} 
                    step={1}
                    onValueChange={updateTextSize}
                    className="w-4/5"
                  />
                  <span className="text-base font-medium">A</span>
                </div>
                
                <div className="border rounded-md p-4 mt-4">
                  <p style={{ fontSize: `${textSize}px` }} className="text-center">
                    Preview Text
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Workout View</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view" className="flex items-center gap-2">
                    <PanelLeft className="h-4 w-4" />
                    <span>Compact View</span>
                  </Label>
                  <Switch id="compact-view" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-calories" className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" />
                    <span>Show Calories</span>
                  </Label>
                  <Switch id="show-calories" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-heart-rate" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>Show Heart Rate</span>
                  </Label>
                  <Switch id="show-heart-rate" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Sound Settings */}
        <TabsContent value="sound" className="px-4 py-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Sound</h3>
                <Switch 
                  checked={soundEnabled} 
                  onCheckedChange={setSoundEnabled} 
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="workout-sounds" className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" />
                    <span>Workout Sounds</span>
                  </Label>
                  <Switch 
                    id="workout-sounds" 
                    checked={workoutSounds}
                    onCheckedChange={setWorkoutSounds}
                    disabled={!soundEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notification-sounds" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Notification Sounds</span>
                  </Label>
                  <Switch 
                    id="notification-sounds" 
                    checked={notificationSounds}
                    onCheckedChange={setNotificationSounds}
                    disabled={!soundEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="voice-guidance" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Voice Guidance</span>
                  </Label>
                  <Switch 
                    id="voice-guidance" 
                    checked={voiceGuidance}
                    onCheckedChange={setVoiceGuidance}
                    disabled={!soundEnabled}
                  />
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="volume">Volume</Label>
                  <div className="flex items-center gap-2">
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                    <Slider 
                      id="volume"
                      value={volume} 
                      min={0} 
                      max={100} 
                      step={1}
                      onValueChange={setVolume}
                      disabled={!soundEnabled}
                      className="w-32"
                    />
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-auto block mt-2" 
                  onClick={testSound}
                  disabled={!soundEnabled}
                >
                  Test Sound
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Haptic Feedback</h3>
                <Switch 
                  checked={hapticFeedback} 
                  onCheckedChange={setHapticFeedback} 
                />
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-md">
                <Vibrate className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Haptic feedback provides physical responses to your interactions.
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={() => {
                  if (hapticFeedback && navigator.vibrate) {
                    navigator.vibrate([100, 30, 100, 30, 100]);
                    toast({
                      title: "Haptic Feedback Test",
                      description: "If your device supports vibration, you should feel it now.",
                    });
                  } else {
                    toast({
                      title: "Haptic Feedback Disabled",
                      description: "Enable haptic feedback or check if your device supports vibration.",
                    });
                  }
                }}
              >
                Test Haptic Feedback
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Device Settings */}
        <TabsContent value="device" className="px-4 py-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-medium">Connected Devices</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/wearables")}
                >
                  Manage
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Manage your connected fitness devices</p>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/wearables")}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Connect New Device
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Wearable Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="heart-rate" className="font-medium">Heart Rate Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Track your heart rate during workouts</p>
                  </div>
                  <Switch 
                    id="heart-rate" 
                    checked={heartRateMonitoring}
                    onCheckedChange={(checked) => {
                      setHeartRateMonitoring(checked);
                      updateWearableSetting("Heart Rate Monitoring", checked);
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sleep-tracking" className="font-medium">Sleep Tracking</Label>
                    <p className="text-sm text-muted-foreground">Monitor your sleep patterns</p>
                  </div>
                  <Switch 
                    id="sleep-tracking" 
                    checked={sleepTracking}
                    onCheckedChange={(checked) => {
                      setSleepTracking(checked);
                      updateWearableSetting("Sleep Tracking", checked);
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="step-counting" className="font-medium">Step Counting</Label>
                    <p className="text-sm text-muted-foreground">Track your daily steps</p>
                  </div>
                  <Switch 
                    id="step-counting" 
                    checked={stepCounting}
                    onCheckedChange={(checked) => {
                      setStepCounting(checked);
                      updateWearableSetting("Step Counting", checked);
                    }}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Data Sync</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="background-sync" className="font-medium">Background Sync</Label>
                    <p className="text-sm text-muted-foreground">Sync data when app is closed</p>
                  </div>
                  <Switch id="background-sync" defaultChecked />
                </div>
                
                <Button variant="outline" className="w-full">
                  Sync Now
                </Button>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Last synced</span>
                  <span>Today, 2:30 PM</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* About Settings */}
        <TabsContent value="about" className="px-4 py-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">FitFusion</h3>
              <p className="text-sm text-muted-foreground">Version 1.2.0</p>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/help")}>
                <span>Help & Support</span>
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
              
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/privacy")}>
                <span>Privacy Policy</span>
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
              
              <Button variant="outline" className="w-full justify-between">
                <span>Terms of Service</span>
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
              
              <Button variant="outline" className="w-full justify-between">
                <span>Licenses</span>
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
            
            <div className="flex justify-center pt-4">
              <Badge variant="outline" className="text-xs">
                &copy; 2025 FitFusion. All rights reserved.
              </Badge>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <MobileNav />
    </div>
  );
};

export default Settings;

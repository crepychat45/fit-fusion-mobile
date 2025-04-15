import React, { useState, useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { 
  ChevronLeft, Moon, Sun, Monitor, Volume2, VolumeX, Smartphone, 
  Eye, Clock, Bell, Settings as SettingsIcon, Heart, Dumbbell, 
  Check, PanelLeft, MessageSquare, Vibrate, FileCode2, HelpCircle,
  Hash, Languages, CirclePlus, X, ChevronsUpDown, Cpu, Code, Database,
  ChevronRight
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
import { useTheme, Theme } from "@/contexts/theme-context";
import { playSound, vibrate, testSound, testHapticFeedback } from "@/utils/feedback-utils";
import { Card, CardContent } from "@/components/ui/card";
import { WorkoutCompactView } from "@/components/workout-compact-view";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  // Theme settings
  const [textSize, setTextSize] = useState(() => {
    const savedSize = localStorage.getItem("fitfusion-text-size");
    return savedSize ? parseInt(savedSize) : 16;
  });
  
  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("fitfusion-sound-enabled") !== "false";
  });
  const [workoutSounds, setWorkoutSounds] = useState(() => {
    return localStorage.getItem("fitfusion-workout-sounds") !== "false";
  });
  const [notificationSounds, setNotificationSounds] = useState(() => {
    return localStorage.getItem("fitfusion-notification-sounds") !== "false";
  });
  const [volume, setVolume] = useState<number[]>(() => {
    const savedVolume = localStorage.getItem("fitfusion-sound-volume");
    return savedVolume ? [parseInt(savedVolume)] : [70];
  });
  const [voiceGuidance, setVoiceGuidance] = useState(() => {
    return localStorage.getItem("fitfusion-voice-guidance") === "true";
  });
  const [hapticFeedback, setHapticFeedback] = useState(() => {
    return localStorage.getItem("fitfusion-haptic-enabled") !== "false";
  });
  
  // View settings
  const [compactView, setCompactView] = useState(() => {
    return localStorage.getItem("fitfusion-compact-view") === "true";
  });
  const [showCalories, setShowCalories] = useState(() => {
    return localStorage.getItem("fitfusion-show-calories") !== "false";
  });
  const [showHeartRate, setShowHeartRate] = useState(() => {
    return localStorage.getItem("fitfusion-show-heart-rate") !== "false";
  });
  
  // Wearable settings
  const [heartRateMonitoring, setHeartRateMonitoring] = useState(() => {
    return localStorage.getItem("fitfusion-heart-rate-monitoring") !== "false";
  });
  const [sleepTracking, setSleepTracking] = useState(() => {
    return localStorage.getItem("fitfusion-sleep-tracking") === "true";
  });
  const [stepCounting, setStepCounting] = useState(() => {
    return localStorage.getItem("fitfusion-step-counting") !== "false";
  });
  
  // Programming languages settings
  const [codeEditorEnabled, setCodeEditorEnabled] = useState(() => {
    return localStorage.getItem("fitfusion-code-editor-enabled") === "true";
  });
  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>(() => {
    const savedLanguages = localStorage.getItem("fitfusion-programming-languages");
    return savedLanguages ? JSON.parse(savedLanguages) : ["JavaScript", "HTML", "CSS"];
  });
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);
  const [customLanguage, setCustomLanguage] = useState("");
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("fitfusion-text-size", textSize.toString());
    document.documentElement.style.fontSize = `${textSize}px`;
  }, [textSize]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-sound-enabled", soundEnabled.toString());
  }, [soundEnabled]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-workout-sounds", workoutSounds.toString());
  }, [workoutSounds]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-notification-sounds", notificationSounds.toString());
  }, [notificationSounds]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-sound-volume", volume[0].toString());
  }, [volume]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-voice-guidance", voiceGuidance.toString());
  }, [voiceGuidance]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-haptic-enabled", hapticFeedback.toString());
  }, [hapticFeedback]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-compact-view", compactView.toString());
  }, [compactView]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-show-calories", showCalories.toString());
  }, [showCalories]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-show-heart-rate", showHeartRate.toString());
  }, [showHeartRate]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-heart-rate-monitoring", heartRateMonitoring.toString());
  }, [heartRateMonitoring]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-sleep-tracking", sleepTracking.toString());
  }, [sleepTracking]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-step-counting", stepCounting.toString());
  }, [stepCounting]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-code-editor-enabled", codeEditorEnabled.toString());
  }, [codeEditorEnabled]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-programming-languages", JSON.stringify(programmingLanguages));
  }, [programmingLanguages]);
  
  const handleThemeChange = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    
    toast({
      title: "Theme Updated",
      description: `Theme set to ${selectedTheme}.`,
    });
  };
  
  const updateTextSize = (size: number[]) => {
    setTextSize(size[0]);
    
    toast({
      title: "Text Size Updated",
      description: "Text size preference has been saved.",
    });
  };
  
  const handleTestSound = async () => {
    if (!soundEnabled) {
      toast({
        title: "Sound is Disabled",
        description: "Enable sound in settings to test audio.",
      });
      return;
    }
    
    try {
      await testSound();
      
      if (hapticFeedback) {
        testHapticFeedback();
      }
      
      toast({
        title: "Sound Test",
        description: "Sound played successfully!",
      });
    } catch (error) {
      console.error("Sound test failed:", error);
      toast({
        title: "Sound Test Failed",
        description: "Unable to play sound. Please check your device settings.",
        variant: "destructive",
      });
    }
  };
  
  const updateWearableSetting = (setting: string, value: boolean) => {
    toast({
      title: `${setting} ${value ? 'Enabled' : 'Disabled'}`,
      description: "Your wearable settings have been updated.",
    });
  };
  
  const addProgrammingLanguage = (language: string) => {
    if (language && !programmingLanguages.includes(language)) {
      setProgrammingLanguages([...programmingLanguages, language]);
      setCustomLanguage("");
      setLanguagePickerOpen(false);
      
      toast({
        title: "Language Added",
        description: `${language} has been added to your programming languages.`,
      });
    }
  };
  
  const removeProgrammingLanguage = (language: string) => {
    setProgrammingLanguages(programmingLanguages.filter(lang => lang !== language));
    
    toast({
      title: "Language Removed",
      description: `${language} has been removed from your programming languages.`,
    });
  };
  
  const languageOptions = [
    "JavaScript",
    "Python",
    "C++",
    "HTML",
    "CSS",
    "TypeScript",
    "Java",
    "C#",
    "Ruby",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "PHP",
    "SQL",
    "Bash",
    "PowerShell",
    "R",
    "Dart",
    "Scala"
  ].filter(lang => !programmingLanguages.includes(lang));
  
  const handleCustomLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLanguage.trim()) {
      addProgrammingLanguage(customLanguage.trim());
    }
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
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="sound">Sound</TabsTrigger>
            <TabsTrigger value="device">Device</TabsTrigger>
            <TabsTrigger value="developer">Developer</TabsTrigger>
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
                <div className="flex flex-col items-center relative">
                  <div className={`border rounded-full p-3 mb-2 ${theme === 'light' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card'}`}>
                    <Sun className="h-5 w-5" />
                  </div>
                  <RadioGroupItem value="light" id="light" className="sr-only" />
                  <Label htmlFor="light" className="text-sm cursor-pointer">Light</Label>
                </div>
                
                <div className="flex flex-col items-center relative">
                  <div className={`border rounded-full p-3 mb-2 ${theme === 'dark' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card'}`}>
                    <Moon className="h-5 w-5" />
                  </div>
                  <RadioGroupItem value="dark" id="dark" className="sr-only" />
                  <Label htmlFor="dark" className="text-sm cursor-pointer">Dark</Label>
                </div>
                
                <div className="flex flex-col items-center relative">
                  <div className={`border rounded-full p-3 mb-2 ${theme === 'system' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card'}`}>
                    <Monitor className="h-5 w-5" />
                  </div>
                  <RadioGroupItem value="system" id="system" className="sr-only" />
                  <Label htmlFor="system" className="text-sm cursor-pointer">System</Label>
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
                  <Switch 
                    id="compact-view" 
                    checked={compactView}
                    onCheckedChange={setCompactView}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-calories" className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" />
                    <span>Show Calories</span>
                  </Label>
                  <Switch 
                    id="show-calories" 
                    checked={showCalories}
                    onCheckedChange={setShowCalories}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-heart-rate" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>Show Heart Rate</span>
                  </Label>
                  <Switch 
                    id="show-heart-rate" 
                    checked={showHeartRate}
                    onCheckedChange={setShowHeartRate}
                  />
                </div>

                {/* Preview Area */}
                <div className="mt-6 border rounded-lg p-3 bg-background/50">
                  <h4 className="text-sm font-medium mb-2">Preview</h4>
                  <WorkoutCompactView 
                    id="preview"
                    title="Full Body Workout"
                    category="strength"
                    level="intermediate"
                    duration={45}
                    isCompact={compactView}
                    showCalories={showCalories}
                    showHeartRate={showHeartRate}
                  />
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
                  onCheckedChange={(checked) => {
                    setSoundEnabled(checked);
                    if (checked) {
                      playSound('success');
                      toast({
                        title: "Sound Enabled",
                        description: "App sounds have been turned on.",
                      });
                    } else {
                      toast({
                        title: "Sound Disabled",
                        description: "App sounds have been turned off.",
                      });
                    }
                  }} 
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
                    onCheckedChange={(checked) => {
                      setWorkoutSounds(checked);
                      if (checked && soundEnabled) {
                        playSound('workout-start', 0.5);
                      }
                    }}
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
                    onCheckedChange={(checked) => {
                      setNotificationSounds(checked);
                      if (checked && soundEnabled) {
                        playSound('notification', 0.5);
                      }
                    }}
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
                      onValueChange={(newVolume) => {
                        setVolume(newVolume);
                        if (soundEnabled && newVolume[0] > 0) {
                          playSound('tap', newVolume[0] / 100);
                        }
                      }}
                      disabled={!soundEnabled}
                      className="w-32"
                    />
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto" 
                    onClick={() => handleTestSound()}
                    disabled={!soundEnabled}
                  >
                    Test Sound
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!soundEnabled}
                      >
                        Custom Sounds
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Custom Sound Settings</DialogTitle>
                        <DialogDescription>
                          Customize sound effects for different app events.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                          {['Workout Start', 'Workout Complete', 'Notification', 'Achievement', 'Success', 'Error'].map((sound) => (
                            <Card key={sound} className="cursor-pointer hover:bg-secondary/10 transition-colors">
                              <CardContent className="p-3 flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium">{sound}</p>
                                  <p className="text-xs text-muted-foreground">Default</p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => {
                                    playSound(sound.toLowerCase().replace(' ', '-') as any);
                                  }}
                                >
                                  <Volume2 className="h-4 w-4" />
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        
                        <div className="mt-4">
                          <Label className="text-sm text-muted-foreground">Upload Custom Sound</Label>
                          <div className="mt-2 flex gap-2">
                            <Input 
                              type="file" 
                              accept="audio/*" 
                              className="text-sm"
                              disabled
                            />
                            <Button disabled variant="outline" size="sm">
                              Upload
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Custom sound uploads will be available in a future update.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Haptic Feedback</h3>
                <Switch 
                  checked={hapticFeedback} 
                  onCheckedChange={(checked) => {
                    setHapticFeedback(checked);
                    if (checked && navigator.vibrate) {
                      navigator.vibrate(100);
                    }
                  }} 
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
                    testHapticFeedback();
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
                
                {/* New wearable features */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smart-notifications" className="font-medium">Smart Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get alerts based on your activity patterns</p>
                  </div>
                  <Switch id="smart-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="location-tracking" className="font-medium">Location Tracking</Label>
                    <p className="text-sm text-muted-foreground">Map your outdoor workout routes</p>
                  </div>
                  <Switch id="location-tracking" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-workout" className="font-medium">Auto Workout Detection</Label>
                    <p className="text-sm text-muted-foreground">Automatically detect and log workouts</p>
                  </div>
                  <Switch id="auto-workout" defaultChecked />
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
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="wifi-only" className="font-medium">Wi-Fi Only Sync</Label>
                    <p className="text-sm text-muted-foreground">Sync data only when on Wi-Fi</p>
                  </div>
                  <Switch id="wifi-only" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-backup" className="font-medium">Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">Weekly backup of all your data</p>
                  </div>
                  <Switch id="auto-backup" defaultChecked />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Syncing Data",
                      description: "Your fitness data is being synced...",
                    });
                    
                    // Simulate sync delay
                    setTimeout(() => {
                      toast({
                        title: "Sync Complete",
                        description: "Your fitness data has been successfully synced.",
                      });
                    }, 2000);
                  }}
                >
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
        
        {/* Developer Settings */}
        <TabsContent value="developer" className="px-4 py-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Code Editor</h3>
                <Switch 
                  checked={codeEditorEnabled}
                  onCheckedChange={setCodeEditorEnabled}
                />
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                The code editor allows you to create custom workouts and analyze your fitness data using programming languages.
              </p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">Programming Languages</Label>
                    <Popover open={languagePickerOpen} onOpenChange={setLanguagePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                          disabled={!codeEditorEnabled}
                        >
                          <CirclePlus className="h-4 w-4 mr-1" />
                          Add Language
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[240px] p-0" align="end">
                        <Command>
                          <CommandInput placeholder="Search languages..." />
                          <CommandList>
                            <CommandEmpty>No languages found.</CommandEmpty>
                            <CommandGroup>
                              {languageOptions.map(language => (
                                <CommandItem
                                  key={language}
                                  onSelect={() => addProgrammingLanguage(language)}
                                >
                                  <span>{language}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                          <form onSubmit={handleCustomLanguageSubmit} className="border-t p-2">
                            <div className="flex gap-1">
                              <Input
                                value={customLanguage}
                                onChange={(e) => setCustomLanguage(e.target.value)}
                                placeholder="Add custom language..."
                                className="h-8 text-sm"
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2"
                                disabled={!customLanguage.trim()}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </form>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {programmingLanguages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No languages selected</p>
                    ) : (
                      programmingLanguages.map(language => (
                        <Badge 
                          key={language} 
                          variant="secondary"
                          className="py-1 px-2 flex items-center gap-1"
                        >
                          <Code className="h-3 w-3" />
                          {language}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 rounded-full ml-1 hover:bg-destructive/10 p-0"
                            onClick={() => removeProgrammingLanguage(language)}
                            disabled={!codeEditorEnabled}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-format" className="font-medium">Auto Format Code</Label>
                      <p className="text-sm text-muted-foreground">Format code on save</p>
                    </div>
                    <Switch 
                      id="auto-format" 
                      defaultChecked 
                      disabled={!codeEditorEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="syntax-highlight" className="font-medium">Syntax Highlighting</Label>
                      <p className="text-sm text-muted-foreground">Colorize code by syntax</p>
                    </div>
                    <Switch 
                      id="syntax-highlight" 
                      defaultChecked 
                      disabled={!codeEditorEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="code-completion" className="font-medium">Code Completion</Label>
                      <p className="text-sm text-muted-foreground">Intelligent code suggestions</p>
                    </div>
                    <Switch 
                      id="code-completion" 
                      defaultChecked 
                      disabled={!codeEditorEnabled}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="font-medium">Data Science Tools</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Card className="p-3 cursor-pointer hover:bg-secondary/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        <span className="text-sm">Dataset Explorer</span>
                      </div>
                    </Card>
                    
                    <Card className="p-3 cursor-pointer hover:bg-secondary/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-primary" />
                        <span className="text-sm">ML Training</span>
                      </div>
                    </Card>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  disabled={!codeEditorEnabled}
                  onClick={() => navigate("/code-editor")}
                >
                  Open Code Editor
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Advanced Features</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dev-mode" className="font-medium">Developer Mode</Label>
                    <p className="text-sm text-muted-foreground">Access advanced debugging tools</p>
                  </div>
                  <Switch id="dev-mode" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="api-access" className="font-medium">API Access</Label>
                    <p className="text-sm text-muted-foreground">Enable external API integrations</p>
                  </div>
                  <Switch id="api-access" />
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  toast({
                    title: "API Documentation",
                    description: "Opening API documentation in new tab."
                  });
                }}
              >
                View API Documentation
              </Button>
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
              <p className="text-sm text-muted-foreground">Version 2.0.0</p>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/help")}>
                <span>Help & Support</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/privacy")}>
                <span>Privacy Policy</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={() => {
                  window.open("/terms-of-service.html", "_blank");
                  toast({
                    title: "Terms of Service",
                    description: "Opened Terms of Service in a new tab.",
                  });
                }}
              >
                <span>Terms of Service</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => {
                  window.open("/licenses.html", "_blank");
                  toast({
                    title: "Licenses",
                    description: "Opened Licenses information in a new tab.",
                  });
                }}
              >
                <span>Licenses</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => {
                  toast({
                    title: "What's New",
                    description: "View the latest features and improvements.",
                  });
                }}
              >
                <span>What's New</span>
                <Badge className="ml-2 bg-primary text-primary-foreground">2.0</Badge>
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

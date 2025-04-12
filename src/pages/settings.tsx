
import React, { useState, useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { 
  ChevronLeft, 
  RefreshCcw, 
  Moon, 
  Volume2, 
  Ruler, 
  Clock,
  Bell,
  Phone,
  Lock,
  Languages,
  Share2,
  Shield,
  CloudSync,
  Bluetooth
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Load settings from localStorage or use defaults
  const loadSavedSettings = () => {
    try {
      return {
        darkMode: localStorage.getItem('darkMode') === 'true',
        sounds: localStorage.getItem('sounds') !== 'false',
        metric: localStorage.getItem('metric') !== 'false',
        timeFormat: localStorage.getItem('timeFormat') === 'true',
        autoSave: localStorage.getItem('autoSave') !== 'false',
        animations: localStorage.getItem('animations') !== 'false',
        notifications: {
          workoutReminders: localStorage.getItem('notif_workoutReminders') !== 'false',
          progressUpdates: localStorage.getItem('notif_progressUpdates') !== 'false',
          achievements: localStorage.getItem('notif_achievements') !== 'false',
          tips: localStorage.getItem('notif_tips') !== 'false'
        },
        privacy: {
          dataSharing: localStorage.getItem('privacy_dataSharing') !== 'false',
          activityTracking: localStorage.getItem('privacy_activityTracking') !== 'false',
          locationTracking: localStorage.getItem('privacy_locationTracking') === 'true'
        },
        sync: {
          autoSync: localStorage.getItem('sync_autoSync') !== 'false',
          backgroundSync: localStorage.getItem('sync_backgroundSync') !== 'false',
          wifiOnly: localStorage.getItem('sync_wifiOnly') === 'true'
        },
        device: {
          connectWearables: localStorage.getItem('device_connectWearables') === 'true',
          heartRateMonitor: localStorage.getItem('device_heartRateMonitor') === 'true',
          fitnessTracker: localStorage.getItem('device_fitnessTracker') === 'true'
        }
      };
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
      return {
        darkMode: false,
        sounds: true,
        metric: true,
        timeFormat: false,
        autoSave: true,
        animations: true,
        notifications: {
          workoutReminders: true,
          progressUpdates: true,
          achievements: true,
          tips: true
        },
        privacy: {
          dataSharing: true,
          activityTracking: true,
          locationTracking: false
        },
        sync: {
          autoSync: true,
          backgroundSync: true,
          wifiOnly: false
        },
        device: {
          connectWearables: false,
          heartRateMonitor: false,
          fitnessTracker: false
        }
      };
    }
  };
  
  const savedSettings = loadSavedSettings();
  
  // State for all settings
  const [darkMode, setDarkMode] = useState(savedSettings.darkMode);
  const [sounds, setSounds] = useState(savedSettings.sounds);
  const [metric, setMetric] = useState(savedSettings.metric);
  const [timeFormat, setTimeFormat] = useState(savedSettings.timeFormat);
  const [autoSave, setAutoSave] = useState(savedSettings.autoSave);
  const [animations, setAnimations] = useState(savedSettings.animations);
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState(savedSettings.notifications);
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState(savedSettings.privacy);
  
  // Sync settings
  const [syncSettings, setSyncSettings] = useState(savedSettings.sync);
  
  // Device settings
  const [deviceSettings, setDeviceSettings] = useState(savedSettings.device);
  
  // Apply dark mode when component mounts or when darkMode changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem('darkMode', 'true');
    } else {
      root.classList.remove("dark");
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);
  
  // Save settings to localStorage
  const saveSettings = (key: string, value: boolean, section?: string) => {
    try {
      if (section) {
        localStorage.setItem(`${section}_${key}`, value.toString());
      } else {
        localStorage.setItem(key, value.toString());
      }
    } catch (error) {
      console.error(`Error saving setting ${key} to localStorage:`, error);
      toast({
        title: "Error saving settings",
        description: "Your settings could not be saved. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle setting changes with toast notifications
  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    saveSettings('darkMode', checked);
    
    toast({
      title: checked ? "Dark mode enabled" : "Light mode enabled",
      description: checked ? "App theme has been changed to dark mode" : "App theme has been changed to light mode",
    });
  };
  
  const handleSoundsChange = (checked: boolean) => {
    setSounds(checked);
    saveSettings('sounds', checked);
    
    toast({
      title: checked ? "App sounds enabled" : "App sounds disabled",
      description: checked ? "Workout completion sounds turned on" : "Workout completion sounds turned off",
    });
  };
  
  const handleMetricChange = (checked: boolean) => {
    setMetric(checked);
    saveSettings('metric', checked);
    
    toast({
      title: checked ? "Metric system enabled" : "Imperial system enabled",
      description: checked ? "Units set to kg, cm" : "Units set to lb, in",
    });
  };
  
  const handleTimeFormatChange = (checked: boolean) => {
    setTimeFormat(checked);
    saveSettings('timeFormat', checked);
    
    toast({
      title: checked ? "24-hour format enabled" : "12-hour format enabled",
      description: checked ? "Time will be displayed in 24-hour format" : "Time will be displayed in 12-hour format",
    });
  };
  
  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSave(checked);
    saveSettings('autoSave', checked);
    
    toast({
      title: checked ? "Auto-save enabled" : "Auto-save disabled",
      description: checked ? "Workout progress will be saved automatically" : "Workout progress will need to be saved manually",
    });
  };
  
  const handleAnimationsChange = (checked: boolean) => {
    setAnimations(checked);
    saveSettings('animations', checked);
    
    toast({
      title: checked ? "Animations enabled" : "Animations disabled",
      description: checked ? "UI animations have been turned on" : "UI animations have been turned off",
    });
  };
  
  // Handle notification setting changes
  const handleNotificationChange = (key: string, checked: boolean) => {
    const newSettings = { ...notificationSettings, [key]: checked };
    setNotificationSettings(newSettings);
    saveSettings(key, checked, 'notif');
    
    toast({
      title: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} ${checked ? 'enabled' : 'disabled'}`,
      description: `${checked ? 'You will now receive' : 'You will no longer receive'} these notifications`,
    });
  };
  
  // Handle privacy setting changes
  const handlePrivacyChange = (key: string, checked: boolean) => {
    const newSettings = { ...privacySettings, [key]: checked };
    setPrivacySettings(newSettings);
    saveSettings(key, checked, 'privacy');
    
    toast({
      title: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} ${checked ? 'enabled' : 'disabled'}`,
      description: `Privacy setting updated successfully`,
    });
  };
  
  // Handle sync setting changes
  const handleSyncChange = (key: string, checked: boolean) => {
    const newSettings = { ...syncSettings, [key]: checked };
    setSyncSettings(newSettings);
    saveSettings(key, checked, 'sync');
    
    toast({
      title: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} ${checked ? 'enabled' : 'disabled'}`,
      description: `Sync setting updated successfully`,
    });
  };
  
  // Handle device setting changes
  const handleDeviceChange = (key: string, checked: boolean) => {
    const newSettings = { ...deviceSettings, [key]: checked };
    setDeviceSettings(newSettings);
    saveSettings(key, checked, 'device');
    
    if (checked && (key === 'heartRateMonitor' || key === 'fitnessTracker')) {
      toast({
        title: `${key === 'heartRateMonitor' ? 'Heart Rate Monitor' : 'Fitness Tracker'} connected`,
        description: `Your device has been successfully paired`,
      });
    } else {
      toast({
        title: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} ${checked ? 'enabled' : 'disabled'}`,
        description: `Device setting updated successfully`,
      });
    }
  };
  
  // Reset all settings to default
  const resetSettings = () => {
    // Default settings
    const defaults = {
      darkMode: false,
      sounds: true,
      metric: true,
      timeFormat: false,
      autoSave: true,
      animations: true,
      notifications: {
        workoutReminders: true,
        progressUpdates: true,
        achievements: true,
        tips: true
      },
      privacy: {
        dataSharing: true,
        activityTracking: true,
        locationTracking: false
      },
      sync: {
        autoSync: true,
        backgroundSync: true,
        wifiOnly: false
      },
      device: {
        connectWearables: false,
        heartRateMonitor: false,
        fitnessTracker: false
      }
    };
    
    // Update state
    setDarkMode(defaults.darkMode);
    setSounds(defaults.sounds);
    setMetric(defaults.metric);
    setTimeFormat(defaults.timeFormat);
    setAutoSave(defaults.autoSave);
    setAnimations(defaults.animations);
    setNotificationSettings(defaults.notifications);
    setPrivacySettings(defaults.privacy);
    setSyncSettings(defaults.sync);
    setDeviceSettings(defaults.device);
    
    // Clear localStorage values
    try {
      // Basic settings
      localStorage.setItem('darkMode', defaults.darkMode.toString());
      localStorage.setItem('sounds', defaults.sounds.toString());
      localStorage.setItem('metric', defaults.metric.toString());
      localStorage.setItem('timeFormat', defaults.timeFormat.toString());
      localStorage.setItem('autoSave', defaults.autoSave.toString());
      localStorage.setItem('animations', defaults.animations.toString());
      
      // Notification settings
      Object.keys(defaults.notifications).forEach(key => {
        localStorage.setItem(`notif_${key}`, defaults.notifications[key as keyof typeof defaults.notifications].toString());
      });
      
      // Privacy settings
      Object.keys(defaults.privacy).forEach(key => {
        localStorage.setItem(`privacy_${key}`, defaults.privacy[key as keyof typeof defaults.privacy].toString());
      });
      
      // Sync settings
      Object.keys(defaults.sync).forEach(key => {
        localStorage.setItem(`sync_${key}`, defaults.sync[key as keyof typeof defaults.sync].toString());
      });
      
      // Device settings
      Object.keys(defaults.device).forEach(key => {
        localStorage.setItem(`device_${key}`, defaults.device[key as keyof typeof defaults.device].toString());
      });
      
      toast({
        title: "Settings reset",
        description: "All settings have been reset to their default values",
      });
    } catch (error) {
      console.error("Error clearing settings from localStorage:", error);
      toast({
        title: "Error resetting settings",
        description: "Your settings could not be reset. Please try again.",
        variant: "destructive"
      });
    }
    
    // Update document root for dark mode
    const root = window.document.documentElement;
    root.classList.remove("dark");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
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
      
      {/* Settings Content */}
      <div className="px-4 py-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Accordion type="single" collapsible defaultValue="appearance" className="space-y-4">
            <motion.div variants={itemVariants}>
              <AccordionItem value="appearance" className="border-none">
                <AccordionTrigger className="py-3 px-4 bg-card rounded-lg shadow-sm">
                  <div className="flex items-center text-left">
                    <Moon className="h-4 w-4 mr-3 text-primary" />
                    <div>
                      <span className="font-medium">App Appearance</span>
                      <p className="text-xs text-muted-foreground">Theme and visual preferences</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 px-0">
                  <Card className="border-primary/10">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">Enable dark theme</p>
                        </div>
                        <Switch 
                          id="dark-mode" 
                          checked={darkMode}
                          onCheckedChange={handleDarkModeChange}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="animations" className="font-medium">UI Animations</Label>
                          <p className="text-sm text-muted-foreground">Enable interface animations</p>
                        </div>
                        <Switch 
                          id="animations" 
                          checked={animations} 
                          onCheckedChange={handleAnimationsChange}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <AccordionItem value="sound" className="border-none">
                <AccordionTrigger className="py-3 px-4 bg-card rounded-lg shadow-sm">
                  <div className="flex items-center text-left">
                    <Volume2 className="h-4 w-4 mr-3 text-primary" />
                    <div>
                      <span className="font-medium">Sound & Feedback</span>
                      <p className="text-xs text-muted-foreground">Audio and haptic options</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 px-0">
                  <Card className="border-primary/10">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sounds" className="font-medium">App Sounds</Label>
                          <p className="text-sm text-muted-foreground">Workout completion sounds</p>
                        </div>
                        <Switch 
                          id="sounds" 
                          checked={sounds}
                          onCheckedChange={handleSoundsChange}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-save" className="font-medium">Auto-save Progress</Label>
                          <p className="text-sm text-muted-foreground">Automatically save workouts</p>
                        </div>
                        <Switch 
                          id="auto-save" 
                          checked={autoSave}
                          onCheckedChange={handleAutoSaveChange}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <AccordionItem value="units" className="border-none">
                <AccordionTrigger className="py-3 px-4 bg-card rounded-lg shadow-sm">
                  <div className="flex items-center text-left">
                    <Ruler className="h-4 w-4 mr-3 text-primary" />
                    <div>
                      <span className="font-medium">Units & Formats</span>
                      <p className="text-xs text-muted-foreground">Measurement preferences</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 px-0">
                  <Card className="border-primary/10">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="metric" className="font-medium">Metric System</Label>
                          <p className="text-sm text-muted-foreground">Use kg, cm</p>
                        </div>
                        <Switch 
                          id="metric" 
                          checked={metric}
                          onCheckedChange={handleMetricChange}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="24h" className="font-medium">24-Hour Time</Label>
                          <p className="text-sm text-muted-foreground">Use 24-hour format</p>
                        </div>
                        <Switch 
                          id="24h" 
                          checked={timeFormat}
                          onCheckedChange={handleTimeFormatChange}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <AccordionItem value="notifications" className="border-none">
                <AccordionTrigger className="py-3 px-4 bg-card rounded-lg shadow-sm">
                  <div className="flex items-center text-left">
                    <Bell className="h-4 w-4 mr-3 text-primary" />
                    <div>
                      <span className="font-medium">Notifications</span>
                      <p className="text-xs text-muted-foreground">Alert preferences</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 px-0">
                  <Card className="border-primary/10">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="workout-reminders" className="font-medium">Workout Reminders</Label>
                          <p className="text-sm text-muted-foreground">Daily workout notifications</p>
                        </div>
                        <Switch 
                          id="workout-reminders" 
                          checked={notificationSettings.workoutReminders}
                          onCheckedChange={(checked) => handleNotificationChange('workoutReminders', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="progress-updates" className="font-medium">Progress Updates</Label>
                          <p className="text-sm text-muted-foreground">Weekly progress reports</p>
                        </div>
                        <Switch 
                          id="progress-updates" 
                          checked={notificationSettings.progressUpdates}
                          onCheckedChange={(checked) => handleNotificationChange('progressUpdates', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="achievements" className="font-medium">Achievements</Label>
                          <p className="text-sm text-muted-foreground">New achievement alerts</p>
                        </div>
                        <Switch 
                          id="achievements" 
                          checked={notificationSettings.achievements}
                          onCheckedChange={(checked) => handleNotificationChange('achievements', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="tips" className="font-medium">Fitness Tips</Label>
                          <p className="text-sm text-muted-foreground">Workout and nutrition tips</p>
                        </div>
                        <Switch 
                          id="tips" 
                          checked={notificationSettings.tips}
                          onCheckedChange={(checked) => handleNotificationChange('tips', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <AccordionItem value="privacy" className="border-none">
                <AccordionTrigger className="py-3 px-4 bg-card rounded-lg shadow-sm">
                  <div className="flex items-center text-left">
                    <Shield className="h-4 w-4 mr-3 text-primary" />
                    <div>
                      <span className="font-medium">Privacy & Data</span>
                      <p className="text-xs text-muted-foreground">Data sharing and tracking</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 px-0">
                  <Card className="border-primary/10">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="data-sharing" className="font-medium">Fitness Data Sharing</Label>
                          <p className="text-sm text-muted-foreground">Share data with health services</p>
                        </div>
                        <Switch 
                          id="data-sharing" 
                          checked={privacySettings.dataSharing}
                          onCheckedChange={(checked) => handlePrivacyChange('dataSharing', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="activity-tracking" className="font-medium">Activity Tracking</Label>
                          <p className="text-sm text-muted-foreground">Track workout sessions</p>
                        </div>
                        <Switch 
                          id="activity-tracking" 
                          checked={privacySettings.activityTracking}
                          onCheckedChange={(checked) => handlePrivacyChange('activityTracking', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="location-tracking" className="font-medium">Location Tracking</Label>
                          <p className="text-sm text-muted-foreground">Track location during workouts</p>
                        </div>
                        <Switch 
                          id="location-tracking" 
                          checked={privacySettings.locationTracking}
                          onCheckedChange={(checked) => handlePrivacyChange('locationTracking', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <AccordionItem value="sync" className="border-none">
                <AccordionTrigger className="py-3 px-4 bg-card rounded-lg shadow-sm">
                  <div className="flex items-center text-left">
                    <CloudSync className="h-4 w-4 mr-3 text-primary" />
                    <div>
                      <span className="font-medium">Sync & Backup</span>
                      <p className="text-xs text-muted-foreground">Data synchronization</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 px-0">
                  <Card className="border-primary/10">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-sync" className="font-medium">Auto Sync</Label>
                          <p className="text-sm text-muted-foreground">Automatically sync data</p>
                        </div>
                        <Switch 
                          id="auto-sync" 
                          checked={syncSettings.autoSync}
                          onCheckedChange={(checked) => handleSyncChange('autoSync', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="background-sync" className="font-medium">Background Sync</Label>
                          <p className="text-sm text-muted-foreground">Sync when app is closed</p>
                        </div>
                        <Switch 
                          id="background-sync" 
                          checked={syncSettings.backgroundSync}
                          onCheckedChange={(checked) => handleSyncChange('backgroundSync', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="wifi-only" className="font-medium">Wi-Fi Only</Label>
                          <p className="text-sm text-muted-foreground">Sync only on Wi-Fi</p>
                        </div>
                        <Switch 
                          id="wifi-only" 
                          checked={syncSettings.wifiOnly}
                          onCheckedChange={(checked) => handleSyncChange('wifiOnly', checked)}
                        />
                      </div>
                      
                      <Button 
                        className="w-full mt-2" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Data synced",
                            description: "Your fitness data has been successfully synchronized",
                          });
                        }}
                      >
                        Sync Now
                      </Button>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <AccordionItem value="devices" className="border-none">
                <AccordionTrigger className="py-3 px-4 bg-card rounded-lg shadow-sm">
                  <div className="flex items-center text-left">
                    <Bluetooth className="h-4 w-4 mr-3 text-primary" />
                    <div>
                      <span className="font-medium">Connected Devices</span>
                      <p className="text-xs text-muted-foreground">Fitness trackers and wearables</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 px-0">
                  <Card className="border-primary/10">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="connect-wearables" className="font-medium">Connect Wearables</Label>
                          <p className="text-sm text-muted-foreground">Pair with fitness devices</p>
                        </div>
                        <Switch 
                          id="connect-wearables" 
                          checked={deviceSettings.connectWearables}
                          onCheckedChange={(checked) => handleDeviceChange('connectWearables', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="heart-rate-monitor" className="font-medium">Heart Rate Monitor</Label>
                          <p className="text-sm text-muted-foreground">Connect to heart rate sensor</p>
                        </div>
                        <Switch 
                          id="heart-rate-monitor" 
                          checked={deviceSettings.heartRateMonitor}
                          onCheckedChange={(checked) => handleDeviceChange('heartRateMonitor', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="fitness-tracker" className="font-medium">Fitness Tracker</Label>
                          <p className="text-sm text-muted-foreground">Connect to activity tracker</p>
                        </div>
                        <Switch 
                          id="fitness-tracker" 
                          checked={deviceSettings.fitnessTracker}
                          onCheckedChange={(checked) => handleDeviceChange('fitnessTracker', checked)}
                        />
                      </div>
                      
                      <Button 
                        className="w-full mt-2" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Scanning for devices",
                            description: "Looking for nearby fitness devices to connect",
                          });
                          
                          setTimeout(() => {
                            toast({
                              title: "No new devices found",
                              description: "Make sure your devices are in pairing mode and try again"
                            });
                          }, 3000);
                        }}
                      >
                        Scan for Devices
                      </Button>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          </Accordion>
        </motion.div>
        
        <div className="mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset All Settings
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset settings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all settings to their default values. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetSettings}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Settings;

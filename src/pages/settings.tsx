
import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft, RefreshCcw, Moon, Volume2, Ruler, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
import { motion } from "framer-motion";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for all settings
  const [darkMode, setDarkMode] = useState(false);
  const [sounds, setSounds] = useState(true);
  const [metric, setMetric] = useState(true);
  const [timeFormat, setTimeFormat] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [animations, setAnimations] = useState(true);
  
  // Handle setting changes with toast notifications
  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    toast({
      title: checked ? "Dark mode enabled" : "Light mode enabled",
      description: checked ? "App theme has been changed to dark mode" : "App theme has been changed to light mode",
    });
  };
  
  const handleSoundsChange = (checked: boolean) => {
    setSounds(checked);
    toast({
      title: checked ? "App sounds enabled" : "App sounds disabled",
      description: checked ? "Workout completion sounds turned on" : "Workout completion sounds turned off",
    });
  };
  
  const handleMetricChange = (checked: boolean) => {
    setMetric(checked);
    toast({
      title: checked ? "Metric system enabled" : "Imperial system enabled",
      description: checked ? "Units set to kg, cm" : "Units set to lb, in",
    });
  };
  
  const handleTimeFormatChange = (checked: boolean) => {
    setTimeFormat(checked);
    toast({
      title: checked ? "24-hour format enabled" : "12-hour format enabled",
      description: checked ? "Time will be displayed in 24-hour format" : "Time will be displayed in 12-hour format",
    });
  };
  
  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSave(checked);
    toast({
      title: checked ? "Auto-save enabled" : "Auto-save disabled",
      description: checked ? "Workout progress will be saved automatically" : "Workout progress will need to be saved manually",
    });
  };
  
  const handleAnimationsChange = (checked: boolean) => {
    setAnimations(checked);
    toast({
      title: checked ? "Animations enabled" : "Animations disabled",
      description: checked ? "UI animations have been turned on" : "UI animations have been turned off",
    });
  };
  
  // Reset all settings to default
  const resetSettings = () => {
    setDarkMode(false);
    setSounds(true);
    setMetric(true);
    setTimeFormat(false);
    setAutoSave(true);
    setAnimations(true);
    
    toast({
      title: "Settings reset",
      description: "All settings have been reset to their default values",
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
      
      {/* Settings Content */}
      <div className="px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-lg shadow-sm divide-y"
        >
          <div className="p-4">
            <h3 className="font-medium mb-4 flex items-center">
              <Moon className="h-4 w-4 mr-2 text-primary" />
              App Appearance
            </h3>
            
            <div className="space-y-4">
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
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-medium mb-4 flex items-center">
              <Volume2 className="h-4 w-4 mr-2 text-primary" />
              Sound & Feedback
            </h3>
            
            <div className="space-y-4">
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
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-medium mb-4 flex items-center">
              <Ruler className="h-4 w-4 mr-2 text-primary" />
              Units & Formats
            </h3>
            
            <div className="space-y-4">
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
            </div>
          </div>
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

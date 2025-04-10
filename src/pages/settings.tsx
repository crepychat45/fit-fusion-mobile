
import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const navigate = useNavigate();

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
        <div className="bg-card rounded-lg shadow-sm divide-y">
          <div className="p-4">
            <h3 className="font-medium mb-4">App Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark theme</p>
                </div>
                <Switch id="dark-mode" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sounds" className="font-medium">App Sounds</Label>
                  <p className="text-sm text-muted-foreground">Workout completion sounds</p>
                </div>
                <Switch id="sounds" defaultChecked />
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-medium mb-4">Units</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="metric" className="font-medium">Metric System</Label>
                  <p className="text-sm text-muted-foreground">Use kg, cm</p>
                </div>
                <Switch id="metric" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="24h" className="font-medium">24-Hour Time</Label>
                  <p className="text-sm text-muted-foreground">Use 24-hour format</p>
                </div>
                <Switch id="24h" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Settings;

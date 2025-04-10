
import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft, Lock, Unlock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const Privacy = () => {
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
          <h1 className="text-xl font-bold text-white ml-2">Privacy & Security</h1>
        </div>
      </div>
      
      {/* Privacy Content */}
      <div className="px-4 py-6">
        <div className="bg-card rounded-lg shadow-sm divide-y">
          <div className="p-4">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-medium">Privacy Controls</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-sharing" className="font-medium">Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">Share workout data with third-party apps</p>
                </div>
                <Switch id="data-sharing" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics" className="font-medium">Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help improve the app with usage data</p>
                </div>
                <Switch id="analytics" defaultChecked />
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center mb-4">
              <Lock className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-medium">Account Security</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="biometric" className="font-medium">Biometric Unlock</Label>
                  <p className="text-sm text-muted-foreground">Use Face ID or fingerprint to unlock</p>
                </div>
                <Switch id="biometric" defaultChecked />
              </div>
              
              <div>
                <Button variant="outline" className="w-full">Change Password</Button>
              </div>
              
              <div>
                <Button variant="outline" className="w-full">Two-Factor Authentication</Button>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center mb-4">
              <Unlock className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-medium">Privacy Documents</h3>
            </div>
            
            <div className="space-y-3">
              <Button variant="link" className="w-full justify-start px-0 text-muted-foreground hover:text-primary">
                Privacy Policy
              </Button>
              <Button variant="link" className="w-full justify-start px-0 text-muted-foreground hover:text-primary">
                Terms of Service
              </Button>
              <Button variant="link" className="w-full justify-start px-0 text-muted-foreground hover:text-primary">
                Data Deletion Request
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Privacy;

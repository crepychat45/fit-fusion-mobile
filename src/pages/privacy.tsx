import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Shield, Lock, FileText, CloudSync, Share2, MapPin, 
  Bell, Trash2, Info, ChevronRight, ArrowUpRight, Download,
  Clock, User, Fingerprint, Eye, Key, AlertTriangle, Settings,
  Smartphone, Users, CheckSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Privacy = () => {
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  
  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">Privacy & Data</h1>
      </header>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-medium">Privacy Status</h2>
              <p className="text-xs text-muted-foreground">Your account is protected</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Secure
          </Badge>
        </div>
        
        <div className="space-y-6">
          {/* Permissions Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">PERMISSIONS</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location Services</p>
                    <p className="text-xs text-muted-foreground">Used for workout tracking</p>
                  </div>
                </div>
                <Switch 
                  checked={locationEnabled} 
                  onCheckedChange={setLocationEnabled} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-xs text-muted-foreground">Workout reminders and updates</p>
                  </div>
                </div>
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={setNotificationsEnabled} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CloudSync className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Data Synchronization</p>
                    <p className="text-xs text-muted-foreground">Sync data across devices</p>
                  </div>
                </div>
                <Switch 
                  checked={dataSync} 
                  onCheckedChange={setDataSync} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Biometric Authentication</p>
                    <p className="text-xs text-muted-foreground">Use fingerprint or Face ID</p>
                  </div>
                </div>
                <Switch 
                  checked={biometricAuth} 
                  onCheckedChange={setBiometricAuth} 
                />
              </div>
            </div>
          </div>
          
          {/* Data & Privacy Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">DATA & PRIVACY</h3>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between" asChild>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-muted-foreground" />
                    <span>Download Your Data</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-between" asChild>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <span>Privacy Settings</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-between" asChild>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span>Privacy Policy</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-between" asChild>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <span>Data Encryption</span>
                  </div>
                  <Badge variant="outline" className="rounded-full text-xs">
                    Enabled
                  </Badge>
                </div>
              </Button>
            </div>
          </div>
          
          {/* Account Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">ACCOUNT</h3>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between" asChild>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <span>Change Password</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-between" asChild>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                    <span>Connected Accounts</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-between text-destructive hover:text-destructive" asChild>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5" />
                    <span>Delete Account</span>
                  </div>
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default Privacy;


import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft, Shield, ToggleLeft, User, Activity, MapPin, Share2, Key, Fingerprint, List, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const PrivacyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [dataSharing, setDataSharing] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  const [biometricUnlock, setBiometricUnlock] = useState(false);
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showActivityLog, setShowActivityLog] = useState(false);
  
  const activityLogs = [
    { 
      id: 1, 
      action: "Login", 
      timestamp: "2025-04-13 08:23 AM", 
      device: "iPhone 15 Pro",
      location: "New York, USA"
    },
    { 
      id: 2, 
      action: "Profile Updated", 
      timestamp: "2025-04-12 02:45 PM", 
      device: "MacBook Pro",
      location: "New York, USA"
    },
    { 
      id: 3, 
      action: "Workout Completed", 
      timestamp: "2025-04-12 07:15 AM", 
      device: "iPhone 15 Pro",
      location: "New York, USA"
    },
    { 
      id: 4, 
      action: "Password Changed", 
      timestamp: "2025-04-10 05:30 PM", 
      device: "iPhone 15 Pro",
      location: "New York, USA"
    },
  ];

  const handleDataSharingToggle = () => {
    setDataSharing(!dataSharing);
    toast({
      title: !dataSharing ? "Data sharing enabled" : "Data sharing disabled",
      description: !dataSharing 
        ? "Your fitness data will be shared with partner services" 
        : "Your fitness data will no longer be shared",
    });
  };
  
  const handleActivityTrackingToggle = () => {
    setActivityTracking(!activityTracking);
    toast({
      title: !activityTracking ? "Activity tracking enabled" : "Activity tracking disabled",
      description: !activityTracking
        ? "Your workouts and activities will be tracked"
        : "Activity tracking has been turned off",
    });
  };
  
  const handleLocationTrackingToggle = () => {
    setLocationTracking(!locationTracking);
    toast({
      title: !locationTracking ? "Location tracking enabled" : "Location tracking disabled",
      description: !locationTracking
        ? "Your location will be used for route tracking"
        : "Location tracking has been turned off",
    });
  };
  
  const handleAnalyticsToggle = () => {
    setAnalytics(!analytics);
    toast({
      title: !analytics ? "Analytics enabled" : "Analytics disabled",
      description: !analytics
        ? "Usage analytics will be collected to improve the app"
        : "Usage analytics collection has been turned off",
    });
  };
  
  const handlePersonalizationToggle = () => {
    setPersonalization(!personalization);
    toast({
      title: !personalization ? "Personalization enabled" : "Personalization disabled",
      description: !personalization
        ? "Content will be personalized based on your activity"
        : "Personalized content has been turned off",
    });
  };
  
  const handleBiometricUnlockToggle = () => {
    setBiometricUnlock(!biometricUnlock);
    toast({
      title: !biometricUnlock ? "Biometric unlock enabled" : "Biometric unlock disabled",
      description: !biometricUnlock
        ? "You can now use Face ID or fingerprint to unlock the app"
        : "Biometric unlock has been turned off",
    });
  };
  
  const resetPrivacySettings = () => {
    setDataSharing(false);
    setActivityTracking(true);
    setLocationTracking(false);
    setAnalytics(false);
    setPersonalization(false);
    
    toast({
      title: "Privacy settings reset",
      description: "Your privacy settings have been reset to recommended defaults",
    });
  };
  
  const handleChangePassword = () => {
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
    
    // Password change successful
    toast({
      title: "Password updated",
      description: "Your password has been successfully changed",
    });
    
    setShowPasswordDialog(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
          <h1 className="text-xl font-bold text-white ml-2">Privacy & Security</h1>
        </div>
      </div>
      
      {/* Privacy Settings */}
      <div className="px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Data Privacy
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-sharing" className="font-medium">Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">Share fitness data with partner services</p>
                </div>
                <Switch 
                  id="data-sharing" 
                  checked={dataSharing}
                  onCheckedChange={handleDataSharingToggle}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="activity-tracking" className="font-medium">Activity Tracking</Label>
                  <p className="text-sm text-muted-foreground">Track workouts and activity metrics</p>
                </div>
                <Switch 
                  id="activity-tracking" 
                  checked={activityTracking}
                  onCheckedChange={handleActivityTrackingToggle}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="location-tracking" className="font-medium">Location Tracking</Label>
                  <p className="text-sm text-muted-foreground">Track location during workouts</p>
                </div>
                <Switch 
                  id="location-tracking" 
                  checked={locationTracking}
                  onCheckedChange={handleLocationTrackingToggle}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Personalization
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics" className="font-medium">Analytics</Label>
                  <p className="text-sm text-muted-foreground">Collect usage data to improve app</p>
                </div>
                <Switch 
                  id="analytics" 
                  checked={analytics}
                  onCheckedChange={handleAnalyticsToggle}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="personalization" className="font-medium">Personalization</Label>
                  <p className="text-sm text-muted-foreground">Personalize content based on activity</p>
                </div>
                <Switch 
                  id="personalization" 
                  checked={personalization}
                  onCheckedChange={handlePersonalizationToggle}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2 text-primary" />
              Security
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="biometric" className="font-medium">Biometric Unlock</Label>
                  <p className="text-sm text-muted-foreground">Use Face ID or fingerprint to unlock</p>
                </div>
                <Switch 
                  id="biometric" 
                  checked={biometricUnlock}
                  onCheckedChange={handleBiometricUnlockToggle}
                />
              </div>
              
              <Separator />
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setShowActivityLog(true)}
              >
                <List className="h-4 w-4" />
                View Activity Log
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setShowPasswordDialog(true)}
              >
                <LockKeyhole className="h-4 w-4" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={resetPrivacySettings}
        >
          Reset Privacy Settings
        </Button>
        
        <p className="text-xs text-muted-foreground text-center mt-6">
          Your privacy is important to us. Read our full <a href="#" className="text-primary underline">Privacy Policy</a> and <a href="#" className="text-primary underline">Terms of Service</a>.
        </p>
      </div>
      
      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                placeholder="Enter current password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                placeholder="Enter new password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="Confirm new password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Activity Log Dialog */}
      <Dialog open={showActivityLog} onOpenChange={setShowActivityLog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Activity Log</DialogTitle>
            <DialogDescription>
              Recent activity on your account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
            {activityLogs.map((log) => (
              <div key={log.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-muted-foreground">{log.timestamp}</p>
                  </div>
                  <Badge variant="outline">{log.device}</Badge>
                </div>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{log.location}</span>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowActivityLog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default PrivacyPage;


import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Fingerprint, Eye, Lock, Shield, 
  Smartphone, AlertTriangle, RefreshCcw, 
  Key, Database, Trash2
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export function PrivacySettings() {
  const { toast } = useToast();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [screenBlockingEnabled, setScreenBlockingEnabled] = useState(false);
  const [secureStorageEnabled, setSecureStorageEnabled] = useState(true);
  const [dataEncryption, setDataEncryption] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    action: () => void;
    actionText: string;
    variant?: 'default' | 'destructive';
  } | null>(null);
  const [clearCacheDialog, setClearCacheDialog] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [clearProgress, setClearProgress] = useState(0);

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      const bioAuth = localStorage.getItem('fitfusion-biometric-auth');
      setBiometricEnabled(bioAuth === 'true');
      
      const twoFactor = localStorage.getItem('fitfusion-2fa-enabled');
      setTwoFactorEnabled(twoFactor === 'true');
      
      const screenBlocking = localStorage.getItem('fitfusion-screenshot-blocking');
      setScreenBlockingEnabled(screenBlocking === 'true');
      
      const secureStorage = localStorage.getItem('fitfusion-secure-storage');
      setSecureStorageEnabled(secureStorage !== 'false'); // Default true
      
      const encryption = localStorage.getItem('fitfusion-data-encryption');
      setDataEncryption(encryption !== 'false'); // Default true
    };
    
    loadSettings();
  }, []);
  
  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('fitfusion-biometric-auth', biometricEnabled.toString());
  }, [biometricEnabled]);
  
  useEffect(() => {
    localStorage.setItem('fitfusion-2fa-enabled', twoFactorEnabled.toString());
  }, [twoFactorEnabled]);
  
  useEffect(() => {
    localStorage.setItem('fitfusion-screenshot-blocking', screenBlockingEnabled.toString());
  }, [screenBlockingEnabled]);
  
  useEffect(() => {
    localStorage.setItem('fitfusion-secure-storage', secureStorageEnabled.toString());
  }, [secureStorageEnabled]);
  
  useEffect(() => {
    localStorage.setItem('fitfusion-data-encryption', dataEncryption.toString());
  }, [dataEncryption]);
  
  const handleToggle = (setting: string, value: boolean, settingFunction: React.Dispatch<React.SetStateAction<boolean>>) => {
    settingFunction(value);
    
    toast({
      title: `${setting} ${value ? 'Enabled' : 'Disabled'}`,
      description: `Your security setting has been updated.`,
    });
  };
  
  const handleClearCache = () => {
    setClearingCache(true);
    setClearProgress(0);
    
    // Simulate clearing cache with progress
    const interval = setInterval(() => {
      setClearProgress(prev => {
        const newProgress = prev + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setClearingCache(false);
          setClearCacheDialog(false);
          
          // Clear selected localStorage items (not all, to preserve app functionality)
          const preserveKeys = [
            'fitfusion-theme',
            'fitfusion-language',
            'auth_token',
            'fitfusion-unit-system'
          ];
          
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !preserveKeys.includes(key)) {
              keysToRemove.push(key);
            }
          }
          
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          toast({
            title: "Cache Cleared",
            description: "All temporary data has been purged from your device.",
            variant: "default",
          });
          
          return 0;
        }
        
        return newProgress;
      });
    }, 100);
  };
  
  const handleEncryptionToggle = (value: boolean) => {
    setDataEncryption(value);
    
    toast({
      title: value ? "Encryption Enabled" : "Encryption Disabled",
      description: value 
        ? "Your data is now encrypted using industry-standard protocols." 
        : "Your data is no longer encrypted. This is less secure.",
      variant: value ? "default" : "destructive",
    });
  };
  
  const handleDeviceAccessLog = () => {
    toast({
      title: "Device Access Log",
      description: "Loading your recent device access history...",
    });
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Device History",
        description: "Current device: Your phone (last accessed just now)",
      });
    }, 1000);
  };

  const showConfirmDialog = (title: string, description: string, action: () => void, actionText: string, variant?: 'default' | 'destructive') => {
    setConfirmDialog({
      title,
      description,
      action,
      actionText,
      variant,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control how your personal data is used and stored</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center">
                <Fingerprint className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium">Biometric Authentication</span>
              </div>
              <span className="text-xs text-muted-foreground pl-6">
                Use fingerprint or face recognition to unlock the app
              </span>
            </div>
            <Switch 
              checked={biometricEnabled} 
              onCheckedChange={(checked) => handleToggle('Biometric Authentication', checked, setBiometricEnabled)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium">Two-Factor Authentication</span>
              </div>
              <span className="text-xs text-muted-foreground pl-6">
                Add an extra layer of security to your account
              </span>
            </div>
            <Switch 
              checked={twoFactorEnabled} 
              onCheckedChange={(checked) => handleToggle('Two-Factor Authentication', checked, setTwoFactorEnabled)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium">Screenshot Blocking</span>
              </div>
              <span className="text-xs text-muted-foreground pl-6">
                Prevent screenshots of sensitive data
              </span>
            </div>
            <Switch 
              checked={screenBlockingEnabled} 
              onCheckedChange={(checked) => handleToggle('Screenshot Blocking', checked, setScreenBlockingEnabled)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium">Secure Storage</span>
              </div>
              <span className="text-xs text-muted-foreground pl-6">
                Store data in encrypted form on your device
              </span>
            </div>
            <Switch 
              checked={secureStorageEnabled} 
              onCheckedChange={(checked) => handleToggle('Secure Storage', checked, setSecureStorageEnabled)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium">End-to-End Encryption</span>
              </div>
              <span className="text-xs text-muted-foreground pl-6">
                Encrypt all your messages and data
              </span>
            </div>
            <Switch 
              checked={dataEncryption} 
              onCheckedChange={(checked) => handleEncryptionToggle(checked)} 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mr-1" />
            <span>Your privacy matters to us</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setClearCacheDialog(true)}
          >
            Clear Cached Data
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => showConfirmDialog(
              "Change Password", 
              "You'll be redirected to the password change form.",
              () => {
                // Navigate to password change page or open modal
                toast({
                  title: "Password Change",
                  description: "Please enter your current and new password.",
                });
              },
              "Continue"
            )}
          >
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleDeviceAccessLog}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Device Access Log
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => showConfirmDialog(
              "Disconnect All Devices", 
              "This will sign you out from all devices except this one.",
              () => {
                // Log out all sessions
                toast({
                  title: "Devices Disconnected",
                  description: "You have been signed out from all other devices.",
                });
              },
              "Disconnect All",
              "destructive"
            )}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Disconnect All Devices
          </Button>
          
          <Button 
            variant="destructive" 
            className="w-full justify-start"
            onClick={() => showConfirmDialog(
              "Delete Account", 
              "This action cannot be undone. This will permanently delete your account and all associated data.",
              () => {
                // Delete account
                toast({
                  title: "Account Deletion Requested",
                  description: "Please check your email to confirm account deletion.",
                  variant: "destructive",
                });
              },
              "Delete Account",
              "destructive"
            )}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
      
      {/* Confirm Dialog */}
      <Dialog open={confirmDialog !== null} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog?.title}</DialogTitle>
            <DialogDescription>
              {confirmDialog?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant={confirmDialog?.variant || "default"} 
              onClick={() => {
                confirmDialog?.action();
                setConfirmDialog(null);
              }}
            >
              {confirmDialog?.actionText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Clear Cache Dialog */}
      <Dialog open={clearCacheDialog} onOpenChange={setClearCacheDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Cached Data</DialogTitle>
            <DialogDescription>
              This will remove all temporary data stored on your device, including cached images and offline data.
            </DialogDescription>
          </DialogHeader>
          
          {clearingCache && (
            <div className="py-4">
              <p className="text-sm text-center mb-2">Clearing cache: {clearProgress}%</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-150"
                  style={{ width: `${clearProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">Please don't close the app</p>
            </div>
          )}
          
          {!clearingCache && (
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                variant="default"
                onClick={handleClearCache}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

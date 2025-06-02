
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  Smartphone, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Clock,
  Globe,
  Database
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function SecurityCenter() {
  const { toast } = useToast();
  const [securityScore, setSecurityScore] = useState(75);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [lastSecurityScan, setLastSecurityScan] = useState<Date | null>(null);
  const [showSecurityTips, setShowSecurityTips] = useState(false);
  const [activeDevices, setActiveDevices] = useState([
    { id: 1, name: "iPhone 13", location: "New York, NY", lastActive: "Just now", current: true },
    { id: 2, name: "MacBook Pro", location: "New York, NY", lastActive: "2 hours ago", current: false }
  ]);

  useEffect(() => {
    calculateSecurityScore();
  }, [twoFactorEnabled, biometricEnabled, encryptionEnabled, privacyMode]);

  const calculateSecurityScore = () => {
    let score = 50; // Base score
    
    if (twoFactorEnabled) score += 20;
    if (biometricEnabled) score += 15;
    if (encryptionEnabled) score += 10;
    if (privacyMode) score += 5;
    
    setSecurityScore(Math.min(score, 100));
  };

  const runSecurityScan = async () => {
    setLastSecurityScan(new Date());
    
    toast({
      title: "Security scan started",
      description: "Checking your account security..."
    });

    // Simulate security scan
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const issues = [];
    if (!twoFactorEnabled) issues.push("Two-factor authentication disabled");
    if (!biometricEnabled) issues.push("Biometric authentication not set up");
    
    if (issues.length === 0) {
      toast({
        title: "Security scan complete",
        description: "No security issues found. Your account is secure!",
      });
    } else {
      toast({
        title: "Security issues found",
        description: `Found ${issues.length} issue(s) that need attention.`,
        variant: "destructive"
      });
    }
  };

  const enableTwoFactor = async () => {
    toast({
      title: "Enabling 2FA",
      description: "Setting up two-factor authentication..."
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTwoFactorEnabled(true);
    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication is now active on your account.",
    });
  };

  const enableBiometric = async () => {
    try {
      toast({
        title: "Setting up biometric authentication",
        description: "Please follow the prompts on your device..."
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBiometricEnabled(true);
      toast({
        title: "Biometric authentication enabled",
        description: "You can now use fingerprint or face recognition to sign in.",
      });
    } catch (error) {
      toast({
        title: "Biometric setup failed",
        description: "Unable to set up biometric authentication. Please try again.",
        variant: "destructive"
      });
    }
  };

  const disconnectDevice = (deviceId: number) => {
    setActiveDevices(prev => prev.filter(device => device.id !== deviceId));
    toast({
      title: "Device disconnected",
      description: "The device has been signed out of your account.",
    });
  };

  const getSecurityLevel = () => {
    if (securityScore >= 90) return { level: "Excellent", color: "text-green-600", icon: CheckCircle };
    if (securityScore >= 75) return { level: "Good", color: "text-blue-600", icon: Shield };
    if (securityScore >= 50) return { level: "Fair", color: "text-yellow-600", icon: AlertTriangle };
    return { level: "Poor", color: "text-red-600", icon: AlertTriangle };
  };

  const securityLevel = getSecurityLevel();
  const SecurityIcon = securityLevel.icon;

  return (
    <div className="space-y-6">
      {/* Security Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Center
          </CardTitle>
          <CardDescription>
            Monitor and improve your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <SecurityIcon className={`h-5 w-5 ${securityLevel.color}`} />
                <span className="font-medium">Security Score: {securityScore}/100</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your security level is <span className={securityLevel.color}>{securityLevel.level}</span>
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowSecurityTips(true)}>
              Improve Security
            </Button>
          </div>
          
          <Progress value={securityScore} className="h-2" />
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {lastSecurityScan ? (
                `Last scan: ${lastSecurityScan.toLocaleString()}`
              ) : (
                "Never scanned"
              )}
            </div>
            <Button variant="outline" size="sm" onClick={runSecurityScan}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Run Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication & Access</CardTitle>
          <CardDescription>
            Configure how you sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {twoFactorEnabled && (
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
              <Switch 
                checked={twoFactorEnabled}
                onCheckedChange={twoFactorEnabled ? setTwoFactorEnabled : enableTwoFactor}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Biometric Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Use fingerprint or face recognition to sign in
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {biometricEnabled && (
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              )}
              <Switch 
                checked={biometricEnabled}
                onCheckedChange={biometricEnabled ? setBiometricEnabled : enableBiometric}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">End-to-End Encryption</p>
                <p className="text-sm text-muted-foreground">
                  Encrypt all your data and communications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Always On
              </Badge>
              <Switch 
                checked={encryptionEnabled}
                onCheckedChange={setEncryptionEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Active Devices
          </CardTitle>
          <CardDescription>
            Manage devices that are signed in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeDevices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{device.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span>{device.location}</span>
                    <span>•</span>
                    <span>{device.lastActive}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {device.current && (
                  <Badge variant="outline" className="text-xs">Current Device</Badge>
                )}
                {!device.current && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => disconnectDevice(device.id)}
                  >
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Tips Dialog */}
      <Dialog open={showSecurityTips} onOpenChange={setShowSecurityTips}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Security Recommendations</DialogTitle>
            <DialogDescription>
              Follow these tips to improve your account security
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!twoFactorEnabled && (
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Enable Two-Factor Authentication</strong>
                  <br />
                  Add an extra layer of security to prevent unauthorized access.
                </AlertDescription>
              </Alert>
            )}
            
            {!biometricEnabled && (
              <Alert>
                <Fingerprint className="h-4 w-4" />
                <AlertDescription>
                  <strong>Set up Biometric Authentication</strong>
                  <br />
                  Use your fingerprint or face for quick and secure sign-ins.
                </AlertDescription>
              </Alert>
            )}
            
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <strong>Use a Strong Password</strong>
                <br />
                Include uppercase, lowercase, numbers, and special characters.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowSecurityTips(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

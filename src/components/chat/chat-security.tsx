
import React, { useState } from "react";
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
  Database,
  Zap
} from "lucide-react";

interface ChatSecurityProps {
  securityLevel: string;
  onSecurityLevelChange: (level: string) => void;
  onClose: () => void;
}

export function ChatSecurity({ securityLevel, onSecurityLevelChange, onClose }: ChatSecurityProps) {
  const { toast } = useToast();
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [vpnRequired, setVpnRequired] = useState(false);
  const [secureMode, setSecureMode] = useState(false);
  const [lastSecurityScan, setLastSecurityScan] = useState<Date | null>(null);
  const [securityScore, setSecurityScore] = useState(85);

  const runSecurityScan = async () => {
    setLastSecurityScan(new Date());
    
    toast({
      title: "Security scan started",
      description: "Analyzing your security configuration..."
    });

    // Simulate security scan
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    let score = 50;
    if (encryptionEnabled) score += 20;
    if (twoFactorEnabled) score += 15;
    if (biometricEnabled) score += 10;
    if (autoLockEnabled) score += 5;
    
    setSecurityScore(Math.min(score, 100));

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

  const getSecurityLevel = () => {
    if (securityScore >= 90) return { level: "Maximum", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle };
    if (securityScore >= 75) return { level: "High", color: "text-blue-600", bgColor: "bg-blue-100", icon: Shield };
    if (securityScore >= 50) return { level: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: AlertTriangle };
    return { level: "Low", color: "text-red-600", bgColor: "bg-red-100", icon: AlertTriangle };
  };

  const currentSecurityLevel = getSecurityLevel();
  const SecurityIcon = currentSecurityLevel.icon;

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
          <CardDescription>
            Monitor and improve your chat security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <SecurityIcon className={`h-5 w-5 ${currentSecurityLevel.color}`} />
                <span className="font-medium">Security Score: {securityScore}/100</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your security level is <span className={currentSecurityLevel.color}>{currentSecurityLevel.level}</span>
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full ${currentSecurityLevel.bgColor}`}>
              <span className={`text-sm font-medium ${currentSecurityLevel.color}`}>
                {currentSecurityLevel.level}
              </span>
            </div>
          </div>
          
          <Progress value={securityScore} className="h-3" />
          
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

      {/* Encryption Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Encryption & Privacy
          </CardTitle>
          <CardDescription>
            Configure end-to-end encryption and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">End-to-End Encryption</p>
                <p className="text-sm text-muted-foreground">
                  Military-grade encryption for all messages
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Secure Mode</p>
                <p className="text-sm text-muted-foreground">
                  Enhanced security with additional verification
                </p>
              </div>
            </div>
            <Switch 
              checked={secureMode}
              onCheckedChange={setSecureMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">VPN Required</p>
                <p className="text-sm text-muted-foreground">
                  Require VPN connection for access
                </p>
              </div>
            </div>
            <Switch 
              checked={vpnRequired}
              onCheckedChange={setVpnRequired}
            />
          </div>
        </CardContent>
      </Card>

      {/* Authentication Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Authentication Methods
          </CardTitle>
          <CardDescription>
            Configure multi-factor authentication options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security with SMS or app-based 2FA
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
                  Use fingerprint or face recognition for quick access
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
                <p className="font-medium">Auto-Lock</p>
                <p className="text-sm text-muted-foreground">
                  Automatically lock chat after inactivity
                </p>
              </div>
            </div>
            <Switch 
              checked={autoLockEnabled}
              onCheckedChange={setAutoLockEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
          <CardDescription>
            Follow these recommendations to improve your security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
          
          {!secureMode && (
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Enable Secure Mode</strong>
                <br />
                Activate enhanced security features for maximum protection.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

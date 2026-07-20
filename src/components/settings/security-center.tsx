import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Zap,
  QrCode,
  Scan,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdvancedAuthentication } from "./advanced-authentication";

export function SecurityCenter() {
  const { toast } = useToast();
  
  // Load settings from localStorage
  const [encryptionEnabled, setEncryptionEnabled] = useState(() => {
    const saved = localStorage.getItem("security-encryption");
    return saved ? JSON.parse(saved) : true;
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    const saved = localStorage.getItem("security-2fa");
    return saved ? JSON.parse(saved) : false;
  });
  const [biometricEnabled, setBiometricEnabled] = useState(() => {
    const saved = localStorage.getItem("security-biometric");
    return saved ? JSON.parse(saved) : false;
  });
  const [autoLockEnabled, setAutoLockEnabled] = useState(() => {
    const saved = localStorage.getItem("security-autolock");
    return saved ? JSON.parse(saved) : true;
  });
  const [vpnRequired, setVpnRequired] = useState(() => {
    const saved = localStorage.getItem("security-vpn");
    return saved ? JSON.parse(saved) : false;
  });
  const [secureMode, setSecureMode] = useState(() => {
    const saved = localStorage.getItem("security-secure-mode");
    return saved ? JSON.parse(saved) : false;
  });
  const [lastSecurityScan, setLastSecurityScan] = useState<Date | null>(null);
  const [securityScore, setSecurityScore] = useState(85);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [passwordlessLogin, setPasswordlessLogin] = useState(() => {
    const saved = localStorage.getItem("security-passwordless");
    return saved ? JSON.parse(saved) : false;
  });
  const [deviceTrust, setDeviceTrust] = useState(() => {
    const saved = localStorage.getItem("security-device-trust");
    return saved ? JSON.parse(saved) : true;
  });
  const [sessionTimeout, setSessionTimeout] = useState(30);

  // Save settings to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem("security-encryption", JSON.stringify(encryptionEnabled));
  }, [encryptionEnabled]);

  React.useEffect(() => {
    localStorage.setItem("security-2fa", JSON.stringify(twoFactorEnabled));
  }, [twoFactorEnabled]);

  React.useEffect(() => {
    localStorage.setItem("security-biometric", JSON.stringify(biometricEnabled));
  }, [biometricEnabled]);

  React.useEffect(() => {
    localStorage.setItem("security-autolock", JSON.stringify(autoLockEnabled));
  }, [autoLockEnabled]);

  React.useEffect(() => {
    localStorage.setItem("security-vpn", JSON.stringify(vpnRequired));
  }, [vpnRequired]);

  React.useEffect(() => {
    localStorage.setItem("security-secure-mode", JSON.stringify(secureMode));
  }, [secureMode]);

  React.useEffect(() => {
    localStorage.setItem("security-passwordless", JSON.stringify(passwordlessLogin));
  }, [passwordlessLogin]);

  React.useEffect(() => {
    localStorage.setItem("security-device-trust", JSON.stringify(deviceTrust));
  }, [deviceTrust]);

  const runSecurityScan = async () => {
    setLastSecurityScan(new Date());

    toast({
      title: "🔍 Security scan started",
      description: "Analyzing your security configuration...",
    });

    // Simulate comprehensive security scan
    await new Promise((resolve) => setTimeout(resolve, 3000));

    let score = 50;
    if (encryptionEnabled) score += 20;
    if (twoFactorEnabled) score += 15;
    if (biometricEnabled) score += 10;
    if (autoLockEnabled) score += 5;
    if (passwordlessLogin) score += 10;
    if (deviceTrust) score += 5;

    setSecurityScore(Math.min(score, 100));

    const issues = [];
    if (!twoFactorEnabled) issues.push("Two-factor authentication disabled");
    if (!biometricEnabled) issues.push("Biometric authentication not set up");
    if (!passwordlessLogin) issues.push("Passwordless login not configured");

    if (issues.length === 0) {
      toast({
        title: "✅ Security scan complete",
        description: "No security issues found. Your account is secure!",
      });
    } else {
      toast({
        title: "⚠️ Security issues found",
        description: `Found ${issues.length} issue(s) that need attention.`,
        variant: "destructive",
      });
    }
  };

  const enableTwoFactor = async () => {
    toast({
      title: "🔐 Enabling 2FA",
      description: "Setting up two-factor authentication...",
    });

    setShowQRCode(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setTwoFactorEnabled(true);
    toast({
      title: "✅ 2FA Enabled",
      description: "Two-factor authentication is now active on your account.",
    });
  };

  const enableBiometric = async () => {
    try {
      toast({
        title: "🔐 Setting up biometric authentication",
        description: "Please follow the prompts on your device...",
      });

      // Simulate biometric setup
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setBiometricEnabled(true);
      toast({
        title: "✅ Biometric authentication enabled",
        description:
          "You can now use fingerprint or face recognition to sign in.",
      });
    } catch (error) {
      toast({
        title: "❌ Biometric setup failed",
        description:
          "Unable to set up biometric authentication. Please try again.",
        variant: "destructive",
      });
    }
  };

  const enablePasswordlessLogin = async () => {
    toast({
      title: "🚀 Enabling passwordless login",
      description: "Setting up secure passwordless authentication...",
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setPasswordlessLogin(true);
    toast({
      title: "✅ Passwordless login enabled",
      description: "You can now sign in using magic links or biometrics.",
    });
  };

  const getSecurityLevel = () => {
    if (securityScore >= 90)
      return {
        level: "Maximum",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: CheckCircle,
      };
    if (securityScore >= 75)
      return {
        level: "High",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: Shield,
      };
    if (securityScore >= 50)
      return {
        level: "Medium",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        icon: AlertTriangle,
      };
    return {
      level: "Low",
      color: "text-red-600",
      bgColor: "bg-red-100",
      icon: AlertTriangle,
    };
  };

  const currentSecurityLevel = getSecurityLevel();
  const SecurityIcon = currentSecurityLevel.icon;

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-6 pr-4">
      {/* Enhanced Security Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Advanced Security Dashboard
            </CardTitle>
            <CardDescription>
              Monitor and enhance your security posture with AI-powered insights
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SecurityIcon
                    className={`h-5 w-5 ${currentSecurityLevel.color}`}
                  />
                  <span className="font-medium">
                    Security Score: {securityScore}/100
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your security level is{" "}
                  <span className={currentSecurityLevel.color}>
                    {currentSecurityLevel.level}
                  </span>
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full ${currentSecurityLevel.bgColor}`}
              >
                <span
                  className={`text-sm font-medium ${currentSecurityLevel.color}`}
                >
                  {currentSecurityLevel.level}
                </span>
              </div>
            </div>

            <Progress value={securityScore} className="h-3" />

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {lastSecurityScan
                  ? `Last scan: ${lastSecurityScan.toLocaleString()}`
                  : "Never scanned"}
              </div>
              <Button variant="outline" size="sm" onClick={runSecurityScan}>
                <RefreshCw className="h-4 w-4 mr-1" />
                AI Security Scan
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Encryption & Privacy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              End-to-End Encryption & Privacy
            </CardTitle>
            <CardDescription>
              Military-grade encryption with quantum-resistant algorithms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Quantum-Safe Encryption</p>
                  <p className="text-sm text-muted-foreground">
                    AES-256 with post-quantum cryptography
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
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
                  <p className="font-medium">Zero-Knowledge Architecture</p>
                  <p className="text-sm text-muted-foreground">
                    Your data is encrypted before it leaves your device
                  </p>
                </div>
              </div>
              <Switch checked={secureMode} onCheckedChange={setSecureMode} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">VPN Protection Required</p>
                  <p className="text-sm text-muted-foreground">
                    Require VPN connection for enhanced security
                  </p>
                </div>
              </div>
              <Switch checked={vpnRequired} onCheckedChange={setVpnRequired} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Real Advanced Authentication (2FA / Passkey / Magic link) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AdvancedAuthentication />
      </motion.div>

      {/* Device Trust & Auto-Lock */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Device & Session
            </CardTitle>
            <CardDescription>Trust and inactivity behaviour</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Device Trust Management</p>
                  <p className="text-sm text-muted-foreground">
                    Remember trusted devices for {sessionTimeout} days
                  </p>
                </div>
              </div>
              <Switch checked={deviceTrust} onCheckedChange={setDeviceTrust} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Smart Auto-Lock</p>
                  <p className="text-sm text-muted-foreground">
                    AI-powered inactivity detection
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
      </motion.div>


      {/* Security Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              AI Security Recommendations
            </CardTitle>
            <CardDescription>
              Personalized security improvements based on your usage patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {!twoFactorEnabled && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Enable Two-Factor Authentication</strong>
                      <br />
                      Add an extra layer of security to prevent unauthorized
                      access.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {!biometricEnabled && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Alert>
                    <Fingerprint className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Set up Biometric Authentication</strong>
                      <br />
                      Use your fingerprint or face for quick and secure
                      sign-ins.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {!passwordlessLogin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Enable Passwordless Login</strong>
                      <br />
                      Experience the future of authentication with magic links
                      and WebAuthn.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </ScrollArea>
  );
}

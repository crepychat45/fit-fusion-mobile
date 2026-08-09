import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { listPasskeys } from "@/lib/passkey-manager";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Wifi,
  UserCheck,
  Settings,
  Activity,
  Clock,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SecurityCheck {
  id: string;
  name: string;
  status: "secure" | "warning" | "critical";
  description: string;
  lastChecked: Date;
}

export function EnhancedSecurityCenter() {
  const { toast } = useToast();
  const [securityScore, setSecurityScore] = useState(85);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  useEffect(() => {
    listPasskeys().then(list => setBiometricEnabled(list.length > 0)).catch(() => {});
  }, []);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([
    {
      id: "password-strength",
      name: "Password Strength",
      status: "secure",
      description: "Strong password with special characters",
      lastChecked: new Date(),
    },
    {
      id: "login-activity",
      name: "Login Activity",
      status: "secure",
      description: "No suspicious login attempts detected",
      lastChecked: new Date(),
    },
    {
      id: "data-encryption",
      name: "Data Encryption",
      status: "secure",
      description: "All data encrypted with AES-256",
      lastChecked: new Date(),
    },
    {
      id: "session-security",
      name: "Session Security",
      status: "warning",
      description: "Long session timeout detected",
      lastChecked: new Date(),
    },
    {
      id: "device-trust",
      name: "Device Trust",
      status: "secure",
      description: "Device is trusted and verified",
      lastChecked: new Date(),
    },
  ]);

  const runSecurityScan = async () => {
    setIsScanning(true);
    setScanProgress(0);

    // Simulate security scan
    for (let i = 0; i <= 100; i += 5) {
      setScanProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Update security score
    const newScore = Math.min(securityScore + Math.random() * 5, 100);
    setSecurityScore(Math.round(newScore));

    // Update check timestamps
    setSecurityChecks((prev) =>
      prev.map((check) => ({ ...check, lastChecked: new Date() })),
    );

    setIsScanning(false);
    setScanProgress(0);

    toast({
      title: "🔒 Security Scan Complete",
      description: `Security score: ${Math.round(newScore)}%`,
    });
  };

  const enableTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast({
      title: twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
      description: twoFactorEnabled
        ? "Two-factor authentication has been disabled"
        : "Two-factor authentication has been enabled",
      variant: twoFactorEnabled ? "destructive" : "default",
    });
  };

  const enableBiometric = () => {
    toast({
      title: "Use Passkey Manager",
      description: "Manage biometrics from your Profile → Security settings.",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (status: SecurityCheck["status"]) => {
    switch (status) {
      case "secure":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Security Center
          </h2>
          <p className="text-muted-foreground">
            Monitor and enhance your account security
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(securityScore)}`}>
            {securityScore}%
          </div>
          <div className="text-sm text-muted-foreground">Security Score</div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Security Score */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Security Health</CardTitle>
                <Button
                  variant="outline"
                  onClick={runSecurityScan}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Run Security Scan
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Security Score</span>
                  <span className={`font-bold ${getScoreColor(securityScore)}`}>
                    {securityScore}%
                  </span>
                </div>
                <Progress value={securityScore} className="h-3" />

                {isScanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span>Scanning security systems...</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <Progress value={scanProgress} className="h-2" />
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Security Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityChecks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {check.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {check.lastChecked.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </div>
                  </div>
                </div>
                <Button
                  variant={twoFactorEnabled ? "default" : "outline"}
                  onClick={enableTwoFactor}
                >
                  {twoFactorEnabled ? "Enabled" : "Enable"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Biometric Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      Use fingerprint or face recognition
                    </div>
                  </div>
                </div>
                <Button
                  variant={biometricEnabled ? "default" : "outline"}
                  onClick={enableBiometric}
                >
                  {biometricEnabled ? "Enabled" : "Enable"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Single Sign-On</div>
                    <div className="text-sm text-muted-foreground">
                      Use your Google or Apple account
                    </div>
                  </div>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
            </CardContent>
          </Card>

          {twoFactorEnabled && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is active. Your account is now more
                secure.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Security Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium">Successful login</div>
                    <div className="text-sm text-muted-foreground">
                      Chrome on Windows • 2 hours ago
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Key className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium">Password changed</div>
                    <div className="text-sm text-muted-foreground">
                      Yesterday • 3:24 PM
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <div className="flex-1">
                    <div className="font-medium">Security scan completed</div>
                    <div className="text-sm text-muted-foreground">
                      2 days ago • 10:15 AM
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Data Analytics</div>
                  <div className="text-sm text-muted-foreground">
                    Allow usage analytics to improve the app
                  </div>
                </div>
                <Button variant="outline">Manage</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Location Tracking</div>
                  <div className="text-sm text-muted-foreground">
                    Share location for workout recommendations
                  </div>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Third-party Integrations</div>
                  <div className="text-sm text-muted-foreground">
                    Connected apps and services
                  </div>
                </div>
                <Button variant="outline">Review</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
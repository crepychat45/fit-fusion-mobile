import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  Smartphone,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Settings,
  Bell,
  Key,
  Database,
  Camera,
  Mic,
  MapPin,
  Clock,
  Activity,
  TrendingUp,
  X,
} from "lucide-react";

interface SecurityMetric {
  id: string;
  name: string;
  status: "secure" | "warning" | "critical";
  score: number;
  description: string;
  icon: React.ComponentType<any>;
}

interface MobileSecurityCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSecurityCenter({
  isOpen,
  onClose,
}: MobileSecurityCenterProps) {
  const [securityScore, setSecurityScore] = useState(92);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [dataEncryption, setDataEncryption] = useState(true);
  const [locationPrivacy, setLocationPrivacy] = useState(false);
  const [cameraAccess, setCameraAccess] = useState(true);
  const [micAccess, setMicAccess] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoLock, setAutoLock] = useState([5]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const securityMetrics: SecurityMetric[] = [
    {
      id: "biometric",
      name: "Biometric Security",
      status: biometricEnabled ? "secure" : "warning",
      score: biometricEnabled ? 100 : 60,
      description: "Fingerprint & Face ID protection",
      icon: Fingerprint,
    },
    {
      id: "encryption",
      name: "Data Encryption",
      status: dataEncryption ? "secure" : "critical",
      score: dataEncryption ? 100 : 20,
      description: "End-to-end data encryption",
      icon: Lock,
    },
    {
      id: "privacy",
      name: "Privacy Controls",
      status: locationPrivacy ? "secure" : "warning",
      score: locationPrivacy ? 90 : 70,
      description: "Location & personal data protection",
      icon: Eye,
    },
    {
      id: "network",
      name: "Network Security",
      status: "secure",
      score: 95,
      description: "Secure connection protocols",
      icon: Wifi,
    },
  ];

  const permissions = [
    {
      id: "camera",
      name: "Camera Access",
      description: "For workout form analysis",
      enabled: cameraAccess,
      setter: setCameraAccess,
      icon: Camera,
      required: false,
    },
    {
      id: "microphone",
      name: "Microphone Access",
      description: "For voice commands",
      enabled: micAccess,
      setter: setMicAccess,
      icon: Mic,
      required: false,
    },
    {
      id: "location",
      name: "Location Services",
      description: "For weather & nearby gyms",
      enabled: locationPrivacy,
      setter: setLocationPrivacy,
      icon: MapPin,
      required: false,
    },
    {
      id: "notifications",
      name: "Push Notifications",
      description: "Workout reminders & updates",
      enabled: notifications,
      setter: setNotifications,
      icon: Bell,
      required: true,
    },
  ];

  useEffect(() => {
    // Calculate overall security score
    const totalScore = securityMetrics.reduce(
      (sum, metric) => sum + metric.score,
      0,
    );
    const avgScore = Math.round(totalScore / securityMetrics.length);
    setSecurityScore(avgScore);
  }, [biometricEnabled, dataEncryption, locationPrivacy]);

  const handleSecurityScan = async () => {
    setLoading(true);

    // Simulate security scan
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newScore =
      Math.random() > 0.8
        ? Math.floor(Math.random() * 10) + 85
        : Math.floor(Math.random() * 5) + 90;

    setSecurityScore(newScore);
    setLoading(false);

    toast({
      title: "🛡️ Security Scan Complete",
      description: `Your mobile security score: ${newScore}/100`,
      variant: newScore > 85 ? "default" : "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "secure":
        return "text-green-600 bg-green-100 border-green-300";
      case "warning":
        return "text-yellow-600 bg-yellow-100 border-yellow-300";
      case "critical":
        return "text-red-600 bg-red-100 border-red-300";
      default:
        return "text-gray-600 bg-gray-100 border-gray-300";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl max-h-[95vh] flex flex-col safe-area-padding"
          >
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(34, 197, 94, 0.7)",
                        "0 0 0 10px rgba(34, 197, 94, 0)",
                        "0 0 0 0 rgba(34, 197, 94, 0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full"
                  >
                    <Shield className="h-6 w-6 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg">Mobile Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Privacy & Protection Center
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Security Score */}
              <div className="mt-4 p-4 bg-white/50 dark:bg-black/20 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Security Score</span>
                  <span
                    className={`text-2xl font-bold ${getScoreColor(securityScore)}`}
                  >
                    {securityScore}/100
                  </span>
                </div>
                <Progress value={securityScore} className="h-2 mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {securityScore >= 90
                      ? "Excellent Security"
                      : securityScore >= 70
                        ? "Good Security"
                        : "Needs Improvement"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSecurityScan}
                    disabled={loading}
                    className="text-xs"
                  >
                    {loading ? "Scanning..." : "Quick Scan"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Security Metrics */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Security Status
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {securityMetrics.map((metric) => (
                    <motion.div
                      key={metric.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                    >
                      <div
                        className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}
                      >
                        <metric.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {metric.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(metric.status)}`}
                          >
                            {metric.score}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {metric.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Privacy Controls */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Privacy Controls
                </h4>

                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Fingerprint className="h-4 w-4 text-primary" />
                        <div>
                          <span className="font-medium text-sm">
                            Biometric Lock
                          </span>
                          <p className="text-xs text-muted-foreground">
                            Fingerprint & Face ID
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={biometricEnabled}
                        onCheckedChange={setBiometricEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="h-4 w-4 text-blue-600" />
                        <div>
                          <span className="font-medium text-sm">
                            Data Encryption
                          </span>
                          <p className="text-xs text-muted-foreground">
                            AES-256 encryption
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={dataEncryption}
                        onCheckedChange={setDataEncryption}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-sm">
                            Auto-Lock Timer
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {autoLock[0]} min
                        </span>
                      </div>
                      <Slider
                        value={autoLock}
                        onValueChange={setAutoLock}
                        max={30}
                        min={1}
                        step={1}
                        className="py-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* App Permissions */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  App Permissions
                </h4>

                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <motion.div
                      key={permission.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <permission.icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {permission.name}
                            </span>
                            {permission.required && (
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={permission.enabled}
                        onCheckedChange={permission.setter}
                        disabled={permission.required}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Security Tips */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Security Tips
                </h4>

                <div className="space-y-2">
                  {[
                    {
                      tip: "Enable biometric authentication for faster, secure access",
                      importance: "high",
                      completed: biometricEnabled,
                    },
                    {
                      tip: "Keep your app updated for latest security patches",
                      importance: "medium",
                      completed: true,
                    },
                    {
                      tip: "Review app permissions regularly",
                      importance: "medium",
                      completed: false,
                    },
                    {
                      tip: "Use secure Wi-Fi networks for syncing data",
                      importance: "high",
                      completed: false,
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-xl border ${
                        item.completed
                          ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                          : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {item.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{item.tip}</p>
                          <Badge
                            variant="outline"
                            className={`text-xs mt-1 ${
                              item.importance === "high"
                                ? "border-red-300 text-red-600"
                                : "border-yellow-300 text-yellow-600"
                            }`}
                          >
                            {item.importance} priority
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <Button
                  onClick={handleSecurityScan}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {loading ? "Scanning Security..." : "Run Full Security Scan"}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Database className="h-3 w-3 mr-1" />
                    Export Data
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Advanced
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

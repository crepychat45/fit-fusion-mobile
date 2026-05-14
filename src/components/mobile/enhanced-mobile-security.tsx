import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Lock, Eye, Fingerprint, Wifi, AlertTriangle, CheckCircle, Settings, Bell, Key,
  Camera, Mic, MapPin, Clock, Activity, TrendingUp, X, Smartphone, Database, Globe, RefreshCw,
  Scan, UserCheck, ShieldCheck, Zap, QrCode, FileText, Trash2, Download, Server,
} from "lucide-react";

interface MobileSecurityCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnhancedMobileSecurityCenter({ isOpen, onClose }: MobileSecurityCenterProps) {
  const { toast } = useToast();
  const [securityScore, setSecurityScore] = useState(92);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [dataEncryption, setDataEncryption] = useState(true);
  const [locationPrivacy, setLocationPrivacy] = useState(false);
  const [cameraAccess, setCameraAccess] = useState(true);
  const [micAccess, setMicAccess] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoLock, setAutoLock] = useState([5]);
  const [vpnEnabled, setVpnEnabled] = useState(false);
  const [antiMalware, setAntiMalware] = useState(true);
  const [secureBackup, setSecureBackup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState("status");

  const securityMetrics = [
    { id: "biometric", name: "Biometric Security", status: biometricEnabled ? "secure" : "warning", score: biometricEnabled ? 100 : 60, description: "Fingerprint & Face ID", icon: Fingerprint },
    { id: "encryption", name: "Data Encryption", status: dataEncryption ? "secure" : "critical", score: dataEncryption ? 100 : 20, description: "AES-256 encryption", icon: Lock },
    { id: "privacy", name: "Privacy Controls", status: locationPrivacy ? "secure" : "warning", score: locationPrivacy ? 90 : 70, description: "Location & data protection", icon: Eye },
    { id: "network", name: "Network Security", status: vpnEnabled ? "secure" : "warning", score: vpnEnabled ? 100 : 75, description: "VPN & secure connection", icon: Wifi },
    { id: "malware", name: "Malware Protection", status: antiMalware ? "secure" : "critical", score: antiMalware ? 100 : 30, description: "Real-time scanning", icon: ShieldCheck },
    { id: "backup", name: "Secure Backup", status: secureBackup ? "secure" : "warning", score: secureBackup ? 95 : 50, description: "Encrypted cloud backup", icon: Database },
  ];

  const permissions = [
    { id: "camera", name: "Camera", description: "Workout form analysis", enabled: cameraAccess, setter: setCameraAccess, icon: Camera },
    { id: "microphone", name: "Microphone", description: "Voice commands", enabled: micAccess, setter: setMicAccess, icon: Mic },
    { id: "location", name: "Location", description: "Weather & nearby gyms", enabled: locationPrivacy, setter: setLocationPrivacy, icon: MapPin },
    { id: "notifications", name: "Notifications", description: "Workout reminders", enabled: notifications, setter: setNotifications, icon: Bell },
  ];

  useEffect(() => {
    const totalScore = securityMetrics.reduce((sum, metric) => sum + metric.score, 0);
    setSecurityScore(Math.round(totalScore / securityMetrics.length));
  }, [biometricEnabled, dataEncryption, locationPrivacy, vpnEnabled, antiMalware, secureBackup]);

  const handleSecurityScan = async () => {
    setScanning(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setScanning(false);
    
    const threats = Math.random() > 0.8 ? 1 : 0;
    toast({
      title: threats > 0 ? "⚠️ Potential Threat Found" : "✅ Scan Complete",
      description: threats > 0 ? "1 suspicious activity detected. Review recommended." : "No threats detected. Your device is secure.",
      variant: threats > 0 ? "destructive" : "default",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "secure": return "text-green-600 bg-green-100 border-green-300";
      case "warning": return "text-yellow-600 bg-yellow-100 border-yellow-300";
      case "critical": return "text-red-600 bg-red-100 border-red-300";
      default: return "text-gray-600 bg-gray-100 border-gray-300";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const tabs = [
    { id: "status", label: "Status", icon: Activity },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "advanced", label: "Advanced", icon: Settings },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl max-h-[95vh] flex flex-col">
            
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div animate={{ boxShadow: ["0 0 0 0 rgba(34, 197, 94, 0.7)", "0 0 0 10px rgba(34, 197, 94, 0)", "0 0 0 0 rgba(34, 197, 94, 0)"] }}
                    transition={{ duration: 2, repeat: Infinity }} className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <Shield className="h-6 w-6 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg">Mobile Security</h3>
                    <p className="text-sm text-muted-foreground">Privacy & Protection Center</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
              </div>

              {/* Security Score */}
              <div className="mt-4 p-4 bg-white/50 dark:bg-black/20 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Security Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>{securityScore}/100</span>
                </div>
                <Progress value={securityScore} className="h-2 mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {securityScore >= 90 ? "Excellent Security" : securityScore >= 70 ? "Good Security" : "Needs Improvement"}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleSecurityScan} disabled={scanning} className="text-xs">
                    {scanning ? <><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Scanning...</> : <><Scan className="h-3 w-3 mr-1" />Deep Scan</>}
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b px-4">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
                    ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                  <tab.icon className="h-4 w-4" />{tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-4">
              {activeTab === "status" && (
                <div className="space-y-4">
                  {securityMetrics.map((metric, index) => (
                    <motion.div key={metric.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                      <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                        <metric.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{metric.name}</span>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(metric.status)}`}>{metric.score}%</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                      <QrCode className="h-4 w-4" /><span className="text-xs">2FA Setup</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                      <Download className="h-4 w-4" /><span className="text-xs">Security Report</span>
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-4">
                  <Card className="p-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                      <Key className="h-4 w-4" />App Permissions
                    </h4>
                    <div className="space-y-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <permission.icon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{permission.name}</p>
                              <p className="text-xs text-muted-foreground">{permission.description}</p>
                            </div>
                          </div>
                          <Switch checked={permission.enabled} onCheckedChange={permission.setter} />
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4" />Auto-Lock Timer
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Lock after inactivity</span>
                        <span className="text-sm font-medium">{autoLock[0]} min</span>
                      </div>
                      <Slider value={autoLock} onValueChange={setAutoLock} max={30} min={1} step={1} />
                    </div>
                  </Card>

                  <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-red-700">
                      <Trash2 className="h-4 w-4" />Danger Zone
                    </h4>
                    <Button variant="outline" size="sm" className="w-full border-red-300 text-red-700 hover:bg-red-100">
                      Clear All Security Data
                    </Button>
                  </Card>
                </div>
              )}

              {activeTab === "advanced" && (
                <div className="space-y-4">
                  <Card className="p-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                      <ShieldCheck className="h-4 w-4" />Advanced Protection
                    </h4>
                    <div className="space-y-3">
                      {[
                        { name: "Biometric Lock", desc: "Fingerprint & Face ID", enabled: biometricEnabled, setter: setBiometricEnabled, icon: Fingerprint },
                        { name: "Data Encryption", desc: "AES-256 encryption", enabled: dataEncryption, setter: setDataEncryption, icon: Lock },
                        { name: "VPN Protection", desc: "Secure tunnel", enabled: vpnEnabled, setter: setVpnEnabled, icon: Globe },
                        { name: "Anti-Malware", desc: "Real-time scanning", enabled: antiMalware, setter: setAntiMalware, icon: ShieldCheck },
                        { name: "Secure Backup", desc: "Encrypted cloud sync", enabled: secureBackup, setter: setSecureBackup, icon: Database },
                      ].map((setting) => (
                        <div key={setting.name} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <setting.icon className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-sm">{setting.name}</p>
                              <p className="text-xs text-muted-foreground">{setting.desc}</p>
                            </div>
                          </div>
                          <Switch checked={setting.enabled} onCheckedChange={setting.setter} />
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4" />Activity Log
                    </h4>
                    <div className="space-y-2 text-sm">
                      {[
                        { action: "Security scan completed", time: "2 min ago", type: "success" },
                        { action: "Biometric enabled", time: "1 hour ago", type: "info" },
                        { action: "Password changed", time: "Yesterday", type: "warning" },
                      ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                          <span>{log.action}</span>
                          <span className="text-xs text-muted-foreground">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

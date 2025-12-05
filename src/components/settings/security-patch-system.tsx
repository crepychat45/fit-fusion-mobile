import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Download,
  CheckCircle,
  AlertTriangle,
  Lock,
  RefreshCw,
  FileText,
  Clock,
  ChevronRight,
  Zap,
  Bug,
  Eye,
  Server,
  Wifi,
} from "lucide-react";

interface SecurityPatch {
  id: string;
  version: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  releaseDate: string;
  size: string;
  installed: boolean;
  changelog: string[];
  improvements: string[];
  fixes: string[];
}

const securityPatches: SecurityPatch[] = [
  {
    id: "patch-5.7.1",
    version: "5.7.1",
    title: "Critical Security Update",
    severity: "critical",
    releaseDate: "2024-12-05",
    size: "2.4 MB",
    installed: false,
    changelog: [
      "Fixed critical authentication bypass vulnerability",
      "Enhanced encryption for data at rest",
      "Patched SQL injection vulnerability in search",
    ],
    improvements: [
      "Improved biometric authentication security",
      "Enhanced session management",
      "Better malware detection algorithms",
    ],
    fixes: [
      "Fixed memory leak in background services",
      "Resolved certificate validation issues",
      "Fixed secure storage encryption bug",
    ],
  },
  {
    id: "patch-5.7.0",
    version: "5.7.0",
    title: "Privacy Enhancement Update",
    severity: "high",
    releaseDate: "2024-12-01",
    size: "1.8 MB",
    installed: true,
    changelog: [
      "Added end-to-end encryption for chat",
      "Improved data anonymization",
      "Enhanced privacy controls",
    ],
    improvements: [
      "New privacy dashboard",
      "Better data export controls",
      "Improved consent management",
    ],
    fixes: [
      "Fixed data leakage in logs",
      "Resolved privacy policy display issues",
      "Fixed cookie consent tracking",
    ],
  },
  {
    id: "patch-5.6.2",
    version: "5.6.2",
    title: "Network Security Patch",
    severity: "medium",
    releaseDate: "2024-11-28",
    size: "1.2 MB",
    installed: true,
    changelog: [
      "Enhanced SSL/TLS security",
      "Improved certificate pinning",
      "Better API security",
    ],
    improvements: [
      "Faster secure connections",
      "Improved VPN compatibility",
      "Better proxy detection",
    ],
    fixes: [
      "Fixed DNS leak prevention",
      "Resolved WebSocket security issues",
      "Fixed CORS vulnerability",
    ],
  },
  {
    id: "patch-5.6.1",
    version: "5.6.1",
    title: "Authentication Security Update",
    severity: "low",
    releaseDate: "2024-11-25",
    size: "0.8 MB",
    installed: true,
    changelog: [
      "Improved password hashing",
      "Enhanced 2FA implementation",
      "Better session timeout handling",
    ],
    improvements: [
      "Smoother biometric flow",
      "Improved password recovery",
      "Better account lockout policies",
    ],
    fixes: [
      "Fixed token refresh issues",
      "Resolved OAuth callback bugs",
      "Fixed remember me functionality",
    ],
  },
];

export function SecurityPatchSystem() {
  const { toast } = useToast();
  const [patches, setPatches] = useState<SecurityPatch[]>(securityPatches);
  const [installing, setInstalling] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [checkingUpdates, setCheckingUpdates] = useState(false);

  const pendingPatches = patches.filter(p => !p.installed);
  const installedPatches = patches.filter(p => p.installed);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return AlertTriangle;
      case "high": return Shield;
      case "medium": return Bug;
      case "low": return Lock;
      default: return Shield;
    }
  };

  const handleInstallPatch = async (patchId: string) => {
    setInstalling(patchId);
    setDownloadProgress(0);

    // Simulate download and installation
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setDownloadProgress(i);
    }

    setPatches(prev => prev.map(p => 
      p.id === patchId ? { ...p, installed: true } : p
    ));
    setInstalling(null);
    setDownloadProgress(0);

    toast({
      title: "✅ Patch Installed",
      description: "Security patch has been successfully installed.",
    });
  };

  const handleCheckUpdates = async () => {
    setCheckingUpdates(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCheckingUpdates(false);
    
    toast({
      title: "🔍 Check Complete",
      description: pendingPatches.length > 0 
        ? `${pendingPatches.length} security patch(es) available`
        : "Your system is up to date!",
    });
  };

  const handleInstallAll = async () => {
    for (const patch of pendingPatches) {
      await handleInstallPatch(patch.id);
    }
    toast({
      title: "🛡️ All Patches Installed",
      description: "Your system is now fully secured.",
    });
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-6 pr-4">
        {/* Security Status Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <div className={`h-2 ${pendingPatches.length > 0 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`} />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Patch Center
              </CardTitle>
              <CardDescription>
                Download and install security updates to protect your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  {pendingPatches.length > 0 ? (
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {pendingPatches.length > 0 
                        ? `${pendingPatches.length} Update(s) Available`
                        : "System Secure"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pendingPatches.length > 0 
                        ? "Install patches to secure your system"
                        : "All security patches are installed"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={handleCheckUpdates} disabled={checkingUpdates} className="flex-1 sm:flex-none">
                    <RefreshCw className={`h-4 w-4 mr-1 ${checkingUpdates ? 'animate-spin' : ''}`} />
                    Check
                  </Button>
                  {pendingPatches.length > 0 && (
                    <Button size="sm" onClick={handleInstallAll} className="flex-1 sm:flex-none">
                      <Download className="h-4 w-4 mr-1" />
                      Install All
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Shield, label: "Protected", value: "Yes", color: "text-green-600" },
                  { icon: Lock, label: "Encryption", value: "AES-256", color: "text-blue-600" },
                  { icon: Server, label: "Server", value: "Secure", color: "text-purple-600" },
                  { icon: Wifi, label: "Connection", value: "SSL/TLS", color: "text-cyan-600" },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 bg-muted/30 rounded-lg text-center">
                    <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-semibold text-sm">{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Patches */}
        {pendingPatches.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="h-5 w-5 text-orange-500" />
                  Available Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingPatches.map((patch) => {
                  const SeverityIcon = getSeverityIcon(patch.severity);
                  const isInstalling = installing === patch.id;

                  return (
                    <motion.div key={patch.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border rounded-xl overflow-hidden">
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getSeverityColor(patch.severity)}`}>
                              <SeverityIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold">{patch.title}</h4>
                                <Badge variant="outline" className="text-xs">v{patch.version}</Badge>
                                <Badge className={`text-xs ${getSeverityColor(patch.severity)}`}>
                                  {patch.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />{patch.releaseDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />{patch.size}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleInstallPatch(patch.id)} disabled={isInstalling}>
                            {isInstalling ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-1" />
                                Install
                              </>
                            )}
                          </Button>
                        </div>

                        <AnimatePresence>
                          {isInstalling && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                              <div className="space-y-2">
                                <Progress value={downloadProgress} className="h-2" />
                                <p className="text-xs text-center text-muted-foreground">
                                  {downloadProgress < 100 ? `Downloading... ${downloadProgress}%` : "Installing..."}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="changelog" className="border-none">
                            <AccordionTrigger className="text-sm py-2 hover:no-underline">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />View Changelog
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 text-sm">
                                <div>
                                  <p className="font-medium text-red-600 mb-1">Security Fixes</p>
                                  <ul className="space-y-1">
                                    {patch.changelog.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                        <CheckCircle className="h-3 w-3 text-red-500 mt-1 shrink-0" />{item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="font-medium text-blue-600 mb-1">Improvements</p>
                                  <ul className="space-y-1">
                                    {patch.improvements.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                        <Zap className="h-3 w-3 text-blue-500 mt-1 shrink-0" />{item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="font-medium text-green-600 mb-1">Bug Fixes</p>
                                  <ul className="space-y-1">
                                    {patch.fixes.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                        <Bug className="h-3 w-3 text-green-500 mt-1 shrink-0" />{item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Installed Patches */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Installed Patches ({installedPatches.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {installedPatches.map((patch) => (
                  <div key={patch.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">{patch.title}</p>
                        <p className="text-xs text-muted-foreground">v{patch.version} • {patch.releaseDate}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-300">Installed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ScrollArea>
  );
}


import React, { useState, useEffect } from "react";
import { Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Zap, Brain, Fingerprint, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface SecurityFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  level: "basic" | "advanced" | "military";
  icon: React.ReactNode;
}

interface SecurityThreat {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  blocked: boolean;
  timestamp: Date;
}

export function AISecuritySystem() {
  const [securityFeatures, setSecurityFeatures] = useState<SecurityFeature[]>([
    {
      id: "ai-threat-detection",
      name: "AI Threat Detection",
      description: "Real-time AI-powered threat analysis and blocking",
      enabled: true,
      level: "military",
      icon: <Brain className="h-4 w-4" />
    },
    {
      id: "end-to-end-encryption",
      name: "End-to-End Encryption",
      description: "AES-256 encryption for all communications",
      enabled: true,
      level: "military",
      icon: <Lock className="h-4 w-4" />
    },
    {
      id: "biometric-auth",
      name: "Biometric Authentication",
      description: "Fingerprint and face recognition security",
      enabled: false,
      level: "advanced",
      icon: <Fingerprint className="h-4 w-4" />
    },
    {
      id: "quantum-encryption",
      name: "Quantum Encryption",
      description: "Next-generation quantum-resistant encryption",
      enabled: true,
      level: "military",
      icon: <Zap className="h-4 w-4" />
    },
    {
      id: "ai-behavior-analysis",
      name: "AI Behavior Analysis",
      description: "Analyze user behavior patterns for anomaly detection",
      enabled: true,
      level: "advanced",
      icon: <Eye className="h-4 w-4" />
    },
    {
      id: "secure-key-management",
      name: "Secure Key Management",
      description: "Hardware security module for key storage",
      enabled: true,
      level: "military",
      icon: <Key className="h-4 w-4" />
    }
  ]);

  const [recentThreats, setRecentThreats] = useState<SecurityThreat[]>([
    {
      id: "1",
      type: "Malicious Input Injection",
      severity: "high",
      blocked: true,
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: "2",
      type: "Unauthorized Access Attempt",
      severity: "critical",
      blocked: true,
      timestamp: new Date(Date.now() - 12 * 60 * 1000)
    },
    {
      id: "3",
      type: "Data Exfiltration Attempt",
      severity: "medium",
      blocked: true,
      timestamp: new Date(Date.now() - 25 * 60 * 1000)
    }
  ]);

  const [securityScore, setSecurityScore] = useState(98);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const toggleSecurityFeature = (featureId: string) => {
    setSecurityFeatures(prev => 
      prev.map(feature => 
        feature.id === featureId 
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );
    
    const feature = securityFeatures.find(f => f.id === featureId);
    toast({
      title: `Security Feature ${feature?.enabled ? 'Disabled' : 'Enabled'}`,
      description: feature?.name,
    });
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    
    // Simulate security scan
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSecurityScore(i);
    }
    
    setSecurityScore(96 + Math.floor(Math.random() * 4));
    setIsScanning(false);
    
    toast({
      title: "Security Scan Complete",
      description: `System security level: ${securityScore}%`,
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "basic": return "bg-yellow-500";
      case "advanced": return "bg-blue-500";
      case "military": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "high": return "text-orange-500";
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-500" />
              AI Security System
            </CardTitle>
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{securityScore}%</div>
              <div className="text-sm text-muted-foreground">Security Score</div>
              <Progress value={securityScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{recentThreats.filter(t => t.blocked).length}</div>
              <div className="text-sm text-muted-foreground">Threats Blocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{securityFeatures.filter(f => f.enabled).length}</div>
              <div className="text-sm text-muted-foreground">Active Features</div>
            </div>
          </div>
          
          <Button 
            onClick={runSecurityScan}
            disabled={isScanning}
            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500"
          >
            {isScanning ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Shield className="h-4 w-4" />
                </motion.div>
                Scanning System...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Run Security Scan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle>Security Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityFeatures.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getLevelColor(feature.level)}`}>
                    {feature.icon}
                  </div>
                  <div>
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                    <Badge variant="outline" className={`mt-1 ${getLevelColor(feature.level)} text-white border-0`}>
                      {feature.level.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <Switch
                  checked={feature.enabled}
                  onCheckedChange={() => toggleSecurityFeature(feature.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Threats */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {recentThreats.map((threat) => (
                  <motion.div
                    key={threat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-4 w-4 ${getSeverityColor(threat.severity)}`} />
                      <div>
                        <div className="font-medium">{threat.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {threat.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={threat.severity === "critical" ? "destructive" : "outline"}>
                        {threat.severity.toUpperCase()}
                      </Badge>
                      {threat.blocked && (
                        <Badge className="bg-green-500 text-white">
                          <Shield className="h-3 w-3 mr-1" />
                          Blocked
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

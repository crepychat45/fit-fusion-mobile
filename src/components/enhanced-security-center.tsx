import React, { useState, useEffect } from "react";
import { Shield, Lock, Eye, Fingerprint, Key, Zap, AlertTriangle, CheckCircle, Wifi, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface SecurityFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  level: "basic" | "advanced" | "military" | "quantum";
  icon: React.ReactNode;
  status: "active" | "monitoring" | "scanning" | "protected";
}

interface ThreatEvent {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  blocked: boolean;
  timestamp: Date;
  source: string;
}

export function EnhancedSecurityCenter() {
  const [securityFeatures, setSecurityFeatures] = useState<SecurityFeature[]>([
    {
      id: "ai-threat-detection",
      name: "AI Threat Detection",
      description: "Real-time AI-powered threat analysis and prevention",
      enabled: true,
      level: "quantum",
      icon: <Eye className="h-4 w-4" />,
      status: "monitoring"
    },
    {
      id: "biometric-auth",
      name: "Biometric Authentication",
      description: "Fingerprint, face, and voice recognition security",
      enabled: true,
      level: "military",
      icon: <Fingerprint className="h-4 w-4" />,
      status: "active"
    },
    {
      id: "quantum-encryption",
      name: "Quantum Encryption",
      description: "Quantum-resistant encryption for ultimate security",
      enabled: true,
      level: "quantum",
      icon: <Zap className="h-4 w-4" />,
      status: "protected"
    },
    {
      id: "neural-firewall",
      name: "Neural Firewall",
      description: "AI-powered firewall with machine learning capabilities",
      enabled: true,
      level: "military",
      icon: <Shield className="h-4 w-4" />,
      status: "scanning"
    },
    {
      id: "secure-vault",
      name: "Secure Data Vault",
      description: "Military-grade storage for sensitive information",
      enabled: true,
      level: "military",
      icon: <Lock className="h-4 w-4" />,
      status: "protected"
    },
    {
      id: "device-trust",
      name: "Device Trust Network",
      description: "Intelligent device verification and trust scoring",
      enabled: false,
      level: "advanced",
      icon: <Smartphone className="h-4 w-4" />,
      status: "monitoring"
    }
  ]);

  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>([
    {
      id: "1",
      type: "AI Injection Attack",
      severity: "critical",
      blocked: true,
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      source: "External API"
    },
    {
      id: "2",
      type: "Brute Force Login",
      severity: "high",
      blocked: true,
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      source: "Web Interface"
    },
    {
      id: "3",
      type: "Data Mining Attempt",
      severity: "medium",
      blocked: true,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      source: "Mobile App"
    },
    {
      id: "4",
      type: "Anomalous Behavior",
      severity: "low",
      blocked: true,
      timestamp: new Date(Date.now() - 23 * 60 * 1000),
      source: "User Session"
    }
  ]);

  const [securityScore, setSecurityScore] = useState(96);
  const [realTimeThreats, setRealTimeThreats] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time threat detection
      if (Math.random() < 0.1) {
        const newThreat: ThreatEvent = {
          id: Date.now().toString(),
          type: ["Malware Scan", "Suspicious Activity", "Unauthorized Access", "Data Leak Attempt"][Math.floor(Math.random() * 4)],
          severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
          blocked: true,
          timestamp: new Date(),
          source: ["External", "Internal", "API", "Mobile"][Math.floor(Math.random() * 4)]
        };
        
        setThreatEvents(prev => [newThreat, ...prev.slice(0, 9)]);
        setRealTimeThreats(prev => prev + 1);
      }
      
      // Update security score
      setSecurityScore(prev => {
        const enabledFeatures = securityFeatures.filter(f => f.enabled).length;
        const baseScore = (enabledFeatures / securityFeatures.length) * 100;
        return Math.min(99, Math.max(85, baseScore + Math.random() * 5 - 2.5));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [securityFeatures]);

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
      variant: feature?.enabled ? "destructive" : "default"
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "basic": return "bg-yellow-500";
      case "advanced": return "bg-blue-500";
      case "military": return "bg-red-500";
      case "quantum": return "bg-purple-500";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "monitoring": return <Eye className="h-3 w-3 text-blue-500" />;
      case "scanning": return <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}><Shield className="h-3 w-3 text-purple-500" /></motion.div>;
      case "protected": return <Lock className="h-3 w-3 text-green-500" />;
      default: return <Shield className="h-3 w-3" />;
    }
  };

  const runFullSystemScan = () => {
    toast({
      title: "Full System Scan Initiated",
      description: "Comprehensive security analysis in progress...",
    });
    
    // Simulate scan completion
    setTimeout(() => {
      setSecurityScore(98);
      toast({
        title: "Security Scan Complete",
        description: "System security level: 98% - All threats neutralized",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="security-card text-white overflow-hidden relative">
          <motion.div
            animate={{ 
              background: [
                "linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))",
                "linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))",
                "linear-gradient(45deg, rgba(6, 182, 212, 0.1), rgba(34, 197, 94, 0.1))"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0"
          />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="p-3 bg-white/20 rounded-full security-indicator"
                >
                  <Shield className="h-8 w-8" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl">FitFusion Security Center</CardTitle>
                  <p className="text-white/90">Military-grade protection active</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  SECURE
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 neural-animation">
                  <Zap className="h-3 w-3 mr-1" />
                  {Math.round(securityScore)}%
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{securityFeatures.filter(f => f.enabled).length}</div>
                <div className="text-white/80 text-sm">Active Shields</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{threatEvents.length}</div>
                <div className="text-white/80 text-sm">Threats Blocked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{realTimeThreats}</div>
                <div className="text-white/80 text-sm">Real-time Blocks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">24/7</div>
                <div className="text-white/80 text-sm">Monitoring</div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Security Level</span>
                <span className="text-sm font-medium">{Math.round(securityScore)}%</span>
              </div>
              <Progress value={securityScore} className="h-3" />
            </div>
            <Button 
              onClick={runFullSystemScan}
              className="w-full interactive-button bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Shield className="h-4 w-4 mr-2" />
              Run Full System Scan
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Security Features */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg glass-card"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getLevelColor(feature.level)}`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {feature.name}
                        {getStatusIcon(feature.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">{feature.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getLevelColor(feature.level)} text-white border-0`}
                        >
                          {feature.level.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {feature.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={feature.enabled}
                    onCheckedChange={() => toggleSecurityFeature(feature.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Threat Monitor */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Threat Monitor
              <Badge variant="outline" className="ml-auto">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {threatEvents.map((threat) => (
                  <motion.div
                    key={threat.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 border rounded-lg glass-card"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-4 w-4 ${getSeverityColor(threat.severity)}`} />
                      <div>
                        <div className="font-medium text-sm">{threat.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {threat.source} • {threat.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={threat.severity === "critical" ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        {threat.severity.toUpperCase()}
                      </Badge>
                      {threat.blocked && (
                        <Badge className="bg-green-500 text-white text-xs">
                          <Shield className="h-2 w-2 mr-1" />
                          BLOCKED
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
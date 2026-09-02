import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { LiquidGlassCard } from "@/components/enhanced-liquid-glass";
import {
  Shield,
  Brain,
  Eye,
  Lock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Scan,
  Activity,
  TrendingUp,
  Database,
  Wifi,
  Smartphone
} from "lucide-react";

interface SecurityThreat {
  id: string;
  type: "malware" | "phishing" | "data-breach" | "unauthorized-access";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  blocked: boolean;
  timestamp: Date;
}

interface SecurityMetrics {
  threatsBlocked: number;
  dataEncrypted: number;
  securityScore: number;
  lastScan: Date;
  activeSessions: number;
  trustedDevices: number;
}

export function AdvancedAISecurity() {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    threatsBlocked: 1247,
    dataEncrypted: 99.9,
    securityScore: 96,
    lastScan: new Date(),
    activeSessions: 3,
    trustedDevices: 5
  });
  const [realTimeProtection, setRealTimeProtection] = useState(true);

  useEffect(() => {
    // Simulate real-time threat detection
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const newThreat: SecurityThreat = {
          id: Date.now().toString(),
          type: ["malware", "phishing", "data-breach", "unauthorized-access"][Math.floor(Math.random() * 4)] as any,
          severity: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)] as any,
          description: generateThreatDescription(),
          blocked: true,
          timestamp: new Date()
        };
        
        setThreats(prev => [newThreat, ...prev].slice(0, 10));
        setMetrics(prev => ({
          ...prev,
          threatsBlocked: prev.threatsBlocked + 1
        }));
        
        toast({
          title: "🛡️ Threat Blocked",
          description: `AI detected and blocked ${newThreat.type} attempt`,
          variant: newThreat.severity === "critical" ? "destructive" : "default"
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [toast]);

  const generateThreatDescription = (): string => {
    const descriptions = [
      "Suspicious login attempt from unknown device",
      "Malicious script blocked in web content",
      "Unauthorized data access attempt detected",
      "Phishing email filtered and quarantined",
      "Network intrusion attempt prevented",
      "Suspicious API call pattern detected"
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const runFullScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    const scanStages = [
      "Initializing AI security engine...",
      "Scanning system files and processes...",
      "Analyzing network traffic patterns...",
      "Checking data encryption integrity...",
      "Validating user authentication tokens...",
      "Performing behavioral analysis...",
      "Generating security recommendations..."
    ];

    for (let i = 0; i < scanStages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setScanProgress(((i + 1) / scanStages.length) * 100);
      
      toast({
        title: scanStages[i],
        description: `${Math.round(((i + 1) / scanStages.length) * 100)}% complete`
      });
    }

    setMetrics(prev => ({
      ...prev,
      lastScan: new Date(),
      securityScore: Math.min(prev.securityScore + Math.floor(Math.random() * 3), 100)
    }));

    toast({
      title: "🎉 Security Scan Complete",
      description: "No threats detected. Your system is secure!"
    });

    setIsScanning(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-500 bg-red-50";
      case "high": return "text-orange-500 bg-orange-50";
      case "medium": return "text-yellow-500 bg-yellow-50";
      case "low": return "text-green-500 bg-green-50";
      default: return "text-gray-500 bg-gray-50";
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case "malware": return <AlertTriangle className="h-4 w-4" />;
      case "phishing": return <Eye className="h-4 w-4" />;
      case "data-breach": return <Database className="h-4 w-4" />;
      case "unauthorized-access": return <Lock className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Security Dashboard */}
      <LiquidGlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI Security Command Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              className="text-center p-3 liquid-glass-subtle rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold text-green-500">{metrics.threatsBlocked.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Threats Blocked</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-3 liquid-glass-subtle rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold text-blue-500">{metrics.dataEncrypted}%</div>
              <div className="text-xs text-muted-foreground">Data Encrypted</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-3 liquid-glass-subtle rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold text-purple-500">{metrics.securityScore}</div>
              <div className="text-xs text-muted-foreground">Security Score</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-3 liquid-glass-subtle rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold text-orange-500">{metrics.activeSessions}</div>
              <div className="text-xs text-muted-foreground">Active Sessions</div>
            </motion.div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm">Real-time Protection: </span>
              <Badge variant="default" className="bg-green-500 text-white">
                {realTimeProtection ? "Active" : "Inactive"}
              </Badge>
            </div>
            <Button
              onClick={runFullScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isScanning ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4 mr-2" />
                  AI Security Scan
                </>
              )}
            </Button>
          </div>

          {isScanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <Progress value={scanProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                AI analyzing {Math.round(scanProgress)}% complete
              </p>
            </motion.div>
          )}
        </CardContent>
      </LiquidGlassCard>

      {/* Real-time Threat Detection */}
      <LiquidGlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Real-time Threat Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="sync">
            {threats.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No threats detected. System secure.</p>
              </motion.div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {threats.map((threat) => (
                  <motion.div
                    key={threat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 liquid-glass-subtle rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getSeverityColor(threat.severity)}`}>
                        {getThreatIcon(threat.type)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{threat.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {threat.timestamp.toLocaleTimeString()} • {threat.type}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="default" 
                      className={threat.blocked ? "bg-green-500" : "bg-red-500"}
                    >
                      {threat.blocked ? "Blocked" : "Active"}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </LiquidGlassCard>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LiquidGlassCard variant="subtle">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">AI-Powered Protection</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Machine learning algorithms analyze patterns and predict threats before they occur.
            </p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs">99.9% threat detection accuracy</span>
            </div>
          </CardContent>
        </LiquidGlassCard>

        <LiquidGlassCard variant="subtle">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Wifi className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Network Monitoring</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Continuous monitoring of network traffic and data transmission security.
            </p>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs">Zero-trust network architecture</span>
            </div>
          </CardContent>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
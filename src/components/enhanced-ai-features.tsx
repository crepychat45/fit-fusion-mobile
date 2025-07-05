import React, { useState, useEffect } from "react";
import { Brain, Zap, Shield, Eye, Star, Sparkles, Lock, Heart, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "active" | "learning" | "analyzing" | "optimizing";
  progress: number;
  impact: "high" | "medium" | "low";
}

export function EnhancedAIFeatures() {
  const [aiFeatures, setAiFeatures] = useState<AIFeature[]>([
    {
      id: "neural-coach",
      name: "Neural Fitness Coach",
      description: "AI-powered personalized coaching with real-time form analysis",
      icon: <Brain className="h-5 w-5" />,
      status: "active",
      progress: 95,
      impact: "high"
    },
    {
      id: "predictive-analytics",
      name: "Predictive Health Analytics",
      description: "Forecasts your fitness journey and prevents potential injuries",
      icon: <TrendingUp className="h-5 w-5" />,
      status: "analyzing",
      progress: 78,
      impact: "high"
    },
    {
      id: "biometric-sync",
      name: "Advanced Biometric Sync",
      description: "Real-time integration with wearables and health sensors",
      icon: <Heart className="h-5 w-5" />,
      status: "learning",
      progress: 67,
      impact: "medium"
    },
    {
      id: "nutrition-ai",
      name: "Smart Nutrition AI",
      description: "Personalized meal planning based on your goals and preferences",
      icon: <Target className="h-5 w-5" />,
      status: "optimizing",
      progress: 85,
      impact: "high"
    },
    {
      id: "mood-analysis",
      name: "Mood & Recovery Analysis",
      description: "AI-driven insights into your mental state and recovery needs",
      icon: <Sparkles className="h-5 w-5" />,
      status: "active",
      progress: 92,
      impact: "medium"
    },
    {
      id: "form-checker",
      name: "Real-time Form Checker",
      description: "Computer vision analysis of your workout form and technique",
      icon: <Eye className="h-5 w-5" />,
      status: "learning",
      progress: 71,
      impact: "high"
    }
  ]);

  const [overallAIScore, setOverallAIScore] = useState(82);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setAiFeatures(prev => prev.map(feature => ({
        ...feature,
        progress: Math.min(100, feature.progress + Math.random() * 2)
      })));
      
      setOverallAIScore(prev => Math.min(100, prev + Math.random() * 0.5));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "learning": return "bg-blue-500";
      case "analyzing": return "bg-purple-500";
      case "optimizing": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const activateAllAI = () => {
    setAiFeatures(prev => prev.map(feature => ({
      ...feature,
      status: "active",
      progress: Math.min(100, feature.progress + 10)
    })));
    
    toast({
      title: "AI Systems Activated",
      description: "All AI features are now running at full capacity",
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="ai-card text-white overflow-hidden relative">
          <motion.div
            animate={{ 
              background: [
                "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
                "linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))",
                "linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))"
              ]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute inset-0"
          />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="p-3 bg-white/20 rounded-full"
                >
                  <Brain className="h-8 w-8" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl">FitFusion AI Engine</CardTitle>
                  <p className="text-white/90">Next-generation artificial intelligence</p>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-white/30 neural-animation">
                <Zap className="h-3 w-3 mr-1" />
                AI Score: {Math.round(overallAIScore)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{aiFeatures.filter(f => f.status === "active").length}</div>
                <div className="text-white/80 text-sm">Active Systems</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{Math.round(aiFeatures.reduce((acc, f) => acc + f.progress, 0) / aiFeatures.length)}%</div>
                <div className="text-white/80 text-sm">Avg Performance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{aiFeatures.filter(f => f.impact === "high").length}</div>
                <div className="text-white/80 text-sm">High Impact Features</div>
              </div>
            </div>
            <Progress value={overallAIScore} className="mb-4" />
            <Button 
              onClick={activateAllAI}
              className="w-full interactive-button bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Optimize All AI Systems
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="gpu-accelerated"
            >
              <Card className="glass-card h-full hover-lift">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-full ${getStatusColor(feature.status)}`}>
                      {feature.icon}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(feature.status)} text-white border-0`}
                      >
                        {feature.status.toUpperCase()}
                      </Badge>
                      <div className="security-indicator">
                        <Shield className="h-3 w-3 text-green-500" />
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-base">{feature.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span>Performance</span>
                      <span className="font-medium">{Math.round(feature.progress)}%</span>
                    </div>
                    <Progress value={feature.progress} className="h-2" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className={`h-3 w-3 ${getImpactColor(feature.impact)}`} />
                        <span className="text-xs capitalize">{feature.impact} Impact</span>
                      </div>
                      {feature.status === "active" && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-xs text-green-500 font-medium"
                        >
                          ● LIVE
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Card className="premium-card text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Today's AI Recommendations</h4>
                <ul className="space-y-1 text-sm text-white/90">
                  <li>• Increase protein intake by 15g for optimal recovery</li>
                  <li>• Your heart rate variability suggests active recovery today</li>
                  <li>• Sleep quality improved 23% - maintain current schedule</li>
                  <li>• Form analysis shows 92% efficiency in squat movement</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Predictive Alerts</h4>
                <ul className="space-y-1 text-sm text-white/90">
                  <li>• 98% chance of achieving weekly goal</li>
                  <li>• Injury risk: Low (2%) - excellent form consistency</li>
                  <li>• Plateau prevention: Adjust routine in 3 days</li>
                  <li>• Optimal workout time: 6:30 AM based on biorhythms</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
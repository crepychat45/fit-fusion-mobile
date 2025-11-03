import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LiquidGlassCard, LiquidGlass } from "@/components/enhanced-liquid-glass";
import {
  Brain,
  Zap,
  Shield,
  Heart,
  TrendingUp,
  Sparkles,
  Star,
  Activity,
  Target,
  Award,
  Flame,
  Clock
} from "lucide-react";

interface AIInsight {
  id: string;
  type: "performance" | "nutrition" | "recovery" | "motivation";
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

export function EnhancedHomeFeatures() {
  const [aiInsights, setAiInsights] = useState<AIInsight[]>(() => {
    try {
      const saved = localStorage.getItem('ai-insights');
      return saved ? JSON.parse(saved) : [
        {
          id: "1",
          type: "performance",
          title: "Optimize Your Morning Routine",
          description: "Based on your activity patterns, starting workouts 30 minutes earlier could improve performance by 15%",
          confidence: 89,
          actionable: true
        },
        {
          id: "2",
          type: "nutrition",
          title: "Post-Workout Nutrition Window",
          description: "Your muscle recovery could improve with protein intake within 30 minutes of cardio sessions",
          confidence: 92,
          actionable: true
        },
        {
          id: "3",
          type: "recovery",
          title: "Sleep Quality Impact",
          description: "Your workout intensity correlates with sleep duration. Consider 7.5+ hours for optimal recovery",
          confidence: 85,
          actionable: false
        }
      ];
    } catch {
      return [];
    }
  });

  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [aiThinking, setAIThinking] = useState(false);

  // Save insights to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('ai-insights', JSON.stringify(aiInsights));
    } catch (error) {
      console.error('Failed to save AI insights:', error);
    }
  }, [aiInsights]);

  const generateNewInsight = async () => {
    setAIThinking(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setAIThinking(false);
    
    // Add new insight logic here
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "performance": return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "nutrition": return <Heart className="h-4 w-4 text-green-500" />;
      case "recovery": return <Shield className="h-4 w-4 text-purple-500" />;
      case "motivation": return <Star className="h-4 w-4 text-yellow-500" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-500 bg-green-50";
    if (confidence >= 80) return "text-blue-500 bg-blue-50";
    if (confidence >= 70) return "text-yellow-500 bg-yellow-50";
    return "text-red-500 bg-red-50";
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Dashboard */}
      <LiquidGlassCard bubble ripple>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI-Powered Insights
            <Badge variant="default" className="ml-2 bg-purple-500">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <AnimatePresence>
              {aiInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedInsight(insight)}
                >
                  <LiquidGlass
                    variant="subtle"
                    ripple
                    className="p-4 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{insight.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {insight.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {insight.type}
                            </Badge>
                            {insight.actionable && (
                              <Badge variant="default" className="text-xs bg-green-500">
                                Actionable
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}%
                      </div>
                    </div>
                  </LiquidGlass>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Button
            onClick={generateNewInsight}
            disabled={aiThinking}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {aiThinking ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-spin" />
                AI Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate New Insight
              </>
            )}
          </Button>
        </CardContent>
      </LiquidGlassCard>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Activity, label: "Active Minutes", value: "245", change: "+12%", color: "blue" },
          { icon: Flame, label: "Calories", value: "2,847", change: "+8%", color: "orange" },
          { icon: Target, label: "Goals Met", value: "7/10", change: "+2", color: "green" },
          { icon: Award, label: "Streak Days", value: "12", change: "+3", color: "purple" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <LiquidGlass
              variant="subtle"
              animated
              className="p-4 rounded-xl text-center"
            >
              <div className={`inline-flex p-2 rounded-full bg-${stat.color}-50 mb-2`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <Badge variant="outline" className={`text-xs mt-1 text-${stat.color}-600`}>
                {stat.change}
              </Badge>
            </LiquidGlass>
          </motion.div>
        ))}
      </div>

      {/* Detailed Insight Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <LiquidGlassCard variant="strong">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getInsightIcon(selectedInsight.type)}
                    {selectedInsight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedInsight.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI Confidence</span>
                      <span className="font-medium">{selectedInsight.confidence}%</span>
                    </div>
                    <Progress value={selectedInsight.confidence} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedInsight(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Close
                    </Button>
                    {selectedInsight.actionable && (
                      <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
                        Take Action
                      </Button>
                    )}
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
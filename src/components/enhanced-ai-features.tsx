import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Clock,
  Award,
  Sparkles,
  BarChart3,
  MessageSquare,
  Settings,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIFeature {
  id: string;
  name: string;
  description: string;
  status: "active" | "learning" | "disabled";
  accuracy: number;
  usage: number;
}

export function EnhancedAIFeatures() {
  const { toast } = useToast();
  const [aiFeatures, setAIFeatures] = useState<AIFeature[]>([
    {
      id: "workout-optimizer",
      name: "Workout Optimizer",
      description: "AI-powered workout plan optimization based on your progress",
      status: "active",
      accuracy: 94,
      usage: 87,
    },
    {
      id: "form-analyzer",
      name: "Form Analyzer",
      description: "Real-time exercise form analysis and correction suggestions",
      status: "learning",
      accuracy: 78,
      usage: 45,
    },
    {
      id: "nutrition-advisor",
      name: "Nutrition Advisor",
      description: "Personalized nutrition recommendations and meal planning",
      status: "active",
      accuracy: 91,
      usage: 72,
    },
    {
      id: "recovery-predictor",
      name: "Recovery Predictor",
      description: "Predicts optimal rest periods based on workout intensity",
      status: "active",
      accuracy: 89,
      usage: 63,
    },
    {
      id: "injury-prevention",
      name: "Injury Prevention",
      description: "Identifies potential injury risks and suggests preventive measures",
      status: "learning",
      accuracy: 82,
      usage: 54,
    },
    {
      id: "motivation-coach",
      name: "AI Motivation Coach",
      description: "Personalized motivation and coaching based on your behavior",
      status: "active",
      accuracy: 96,
      usage: 89,
    },
  ]);

  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const improveAI = async (featureId: string) => {
    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate training progress
    for (let i = 0; i <= 100; i += 10) {
      setTrainingProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Update the feature
    setAIFeatures((prev) =>
      prev.map((feature) =>
        feature.id === featureId
          ? {
              ...feature,
              accuracy: Math.min(feature.accuracy + Math.random() * 5, 99),
              status: "active" as const,
            }
          : feature,
      ),
    );

    setIsTraining(false);
    setTrainingProgress(0);

    toast({
      title: "🧠 AI Training Complete",
      description: "The AI feature has been improved with your data.",
    });
  };

  const toggleFeature = (featureId: string) => {
    setAIFeatures((prev) =>
      prev.map((feature) =>
        feature.id === featureId
          ? {
              ...feature,
              status:
                feature.status === "disabled"
                  ? "active"
                  : feature.status === "active"
                    ? "disabled"
                    : feature.status,
            }
          : feature,
      ),
    );

    toast({
      title: "AI Feature Updated",
      description: "Feature status has been changed.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Enhanced AI Features
          </h2>
          <p className="text-muted-foreground">
            Advanced AI-powered features to enhance your fitness journey
          </p>
        </div>
        <Badge variant="secondary" className="text-primary">
          <Sparkles className="h-3 w-3 mr-1" />
          6 Active Features
        </Badge>
      </div>

      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">AI Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">AI Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4">
            {aiFeatures.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {feature.id === "workout-optimizer" && (
                            <Target className="h-5 w-5 text-primary" />
                          )}
                          {feature.id === "form-analyzer" && (
                            <Activity className="h-5 w-5 text-primary" />
                          )}
                          {feature.id === "nutrition-advisor" && (
                            <Zap className="h-5 w-5 text-primary" />
                          )}
                          {feature.id === "recovery-predictor" && (
                            <Clock className="h-5 w-5 text-primary" />
                          )}
                          {feature.id === "injury-prevention" && (
                            <Award className="h-5 w-5 text-primary" />
                          )}
                          {feature.id === "motivation-coach" && (
                            <MessageSquare className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{feature.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          feature.status === "active"
                            ? "default"
                            : feature.status === "learning"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {feature.status === "active" && "Active"}
                        {feature.status === "learning" && "Learning"}
                        {feature.status === "disabled" && "Disabled"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Accuracy</span>
                        <span className="font-medium">{feature.accuracy}%</span>
                      </div>
                      <Progress value={feature.accuracy} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Usage</span>
                        <span className="font-medium">{feature.usage}%</span>
                      </div>
                      <Progress value={feature.usage} className="h-2" />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeature(feature.id)}
                      >
                        {feature.status === "disabled" ? "Enable" : "Disable"}
                      </Button>
                      {feature.status === "learning" && (
                        <Button
                          size="sm"
                          onClick={() => improveAI(feature.id)}
                          disabled={isTraining}
                        >
                          {isTraining ? (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Training...
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Improve AI
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {isTraining && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Training Progress</span>
                          <span>{trainingProgress}%</span>
                        </div>
                        <Progress value={trainingProgress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                AI Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">94.2%</div>
                  <div className="text-sm text-muted-foreground">
                    Average Accuracy
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">68.5%</div>
                  <div className="text-sm text-muted-foreground">
                    Average Usage
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1,247</div>
                  <div className="text-sm text-muted-foreground">
                    AI Predictions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">98.1%</div>
                  <div className="text-sm text-muted-foreground">
                    User Satisfaction
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-Learning</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically improve AI based on your usage
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Enabled
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Privacy Mode</div>
                  <div className="text-sm text-muted-foreground">
                    Keep your data local and private
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">AI Insights</div>
                  <div className="text-sm text-muted-foreground">
                    Receive personalized AI insights
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Enabled
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
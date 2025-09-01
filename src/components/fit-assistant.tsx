import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  X, 
  Sparkles, 
  Brain,
  Camera,
  Zap
} from "lucide-react";
import { EnhancedAIAssistant } from "@/components/ai/enhanced-ai-assistant";
import { WorkoutAIAnalyzer } from "@/components/features/workout-ai-analyzer";

export function FitAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'chat' | 'analyzer' | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);

  const aiFeatures = [
    {
      id: 'chat',
      name: 'AI Assistant',
      description: 'Smart fitness coaching & advice',
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 'analyzer',
      name: 'Form Analyzer',
      description: 'Real-time workout form analysis',
      icon: <Camera className="h-5 w-5" />,
      color: 'bg-blue-500'
    }
  ];

  const handleFeatureSelect = (featureId: string) => {
    if (featureId === 'chat') {
      setActiveFeature('chat');
      setIsOpen(true);
    } else if (featureId === 'analyzer') {
      setActiveFeature('analyzer');
      setIsOpen(true);
    }
    setShowFeatures(false);
  };

  return (
    <>
      {/* Enhanced AI Assistant Button */}
      <motion.div 
        className="fixed bottom-6 right-6 z-30"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.5 }}
      >
        <Button
          size="lg"
          className="relative h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={() => setShowFeatures(!showFeatures)}
        >
          <Bot className="h-6 w-6" />
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ opacity: 0.3 }}
          />
        </Button>

        {/* Feature Selection Menu */}
        <AnimatePresence>
          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute bottom-16 right-0 w-72 mb-2"
            >
              <Card className="shadow-xl border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      AI Features
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowFeatures(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {aiFeatures.map((feature) => (
                      <motion.div
                        key={feature.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleFeatureSelect(feature.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`${feature.color} text-white p-2 rounded-full`}>
                            {feature.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{feature.name}</h4>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <Badge variant="secondary" className="w-full justify-center text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Powered by Advanced AI
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Enhanced AI Assistant */}
      {activeFeature === 'chat' && (
        <EnhancedAIAssistant 
          isOpen={isOpen} 
          onClose={() => {
            setIsOpen(false);
            setActiveFeature(null);
          }} 
        />
      )}

      {/* AI Form Analyzer */}
      {activeFeature === 'analyzer' && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <Card className="w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Camera className="h-6 w-6" />
                AI Form Analyzer
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                  setActiveFeature(null);
                }}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <WorkoutAIAnalyzer />
            </div>
          </Card>
        </motion.div>
      )}
    </>
  );
}
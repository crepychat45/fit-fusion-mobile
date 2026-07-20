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
      {/* Liquid Glass AI Assistant Button */}
      <motion.div 
        className="fixed bottom-6 right-6 z-30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 0.5, stiffness: 260, damping: 20 }}
      >
        {/* Ambient glow */}
        <motion.div
          aria-hidden
          className="absolute -inset-4 rounded-full blur-2xl pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, hsl(var(--primary)/0.55), hsl(280 90% 65% / 0.55), hsl(200 90% 60% / 0.55), hsl(var(--primary)/0.55))",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowFeatures(!showFeatures)}
          className="relative h-16 w-16 rounded-full overflow-hidden border border-white/25 shadow-[0_8px_32px_rgba(31,38,135,0.35)] backdrop-blur-2xl bg-white/10 dark:bg-white/5"
          aria-label="Open AI assistant"
        >
          {/* Liquid gradient core */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(120% 120% at 20% 15%, hsl(var(--primary)/0.9) 0%, hsl(280 85% 60% / 0.85) 45%, hsl(210 90% 55% / 0.9) 100%)",
            }}
          />
          {/* Glass sheen */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/45 via-white/10 to-transparent mix-blend-overlay" />
          {/* Inner highlight */}
          <span className="absolute inset-x-3 top-1.5 h-2 rounded-full bg-white/60 blur-[2px]" />
          {/* Icon */}
          <span className="absolute inset-0 flex items-center justify-center">
            <Bot className="h-7 w-7 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]" />
          </span>
          {/* Pulse ring */}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-white/40"
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
          {/* Sparkle badge */}
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-amber-300 to-pink-400 shadow-md flex items-center justify-center">
            <Sparkles className="h-2.5 w-2.5 text-white" />
          </span>
        </motion.button>

        {/* Liquid Glass Feature Menu */}
        <AnimatePresence>
          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="absolute bottom-20 right-0 w-72"
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 backdrop-blur-2xl bg-white/15 dark:bg-white/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-white/5 pointer-events-none" />
                <div className="absolute -top-16 -right-10 h-32 w-32 rounded-full bg-primary/40 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-purple-500/40 blur-3xl pointer-events-none" />

                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2 text-foreground">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      AI Features
                    </h3>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-white/20" onClick={() => setShowFeatures(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {aiFeatures.map((feature) => (
                      <motion.button
                        key={feature.id}
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleFeatureSelect(feature.id)}
                        className="w-full text-left p-3 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`${feature.color} text-white p-2 rounded-xl shadow-inner ring-1 ring-white/30`}>
                            {feature.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{feature.name}</h4>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/15">
                    <Badge variant="secondary" className="w-full justify-center text-xs bg-white/10 backdrop-blur-md border border-white/15">
                      <Zap className="h-3 w-3 mr-1" />
                      Powered by Liquid Glass AI
                    </Badge>
                  </div>
                </div>
              </div>
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
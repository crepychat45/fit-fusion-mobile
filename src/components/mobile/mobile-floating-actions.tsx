import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus,
  Brain,
  Shield,
  Mic,
  Camera,
  Zap,
  Heart,
  Activity,
  Target,
  X,
  ChevronUp
} from "lucide-react";

interface FloatingAction {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  color: string;
  action: () => void;
  badge?: string;
}

interface MobileFloatingActionsProps {
  onAIAssistant: () => void;
  onSecurity: () => void;
  onVoiceCommand: () => void;
  onQuickWorkout: () => void;
}

export function MobileFloatingActions({ 
  onAIAssistant, 
  onSecurity, 
  onVoiceCommand, 
  onQuickWorkout 
}: MobileFloatingActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastInteraction, setLastInteraction] = useState<Date>();
  const { toast } = useToast();

  const actions: FloatingAction[] = [
    {
      id: "ai",
      icon: Brain,
      label: "AI Coach",
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => {
        onAIAssistant();
        setIsExpanded(false);
        toast({
          title: "🤖 AI Coach Activated",
          description: "Your personal fitness AI is ready to help!"
        });
      },
      badge: "NEW"
    },
    {
      id: "security",
      icon: Shield,
      label: "Security",
      color: "bg-green-500 hover:bg-green-600",
      action: () => {
        onSecurity();
        setIsExpanded(false);
        toast({
          title: "🛡️ Security Center",
          description: "Protecting your fitness data and privacy"
        });
      }
    },
    {
      id: "voice",
      icon: Mic,
      label: "Voice",
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => {
        onVoiceCommand();
        setIsExpanded(false);
        toast({
          title: "🎤 Voice Commands",
          description: "Speak your workout commands naturally"
        });
      }
    },
    {
      id: "workout",
      icon: Activity,
      label: "Quick Workout",
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => {
        onQuickWorkout();
        setIsExpanded(false);
        toast({
          title: "⚡ Quick Workout",
          description: "Starting your instant fitness session!"
        });
      }
    }
  ];

  // Auto-collapse after inactivity
  useEffect(() => {
    if (isExpanded && lastInteraction) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isExpanded, lastInteraction]);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    setLastInteraction(new Date());
  };

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-4 z-40 flex flex-col items-end space-y-3 sm:bottom-24 md:bottom-20">
      {/* Action Buttons */}
      <AnimatePresence>
        {isExpanded && actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0, x: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: 0,
              transition: { 
                delay: index * 0.1,
                type: "spring",
                stiffness: 500,
                damping: 30
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0, 
              x: 20,
              transition: { delay: (actions.length - index - 1) * 0.1 }
            }}
            className="relative"
          >
            <Button
              onClick={action.action}
              className={`${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full p-3 min-w-[44px] h-11 mobile-haptic-feedback touch-manipulation active:scale-95 xs:min-w-[48px] xs:h-12`}
            >
              <action.icon className="h-5 w-5" />
            </Button>
            
            {/* Action Badge */}
            {action.badge && (
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -left-1 text-xs px-1 py-0 h-5 min-w-[20px] bg-primary text-primary-foreground animate-pulse"
              >
                {action.badge}
              </Badge>
            )}
            
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none"
            >
              {action.label}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-black/80" />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          onClick={handleExpand}
          className={`bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full p-3 w-12 h-12 mobile-haptic-feedback touch-manipulation active:scale-95 xs:p-4 xs:w-14 xs:h-14 ${
            isExpanded ? 'rotate-45' : ''
          }`}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </motion.div>
        </Button>
        
        {/* Pulse animation when collapsed */}
        {!isExpanded && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-primary rounded-full"
          />
        )}
      </motion.div>

      {/* Hint Text */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="bg-black/70 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 pointer-events-none"
          >
            <ChevronUp className="h-3 w-3 animate-bounce" />
            Tap for quick actions
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Dumbbell, 
  MessageSquare, 
  BarChart3, 
  User, 
  Settings,
  Plus,
  Timer
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function QuickActionsPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleQuickStart = () => {
    toast({
      title: "Quick Workout Started!",
      description: "Starting a 15-minute HIIT session based on your preferences.",
    });
    navigate("/workout/1");
  };

  const quickActions = [
    {
      icon: Play,
      label: "Quick Start",
      description: "15-min HIIT",
      color: "bg-green-500",
      action: handleQuickStart
    },
    {
      icon: Dumbbell,
      label: "Workouts",
      description: "Browse all",
      color: "bg-blue-500",
      action: () => navigate("/workouts")
    },
    {
      icon: MessageSquare,
      label: "AI Coach",
      description: "Get advice",
      color: "bg-purple-500",
      action: () => navigate("/chat")
    },
    {
      icon: BarChart3,
      label: "Progress",
      description: "View stats",
      color: "bg-orange-500",
      action: () => navigate("/progress")
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">Quick Actions</h2>
        <Badge variant="outline" className="text-xs">
          <Timer className="h-3 w-3 mr-1" />
          Smart
        </Badge>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3"
      >
        {quickActions.map((action, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-200 border border-primary/10"
              onClick={action.action}
            >
              <CardContent className="p-4 text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`${action.color} text-white p-3 rounded-full w-fit mx-auto mb-2`}
                >
                  <action.icon className="h-5 w-5" />
                </motion.div>
                <h3 className="text-sm font-medium">{action.label}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Additional Quick Settings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4"
      >
        <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Customize Dashboard</h4>
                <p className="text-xs text-muted-foreground">Personalize your experience</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

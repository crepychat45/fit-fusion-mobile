import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  BellRing, 
  Clock, 
  Target, 
  TrendingUp, 
  Zap, 
  Heart,
  Trophy,
  X,
  Check
} from "lucide-react";

interface SmartNotification {
  id: string;
  type: 'workout' | 'nutrition' | 'progress' | 'motivation' | 'achievement';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  actionLabel?: string;
  actionCallback?: () => void;
  autoHide?: boolean;
}

const NOTIFICATION_TYPES = {
  workout: {
    icon: <Target className="h-4 w-4" />,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  nutrition: {
    icon: <Heart className="h-4 w-4" />,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  progress: {
    icon: <TrendingUp className="h-4 w-4" />,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  motivation: {
    icon: <Zap className="h-4 w-4" />,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  achievement: {
    icon: <Trophy className="h-4 w-4" />,
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  }
};

export function SmartNotifications() {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Generate smart notifications based on user behavior and time
  useEffect(() => {
    const generateSmartNotifications = () => {
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();
      
      const smartNotifications: SmartNotification[] = [];

      // Morning workout reminder
      if (hour >= 7 && hour <= 9) {
        smartNotifications.push({
          id: 'morning-workout',
          type: 'workout',
          title: 'Good Morning! 🌅',
          message: 'Perfect time for your morning workout. Your body is ready to perform!',
          priority: 'medium',
          timestamp: now,
          actionLabel: 'Start Workout',
          actionCallback: () => console.log('Starting workout'),
          autoHide: true
        });
      }

      // Hydration reminder
      if (hour >= 10 && hour <= 18) {
        smartNotifications.push({
          id: 'hydration',
          type: 'nutrition',
          title: 'Stay Hydrated! 💧',
          message: 'You should aim for 8-10 glasses of water daily. How are you doing?',
          priority: 'low',
          timestamp: now,
          autoHide: true
        });
      }

      // Weekend motivation
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        smartNotifications.push({
          id: 'weekend-motivation',
          type: 'motivation',
          title: 'Weekend Warrior! 💪',
          message: 'Weekends are perfect for trying new activities. What will you explore today?',
          priority: 'medium',
          timestamp: now,
          actionLabel: 'Explore Activities'
        });
      }

      // Progress check
      if (dayOfWeek === 1 && hour >= 9 && hour <= 11) {
        smartNotifications.push({
          id: 'weekly-progress',
          type: 'progress',
          title: 'Weekly Progress Check 📊',
          message: 'Time to review your progress from last week and set new goals!',
          priority: 'high',
          timestamp: now,
          actionLabel: 'View Progress'
        });
      }

      // Achievement celebration
      const achievements = ['5 workouts completed', '10,000 steps reached', '7-day streak'];
      if (Math.random() > 0.7) {
        smartNotifications.push({
          id: 'achievement',
          type: 'achievement',
          title: 'Achievement Unlocked! 🏆',
          message: `Congratulations! You've ${achievements[Math.floor(Math.random() * achievements.length)]}!`,
          priority: 'high',
          timestamp: now,
          actionLabel: 'Celebrate'
        });
      }

      setNotifications(smartNotifications);
      setIsVisible(smartNotifications.length > 0);
    };

    // Generate notifications on mount and every 30 minutes
    generateSmartNotifications();
    const interval = setInterval(generateSmartNotifications, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-hide notifications
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.autoHide) {
        setTimeout(() => {
          dismissNotification(notification.id);
        }, 10000); // Auto-hide after 10 seconds
      }
    });
  }, [notifications]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
    setIsVisible(false);
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 max-w-sm space-y-2">
      <AnimatePresence>
        {notifications.map((notification, index) => {
          const typeConfig = NOTIFICATION_TYPES[notification.type];
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                transition: { delay: index * 0.1 }
              }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <Card className={`${typeConfig.bgColor} ${typeConfig.borderColor} border-2 shadow-lg`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`${typeConfig.color} text-white p-2 rounded-full flex-shrink-0`}>
                      {typeConfig.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
                        <Badge 
                          variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {notification.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        
                        <div className="flex gap-1">
                          {notification.actionLabel && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                              onClick={notification.actionCallback}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              {notification.actionLabel}
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => dismissNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {notifications.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={dismissAll}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Dismiss All ({notifications.length})
          </Button>
        </motion.div>
      )}
    </div>
  );
}
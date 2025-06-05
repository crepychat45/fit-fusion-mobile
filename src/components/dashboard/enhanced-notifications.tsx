import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  BellRing, 
  Download, 
  Target, 
  Dumbbell, 
  Heart, 
  Trophy, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  X,
  CheckCircle,
  Clock,
  Flame
} from "lucide-react";

interface Notification {
  id: string;
  type: 'update' | 'goal' | 'workout' | 'health' | 'achievement' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionable?: boolean;
  data?: any;
}

const notificationIcons = {
  update: Download,
  goal: Target,
  workout: Dumbbell,
  health: Heart,
  achievement: Trophy,
  reminder: Clock
};

const notificationColors = {
  update: 'text-blue-500',
  goal: 'text-green-500',
  workout: 'text-purple-500',
  health: 'text-red-500',
  achievement: 'text-yellow-500',
  reminder: 'text-orange-500'
};

export function EnhancedNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Generate sample notifications with real-world scenarios
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'update',
        title: 'App Update Available',
        message: 'Version 5.0.2 is available with new features and bug fixes',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        priority: 'high',
        read: false,
        actionable: true,
        data: { version: '5.0.2' }
      },
      {
        id: '2',
        type: 'goal',
        title: 'Daily Goal Achievement',
        message: 'You completed 85% of your daily calorie burn goal!',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        priority: 'medium',
        read: false,
        data: { progress: 85, target: 500 }
      },
      {
        id: '3',
        type: 'workout',
        title: 'Workout Reminder',
        message: 'Your scheduled Upper Body workout starts in 15 minutes',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        priority: 'high',
        read: false,
        actionable: true,
        data: { workoutType: 'Upper Body', duration: 45 }
      },
      {
        id: '4',
        type: 'health',
        title: 'High Heart Rate Detected',
        message: 'Heart rate reached 185 BPM during last workout session',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        priority: 'high',
        read: true,
        data: { heartRate: 185, maxSafe: 175 }
      },
      {
        id: '5',
        type: 'achievement',
        title: 'New Achievement Unlocked!',
        message: 'Congratulations! You completed 7 consecutive workout days',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        priority: 'medium',
        read: false,
        data: { achievement: '7 Day Streak', rewards: 50 }
      },
      {
        id: '6',
        type: 'goal',
        title: 'Weekly Goal Progress',
        message: 'You are 90% towards your weekly exercise goal. Keep it up!',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        priority: 'medium',
        read: true,
        data: { weeklyProgress: 90, remaining: 1 }
      },
      {
        id: '7',
        type: 'reminder',
        title: 'Hydration Reminder',
        message: 'Time to drink water! You haven\'t logged water intake in 2 hours',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        priority: 'low',
        read: true,
        data: { lastIntake: '2 hours ago' }
      },
      {
        id: '8',
        type: 'workout',
        title: 'Workout Completed',
        message: 'Great job! You burned 450 calories in your cardio session',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        priority: 'low',
        read: true,
        data: { caloriesBurned: 450, duration: 35 }
      }
    ];

    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => prev - 1);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const visibleNotifications = showAll ? notifications : notifications.slice(0, 4);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <BellRing className="h-5 w-5 text-blue-600" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </div>
            Notifications
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-96">
          <div className="space-y-3">
            <AnimatePresence>
              {visibleNotifications.map((notification) => {
                const IconComponent = notificationIcons[notification.type];
                const iconColor = notificationColors[notification.type];
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      !notification.read 
                        ? getPriorityColor(notification.priority)
                        : 'border-gray-100 bg-white dark:bg-gray-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${
                        notification.priority === 'high' ? 'bg-red-100 dark:bg-red-950/30' :
                        notification.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-950/30' :
                        'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <IconComponent className={`h-4 w-4 ${iconColor}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium text-sm ${
                              !notification.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm mt-1 ${
                              !notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'
                            }`}>
                              {notification.message}
                            </p>
                            
                            {/* Additional data display */}
                            {notification.data && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {notification.type === 'goal' && (
                                  <Badge variant="outline" className="text-xs">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    {notification.data.progress}% Complete
                                  </Badge>
                                )}
                                {notification.type === 'health' && notification.data.heartRate > notification.data.maxSafe && (
                                  <Badge variant="destructive" className="text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Above Safe Zone
                                  </Badge>
                                )}
                                {notification.type === 'achievement' && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Flame className="h-3 w-3 mr-1" />
                                    +{notification.data.rewards} XP
                                  </Badge>
                                )}
                                {notification.type === 'workout' && notification.data.caloriesBurned && (
                                  <Badge variant="outline" className="text-xs">
                                    <Flame className="h-3 w-3 mr-1" />
                                    {notification.data.caloriesBurned} cal
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-950/30"
                              onClick={() => removeNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {notification.actionable && !notification.read && (
                          <div className="mt-3 flex gap-2">
                            {notification.type === 'update' && (
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                Update Now
                              </Button>
                            )}
                            {notification.type === 'workout' && (
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                Start Workout
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Dismiss
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!notification.read && (
                      <div className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
        
        {notifications.length > 4 && (
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All (${notifications.length - 4} more)`}
            </Button>
          </div>
        )}
        
        {notifications.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

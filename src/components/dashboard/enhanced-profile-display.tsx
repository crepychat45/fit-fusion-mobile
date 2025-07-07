import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  User, 
  Crown, 
  Trophy, 
  Star, 
  Calendar,
  TrendingUp,
  Target,
  Edit3,
  Settings,
  Award,
  Zap,
  Heart,
  Activity,
  MapPin
} from "lucide-react";
import { userProfile } from "@/data/user";
import { useNavigate } from "react-router-dom";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const recentAchievements: Achievement[] = [
  {
    id: "1",
    title: "Week Warrior",
    description: "Completed 7 workouts in a week",
    icon: "🏆",
    unlockedAt: "2 days ago",
    rarity: 'rare'
  },
  {
    id: "2", 
    title: "Calorie Crusher",
    description: "Burned 1000+ calories in a single workout",
    icon: "🔥",
    unlockedAt: "1 week ago",
    rarity: 'epic'
  },
  {
    id: "3",
    title: "Early Bird",
    description: "Completed 5 morning workouts",
    icon: "🌅",
    unlockedAt: "2 weeks ago",
    rarity: 'common'
  }
];

interface ProfileDisplayProps {
  userName?: string;
  showFullProfile?: boolean;
}

export function EnhancedProfileDisplay({ userName, showFullProfile = false }: ProfileDisplayProps) {
  const [currentProfile, setCurrentProfile] = useState(userProfile);
  const [displayName, setDisplayName] = useState(userName || userProfile.name);
  const [streakMotivation, setStreakMotivation] = useState("");
  const navigate = useNavigate();

  // Enhanced user profile loading
  useEffect(() => {
    const loadUserProfile = () => {
      try {
        const savedProfile = localStorage.getItem('fitfusion-user-profile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          if (parsed.name && parsed.name !== "John Smith") {
            setDisplayName(parsed.name);
            setCurrentProfile(prev => ({ ...prev, name: parsed.name }));
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }

      // Set motivational message based on streak
      const streak = currentProfile.stats.streakDays;
      if (streak >= 7) setStreakMotivation("🔥 On fire! Keep the momentum!");
      else if (streak >= 3) setStreakMotivation("💪 Great consistency!");
      else if (streak >= 1) setStreakMotivation("🌟 Building good habits!");
      else setStreakMotivation("🚀 Ready to start your journey!");
    };

    loadUserProfile();
  }, [userName, currentProfile.stats.streakDays]);

  const getInitials = () => {
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return displayName[0]?.toUpperCase() || "U";
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getLevelProgress = () => {
    const baseExp = currentProfile.stats.workoutsCompleted * 10 + 
                   currentProfile.stats.caloriesBurned / 10 + 
                   currentProfile.stats.streakDays * 20;
    
    const currentLevelExp = Math.floor(baseExp / 100) * 100;
    const nextLevelExp = currentLevelExp + 100;
    const progress = ((baseExp - currentLevelExp) / 100) * 100;
    
    return {
      currentLevel: Math.floor(baseExp / 100) + 1,
      progress: Math.round(progress),
      expToNext: nextLevelExp - baseExp
    };
  };

  const levelData = getLevelProgress();

  if (showFullProfile) {
    return (
      <Card className="w-full overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Profile Header */}
            <div className="flex items-start gap-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                  <AvatarImage src={currentProfile.avatar} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {displayName}
                  </h1>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Member
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    Goal: {currentProfile.goal}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Member since {currentProfile.memberSince}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Level: {currentProfile.level}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4" />
                    Last: {currentProfile.lastWorkout}
                  </div>
                </div>

                {/* Level Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Level {levelData.currentLevel}</span>
                    <span className="text-xs text-muted-foreground">{levelData.expToNext} XP to next level</span>
                  </div>
                  <Progress value={levelData.progress} className="h-3" />
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  {streakMotivation}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/profile")}
                    className="bg-white/50 backdrop-blur-sm"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/settings")}
                    className="bg-white/50 backdrop-blur-sm"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl text-center border border-blue-200/50"
              >
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
                <div className="font-bold text-xl text-blue-600">{currentProfile.stats.workoutsCompleted}</div>
                <div className="text-xs text-muted-foreground">Workouts</div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-xl text-center border border-orange-200/50"
              >
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <div className="font-bold text-xl text-orange-600">{currentProfile.stats.streakDays}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl text-center border border-green-200/50"
              >
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div className="font-bold text-xl text-green-600">{currentProfile.stats.caloriesBurned.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-xl text-center border border-red-200/50"
              >
                <div className="flex items-center justify-center mb-2">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <div className="font-bold text-xl text-red-600">{currentProfile.stats.avgHeartRate}</div>
                <div className="text-xs text-muted-foreground">Avg BPM</div>
              </motion.div>
            </div>

            {/* Recent Achievements */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Recent Achievements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white relative overflow-hidden`}
                  >
                    <div className="relative z-10">
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <div className="font-semibold text-sm">{achievement.title}</div>
                      <div className="text-xs opacity-90">{achievement.description}</div>
                      <div className="text-xs opacity-75 mt-1">{achievement.unlockedAt}</div>
                    </div>
                    <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-bl-full" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Compact version for dashboard
  return (
    <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
      <Avatar className="w-12 h-12 border-2 border-white/30">
        <AvatarImage src={currentProfile.avatar} alt="Profile" />
        <AvatarFallback className="bg-white/20 text-white font-bold">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-white truncate">{displayName}</h3>
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </div>
        <div className="text-white/80 text-xs">
          Level {levelData.currentLevel} • {currentProfile.stats.streakDays} day streak
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => navigate("/profile")}
        className="text-white hover:bg-white/20"
      >
        <User className="w-4 h-4" />
      </Button>
    </div>
  );
}
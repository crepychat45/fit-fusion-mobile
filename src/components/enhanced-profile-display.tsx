import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProfilePhotoUpload } from "./profile-photo-upload";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Camera, 
  Edit2, 
  Award, 
  Target, 
  TrendingUp, 
  Calendar,
  MapPin,
  Heart,
  Zap,
  Trophy,
  Star,
  Clock,
  Activity
} from "lucide-react";

interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinDate?: string;
  fitnessLevel?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  goals?: string[];
  achievements?: Achievement[];
  stats?: UserStats;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface UserStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  caloriesBurned: number;
  favoriteWorkout: string;
}

interface EnhancedProfileDisplayProps {
  user?: UserProfile;
  onEdit?: () => void;
  showEditButton?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "minimal" | "card" | "detailed";
}

export function EnhancedProfileDisplay({ 
  user, 
  onEdit, 
  showEditButton = true,
  size = "medium",
  variant = "detailed"
}: EnhancedProfileDisplayProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "achievements" | "stats">("overview");

  // Load profile image from localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  // Mock user data if none provided
  const defaultUser: UserProfile = {
    name: localStorage.getItem('userName') || "Fitness Enthusiast",
    email: "user@fitfusion.com",
    bio: "Passionate about fitness and healthy living. Currently training for a marathon and focusing on strength building. Love trying new workout routines and sharing tips with the community!",
    location: "New York, NY",
    joinDate: "January 2024",
    fitnessLevel: "Intermediate",
    goals: ["Build Muscle", "Lose Weight", "Improve Endurance", "Better Flexibility"],
    achievements: [
      {
        id: "1",
        title: "First Week Complete",
        description: "Completed your first week of workouts",
        icon: "🎯",
        unlockedAt: new Date("2024-01-07"),
        rarity: "common"
      },
      {
        id: "2", 
        title: "Streak Master",
        description: "Maintained a 30-day workout streak",
        icon: "🔥",
        unlockedAt: new Date("2024-02-01"),
        rarity: "rare"
      },
      {
        id: "3",
        title: "Calorie Crusher",
        description: "Burned 10,000 total calories",
        icon: "⚡",
        unlockedAt: new Date("2024-02-15"),
        rarity: "epic"
      }
    ],
    stats: {
      totalWorkouts: 156,
      currentStreak: 12,
      longestStreak: 45,
      totalMinutes: 3840,
      caloriesBurned: 18750,
      favoriteWorkout: "HIIT Training"
    }
  };

  const profileData = user || defaultUser;

  const handleImageUpdate = (newImage: string) => {
    setProfileImage(newImage);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(word => word[0]).join("").toUpperCase();
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "small":
        return {
          avatar: "h-12 w-12",
          name: "text-lg font-semibold",
          bio: "text-sm"
        };
      case "large":
        return {
          avatar: "h-32 w-32",
          name: "text-3xl font-bold",
          bio: "text-base"
        };
      default:
        return {
          avatar: "h-20 w-20",
          name: "text-xl font-bold",
          bio: "text-sm"
        };
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-100 text-gray-800 border-gray-300";
      case "rare": return "bg-blue-100 text-blue-800 border-blue-300";
      case "epic": return "bg-purple-100 text-purple-800 border-purple-300";
      case "legendary": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const sizeClasses = getSizeClasses(size);

  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className={sizeClasses.avatar}>
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(profileData.name)}
            </AvatarFallback>
            {profileImage && <AvatarImage src={profileImage} alt={profileData.name} />}
          </Avatar>
          {size !== "small" && (
            <ProfilePhotoUpload 
              name={profileData.name}
              initialImage={profileImage}
              onImageUpdate={handleImageUpdate}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={sizeClasses.name}>{profileData.name}</h3>
          {profileData.email && (
            <p className="text-muted-foreground text-sm truncate">{profileData.email}</p>
          )}
        </div>
        {showEditButton && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Avatar className={sizeClasses.avatar}>
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                  {getInitials(profileData.name)}
                </AvatarFallback>
                {profileImage && <AvatarImage src={profileImage} alt={profileData.name} />}
              </Avatar>
              <ProfilePhotoUpload 
                name={profileData.name}
                initialImage={profileImage}
                onImageUpdate={handleImageUpdate}
              />
            </div>
            
            <div className="space-y-2">
              <h3 className={sizeClasses.name}>{profileData.name}</h3>
              {profileData.fitnessLevel && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {profileData.fitnessLevel}
                </Badge>
              )}
              {profileData.location && (
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
                  <MapPin className="h-3 w-3" />
                  {profileData.location}
                </div>
              )}
            </div>

            {showEditButton && onEdit && (
              <Button variant="outline" onClick={onEdit} className="w-full">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative mb-4">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-3xl">
                    {getInitials(profileData.name)}
                  </AvatarFallback>
                  {profileImage && <AvatarImage src={profileImage} alt={profileData.name} />}
                </Avatar>
                <ProfilePhotoUpload 
                  name={profileData.name}
                  initialImage={profileImage}
                  onImageUpdate={handleImageUpdate}
                />
              </div>
              
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">{profileData.name}</h2>
                {profileData.email && (
                  <p className="text-muted-foreground mb-2">{profileData.email}</p>
                )}
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {profileData.fitnessLevel && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <Target className="h-3 w-3 mr-1" />
                      {profileData.fitnessLevel}
                    </Badge>
                  )}
                  {profileData.location && (
                    <Badge variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      {profileData.location}
                    </Badge>
                  )}
                  {profileData.joinDate && (
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      Joined {profileData.joinDate}
                    </Badge>
                  )}
                </div>

                {showEditButton && onEdit && (
                  <Button variant="outline" onClick={onEdit}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-blue-600">{profileData.stats?.totalWorkouts || 0}</div>
                    <div className="text-xs text-muted-foreground">Workouts</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                    <Zap className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-orange-600">{profileData.stats?.currentStreak || 0}</div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-purple-600">{Math.round((profileData.stats?.totalMinutes || 0) / 60)}</div>
                    <div className="text-xs text-muted-foreground">Hours</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <Trophy className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-green-600">{profileData.achievements?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Tabs */}
        <div className="p-6">
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === "overview" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === "achievements" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Achievements ({profileData.achievements?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === "stats" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Detailed Stats
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Bio Section */}
                {profileData.bio && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      About
                    </h4>
                    <div className="text-muted-foreground">
                      <p className={showFullBio ? "" : "line-clamp-3"}>
                        {profileData.bio}
                      </p>
                      {profileData.bio.length > 150 && (
                        <button
                          onClick={() => setShowFullBio(!showFullBio)}
                          className="text-primary text-sm mt-1 hover:underline"
                        >
                          {showFullBio ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Goals Section */}
                {profileData.goals && profileData.goals.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Current Goals
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profileData.goals.map((goal, index) => (
                        <Badge key={index} variant="outline" className="bg-primary/5">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "achievements" && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {profileData.achievements && profileData.achievements.length > 0 ? (
                  <div className="grid gap-4">
                    {profileData.achievements.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h5 className="font-semibold">{achievement.title}</h5>
                            <p className="text-sm opacity-80">{achievement.description}</p>
                            <p className="text-xs mt-1 opacity-60">
                              Unlocked {achievement.unlockedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No achievements yet. Start working out to earn your first badge!</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Workout Statistics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Total Workouts</span>
                        <span className="text-lg font-bold text-blue-600">{profileData.stats?.totalWorkouts || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Total Minutes</span>
                        <span className="text-lg font-bold text-purple-600">{profileData.stats?.totalMinutes || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Calories Burned</span>
                        <span className="text-lg font-bold text-orange-600">{profileData.stats?.caloriesBurned || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Streak & Consistency
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Current Streak</span>
                        <span className="text-lg font-bold text-green-600">{profileData.stats?.currentStreak || 0} days</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Longest Streak</span>
                        <span className="text-lg font-bold text-yellow-600">{profileData.stats?.longestStreak || 0} days</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Favorite Workout</span>
                        <span className="text-sm font-medium text-primary">{profileData.stats?.favoriteWorkout || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
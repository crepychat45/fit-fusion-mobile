import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Info,
  Download,
  ExternalLink,
  Heart,
  Star,
  Users,
  Calendar,
  Code,
  Shield,
  Zap,
  Database,
  Smartphone,
  Globe,
  Award,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Brain,
  Book,
  UserCheck,
  Gift,
  MessageCircle,
  Network,
} from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AboutPage() {
  const { toast } = useToast();
  const [appVersion] = useState("5.0.4");
  const [buildNumber] = useState("20241206.002");
  const [releaseDate] = useState("June 6, 2025");
  const [userStats, setUserStats] = useState({
    totalUsers: 125000,
    activeToday: 8500,
    workoutsCompleted: 2500000,
    countriesServed: 85,
  });

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Workouts",
      description: "Personalized fitness routines using machine learning",
      version: "5.0.0",
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "End-to-end encryption and biometric authentication",
      version: "5.0.1",
    },
    {
      icon: Database,
      title: "Smart Analytics",
      description: "Comprehensive fitness tracking and insights",
      version: "4.8.0",
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Seamless experience across all devices",
      version: "5.0.3",
    },
    {
      icon: MessageCircle,
      title: "Enhanced Chat",
      description: "Secure communication with fitness community",
      version: "5.0.4",
    },
    {
      icon: Network,
      title: "AI Integration",
      description: "Integrated AI throughout the platform",
      version: "5.0.4",
    },
  ];

  const changelog = [
    {
      version: "5.0.4",
      date: "June 6, 2025",
      type: "major",
      changes: [
        "🧠 Enhanced AI integration throughout the entire platform",
        "💬 Redesigned chat interface with voice message support",
        "🔒 Improved security with biometric authentication",
        "💪 New smart workout recommendation system",
        "📊 Enhanced analytics dashboard with goal tracking",
        "💳 Secure payment gateway for subscriptions",
        "🎨 UI/UX improvements across all pages",
        "📱 Better mobile experience with responsive design",
        "🏆 Expanded achievements and goals system",
        "🔄 Sync optimizations for faster data transfer",
      ],
    },
    {
      version: "5.0.3",
      date: "December 6, 2024",
      type: "major",
      changes: [
        "🎨 Complete UI/UX redesign with modern animations",
        "📱 Enhanced mobile responsiveness and touch interactions",
        "🔐 Advanced biometric authentication support",
        "⚡ 40% performance improvement in app loading",
        "🤖 New AI workout recommendations engine",
        "🌙 Improved dark mode with better contrast",
        "🔧 Enhanced settings validation and auto-fix features",
        "📊 Real-time analytics dashboard",
        "🎯 Personalized goal tracking system",
        "🔄 Seamless data sync across devices",
      ],
    },
    {
      version: "5.0.2",
      date: "November 20, 2024",
      type: "minor",
      changes: [
        "🏥 Health app integrations (Apple Health, Google Fit)",
        "🔔 Smart notification system",
        "🐛 Critical bug fixes for data synchronization",
        "⚡ Performance optimizations",
      ],
    },
    {
      version: "5.0.1",
      date: "November 10, 2024",
      type: "patch",
      changes: [
        "🔐 Enhanced security protocols",
        "🌐 Added 5 new language translations",
        "🔧 Minor UI improvements",
        "🐛 Bug fixes and stability improvements",
      ],
    },
    {
      version: "5.0.0",
      date: "October 25, 2024",
      type: "major",
      changes: [
        "🚀 Major version release with AI integration",
        "💡 Intelligent workout planning",
        "📈 Advanced progress tracking",
        "🎨 Complete visual overhaul",
        "⚡ Rewritten for better performance",
      ],
    },
  ];

  const team = [
    { name: "Juned Khan", role: "Lead Developer", avatar: "JK" },
    { name: "Sara Thompson", role: "UI/UX Designer", avatar: "ST" },
    { name: "Samir Khan", role: "Backend Engineer", avatar: "SK" },
    { name: "Ajay Mortel", role: "Product Manager", avatar: "AM" },
    { name: "Sahil Khan", role: "AI Specialist", avatar: "SH" },
  ];

  const handleFeedback = () => {
    toast({
      title: "💌 Feedback appreciated!",
      description: "Thank you for helping us improve FitFusion.",
    });
  };

  const handleRateApp = () => {
    toast({
      title: "⭐ Thanks for rating!",
      description: "Your rating helps other users discover FitFusion.",
    });
  };

  useEffect(() => {
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setUserStats((prev) => ({
        ...prev,
        activeToday: prev.activeToday + Math.floor(Math.random() * 3),
        workoutsCompleted:
          prev.workoutsCompleted + Math.floor(Math.random() * 5),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* App Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">FitFusion</CardTitle>
                  <CardDescription className="text-lg">
                    AI-Powered Fitness Companion
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="default"
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      v{appVersion}
                    </Badge>
                    <Badge variant="outline">Build {buildNumber}</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Released</p>
                <p className="font-medium">{releaseDate}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold">
                  {userStats.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold">
                  {userStats.activeToday.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Active Today</p>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <Award className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <p className="text-lg font-bold">
                  {(userStats.workoutsCompleted / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <Globe className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <p className="text-lg font-bold">{userStats.countriesServed}</p>
                <p className="text-xs text-muted-foreground">Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Key Features
            </CardTitle>
            <CardDescription>
              Cutting-edge technology that makes FitFusion stand out
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FeatureIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{feature.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {feature.version}
                      </Badge>
                      {feature.version === appVersion && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        >
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* What's New */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              What's New in v{appVersion}
            </CardTitle>
            <CardDescription>
              Latest updates and improvements in this release
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ScrollArea className="h-96 pr-4">
              {changelog.map((release, releaseIndex) => (
                <motion.div
                  key={release.version}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: releaseIndex * 0.1 }}
                  className={`border-l-4 pl-4 mb-6 ${
                    release.version === appVersion
                      ? "border-primary"
                      : "border-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Version {release.version}</h4>
                    <Badge
                      variant={
                        release.type === "major"
                          ? "default"
                          : release.type === "minor"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {release.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {release.date}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {release.changes.map((change, changeIndex) => (
                      <motion.li
                        key={changeIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: releaseIndex * 0.1 + changeIndex * 0.05,
                        }}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {change}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Development Team */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Development Team
            </CardTitle>
            <CardDescription>
              Meet the talented people behind FitFusion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {member.avatar}
                  </div>
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions & Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Support & Community
            </CardTitle>
            <CardDescription>
              Help us improve and connect with other users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleRateApp}
                className="w-full justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4" />
                    <span className="font-medium">Rate the App</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Help others discover FitFusion
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={handleFeedback}
                className="w-full justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="h-4 w-4" />
                    <span className="font-medium">Send Feedback</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Share your thoughts and suggestions
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">Visit Website</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Learn more at fitfusion.app
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Code className="h-4 w-4" />
                    <span className="font-medium">Open Source</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Contribute on GitHub
                  </div>
                </div>
              </Button>
            </div>

            <div className="pt-4 border-t text-center text-sm text-muted-foreground">
              <p>
                © 2025 FitFusion. Made with ❤️ for fitness enthusiasts
                worldwide.
              </p>
              <p className="mt-1">
                Built with React, TypeScript, and Supabase • Lovable AI-assisted
                development
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

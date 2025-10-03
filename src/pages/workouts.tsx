import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Zap,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Star,
  Users,
  PlayCircle,
  Heart,
  Share2,
  BarChart3,
  Award,
  Flame,
  Brain,
} from "lucide-react";
import { workouts } from "@/data/workouts";
import { useNavigate } from "react-router-dom";

const Workouts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [favoriteWorkouts, setFavoriteWorkouts] = useState<string[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [personalizedPlans, setPersonalizedPlans] = useState<any[]>([]);

  useEffect(() => {
    // Load saved data
    const saved = localStorage.getItem("workout-data");
    if (saved) {
      const data = JSON.parse(saved);
      setFavoriteWorkouts(data.favorites || []);
      setCompletedWorkouts(data.completed || []);
    }

    // Generate AI recommendations
    generateAIRecommendations();
    generatePersonalizedPlans();
  }, []);

  const generateAIRecommendations = () => {
    const recommendations = [
      {
        id: "ai-1",
        title: "AI Smart HIIT",
        description:
          "Personalized high-intensity workout based on your progress",
        duration: "25 mins",
        difficulty: "Intermediate",
        calories: 320,
        aiGenerated: true,
        icon: Brain,
      },
      {
        id: "ai-2",
        title: "Adaptive Strength",
        description: "AI-optimized strength training for your fitness level",
        duration: "35 mins",
        difficulty: "Advanced",
        calories: 280,
        aiGenerated: true,
        icon: Zap,
      },
    ];
    setAiRecommendations(recommendations);
  };

  const generatePersonalizedPlans = () => {
    const plans = [
      {
        id: "plan-1",
        title: "30-Day Transform",
        description: "Comprehensive plan tailored to your goals",
        workouts: 24,
        duration: "30 days",
        difficulty: "Progressive",
      },
      {
        id: "plan-2",
        title: "Strength Builder",
        description: "Build muscle with progressive overload",
        workouts: 18,
        duration: "6 weeks",
        difficulty: "Intermediate",
      },
    ];
    setPersonalizedPlans(plans);
  };

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch =
      workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || workout.category === filterType;
    const matchesDifficulty =
      filterDifficulty === "all" || workout.level === filterDifficulty;

    return matchesSearch && matchesType && matchesDifficulty;
  });

  const toggleFavorite = (workoutId: string) => {
    const newFavorites = favoriteWorkouts.includes(workoutId)
      ? favoriteWorkouts.filter((id) => id !== workoutId)
      : [...favoriteWorkouts, workoutId];

    setFavoriteWorkouts(newFavorites);
    localStorage.setItem(
      "workout-data",
      JSON.stringify({
        favorites: newFavorites,
        completed: completedWorkouts,
      }),
    );

    toast({
      title: favoriteWorkouts.includes(workoutId)
        ? "Removed from favorites"
        : "Added to favorites",
      description: "Your workout preferences have been updated.",
    });
  };

  const markCompleted = (workoutId: string) => {
    const newCompleted = [...completedWorkouts, workoutId];
    setCompletedWorkouts(newCompleted);
    localStorage.setItem(
      "workout-data",
      JSON.stringify({
        favorites: favoriteWorkouts,
        completed: newCompleted,
      }),
    );

    toast({
      title: "🎉 Workout Completed!",
      description: "Great job! Keep up the momentum.",
    });
  };

  const workoutStats = {
    total: workouts.length,
    completed: completedWorkouts.length,
    favorites: favoriteWorkouts.length,
    streak: 7, // Example streak
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600" />
        <div className="absolute inset-0 bg-black/20" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative pt-12 pb-8 px-4 text-white"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Smart Workouts</h1>
              <p className="text-white/80">AI-powered fitness routines</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                v5.0.4
              </Badge>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-4 gap-3">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
            >
              <Target className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg font-bold">{workoutStats.total}</div>
              <div className="text-xs text-white/80">Available</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
            >
              <Award className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg font-bold">{workoutStats.completed}</div>
              <div className="text-xs text-white/80">Completed</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
            >
              <Heart className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg font-bold">{workoutStats.favorites}</div>
              <div className="text-xs text-white/80">Favorites</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
            >
              <Flame className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg font-bold">{workoutStats.streak}</div>
              <div className="text-xs text-white/80">Day Streak</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-6">
        {/* Enhanced Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workouts, exercises, or goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="hiit">HIIT</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterDifficulty}
              onValueChange={setFilterDifficulty}
            >
              <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm border-0 shadow-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </motion.div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Target className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Smart
            </TabsTrigger>
            <TabsTrigger
              value="plans"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Plans
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Heart className="h-4 w-4 mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="all" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWorkouts.map((workout, index) => (
                    <motion.div
                      key={workout.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-1">
                                {workout.title}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {workout.description}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(workout.id)}
                                className="p-2"
                              >
                                <Heart
                                  className={`h-4 w-4 ${favoriteWorkouts.includes(workout.id) ? "fill-red-500 text-red-500" : ""}`}
                                />
                              </Button>
                              <Button variant="ghost" size="sm" className="p-2">
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {workout.duration}
                              </span>
                            </div>
                            <Badge variant="outline">{workout.level}</Badge>
                            <Badge variant="secondary">
                              {workout.category}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Flame className="h-4 w-4" />
                                {workout.exercises?.length || 8} exercises
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="h-4 w-4" />
                                ~250 cal
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {completedWorkouts.includes(workout.id) ? (
                                <Badge className="bg-green-100 text-green-800">
                                  ✓ Completed
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    try {
                                      navigate(`/workout-detail/${workout.id}`);
                                    } catch (error) {
                                      toast({
                                        title: "Navigation Error",
                                        description:
                                          "Failed to open workout. Please try again.",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4 mt-0">
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      AI-Generated Workouts
                    </CardTitle>
                    <CardDescription>
                      Personalized workouts created by our AI based on your
                      fitness profile
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiRecommendations.map((workout, index) => (
                    <motion.div
                      key={workout.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-primary/20">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <workout.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">
                                {workout.title}
                              </CardTitle>
                              <CardDescription>
                                {workout.description}
                              </CardDescription>
                            </div>
                            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              AI Generated
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {workout.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Flame className="h-4 w-4" />
                                {workout.calories} cal
                              </span>
                            </div>
                            <Button size="sm" className="bg-primary">
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Try Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="plans" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 gap-4">
                  {personalizedPlans.map((plan, index) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xl">
                                {plan.title}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {plan.description}
                              </CardDescription>
                            </div>
                            <Badge variant="outline">{plan.difficulty}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {plan.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {plan.workouts} workouts
                              </span>
                            </div>
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Start Plan
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="favorites" className="space-y-4 mt-0">
                {favoriteWorkouts.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No favorites yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Start adding workouts to your favorites to see them here
                      </p>
                      <Button onClick={() => setActiveTab("all")}>
                        Browse Workouts
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workouts
                      .filter((workout) =>
                        favoriteWorkouts.includes(workout.id),
                      )
                      .map((workout, index) => (
                        <motion.div
                          key={workout.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg mb-1">
                                    {workout.title}
                                  </CardTitle>
                                  <CardDescription className="text-sm">
                                    {workout.description}
                                  </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleFavorite(workout.id)}
                                    className="p-2"
                                  >
                                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {workout.duration}
                                  </span>
                                </div>
                                <Badge variant="outline">{workout.level}</Badge>
                                <Badge variant="secondary">
                                  {workout.category}
                                </Badge>
                              </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Flame className="h-4 w-4" />
                                    {workout.exercises?.length || 8} exercises
                                  </span>
                                </div>

                                <Button
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/workout-detail/${workout.id}`)
                                  }
                                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* Quick Action Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-24 right-4 z-40"
        >
          <Button
            size="lg"
            className="rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            onClick={() => navigate("/workout-detail/quick-start")}
          >
            <Plus className="h-5 w-5 mr-2" />
            Quick Start
          </Button>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
};

export default Workouts;

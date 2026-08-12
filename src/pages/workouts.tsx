import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Zap, Clock, Target, TrendingUp, Calendar, Star,
  PlayCircle, Heart, Share2, Award, Flame, Brain, Video, Sparkles, Dumbbell,
} from "lucide-react";
import { workouts } from "@/data/workouts";
import { AIWorkoutVideos } from "@/components/workout/ai-workout-videos";
import { AIWorkoutBuilder } from "@/components/features/ai-workout-builder";
import { RecoveryFocusWidget } from "@/components/workout/recovery-focus-widget";
import { WorkoutCategories } from "@/components/workout/workout-categories";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Workout } from "@/data/workouts";

const Workouts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [previewWorkout, setPreviewWorkout] = useState<Workout | null>(null);
  const [favoriteWorkouts, setFavoriteWorkouts] = useState<string[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [personalizedPlans, setPersonalizedPlans] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("workout-data");
    if (saved) {
      const data = JSON.parse(saved);
      setFavoriteWorkouts(data.favorites || []);
      setCompletedWorkouts(data.completed || []);
    }
    setAiRecommendations([
      { id: "ai-1", title: "AI Smart HIIT", description: "Personalized high-intensity workout", duration: "25 mins", difficulty: "Intermediate", calories: 320, icon: Brain },
      { id: "ai-2", title: "Adaptive Strength", description: "AI-optimized strength training", duration: "35 mins", difficulty: "Advanced", calories: 280, icon: Zap },
    ]);
    setPersonalizedPlans([
      { id: "plan-1", title: "30-Day Transform", description: "Comprehensive plan tailored to your goals", workouts: 24, duration: "30 days", difficulty: "Progressive" },
      { id: "plan-2", title: "Strength Builder", description: "Build muscle with progressive overload", workouts: 18, duration: "6 weeks", difficulty: "Intermediate" },
    ]);
  }, []);

  const filteredWorkouts = workouts
    .filter((w) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        (w.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (w.equipment || []).some((t) => t.toLowerCase().includes(q));
      const matchesType = filterType === "all" || w.category === filterType;
      const matchesDifficulty = filterDifficulty === "all" || w.level === filterDifficulty;
      return matchesSearch && matchesType && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "shortest":
          return a.duration - b.duration;
        case "longest":
          return b.duration - a.duration;
        case "calories":
          return (b.calories ?? 0) - (a.calories ?? 0);
        case "az":
          return a.title.localeCompare(b.title);
        default:
          return b.popularity - a.popularity;
      }
    });

  const toggleFavorite = (id: string) => {
    const newFavs = favoriteWorkouts.includes(id) ? favoriteWorkouts.filter((f) => f !== id) : [...favoriteWorkouts, id];
    setFavoriteWorkouts(newFavs);
    localStorage.setItem("workout-data", JSON.stringify({ favorites: newFavs, completed: completedWorkouts }));
    toast({ title: favoriteWorkouts.includes(id) ? "Removed from favorites" : "Added to favorites" });
  };

  const stats = { total: workouts.length, completed: completedWorkouts.length, favorites: favoriteWorkouts.length, streak: 7 };

  const fadeUp = { hidden: { y: 12, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background pb-24">
        {/* Glass Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent-foreground" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative pt-12 pb-8 px-4 text-primary-foreground">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="h-6 w-6" />
                  <h1 className="text-2xl font-bold">Workouts</h1>
                </div>
                <p className="text-primary-foreground/70 text-sm">AI-powered fitness routines</p>
              </div>
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">v6.2.0</Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Target, value: stats.total, label: "Available" },
                { icon: Award, value: stats.completed, label: "Done" },
                { icon: Heart, value: stats.favorites, label: "Saved" },
                { icon: Flame, value: stats.streak, label: "Streak" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 }}
                  className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-2.5 text-center border border-primary-foreground/10">
                  <s.icon className="h-4 w-4 mx-auto mb-1 text-primary-foreground/80" />
                  <div className="text-lg font-bold leading-tight">{s.value}</div>
                  <div className="text-[10px] text-primary-foreground/60">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="px-4 py-5">
          {/* Recovery & Focus */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-5">
            <RecoveryFocusWidget onStart={() => navigate("/workouts?quick=true")} />
          </motion.div>

          {/* Categories */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-5">
            <WorkoutCategories onSelect={(cat) => setFilterType(cat)} />
          </motion.div>


          {/* Search */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-5 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search workouts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-border/30 bg-card/60 backdrop-blur-sm shadow-sm h-11" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[130px] rounded-xl border-border/30 bg-card/60 backdrop-blur-sm h-9 text-sm">
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
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] rounded-xl border-border/30 bg-card/60 backdrop-blur-sm h-9 text-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="shortest">Shortest first</SelectItem>
                  <SelectItem value="longest">Longest first</SelectItem>
                  <SelectItem value="calories">Most calories</SelectItem>
                  <SelectItem value="az">A → Z</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-[130px] rounded-xl border-border/30 bg-card/60 backdrop-blur-sm h-9 text-sm">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-6 mb-5 bg-muted/40 backdrop-blur-sm rounded-xl h-10">
              <TabsTrigger value="all" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Target className="h-3.5 w-3.5 mr-1" />All</TabsTrigger>
              <TabsTrigger value="builder" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Sparkles className="h-3.5 w-3.5 mr-1" />Build</TabsTrigger>
              <TabsTrigger value="videos" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Video className="h-3.5 w-3.5 mr-1" />Videos</TabsTrigger>
              <TabsTrigger value="ai" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Brain className="h-3.5 w-3.5 mr-1" />AI</TabsTrigger>
              <TabsTrigger value="plans" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Calendar className="h-3.5 w-3.5 mr-1" />Plans</TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Heart className="h-3.5 w-3.5 mr-1" />Saved</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                <TabsContent value="all" className="space-y-3 mt-0">
                  {filteredWorkouts.length === 0 ? (
                    <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
                      <CardContent className="pt-8 pb-8 text-center">
                        <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground font-medium">No workouts found</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your filters</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredWorkouts.map((workout, i) => (
                        <motion.div key={workout.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <Card className="overflow-hidden border-border/20 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base font-semibold text-foreground truncate">{workout.title}</CardTitle>
                                  <CardDescription className="text-sm mt-0.5 line-clamp-2">{workout.description}</CardDescription>
                                </div>
                                <div className="flex items-center gap-1 ml-2 shrink-0">
                                  <Button variant="ghost" size="sm" onClick={() => toggleFavorite(workout.id)} className="p-1.5 h-auto">
                                    <Heart className={`h-4 w-4 ${favoriteWorkouts.includes(workout.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{workout.duration}</span>
                                </div>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">{workout.level}</Badge>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{workout.category}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" />{workout.exercises?.length || 8} exercises</span>
                                  <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" />~{workout.calories ?? 250} cal</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                {workout.videoUrl && (
                                  <Button size="sm" variant="outline" onClick={() => setPreviewWorkout(workout)}
                                    className="h-8 text-xs rounded-lg">
                                    <Video className="h-3.5 w-3.5 mr-1" />Watch
                                  </Button>
                                )}
                                {completedWorkouts.includes(workout.id) ? (
                                  <Badge className="bg-accent text-accent-foreground text-[10px]">✓ Done</Badge>
                                ) : (
                                  <Button size="sm" onClick={() => navigate(`/workout-detail/${workout.id}`)}
                                    className="h-8 text-xs rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                                    <PlayCircle className="h-3.5 w-3.5 mr-1" />Start
                                  </Button>
                                )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="builder" className="mt-0"><AIWorkoutBuilder /></TabsContent>
                <TabsContent value="videos" className="mt-0"><AIWorkoutVideos /></TabsContent>

                <TabsContent value="ai" className="space-y-3 mt-0">
                  <Card className="border-border/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base"><Brain className="h-5 w-5 text-primary" />AI-Generated Workouts</CardTitle>
                      <CardDescription>Personalized based on your fitness profile</CardDescription>
                    </CardHeader>
                  </Card>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiRecommendations.map((w, i) => (
                      <motion.div key={w.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm hover:shadow-lg transition-all">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-xl"><w.icon className="h-5 w-5 text-primary" /></div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base">{w.title}</CardTitle>
                                <CardDescription className="text-sm">{w.description}</CardDescription>
                              </div>
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] shrink-0">AI</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{w.duration}</span>
                                <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" />{w.calories} cal</span>
                              </div>
                              <Button size="sm" className="h-8 text-xs rounded-lg"><PlayCircle className="h-3.5 w-3.5 mr-1" />Try Now</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="plans" className="space-y-3 mt-0">
                  <Card className="border-border/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-5 w-5 text-primary" />Training Plans</CardTitle>
                      <CardDescription>Structured programs for your goals</CardDescription>
                    </CardHeader>
                  </Card>
                  {personalizedPlans.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <Card className="border-border/20 bg-card/60 backdrop-blur-sm hover:shadow-lg transition-all">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{p.title}</CardTitle>
                          <CardDescription>{p.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{p.workouts} workouts</span>
                              <span>{p.duration}</span>
                              <Badge variant="outline" className="text-[10px] h-5">{p.difficulty}</Badge>
                            </div>
                            <Button size="sm" className="h-8 text-xs rounded-lg">Start Plan</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                <TabsContent value="favorites" className="space-y-3 mt-0">
                  {favoriteWorkouts.length === 0 ? (
                    <Card className="border-border/20 bg-card/60 backdrop-blur-sm">
                      <CardContent className="pt-8 pb-8 text-center">
                        <Heart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground font-medium">No saved workouts yet</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">Tap the heart icon to save workouts</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {workouts.filter((w) => favoriteWorkouts.includes(w.id)).map((workout, i) => (
                        <motion.div key={workout.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <Card className="border-border/20 bg-card/60 backdrop-blur-sm hover:shadow-lg transition-all">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">{workout.title}</CardTitle>
                              <CardDescription>{workout.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" /><span>{workout.duration}</span>
                                  <Badge variant="outline" className="text-[10px] h-5">{workout.level}</Badge>
                                </div>
                                <Button size="sm" onClick={() => navigate(`/workout-detail/${workout.id}`)} className="h-8 text-xs rounded-lg">
                                  <PlayCircle className="h-3.5 w-3.5 mr-1" />Start
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
        </div>

        <Dialog open={!!previewWorkout} onOpenChange={(o) => !o && setPreviewWorkout(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{previewWorkout?.title}</DialogTitle>
            </DialogHeader>
            {previewWorkout?.videoUrl && (
              <video
                key={previewWorkout.id}
                src={previewWorkout.videoUrl}
                poster={previewWorkout.thumbnailUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full rounded-xl bg-black"
              />
            )}
            <p className="text-sm text-muted-foreground">{previewWorkout?.description}</p>
            <div className="flex flex-wrap gap-2">
              {(previewWorkout?.equipment || []).map((eq) => (
                <Badge key={eq} variant="outline" className="text-[10px] capitalize">{eq}</Badge>
              ))}
              {(previewWorkout?.tags || []).map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>
              ))}
            </div>
            <Button
              onClick={() => {
                const id = previewWorkout?.id;
                setPreviewWorkout(null);
                if (id) navigate(`/workout-detail/${id}`);
              }}
            >
              <PlayCircle className="h-4 w-4 mr-1.5" />Start this workout
            </Button>
          </DialogContent>
        </Dialog>

        <MobileNav />
      </div>
    </MainLayout>
  );
};

export default Workouts;

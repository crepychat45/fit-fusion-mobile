
import React, { useState, useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { WorkoutCard } from "@/components/workout-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, Filter, Clock, RotateCcw, Dumbbell, Heart, 
  ArrowUpDown, TrendingUp, Bookmark, BookmarkCheck 
} from "lucide-react";
import { 
  Popover, PopoverTrigger, PopoverContent 
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { workouts } from "@/data/workouts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  { label: "All", value: "all" },
  { label: "Strength", value: "strength" },
  { label: "Cardio", value: "cardio" },
  { label: "HIIT", value: "hiit" },
  { label: "Flexibility", value: "flexibility" },
];

const Workouts = () => {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [durationRange, setDurationRange] = useState<number[]>([5, 60]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'duration'>('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("fitfusion-favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem("fitfusion-bookmarks");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Save favorites and bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem("fitfusion-favorites", JSON.stringify(favorites));
  }, [favorites]);
  
  useEffect(() => {
    localStorage.setItem("fitfusion-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);
  
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        toast({
          title: "Added to Favorites",
          description: "Workout has been added to your favorites."
        });
        return [...prev, id];
      }
    });
  };
  
  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        toast({
          title: "Workout Saved",
          description: "Workout has been saved for later."
        });
        return [...prev, id];
      }
    });
  };
  
  const resetFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setDurationRange([5, 60]);
    setSortBy('newest');
    setShowFilters(false);
    toast({
      title: "Filters Reset",
      description: "All workout filters have been reset."
    });
  };
  
  // Filter and sort workouts
  let filteredWorkouts = workouts.filter((workout) => {
    const matchesCategory = activeCategory === "all" || workout.category === activeCategory;
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDuration = workout.duration >= durationRange[0] && workout.duration <= durationRange[1];
    return matchesCategory && matchesSearch && matchesDuration;
  });
  
  // Sort workouts
  if (sortBy === 'duration') {
    filteredWorkouts = [...filteredWorkouts].sort((a, b) => a.duration - b.duration);
  } else if (sortBy === 'popular') {
    filteredWorkouts = [...filteredWorkouts].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  } else {
    // Sort by newest (default)
    filteredWorkouts = [...filteredWorkouts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
  
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="p-4">
        <h1 className="text-xl font-bold mb-4">Workouts</h1>
        
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search workouts..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {(activeCategory !== "all" || durationRange[0] !== 5 || durationRange[1] !== 60) && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filters</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{durationRange[0]}m</span>
                    <span>{durationRange[1]}m</span>
                  </div>
                  <Slider 
                    value={durationRange} 
                    min={5} 
                    max={60} 
                    step={5} 
                    onValueChange={setDurationRange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      size="sm" 
                      variant={sortBy === 'newest' ? 'default' : 'outline'} 
                      onClick={() => setSortBy('newest')}
                      className="w-full"
                    >
                      Newest
                    </Button>
                    <Button 
                      size="sm" 
                      variant={sortBy === 'popular' ? 'default' : 'outline'} 
                      onClick={() => setSortBy('popular')}
                      className="w-full"
                    >
                      Popular
                    </Button>
                    <Button 
                      size="sm" 
                      variant={sortBy === 'duration' ? 'default' : 'outline'} 
                      onClick={() => setSortBy('duration')}
                      className="w-full"
                    >
                      Duration
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>Apply</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      {/* Tabs for All/Favorites/Bookmarks */}
      <Tabs defaultValue="all" className="w-full mt-2">
        <div className="px-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="favorites">
              Favorites
              {favorites.length > 0 && (
                <Badge variant="secondary" className="ml-1">{favorites.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookmarks">
              Saved
              {bookmarks.length > 0 && (
                <Badge variant="secondary" className="ml-1">{bookmarks.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all">
          {/* Categories */}
          <div className="px-4 mt-2">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={activeCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.value)}
                  className="rounded-full whitespace-nowrap"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Workouts Grid or List */}
          <div className="p-4">
            {filteredWorkouts.length > 0 ? (
              <div className={view === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 gap-4" 
                : "flex flex-col gap-3"
              }>
                {filteredWorkouts.map((workout) => (
                  <div key={workout.id} className="relative">
                    <WorkoutCard 
                      id={workout.id}
                      title={workout.title}
                      category={workout.category}
                      duration={workout.duration}
                      exercises={workout.exercises.length}
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 bg-background/40 backdrop-blur-sm hover:bg-background/60"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(workout.id);
                        }}
                      >
                        {favorites.includes(workout.id) ? (
                          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                        ) : (
                          <Heart className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 bg-background/40 backdrop-blur-sm hover:bg-background/60"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleBookmark(workout.id);
                        }}
                      >
                        {bookmarks.includes(workout.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No workouts found.</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="favorites">
          <div className="p-4">
            {favorites.length > 0 ? (
              <div className={view === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 gap-4" 
                : "flex flex-col gap-3"
              }>
                {workouts
                  .filter(workout => favorites.includes(workout.id))
                  .map((workout) => (
                    <div key={workout.id} className="relative">
                      <WorkoutCard 
                        id={workout.id}
                        title={workout.title}
                        category={workout.category}
                        duration={workout.duration}
                        exercises={workout.exercises.length}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-3 right-3 h-8 w-8 bg-background/40 backdrop-blur-sm hover:bg-background/60"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(workout.id);
                        }}
                      >
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                <p className="text-muted-foreground">Mark workouts as favorites to access them quickly.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="bookmarks">
          <div className="p-4">
            {bookmarks.length > 0 ? (
              <div className={view === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 gap-4" 
                : "flex flex-col gap-3"
              }>
                {workouts
                  .filter(workout => bookmarks.includes(workout.id))
                  .map((workout) => (
                    <div key={workout.id} className="relative">
                      <WorkoutCard 
                        id={workout.id}
                        title={workout.title}
                        category={workout.category}
                        duration={workout.duration}
                        exercises={workout.exercises.length}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-3 right-3 h-8 w-8 bg-background/40 backdrop-blur-sm hover:bg-background/60"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleBookmark(workout.id);
                        }}
                      >
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No saved workouts</h3>
                <p className="text-muted-foreground">Bookmark workouts to save them for later.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Workouts;

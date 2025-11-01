import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Play,
  Search,
  Filter,
  Clock,
  Flame,
  TrendingUp,
  Star,
  Bookmark,
  Share2,
  Heart,
} from "lucide-react";

interface WorkoutVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  calories: number;
  instructor: string;
  category: string;
  views: number;
  rating: number;
  isFavorite: boolean;
}

const workoutVideos: WorkoutVideo[] = [
  {
    id: "1",
    title: "30-Min HIIT Cardio Blast",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    duration: "30:00",
    difficulty: "intermediate",
    calories: 350,
    instructor: "Sarah Johnson",
    category: "HIIT",
    views: 12500,
    rating: 4.8,
    isFavorite: true,
  },
  {
    id: "2",
    title: "Full Body Strength Training",
    thumbnail: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=600&fit=crop",
    duration: "45:00",
    difficulty: "advanced",
    calories: 420,
    instructor: "Mike Chen",
    category: "Strength",
    views: 18200,
    rating: 4.9,
    isFavorite: false,
  },
  {
    id: "3",
    title: "Yoga Flow for Beginners",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
    duration: "20:00",
    difficulty: "beginner",
    calories: 150,
    instructor: "Emma Davis",
    category: "Yoga",
    views: 9800,
    rating: 4.7,
    isFavorite: true,
  },
  {
    id: "4",
    title: "Core Crusher Abs Workout",
    thumbnail: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&h=600&fit=crop",
    duration: "15:00",
    difficulty: "intermediate",
    calories: 180,
    instructor: "Alex Rivera",
    category: "Core",
    views: 15600,
    rating: 4.6,
    isFavorite: false,
  },
  {
    id: "5",
    title: "Dance Cardio Party",
    thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop",
    duration: "40:00",
    difficulty: "beginner",
    calories: 300,
    instructor: "Lisa Martinez",
    category: "Dance",
    views: 11200,
    rating: 4.9,
    isFavorite: true,
  },
  {
    id: "6",
    title: "Power Pilates",
    thumbnail: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&h=600&fit=crop",
    duration: "35:00",
    difficulty: "intermediate",
    calories: 250,
    instructor: "Rachel Kim",
    category: "Pilates",
    views: 8900,
    rating: 4.8,
    isFavorite: false,
  },
];

export function AIWorkoutVideos() {
  const [videos, setVideos] = useState<WorkoutVideo[]>(workoutVideos);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<WorkoutVideo | null>(null);

  const categories = ["all", "HIIT", "Strength", "Yoga", "Core", "Dance", "Pilates"];

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const toggleFavorite = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, isFavorite: !v.isFavorite } : v
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-6 w-6 text-primary" />
            AI-Powered Workout Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Category Filters */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                  <div
                    className="relative aspect-video bg-cover bg-center"
                    style={{ backgroundImage: `url(${video.thumbnail})` }}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-primary ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge className={getDifficultyColor(video.difficulty)}>
                        {video.difficulty}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="bg-black/70 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        {video.duration}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {video.instructor}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-orange-600">
                          <Flame className="h-4 w-4" />
                          {video.calories}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Star className="h-4 w-4 fill-current" />
                          {video.rating}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(video.id);
                        }}
                      >
                        <Heart
                          className={`h-4 w-4 ${video.isFavorite ? "fill-red-500 text-red-500" : ""}`}
                        />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <p className="text-white">Video player would be integrated here</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className={getDifficultyColor(selectedVideo?.difficulty || "beginner")}>
                  {selectedVideo?.difficulty}
                </Badge>
                <span className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  {selectedVideo?.duration}
                </span>
                <span className="flex items-center gap-1 text-sm text-orange-600">
                  <Flame className="h-4 w-4" />
                  {selectedVideo?.calories} cal
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">About this workout</h4>
              <p className="text-sm text-muted-foreground">
                Join {selectedVideo?.instructor} for an amazing {selectedVideo?.category} workout.
                This {selectedVideo?.duration} session is designed for {selectedVideo?.difficulty} level
                and will help you burn approximately {selectedVideo?.calories} calories.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

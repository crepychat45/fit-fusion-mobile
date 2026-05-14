import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Star, Clock, TrendingUp } from "lucide-react";

interface TransformationStory {
  id: string;
  userName: string;
  avatar: string;
  duration: string;
  beforeWeight: string;
  afterWeight: string;
  goal: string;
  story: string;
  likes: number;
  comments: number;
  rating: number;
  tags: string[];
}

const SAMPLE_STORIES: TransformationStory[] = [
  {
    id: "1",
    userName: "Sarah M.",
    avatar: "SM",
    duration: "6 months",
    beforeWeight: "85 kg",
    afterWeight: "68 kg",
    goal: "Weight Loss",
    story: "FitFusion's AI coach helped me build sustainable habits. The personalized meal plans and workout routines made all the difference. I've never felt stronger!",
    likes: 342,
    comments: 47,
    rating: 5,
    tags: ["Weight Loss", "Nutrition", "Strength"],
  },
  {
    id: "2",
    userName: "Mike R.",
    avatar: "MR",
    duration: "8 months",
    beforeWeight: "72 kg",
    afterWeight: "82 kg",
    goal: "Muscle Gain",
    story: "Went from skinny to strong. The progressive overload tracking and AI form correction ensured I was always improving with proper technique.",
    likes: 289,
    comments: 31,
    rating: 5,
    tags: ["Muscle Gain", "Strength Training", "Consistency"],
  },
  {
    id: "3",
    userName: "Priya K.",
    avatar: "PK",
    duration: "4 months",
    beforeWeight: "N/A",
    afterWeight: "N/A",
    goal: "Flexibility & Wellness",
    story: "The yoga and mindfulness routines transformed my daily life. Better sleep, less stress, and incredible flexibility gains. Truly holistic fitness!",
    likes: 198,
    comments: 22,
    rating: 4,
    tags: ["Yoga", "Wellness", "Mindfulness"],
  },
];

export function TransformationStories() {
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedStories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Transformation Stories</h2>
        <p className="text-muted-foreground">Real journeys from our community members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAMPLE_STORIES.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-sm">
                      {story.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{story.userName}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{story.duration}
                      <span className="mx-1">•</span>
                      <div className="flex">
                        {Array.from({ length: story.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {story.beforeWeight !== "N/A" && (
                  <div className="flex items-center justify-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Before</p>
                      <p className="font-bold text-red-500">{story.beforeWeight}</p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">After</p>
                      <p className="font-bold text-green-500">{story.afterWeight}</p>
                    </div>
                  </div>
                )}

                <Badge variant="secondary" className="text-xs">{story.goal}</Badge>

                <p className="text-sm text-muted-foreground leading-relaxed">"{story.story}"</p>

                <div className="flex flex-wrap gap-1">
                  {story.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Button variant="ghost" size="sm" className={likedStories.has(story.id) ? "text-red-500" : ""} onClick={() => toggleLike(story.id)}>
                    <Heart className={`h-4 w-4 mr-1 ${likedStories.has(story.id) ? "fill-current" : ""}`} />
                    {story.likes + (likedStories.has(story.id) ? 1 : 0)}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />{story.comments}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

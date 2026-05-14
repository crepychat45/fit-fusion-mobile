import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Trophy, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommentSection } from "./comment-section";
import { toast } from "sonner";

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  type: "workout" | "achievement" | "challenge";
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  data?: {
    workoutName?: string;
    duration?: number;
    calories?: number;
    achievement?: string;
  };
}

const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: "1",
    user: { name: "Sarah Johnson", initials: "SJ" },
    type: "workout",
    content: "Completed a crushing HIIT session! 💪",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 5,
    data: {
      workoutName: "HIIT Cardio Blast",
      duration: 30,
      calories: 350,
    },
  },
  {
    id: "2",
    user: { name: "Mike Chen", initials: "MC" },
    type: "achievement",
    content: "Unlocked the 30-Day Streak badge! 🎉",
    timestamp: "5 hours ago",
    likes: 42,
    comments: 8,
    data: {
      achievement: "30-Day Streak",
    },
  },
  {
    id: "3",
    user: { name: "Emily Davis", initials: "ED" },
    type: "challenge",
    content: "Join me in the 100 Pushups Challenge!",
    timestamp: "1 day ago",
    likes: 18,
    comments: 12,
  },
];

export function ActivityFeed() {
  const [activities] = React.useState<Activity[]>(SAMPLE_ACTIVITIES);
  const [likedActivities, setLikedActivities] = React.useState<Set<string>>(new Set());
  const [showComments, setShowComments] = React.useState<Set<string>>(new Set());

  const handleLike = (id: string) => {
    setLikedActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleComments = (id: string) => {
    setShowComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleShare = () => {
    toast.success("Post shared successfully!");
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "workout":
        return <Flame className="h-5 w-5 text-orange-500" />;
      case "achievement":
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case "challenge":
        return <Trophy className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                    {activity.user.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{activity.user.name}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
              {getActivityIcon(activity.type)}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <p className="text-sm">{activity.content}</p>

            {activity.data && activity.type === "workout" && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
                <Badge variant="secondary" className="capitalize">
                  {activity.data.workoutName}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {activity.data.duration} min • {activity.data.calories} cal
                </span>
              </div>
            )}

            {activity.data && activity.type === "achievement" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-semibold">{activity.data.achievement}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(activity.id)}
                  className={likedActivities.has(activity.id) ? "text-red-500" : ""}
                >
                  <Heart
                    className="h-4 w-4 mr-1"
                    fill={likedActivities.has(activity.id) ? "currentColor" : "none"}
                  />
                  {activity.likes + (likedActivities.has(activity.id) ? 1 : 0)}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleComments(activity.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {activity.comments}
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            {showComments.has(activity.id) && (
              <CommentSection activityId={activity.id} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

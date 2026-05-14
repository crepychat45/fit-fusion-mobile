import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Calendar, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "weekly" | "monthly";
  participants: number;
  target: number;
  current: number;
  unit: string;
  endsAt: Date;
  reward: string;
  isJoined?: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const [isJoined, setIsJoined] = React.useState(challenge.isJoined || false);
  const progress = (challenge.current / challenge.target) * 100;

  const handleJoinChallenge = () => {
    setIsJoined(true);
    toast.success(`Joined ${challenge.title}!`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={challenge.type === "weekly" ? "default" : "secondary"}>
                {challenge.type}
              </Badge>
              {isJoined && (
                <Badge variant="outline" className="text-green-600 border-green-600/20">
                  Joined
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{challenge.title}</CardTitle>
          </div>
          <Trophy className="h-8 w-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{challenge.description}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">
              {challenge.current} / {challenge.target} {challenge.unit}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {challenge.participants.toLocaleString()} participants
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Ends {formatDistanceToNow(challenge.endsAt, { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Reward: {challenge.reward}</span>
        </div>

        {!isJoined && (
          <Button className="w-full" onClick={handleJoinChallenge}>
            Join Challenge
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: "ch1",
    title: "30-Day Workout Streak",
    description: "Complete a workout every day for 30 days",
    type: "monthly",
    participants: 1543,
    target: 30,
    current: 12,
    unit: "days",
    endsAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    reward: "Consistency Champion Badge",
  },
  {
    id: "ch2",
    title: "1000 Push-ups Challenge",
    description: "Complete 1000 push-ups this week",
    type: "weekly",
    participants: 892,
    target: 1000,
    current: 450,
    unit: "reps",
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    reward: "Push-up Master Badge",
  },
  {
    id: "ch3",
    title: "50km Running Goal",
    description: "Run a total of 50km this month",
    type: "monthly",
    participants: 2341,
    target: 50,
    current: 23,
    unit: "km",
    endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    reward: "Marathon Warrior Badge",
  },
];

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  score: number;
  change: number;
}

const WEEKLY_LEADERS: LeaderboardEntry[] = [
  { rank: 1, user: { name: "Alex Thompson", initials: "AT" }, score: 2850, change: 2 },
  { rank: 2, user: { name: "Jordan Lee", initials: "JL" }, score: 2720, change: -1 },
  { rank: 3, user: { name: "Sam Rivera", initials: "SR" }, score: 2680, change: 1 },
  { rank: 4, user: { name: "Chris Martinez", initials: "CM" }, score: 2540, change: 3 },
  { rank: 5, user: { name: "Taylor Kim", initials: "TK" }, score: 2420, change: -2 },
];

const MONTHLY_LEADERS: LeaderboardEntry[] = [
  { rank: 1, user: { name: "Jordan Lee", initials: "JL" }, score: 11250, change: 0 },
  { rank: 2, user: { name: "Alex Thompson", initials: "AT" }, score: 10920, change: 1 },
  { rank: 3, user: { name: "Sam Rivera", initials: "SR" }, score: 10450, change: -1 },
  { rank: 4, user: { name: "Taylor Kim", initials: "TK" }, score: 9860, change: 2 },
  { rank: 5, user: { name: "Chris Martinez", initials: "CM" }, score: 9540, change: 1 },
];

export function Leaderboard() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-semibold">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/20";
      case 2:
        return "bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/20";
      case 3:
        return "bg-gradient-to-r from-amber-600/10 to-amber-700/10 border-amber-600/20";
      default:
        return "";
    }
  };

  const LeaderboardList = ({ entries }: { entries: LeaderboardEntry[] }) => (
    <div className="space-y-2">
      {entries.map((entry) => (
        <Card key={entry.rank} className={cn("border-2", getRankStyle(entry.rank))}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.user.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                    {entry.user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{entry.user.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.score.toLocaleString()} points</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {entry.change !== 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      entry.change > 0 ? "text-green-600 border-green-600/20" : "text-red-600 border-red-600/20"
                    )}
                  >
                    <TrendingUp
                      className={cn("h-3 w-3 mr-1", entry.change < 0 && "rotate-180")}
                    />
                    {Math.abs(entry.change)}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span>Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly" className="mt-4">
            <LeaderboardList entries={WEEKLY_LEADERS} />
          </TabsContent>
          <TabsContent value="monthly" className="mt-4">
            <LeaderboardList entries={MONTHLY_LEADERS} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

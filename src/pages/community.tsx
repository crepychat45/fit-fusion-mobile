import React from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { PostCreator } from "@/components/community/post-creator";
import { ActivityFeed } from "@/components/community/activity-feed";
import { Leaderboard } from "@/components/community/leaderboard";
import { ChallengeCard, SAMPLE_CHALLENGES } from "@/components/community/challenge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Activity, Star } from "lucide-react";
import { TransformationStories } from "@/components/community/transformation-stories";

export default function Community() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community</h1>
          <p className="text-muted-foreground">
            Connect with fellow fitness enthusiasts and share your journey
          </p>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="feed">
              <Activity className="h-4 w-4 mr-2" />Feed
            </TabsTrigger>
            <TabsTrigger value="stories">
              <Star className="h-4 w-4 mr-2" />Stories
            </TabsTrigger>
            <TabsTrigger value="challenges">
              <Trophy className="h-4 w-4 mr-2" />Challenges
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Users className="h-4 w-4 mr-2" />Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <PostCreator />
                <ActivityFeed />
              </div>
              <div className="space-y-6">
                <Leaderboard />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            <TransformationStories />
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_CHALLENGES.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="max-w-2xl mx-auto">
              <Leaderboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

import React from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { PostCreator } from "@/components/community/post-creator";
import { ActivityFeed } from "@/components/community/activity-feed";
import { Leaderboard } from "@/components/community/leaderboard";
import { ChallengeCard, SAMPLE_CHALLENGES } from "@/components/community/challenge-card";
import { CommunityStats } from "@/components/community/community-stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Activity, Star, User } from "lucide-react";
import { TransformationStories } from "@/components/community/transformation-stories";

export default function Community() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Community</h1>
          <p className="text-muted-foreground">
            Connect with fellow fitness enthusiasts and share your journey
          </p>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="feed"><Activity className="h-4 w-4 mr-1" />Feed</TabsTrigger>
            <TabsTrigger value="mine"><User className="h-4 w-4 mr-1" />Mine</TabsTrigger>
            <TabsTrigger value="stories"><Star className="h-4 w-4 mr-1" />Stories</TabsTrigger>
            <TabsTrigger value="challenges"><Trophy className="h-4 w-4 mr-1" />Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard"><Users className="h-4 w-4 mr-1" />Leaders</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <PostCreator />
                <ActivityFeed filter="all" />
              </div>
              <div className="space-y-6">
                <CommunityStats />
                <Leaderboard />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mine" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <PostCreator />
                <ActivityFeed filter="mine" />
              </div>
              <div className="space-y-6">
                <CommunityStats />
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
            <div className="max-w-2xl mx-auto space-y-6">
              <CommunityStats />
              <Leaderboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}


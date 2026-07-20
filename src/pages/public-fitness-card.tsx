import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FitnessIDCard } from "@/components/profile/fitness-id-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PublicProfile {
  user_id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  fitness_level: string | null;
  fitness_goals: string[] | null;
  created_at: string;
}

const PublicFitnessCard: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState({ workouts: 0, streak: 0, calories: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!userId) { setError("Invalid card link"); setLoading(false); return; }
      try {
        const { data, error: e } = await supabase
          .from("profiles")
          .select("user_id,name,username,bio,avatar_url,fitness_level,fitness_goals,created_at")
          .eq("user_id", userId)
          .maybeSingle();
        if (e) throw e;
        if (!mounted) return;
        if (!data) { setError("Fitness card not found"); setLoading(false); return; }
        setProfile(data as PublicProfile);

        const { count } = await supabase
          .from("workout_sessions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId);
        if (mounted) setStats((s) => ({ ...s, workouts: count ?? 0, calories: (count ?? 0) * 220 }));
      } catch (err: any) {
        if (mounted) setError(err?.message || "Failed to load card");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-base">Card unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{error || "This fitness card is private or does not exist."}</p>
            <Button asChild size="sm"><Link to="/"><ArrowLeft className="h-3.5 w-3.5 mr-1" />Home</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = profile.name || profile.username || "FitXFusion Athlete";
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-16">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link></Button>
          <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" />Verified card</Badge>
        </div>

        <FitnessIDCard
          name={displayName}
          avatarUrl={profile.avatar_url || undefined}
          memberSince={profile.created_at ? new Date(profile.created_at).getFullYear().toString() : undefined}
          level={Math.max(1, Math.floor(stats.workouts / 10) + 1)}
          workouts={stats.workouts}
          streak={stats.streak}
          calories={stats.calories}
          fitnessScore={Math.min(99, 50 + stats.workouts)}
          goal={profile.fitness_goals?.[0] || profile.fitness_level || "Stay Fit"}
          userId={profile.user_id}
        />

        <Card className="mt-4 border-border/20 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Athlete details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-muted-foreground text-xs">Name</div><div className="font-medium">{displayName}</div></div>
            {profile.username && <div><div className="text-muted-foreground text-xs">Username</div><div className="font-medium">@{profile.username}</div></div>}
            {profile.fitness_level && <div><div className="text-muted-foreground text-xs">Level</div><div className="font-medium capitalize">{profile.fitness_level}</div></div>}
            <div><div className="text-muted-foreground text-xs">Member since</div><div className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</div></div>
            {profile.fitness_goals?.length ? (
              <div className="col-span-2"><div className="text-muted-foreground text-xs mb-1">Goals</div><div className="flex flex-wrap gap-1">{profile.fitness_goals.map((g) => <Badge key={g} variant="secondary" className="text-[10px]">{g}</Badge>)}</div></div>
            ) : null}
            {profile.bio && <div className="col-span-2"><div className="text-muted-foreground text-xs">Bio</div><div>{profile.bio}</div></div>}
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          Scan or share this page to view {displayName}'s official FitXFusion ID card. Use the download menu on the card to save an HD copy.
        </p>
      </div>
    </div>
  );
};

export default PublicFitnessCard;

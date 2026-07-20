import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Loader2, Sparkles } from "lucide-react";
import { CommentSection } from "./comment-section";
import { toast } from "sonner";
import { usePosts, type Post } from "@/hooks/use-social";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

type ProfileLite = { id: string; display_name?: string | null; avatar_url?: string | null };

export function ActivityFeed({ filter = "all" }: { filter?: "all" | "mine" }) {
  const { user } = useEnhancedAuth();
  const { posts, isLoading, likePost, unlikePost } = usePosts();
  const [likedIds, setLikedIds] = React.useState<Set<string>>(new Set());
  const [openComments, setOpenComments] = React.useState<Set<string>>(new Set());
  const [profiles, setProfiles] = React.useState<Record<string, ProfileLite>>({});

  // Load current user's likes
  React.useEffect(() => {
    if (!user?.id || !posts?.length) return;
    (async () => {
      const { data } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", posts.map((p) => p.id));
      if (data) setLikedIds(new Set(data.map((r: any) => r.post_id)));
    })();
  }, [user?.id, posts]);

  // Load profiles for authors
  React.useEffect(() => {
    if (!posts?.length) return;
    const ids = Array.from(new Set(posts.map((p) => p.user_id))).filter((id) => !profiles[id]);
    if (!ids.length) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", ids);
      if (data) {
        const next: Record<string, ProfileLite> = { ...profiles };
        data.forEach((p: any) => (next[p.id] = p));
        setProfiles(next);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const filtered = React.useMemo(() => {
    if (!posts) return [];
    if (filter === "mine" && user?.id) return posts.filter((p) => p.user_id === user.id);
    return posts;
  }, [posts, filter, user?.id]);

  const handleToggleLike = async (post: Post) => {
    if (!user) {
      toast.error("Sign in to like posts");
      return;
    }
    const isLiked = likedIds.has(post.id);
    // optimistic
    setLikedIds((prev) => {
      const s = new Set(prev);
      isLiked ? s.delete(post.id) : s.add(post.id);
      return s;
    });
    try {
      if (isLiked) await unlikePost.mutateAsync(post.id);
      else await likePost.mutateAsync(post.id);
    } catch {
      // revert on error
      setLikedIds((prev) => {
        const s = new Set(prev);
        isLiked ? s.add(post.id) : s.delete(post.id);
        return s;
      });
    }
  };

  const handleShare = async (post: Post) => {
    const url = `${window.location.origin}/community`;
    const text = post.content.slice(0, 100);
    if (navigator.share) {
      try { await navigator.share({ title: "FitFusion Post", text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Post link copied");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />Loading feed…
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center space-y-2">
          <Sparkles className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="font-medium">{filter === "mine" ? "You haven't posted yet" : "No posts yet"}</p>
          <p className="text-sm text-muted-foreground">Be the first to share your fitness journey!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filtered.map((post) => {
        const author = profiles[post.user_id];
        const name = author?.display_name || (post.user_id === user?.id ? "You" : "Athlete");
        const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "FF";
        const liked = likedIds.has(post.id);
        return (
          <Card key={post.id} className="overflow-hidden backdrop-blur-sm bg-card/70 border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={author?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm whitespace-pre-wrap">{post.content}</p>
              {post.image_url && (
                <img src={post.image_url} alt="Post attachment" className="rounded-lg w-full object-cover max-h-96" loading="lazy" />
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => handleToggleLike(post)}
                    className={liked ? "text-red-500" : ""}
                  >
                    <Heart className="h-4 w-4 mr-1" fill={liked ? "currentColor" : "none"} />
                    {post.likes_count || 0}
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() =>
                      setOpenComments((prev) => {
                        const s = new Set(prev);
                        s.has(post.id) ? s.delete(post.id) : s.add(post.id);
                        return s;
                      })
                    }
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Comments
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleShare(post)}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {openComments.has(post.id) && <CommentSection activityId={post.id} />}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

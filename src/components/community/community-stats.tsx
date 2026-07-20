import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, MessageSquare, Heart, Flame } from "lucide-react";
import { motion } from "framer-motion";

export function CommunityStats() {
  const [stats, setStats] = useState({ posts: 0, likes: 0, comments: 0, athletes: 0 });

  useEffect(() => {
    (async () => {
      const [p, l, c, a] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("post_likes").select("id", { count: "exact", head: true }),
        supabase.from("post_comments").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        posts: p.count || 0,
        likes: l.count || 0,
        comments: c.count || 0,
        athletes: a.count || 0,
      });
    })();
  }, []);

  const items = [
    { icon: Users, label: "Athletes", value: stats.athletes, color: "text-primary" },
    { icon: MessageSquare, label: "Posts", value: stats.posts, color: "text-accent-foreground" },
    { icon: Heart, label: "Likes", value: stats.likes, color: "text-red-500" },
    { icon: Flame, label: "Comments", value: stats.comments, color: "text-orange-500" },
  ];

  return (
    <Card className="backdrop-blur-sm bg-card/70 border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Community Pulse</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {items.map((it, i) => (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/30 bg-background/40 p-3 flex items-center gap-3"
            >
              <it.icon className={`h-5 w-5 ${it.color}`} />
              <div>
                <div className="text-lg font-bold leading-tight">{it.value.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{it.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

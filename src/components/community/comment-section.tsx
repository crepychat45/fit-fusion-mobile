import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { validateInput, commentSchema, containsMaliciousContent } from "@/utils/validation";
import { toast } from "sonner";
import { useComments } from "@/hooks/use-social";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { supabase } from "@/integrations/supabase/client";

interface CommentSectionProps {
  activityId: string;
}

export function CommentSection({ activityId }: CommentSectionProps) {
  const { user } = useEnhancedAuth();
  const { comments, isLoading, addComment } = useComments(activityId);
  const [newComment, setNewComment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [authors, setAuthors] = useState<Record<string, { display_name?: string | null; avatar_url?: string | null }>>({});

  useEffect(() => {
    if (!comments?.length) return;
    const ids = Array.from(new Set(comments.map((c) => c.user_id))).filter((id) => !authors[id]);
    if (!ids.length) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", ids as any);
      if (data) {
        const next = { ...authors };
        (data as any[]).forEach((p) => (next[p.id] = p));
        setAuthors(next);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  const handleChange = (v: string) => {
    setNewComment(v);
    setValidationError(containsMaliciousContent(v) ? "Comment contains unsafe characters" : null);
  };

  const submit = async () => {
    if (!user) { toast.error("Sign in to comment"); return; }
    const validation = validateInput(commentSchema, newComment);
    if (!validation.success) {
      toast.error(validation.error || "Invalid comment");
      setValidationError(validation.error || null);
      return;
    }
    if (containsMaliciousContent(newComment)) { setValidationError("Content unsafe"); return; }
    try {
      await addComment.mutateAsync(validation.data as string);
      setNewComment("");
      setValidationError(null);
    } catch {}
  };

  const keyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading comments…
        </div>
      ) : (
        <div className="space-y-3">
          {comments?.map((c) => {
            const a = authors[c.user_id];
            const name = a?.display_name || (c.user_id === user?.id ? "You" : "Athlete");
            const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "FF";
            return (
              <div key={c.id} className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={a?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-2">
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-2">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
          {comments && comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">No comments yet — be the first!</p>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-col">
        <div className="flex gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">Y</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => handleChange(e.target.value)}
              onKeyPress={keyPress}
              className={validationError ? "border-red-500" : ""}
              maxLength={1000}
            />
            <Button size="sm" onClick={submit} disabled={!newComment.trim() || !!validationError || addComment.isPending}>
              {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {validationError && (
          <div className="flex items-center gap-2 ml-10 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{validationError}</span>
          </div>
        )}
      </div>
    </div>
  );
}

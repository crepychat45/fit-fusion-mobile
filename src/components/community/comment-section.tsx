import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  content: string;
  timestamp: Date;
}

interface CommentSectionProps {
  activityId: string;
  comments?: Comment[];
}

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "c1",
    user: { name: "Jordan Lee", initials: "JL" },
    content: "Great job! Keep it up! 💪",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "c2",
    user: { name: "Sam Rivera", initials: "SR" },
    content: "Inspiring! What's your workout routine?",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

export function CommentSection({ activityId, comments = SAMPLE_COMMENTS }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [displayComments, setDisplayComments] = useState(comments);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `c${Date.now()}`,
      user: { name: "You", initials: "Y" },
      content: newComment,
      timestamp: new Date(),
    };

    setDisplayComments([...displayComments, comment]);
    setNewComment("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="space-y-3">
        {displayComments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                {comment.user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted rounded-lg p-2">
                <p className="font-semibold text-sm">{comment.user.name}</p>
                <p className="text-sm">{comment.content}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-2">
                {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src="" />
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
            Y
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            size="sm"
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

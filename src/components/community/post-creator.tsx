import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Video, Trophy, Send, X } from "lucide-react";
import { toast } from "sonner";

interface PostCreatorProps {
  onPostCreated?: () => void;
}

export function PostCreator({ onPostCreated }: PostCreatorProps) {
  const [content, setContent] = useState("");
  const [attachmentType, setAttachmentType] = useState<"image" | "video" | null>(null);

  const handlePost = () => {
    if (!content.trim()) {
      toast.error("Please write something before posting");
      return;
    }

    // Simulate post creation
    toast.success("Post created successfully!");
    setContent("");
    setAttachmentType(null);
    onPostCreated?.();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
              You
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Share your fitness journey..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />

            {attachmentType && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {attachmentType === "image" ? (
                    <Image className="h-4 w-4 text-primary" />
                  ) : (
                    <Video className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {attachmentType === "image" ? "Image" : "Video"} attachment
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachmentType(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachmentType("image")}
                  disabled={attachmentType !== null}
                >
                  <Image className="h-4 w-4 mr-1" />
                  Photo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachmentType("video")}
                  disabled={attachmentType !== null}
                >
                  <Video className="h-4 w-4 mr-1" />
                  Video
                </Button>
                <Button variant="ghost" size="sm">
                  <Trophy className="h-4 w-4 mr-1" />
                  Achievement
                </Button>
              </div>
              <Button onClick={handlePost} disabled={!content.trim()}>
                <Send className="h-4 w-4 mr-1" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

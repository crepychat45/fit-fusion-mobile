import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Video, Trophy, Send, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { validateInput, postContentSchema, containsMaliciousContent } from "@/utils/validation";

interface PostCreatorProps {
  onPostCreated?: () => void;
}

export function PostCreator({ onPostCreated }: PostCreatorProps) {
  const [content, setContent] = useState("");
  const [attachmentType, setAttachmentType] = useState<"image" | "video" | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setValidationError(null);

    // Real-time malicious content detection
    if (containsMaliciousContent(newContent)) {
      setValidationError("Content contains potentially unsafe characters");
    }
  };

  const handlePost = () => {
    // Validate content
    const validation = validateInput(postContentSchema, content);
    
    if (!validation.success) {
      toast.error(validation.error || "Invalid post content");
      setValidationError(validation.error || null);
      return;
    }

    // Additional security check
    if (containsMaliciousContent(content)) {
      toast.error("Post contains unsafe content");
      setValidationError("Content contains potentially unsafe characters");
      return;
    }

    // Use sanitized data
    const sanitizedContent = validation.data;

    // Simulate post creation with sanitized content
    toast.success("Post created successfully!");
    setContent("");
    setAttachmentType(null);
    setValidationError(null);
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
            <div>
              <Textarea
                placeholder="Share your fitness journey..."
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className={`min-h-[100px] resize-none ${validationError ? "border-red-500" : ""}`}
                maxLength={5000}
              />
              {validationError && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{validationError}</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {content.length}/5000 characters
              </div>
            </div>

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

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image as ImageIcon, Trophy, Send, X, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { validateInput, postContentSchema, containsMaliciousContent } from "@/utils/validation";
import { usePosts } from "@/hooks/use-social";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";

interface PostCreatorProps {
  onPostCreated?: () => void;
}

export function PostCreator({ onPostCreated }: PostCreatorProps) {
  const { user } = useEnhancedAuth();
  const { profile } = useProfile();
  const { createPost } = usePosts();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleContentChange = (v: string) => {
    setContent(v);
    setValidationError(containsMaliciousContent(v) ? "Content contains potentially unsafe characters" : null);
  };

  const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    if (!f.type.startsWith("image/")) { toast.error("Only image files allowed"); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const insertAchievement = () => {
    setContent((c) => (c ? c + " " : "") + "🏆 Just unlocked a new achievement!");
  };

  const handlePost = async () => {
    if (!user) { toast.error("Sign in to post"); return; }
    const validation = validateInput(postContentSchema, content);
    if (!validation.success) {
      toast.error(validation.error || "Invalid post content");
      setValidationError(validation.error || null);
      return;
    }
    if (containsMaliciousContent(content)) { setValidationError("Unsafe content"); return; }

    setUploading(true);
    try {
      let image_url: string | undefined;
      if (imageFile) {
        const path = `posts/${user.id}/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: upErr } = await supabase.storage
          .from("fitusion.data")
          .upload(path, imageFile, { upsert: false, contentType: imageFile.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("fitusion.data").getPublicUrl(path);
        image_url = pub.publicUrl;
      }
      await createPost.mutateAsync({ content: validation.data as string, image_url });
      setContent("");
      clearImage();
      setValidationError(null);
      onPostCreated?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  const displayName = (profile as any)?.display_name || (profile as any)?.full_name || "You";
  const initials = displayName.split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Card className="backdrop-blur-sm bg-card/70 border-border/40">
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={(profile as any)?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
              {initials || "FF"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div>
              <Textarea
                placeholder="Share your fitness journey…"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className={`min-h-[100px] resize-none ${validationError ? "border-red-500" : ""}`}
                maxLength={5000}
              />
              {validationError && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" /><span>{validationError}</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1 text-right">{content.length}/5000</div>
            </div>

            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="rounded-lg max-h-64 w-full object-cover" />
                <Button variant="secondary" size="sm" onClick={clearImage} className="absolute top-2 right-2 h-7 w-7 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <label>
                  <input type="file" accept="image/*" className="hidden" onChange={onSelectImage} />
                  <Button variant="ghost" size="sm" asChild>
                    <span className="cursor-pointer"><ImageIcon className="h-4 w-4 mr-1" />Photo</span>
                  </Button>
                </label>
                <Button variant="ghost" size="sm" onClick={insertAchievement}>
                  <Trophy className="h-4 w-4 mr-1" />Achievement
                </Button>
              </div>
              <Button onClick={handlePost} disabled={!content.trim() || uploading || createPost.isPending}>
                {uploading || createPost.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Posting…</>
                ) : (
                  <><Send className="h-4 w-4 mr-1" />Post</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

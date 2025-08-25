import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Upload, Play, Pause, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadCustomSound } from "@/utils/sound-utils";

interface CustomSoundUploaderProps {
  onSoundUploaded?: (name: string, url: string) => void;
}

export function CustomSoundUploader({
  onSoundUploaded,
}: CustomSoundUploaderProps) {
  const [soundName, setSoundName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an audio file
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an audio file (.mp3, .wav, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Audio file must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !soundName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a sound name and select a file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const url = await uploadCustomSound(
        selectedFile,
        soundName,
        "notification",
      );

      toast({
        title: "Sound uploaded successfully",
        description: `"${soundName}" has been added to your custom sounds`,
      });

      // Clear the form
      setSoundName("");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Notify parent component
      if (onSoundUploaded) {
        onSoundUploaded(soundName, url);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload sound",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleClear = () => {
    setSoundName("");
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="sound-name">Sound Name</Label>
        <Input
          id="sound-name"
          placeholder="Enter a name for your sound"
          value={soundName}
          onChange={(e) => setSoundName(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="sound-file">Sound File</Label>
        <Input
          ref={fileInputRef}
          id="sound-file"
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
        />
        <p className="text-sm text-muted-foreground">
          Select an audio file (MP3, WAV, etc.) up to 2MB
        </p>
      </div>

      {previewUrl && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <span className="text-sm">
            {selectedFile?.name} ({(selectedFile?.size || 0) / 1024} KB)
          </span>
          <audio
            ref={audioRef}
            src={previewUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || !soundName.trim() || isUploading}
          className="flex-1"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Sound
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          disabled={!selectedFile && !soundName}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

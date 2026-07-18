import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
} from "lucide-react";
import { FALLBACK_VIDEO_URLS } from "@/data/workout-videos";

interface WorkoutVideoProps {
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  /** Render the player inline (no card/dialog wrapper) with autoplay. */
  inline?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
}

/**
 * Inline video player – autoplays muted (browser policy safe), shows controls.
 * Handles play/pause, mute, restart, fullscreen, and hides load errors gracefully.
 */
function InlineVideoPlayer({
  title,
  thumbnailUrl,
  videoUrl,
  autoPlay = true,
  loop = false,
}: Pick<WorkoutVideoProps, "title" | "thumbnailUrl" | "videoUrl" | "autoPlay" | "loop">) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Build a de-duped source chain: primary URL first, then fallbacks.
  const sources = useMemo(() => {
    const list = [videoUrl, ...FALLBACK_VIDEO_URLS].filter(
      (u, i, a) => u && a.indexOf(u) === i,
    );
    return list;
  }, [videoUrl]);

  const [sourceIdx, setSourceIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [errored, setErrored] = useState(false);

  // Reset when incoming videoUrl changes
  useEffect(() => {
    setSourceIdx(0);
    setErrored(false);
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (autoPlay) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => setIsPlaying(false));
      }
    }
  }, [sourceIdx, autoPlay]);

  const handleError = () => {
    // Try next fallback in the chain before giving up.
    if (sourceIdx < sources.length - 1) {
      setSourceIdx((i) => i + 1);
    } else {
      setErrored(true);
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => setIsPlaying(false));
    } else {
      v.pause();
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const restart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  const goFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      v.requestFullscreen?.().catch(() => {});
    }
  };

  const retryFromStart = () => {
    setSourceIdx(0);
    setErrored(false);
  };

  if (errored) {
    return (
      <div className="w-full aspect-video bg-muted flex flex-col items-center justify-center text-muted-foreground gap-2">
        <p className="text-sm font-medium">Exercise demo temporarily offline</p>
        <p className="text-xs opacity-60 line-clamp-1">{title}</p>
        <Button size="sm" variant="secondary" onClick={retryFromStart}>
          <RotateCcw className="h-3 w-3 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  const currentSrc = sources[sourceIdx];

  return (
    <div className="relative w-full bg-black group">
      <video
        ref={videoRef}
        key={currentSrc}
        src={currentSrc}
        poster={thumbnailUrl || "/placeholder.svg"}
        className="w-full aspect-video object-contain bg-black"
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        playsInline
        preload="metadata"
        controls
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={handleError}
      />
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-black/60 hover:bg-black/80 text-white border-0"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-black/60 hover:bg-black/80 text-white border-0"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-black/60 hover:bg-black/80 text-white border-0"
          onClick={restart}
          aria-label="Restart"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-black/60 hover:bg-black/80 text-white border-0"
          onClick={goFullscreen}
          aria-label="Fullscreen"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function WorkoutVideo({
  title,
  thumbnailUrl,
  videoUrl,
  duration,
  inline = false,
  autoPlay = true,
  loop = false,
}: WorkoutVideoProps) {
  if (inline) {
    return (
      <InlineVideoPlayer
        title={title}
        thumbnailUrl={thumbnailUrl}
        videoUrl={videoUrl}
        autoPlay={autoPlay}
        loop={loop}
      />
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
          <div className="relative">
            <img
              src={thumbnailUrl || "/placeholder.svg"}
              alt={title}
              className="w-full aspect-video object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="rounded-full bg-primary/90 p-2">
                <Play className="h-6 w-6 text-white" fill="white" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {duration}
            </div>
          </div>
          <CardContent className="p-3">
            <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>
        <InlineVideoPlayer
          title={title}
          thumbnailUrl={thumbnailUrl}
          videoUrl={videoUrl}
          autoPlay
          loop={loop}
        />
      </DialogContent>
    </Dialog>
  );
}

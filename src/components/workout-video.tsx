import React, { useState } from "react";
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
  X,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";

interface WorkoutVideoProps {
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
}

export function WorkoutVideo({
  title,
  thumbnailUrl,
  videoUrl,
  duration,
}: WorkoutVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreenToggle = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message}`,
          );
        });
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const hideControlsTimeout = () => {
    setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
          <div className="relative">
            <img
              src={thumbnailUrl || "/placeholder.svg"}
              alt={title}
              className="w-full aspect-video object-cover"
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

      <DialogContent className="sm:max-w-[600px] p-0">
        <div
          className="relative"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => isPlaying && hideControlsTimeout()}
          onMouseMove={() => {
            setShowControls(true);
            hideControlsTimeout();
          }}
        >
          <video
            ref={videoRef}
            src={
              videoUrl ||
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            }
            poster={thumbnailUrl || "/placeholder.svg"}
            className="w-full aspect-video"
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls
            preload="metadata"
            style={{ maxHeight: "70vh" }}
          />

          {/* Video overlay controls */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <DialogHeader className="absolute top-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-white text-shadow">
                  {title}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-black/20"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.pause();
                    }
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-black/20"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" fill="white" />
                  ) : (
                    <Play className="h-6 w-6" fill="white" />
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-black/20"
                    onClick={handleMuteToggle}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-black/20"
                    onClick={handleFullscreenToggle}
                  >
                    {isFullscreen ? (
                      <Minimize className="h-5 w-5" />
                    ) : (
                      <Maximize className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, Plus, Minus, SkipForward } from "lucide-react";

interface RestTimerProps {
  duration: number; // in seconds
  onComplete: () => void;
  onSkip: () => void;
}

export function RestTimer({ duration, onComplete, onSkip }: RestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    if (timeRemaining <= 0) {
      // Play completion sound
      try {
        const audio = new Audio("/sounds/timer-complete.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (error) {
        console.log("Could not play sound");
      }
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, isPaused, onComplete]);

  const progress = ((duration - timeRemaining) / duration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const addTime = (seconds: number) => {
    setTimeRemaining((prev) => Math.max(0, prev + seconds));
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Timer className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Rest Time</h3>
            <p className="text-sm text-muted-foreground">
              Take a break before your next set
            </p>
          </div>

          <div className="text-center">
            <div className="text-6xl font-bold font-mono mb-4">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => addTime(-15)}
              disabled={timeRemaining <= 15}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPaused(!isPaused)}
              className="min-w-[100px]"
            >
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => addTime(15)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={onSkip}
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip Rest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

interface WorkoutTimerProps {
  initialTime?: number; // Initial time in seconds
  onComplete?: () => void;
}

export function WorkoutTimer({
  initialTime = 60,
  onComplete,
}: WorkoutTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { theme } = useTheme();

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            clearInterval(interval!);
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, onComplete]);

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setTimeRemaining(initialTime);
    setIsActive(false);
    setIsPaused(false);
  };

  // Calculate progress percentage
  const progress = ((initialTime - timeRemaining) / initialTime) * 100;

  return (
    <Card
      className={cn(
        "overflow-hidden",
        theme === "dark" ? "border-primary/30" : "border-primary/20",
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            {/* Progress Circle */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={theme === "dark" ? "#27272a" : "#f4f4f5"}
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                transform="rotate(-90 50 50)"
              />
              {/* Time text */}
              <text
                x="50"
                y="55"
                fontSize="18"
                fontWeight="bold"
                textAnchor="middle"
                fill="currentColor"
              >
                {formatTime(timeRemaining)}
              </text>
            </svg>
          </div>

          <div className="flex gap-2">
            {!isActive ? (
              <Button onClick={startTimer}>
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            ) : isPaused ? (
              <Button onClick={resumeTimer}>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            ) : (
              <Button onClick={pauseTimer}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}

            <Button variant="outline" onClick={resetTimer}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

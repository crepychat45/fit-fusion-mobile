import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX, Maximize, Timer } from "lucide-react";

interface ExerciseVideoPlayerProps {
  exerciseName: string;
  muscleGroups?: string[];
  sets?: number;
  reps?: string;
  onComplete?: () => void;
}

// Map common exercise names to Pexels video placeholders
const getVideoPlaceholder = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes("squat")) return "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=600";
  if (lower.includes("push") || lower.includes("press")) return "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600";
  if (lower.includes("plank") || lower.includes("core")) return "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=600";
  if (lower.includes("lunge")) return "https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg?auto=compress&cs=tinysrgb&w=600";
  if (lower.includes("curl") || lower.includes("bicep")) return "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600";
  if (lower.includes("deadlift") || lower.includes("row")) return "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600";
  return "https://images.pexels.com/photos/4162485/pexels-photo-4162485.jpeg?auto=compress&cs=tinysrgb&w=600";
};

export function ExerciseVideoPlayer({ exerciseName, muscleGroups, sets, reps, onComplete }: ExerciseVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [timer, setTimer] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <Card className="overflow-hidden border-border/50">
      <div className="relative aspect-video bg-black/90 overflow-hidden">
        <img
          src={getVideoPlaceholder(exerciseName)}
          alt={exerciseName}
          className="w-full h-full object-cover opacity-80"
          loading="lazy"
        />
        {/* Overlay controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex flex-col justify-between p-3">
          <div className="flex justify-between items-start">
            <Badge className="bg-red-500/80 text-white border-0 text-xs">
              <motion.div animate={{ opacity: isPlaying ? [1, 0.3, 1] : 1 }} transition={{ duration: 1, repeat: Infinity }}>
                ● DEMO
              </motion.div>
            </Badge>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="bg-black/40 text-white border-white/20 text-xs">
                <Timer className="h-3 w-3 mr-1" />{formatTime(timer)}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-1">{exerciseName}</h4>
            {muscleGroups && (
              <div className="flex gap-1 mb-2">
                {muscleGroups.map(mg => (
                  <Badge key={mg} className="bg-white/20 text-white border-0 text-[10px]">{mg}</Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => { setTimer(0); setCurrentSet(1); }}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setCurrentSet(c => Math.min(c + 1, sets || 4))}>
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20 ml-auto" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {sets && reps && (
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Set {currentSet} of {sets}</span>
            <span className="font-medium">{reps} reps</span>
            {currentSet >= (sets || 1) && (
              <Button size="sm" variant="default" onClick={onComplete} className="text-xs">Complete ✓</Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

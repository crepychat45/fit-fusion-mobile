import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dumbbell, Target, AlertCircle } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  instructions: string;
  muscles: string[];
}

interface ExerciseInstructionModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export function ExerciseInstructionModal({
  exercise,
  onClose,
}: ExerciseInstructionModalProps) {
  const alternatives = [
    "Standard Push-ups (easier)",
    "Diamond Push-ups (harder)",
    "Incline Push-ups (easier)",
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{exercise.name}</DialogTitle>
          <DialogDescription>
            Detailed instructions and form tips
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Exercise Details */}
            <div className="flex flex-wrap gap-2">
              {exercise.muscles.map((muscle) => (
                <Badge key={muscle} variant="secondary">
                  {muscle}
                </Badge>
              ))}
            </div>

            {/* Media Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Dumbbell className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Exercise demonstration video
                </p>
              </div>
            </div>

            {/* Sets & Reps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">{exercise.sets}</p>
                <p className="text-sm text-muted-foreground">Sets</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">
                  {exercise.duration ? `${exercise.duration}s` : exercise.reps}
                </p>
                <p className="text-sm text-muted-foreground">
                  {exercise.duration ? "Duration" : "Reps"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Instructions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Instructions</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {exercise.instructions}
              </p>
            </div>

            <Separator />

            {/* Form Tips */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Form Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Keep your core engaged throughout the movement</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Control the movement - avoid using momentum</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Breathe properly - exhale on exertion</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Maintain proper posture and alignment</span>
                </li>
              </ul>
            </div>

            <Separator />

            {/* Alternative Exercises */}
            <div>
              <h3 className="font-semibold mb-3">Alternative Exercises</h3>
              <div className="space-y-2">
                {alternatives.map((alt, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <p className="text-sm">{alt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

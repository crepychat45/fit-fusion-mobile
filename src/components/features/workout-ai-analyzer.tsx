import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Target,
  Timer,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormAnalysis {
  exercise: string;
  score: number;
  feedback: string[];
  corrections: string[];
  reps: number;
  sets: number;
}

interface WorkoutSession {
  id: string;
  startTime: Date;
  duration: number;
  exercises: FormAnalysis[];
  overallScore: number;
}

export function WorkoutAIAnalyzer() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<string>("");
  const [analysis, setAnalysis] = useState<FormAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const exercises = [
    "Squat", "Deadlift", "Bench Press", "Push-up", "Pull-up", 
    "Plank", "Lunge", "Burpee", "Mountain Climber", "Jumping Jack"
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setIsRecording(true);
      toast({
        title: "Camera Started",
        description: "AI form analysis is now active. Select an exercise to begin.",
      });
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setAnalysis(null);
  };

  const analyzeForm = async (exercise: string) => {
    if (!isRecording) {
      toast({
        title: "Camera Required",
        description: "Please start the camera first to analyze your form.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setCurrentExercise(exercise);

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate realistic analysis results
    const score = Math.floor(Math.random() * 30) + 70; // 70-100 range
    const feedback = generateFeedback(exercise, score);
    const corrections = generateCorrections(exercise, score);

    const newAnalysis: FormAnalysis = {
      exercise,
      score,
      feedback,
      corrections,
      reps: Math.floor(Math.random() * 15) + 5,
      sets: Math.floor(Math.random() * 3) + 1
    };

    setAnalysis(newAnalysis);
    setIsAnalyzing(false);

    // Update workout session
    if (workoutSession) {
      setWorkoutSession(prev => prev ? {
        ...prev,
        exercises: [...prev.exercises, newAnalysis],
        overallScore: Math.round((prev.overallScore + score) / 2)
      } : null);
    } else {
      setWorkoutSession({
        id: Date.now().toString(),
        startTime: new Date(),
        duration: 0,
        exercises: [newAnalysis],
        overallScore: score
      });
    }

    toast({
      title: "Analysis Complete",
      description: `Form analysis for ${exercise} completed with ${score}% accuracy.`,
    });
  };

  const generateFeedback = (exercise: string, score: number): string[] => {
    const commonFeedback = {
      squat: [
        "Good depth achieved",
        "Knees tracking well over toes",
        "Core engagement maintained",
        "Chest position looks good"
      ],
      deadlift: [
        "Strong hip hinge movement",
        "Bar path staying close to body",
        "Neutral spine maintained",
        "Good lockout position"
      ],
      pushup: [
        "Full range of motion achieved",
        "Body alignment maintained",
        "Controlled descent",
        "Strong push-off"
      ]
    };

    const exerciseKey = exercise.toLowerCase().replace(/[-\s]/g, '');
    const baseFeedback = commonFeedback[exerciseKey as keyof typeof commonFeedback] || [
      "Good form overall",
      "Consistent movement pattern",
      "Proper range of motion",
      "Nice control throughout"
    ];

    return score >= 85 
      ? baseFeedback
      : baseFeedback.slice(0, 2).concat(["Room for improvement in technique", "Focus on control"]);
  };

  const generateCorrections = (exercise: string, score: number): string[] => {
    if (score >= 85) return ["Excellent form! Keep it up!"];

    const corrections = {
      squat: [
        "Try to sit back more into your hips",
        "Keep your chest up throughout the movement",
        "Ensure knees don't cave inward"
      ],
      deadlift: [
        "Keep the bar closer to your body",
        "Drive through your heels",
        "Maintain neutral spine position"
      ],
      pushup: [
        "Lower your body as one unit",
        "Don't let hips sag",
        "Push up with control"
      ]
    };

    const exerciseKey = exercise.toLowerCase().replace(/[-\s]/g, '');
    return corrections[exerciseKey as keyof typeof corrections] || [
      "Focus on slower, controlled movements",
      "Maintain proper alignment",
      "Practice the movement pattern"
    ];
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    return "Needs Work";
  };

  return (
    <div className="space-y-6">
      {/* Camera Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            AI Form Analysis Camera
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {!isRecording && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Button onClick={startCamera} size="lg">
                  <Camera className="h-5 w-5 mr-2" />
                  Start Camera
                </Button>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center text-white">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mx-auto mb-2"
                  >
                    <Activity className="h-8 w-8" />
                  </motion.div>
                  <p>Analyzing {currentExercise} form...</p>
                </div>
              </div>
            )}

            {isRecording && !isAnalyzing && (
              <div className="absolute top-4 right-4">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  REC
                </Badge>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              {isRecording ? (
                <Button onClick={stopCamera} variant="destructive">
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Camera
                </Button>
              ) : (
                <Button onClick={startCamera}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              )}
            </div>
            
            {workoutSession && (
              <div className="text-sm text-muted-foreground">
                <Timer className="h-4 w-4 inline mr-1" />
                Workout Session Active
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select Exercise to Analyze
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {exercises.map((exercise) => (
              <Button
                key={exercise}
                variant={currentExercise === exercise ? "default" : "outline"}
                size="sm"
                onClick={() => analyzeForm(exercise)}
                disabled={!isRecording || isAnalyzing}
                className="text-xs"
              >
                {exercise}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Form Analysis: {analysis.exercise}
                </span>
                <Badge variant={analysis.score >= 75 ? "default" : "secondary"}>
                  {getScoreBadge(analysis.score)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}%
                  </div>
                  <div className="text-sm text-muted-foreground">Form Score</div>
                </div>
                <div className="flex-1">
                  <Progress value={analysis.score} className="h-3" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{analysis.reps}</div>
                  <div className="text-sm text-muted-foreground">Reps</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    What You Did Well
                  </h4>
                  <ul className="space-y-1">
                    {analysis.feedback.map((item, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start gap-1">
                        <span className="text-green-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-1">
                    {analysis.corrections.map((item, index) => (
                      <li key={index} className="text-sm text-orange-700 flex items-start gap-1">
                        <span className="text-orange-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Workout Session Summary */}
      {workoutSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Workout Session Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {workoutSession.exercises.length}
                </div>
                <div className="text-sm text-muted-foreground">Exercises</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(workoutSession.overallScore)}`}>
                  {workoutSession.overallScore}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {workoutSession.exercises.reduce((sum, ex) => sum + ex.reps, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Reps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.floor((Date.now() - workoutSession.startTime.getTime()) / 60000)}m
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>

            <div className="space-y-2">
              {workoutSession.exercises.map((exercise, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="font-medium">{exercise.exercise}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{exercise.reps} reps</span>
                    <Badge variant={exercise.score >= 75 ? "default" : "secondary"}>
                      {exercise.score}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
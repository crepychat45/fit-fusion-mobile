import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Brain,
  Send,
  Sparkles,
  TrendingUp,
  Target,
  Heart,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIWorkoutCoach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "👋 Hi! I'm your AI Workout Coach. I can help you create personalized workout plans, provide form tips, suggest exercises, and answer your fitness questions. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const quickPrompts = [
    { icon: Target, text: "Create a workout plan", color: "text-blue-500" },
    { icon: Heart, text: "Improve cardio endurance", color: "text-red-500" },
    { icon: Zap, text: "Build muscle mass", color: "text-orange-500" },
    { icon: TrendingUp, text: "Lose weight safely", color: "text-green-500" },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("workout plan") || lowerQuery.includes("routine")) {
      return `🎯 Based on your goals, I recommend a balanced 4-day split:

**Day 1: Upper Body Push**
- Bench Press: 4 sets × 8-10 reps
- Overhead Press: 3 sets × 10-12 reps
- Dips: 3 sets × 12-15 reps
- Tricep Extensions: 3 sets × 12-15 reps

**Day 2: Lower Body**
- Squats: 4 sets × 8-10 reps
- Romanian Deadlifts: 3 sets × 10-12 reps
- Leg Press: 3 sets × 12-15 reps
- Calf Raises: 4 sets × 15-20 reps

**Day 3: Rest or Active Recovery**

**Day 4: Upper Body Pull**
- Pull-ups: 4 sets × 8-10 reps
- Barbell Rows: 3 sets × 10-12 reps
- Face Pulls: 3 sets × 15-20 reps
- Bicep Curls: 3 sets × 12-15 reps

**Day 5: Full Body or HIIT**
- Circuit training with compound movements

Would you like me to customize this further based on your equipment or specific goals?`;
    }

    if (lowerQuery.includes("cardio") || lowerQuery.includes("endurance")) {
      return `🏃‍♂️ Here's a progressive cardio plan to improve endurance:

**Week 1-2: Foundation**
- 20-30 min steady-state cardio, 3x/week
- Target: 60-70% max heart rate

**Week 3-4: Building**
- 30-40 min sessions, 4x/week
- Add one interval session (1 min hard, 2 min easy)

**Week 5-6: Progress**
- 40-50 min sessions
- Two interval sessions per week
- Include hill work or incline training

**Week 7-8: Peak**
- 50-60 min long runs
- HIIT sessions 2x/week
- Cross-training to prevent injury

Track your resting heart rate weekly - it should gradually decrease as fitness improves!`;
    }

    if (lowerQuery.includes("muscle") || lowerQuery.includes("bulk")) {
      return `💪 To build muscle effectively, focus on these key principles:

**Training:**
- Progressive overload: Gradually increase weight/reps
- Compound exercises: Squats, deadlifts, bench press
- Volume: 10-20 sets per muscle group/week
- Rest: 48-72 hours between training same muscle

**Nutrition:**
- Caloric surplus: +300-500 calories/day
- Protein: 1.6-2.2g per kg body weight
- Carbs: 4-6g per kg for energy
- Healthy fats: 0.8-1g per kg

**Recovery:**
- 7-9 hours sleep nightly
- Stay hydrated
- Manage stress levels
- Deload every 4-6 weeks

Would you like a specific muscle-building workout plan?`;
    }

    if (lowerQuery.includes("weight") || lowerQuery.includes("fat loss")) {
      return `🎯 Safe and effective weight loss approach:

**Nutrition (Most Important):**
- Caloric deficit: 300-500 calories/day
- High protein: Preserves muscle mass
- Don't eliminate food groups
- Stay hydrated: 2-3L water daily
- Track your intake consistently

**Exercise:**
- Resistance training: 3-4x/week (maintains muscle)
- Cardio: 2-3x/week, 30-45 min
- NEAT: Increase daily movement
- Recovery days: Essential for progress

**Realistic Goals:**
- 0.5-1 kg per week is sustainable
- Focus on body composition, not just scale
- Take progress photos monthly
- Measure waist circumference

**Mindset:**
- This is a lifestyle change, not a quick fix
- Consistency beats perfection
- Celebrate non-scale victories

Ready to create your personalized plan?`;
    }

    return `I understand you're asking about "${query}". I'm here to help with:

✅ Creating custom workout plans
✅ Exercise form and technique
✅ Nutrition advice for your goals
✅ Recovery and injury prevention
✅ Progress tracking strategies
✅ Motivation and consistency tips

Could you provide more details about what you'd like to know? The more specific you are, the better I can help!`;
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">AI Workout Coach</h3>
            <p className="text-xs text-muted-foreground font-normal">
              Your personal AI fitness assistant
            </p>
          </div>
          <Badge
            variant="outline"
            className="ml-auto bg-green-50 text-green-700 border-green-200"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "bg-muted"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">
                      AI Coach
                    </span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${message.role === "user" ? "text-white/70" : "text-muted-foreground"}`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt(prompt.text)}
                className="justify-start"
              >
                <prompt.icon className={`h-4 w-4 mr-2 ${prompt.color}`} />
                <span className="text-xs">{prompt.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything about fitness, workouts, or nutrition..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px] bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quote, RefreshCw, Heart, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const motivationalQuotes = [
  {
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown",
    category: "Motivation",
  },
  {
    text: "Strong people don't put others down. They lift them up.",
    author: "Michael P. Watson",
    category: "Strength",
  },
  {
    text: "Success isn't given. It's earned in the gym.",
    author: "Unknown",
    category: "Success",
  },
  {
    text: "Your body can do it. It's your mind you need to convince.",
    author: "Unknown",
    category: "Mindset",
  },
  {
    text: "Progress, not perfection, is the goal.",
    author: "Unknown",
    category: "Progress",
  },
];

export function MotivationalQuotes() {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setCurrentQuote(motivationalQuotes[randomIndex]);
    setIsLiked(false);
  };

  useEffect(() => {
    // Auto-rotate quotes every 30 seconds
    const interval = setInterval(() => {
      getRandomQuote();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      toast({
        title: "Quote Saved!",
        description: "Added to your favorites.",
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Motivational Quote",
        text: `"${currentQuote.text}" - ${currentQuote.author}`,
      });
    } else {
      toast({
        title: "Quote Copied!",
        description: "Copied to clipboard.",
      });
    }
  };

  return (
    <Card className="h-full bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Quote className="h-4 w-4 text-primary" />
          Daily Motivation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote.text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <blockquote className="text-sm font-medium leading-relaxed text-center">
              "{currentQuote.text}"
            </blockquote>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                — {currentQuote.author}
              </p>
              <Badge variant="outline" className="mt-2 text-xs">
                {currentQuote.category}
              </Badge>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLike}
            className={`h-8 px-2 ${isLiked ? "text-red-500" : ""}`}
          >
            <Heart className={`h-3 w-3 ${isLiked ? "fill-current" : ""}`} />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={getRandomQuote}
            className="h-8 px-2"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleShare}
            className="h-8 px-2"
          >
            <Share className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

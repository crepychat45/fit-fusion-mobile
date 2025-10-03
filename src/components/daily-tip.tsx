import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DailyTipProps {
  day?: number; // 0-6 for days of the week (Sunday is 0)
}

const tips = [
  {
    day: 0, // Sunday
    title: "Recovery Day",
    content:
      "Allow your body to recover. Active recovery like walking or gentle yoga can help reduce muscle soreness.",
    image: "/images/tips/recovery-day.jpg",
  },
  {
    day: 1, // Monday
    title: "Hydration Matters",
    content:
      "Drink water before, during, and after exercise to maintain energy levels and prevent cramping.",
    image: "/images/tips/hydration.jpg",
  },
  {
    day: 2, // Tuesday
    title: "Protein Intake",
    content:
      "Consume protein within 30 minutes after your workout to help muscle recovery and growth.",
    image: "/images/tips/protein.jpg",
  },
  {
    day: 3, // Wednesday
    title: "Proper Form",
    content:
      "Focus on proper form rather than lifting heavier weights. This prevents injuries and ensures the right muscles are worked.",
    image: "/images/tips/proper-form.jpg",
  },
  {
    day: 4, // Thursday
    title: "Rest Between Sets",
    content:
      "Take 60-90 seconds rest between strength training sets for optimal recovery and performance.",
    image: "/images/tips/rest-sets.jpg",
  },
  {
    day: 5, // Friday
    title: "Stretching",
    content:
      "Incorporate dynamic stretches before workouts and static stretches afterward to improve flexibility and reduce injury risk.",
    image: "/images/tips/stretching.jpg",
  },
  {
    day: 6, // Saturday
    title: "Mix It Up",
    content:
      "Vary your workout routine to prevent plateaus and keep your body challenged. Try a new exercise this weekend!",
    image: "/images/tips/mix-workouts.jpg",
  },
];

// Fallback images in case the custom images aren't available
const fallbackImages = {
  0: "/placeholder.svg",
  1: "/placeholder.svg",
  2: "/placeholder.svg",
  3: "/placeholder.svg",
  4: "/placeholder.svg",
  5: "/placeholder.svg",
  6: "/placeholder.svg",
};

export function DailyTip({ day }: DailyTipProps) {
  // Get current day of week if none provided
  const currentDay = day !== undefined ? day : new Date().getDay();
  const tip = tips[currentDay];

  // Image error handling
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src =
      fallbackImages[currentDay as keyof typeof fallbackImages];
  };

  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Fitness Tip of the Day</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-1/3 mb-3 md:mb-0">
            <img
              src={
                tip.image ||
                fallbackImages[currentDay as keyof typeof fallbackImages]
              }
              alt={tip.title}
              className="w-full h-32 object-cover rounded-md"
              onError={handleImageError}
            />
          </div>
          <div className="w-full md:w-2/3">
            <h3 className="font-medium text-sm mb-1">{tip.title}</h3>
            <p className="text-sm text-muted-foreground">{tip.content}</p>
            <div className="text-xs text-muted-foreground mt-2">
              {format(new Date(), "EEEE, MMMM d")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

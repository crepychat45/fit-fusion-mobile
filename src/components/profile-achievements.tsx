import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { achievements } from "@/data/achievements";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export function ProfileAchievements() {
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(
    null,
  );
  const { toast } = useToast();

  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((earnedCount / totalCount) * 100);

  const handleAchievementClick = (index: number) => {
    setSelectedAchievement(selectedAchievement === index ? null : index);

    // Show toast only when opening a new achievement, not when closing
    if (selectedAchievement !== index) {
      const achievement = achievements[index];
      if (achievement.earned) {
        toast({
          title: `${achievement.title} - Earned!`,
          description: `${achievement.description} - Earned on April 8, 2025`,
        });
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Achievements</h3>
        <Badge variant="outline" className="bg-primary/10 text-primary">
          {earnedCount}/{totalCount} Earned
        </Badge>
      </div>

      <div className="relative w-full bg-muted/30 h-2 rounded-full overflow-hidden">
        <motion.div
          className="bg-primary h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={containerVariants}
      >
        {achievements.map((achievement, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAchievementClick(index)}
            layout
          >
            <Card
              className={`${
                achievement.earned
                  ? "border-primary/30 shadow-sm"
                  : "border-muted/50 opacity-70"
              } ${
                selectedAchievement === index
                  ? "ring-2 ring-primary/20 shadow-md"
                  : ""
              } transition-all hover:shadow-md cursor-pointer`}
            >
              <CardContent className="p-3 flex flex-col items-center text-center">
                <motion.div
                  className={`rounded-full p-2.5 mb-2 ${
                    achievement.earned
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/10 text-muted-foreground"
                  }`}
                  whileHover={{
                    scale: achievement.earned ? 1.1 : 1.05,
                    rotate: achievement.earned ? [0, -5, 5, -5, 5, 0] : 0,
                    transition: {
                      duration: achievement.earned ? 0.5 : 0.2,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <achievement.icon className="h-5 w-5" />
                </motion.div>
                <h4 className="text-sm font-medium">
                  {achievement.title}
                  {achievement.earned && (
                    <span className="ml-1 inline-flex">
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        ✓
                      </motion.span>
                    </span>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {achievement.description}
                </p>

                <AnimatePresence>
                  {selectedAchievement === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 pt-2 border-t border-muted/30 w-full"
                    >
                      <p className="text-xs">
                        {achievement.earned
                          ? "Earned on April 8, 2025"
                          : "Keep training to unlock this achievement!"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

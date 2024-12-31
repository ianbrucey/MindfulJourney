import { Award, Medal, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import type { SelectAchievement, SelectUserAchievement } from "@db/schema";

interface AchievementsListProps {
  achievements: SelectAchievement[];
  unlockedAchievements: SelectUserAchievement[];
}

const achievementIcons = {
  Award,
  Medal,
  Trophy,
};

const achievementVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  },
  unlocked: {
    scale: [1, 1.2, 1],
    opacity: 1,
    transition: {
      duration: 0.5,
      times: [0, 0.5, 1]
    }
  }
};

const glowAnimation = {
  initial: { boxShadow: "0 0 0 0px rgba(var(--primary), 0.2)" },
  animate: {
    boxShadow: [
      "0 0 0 0px rgba(var(--primary), 0.2)",
      "0 0 0 4px rgba(var(--primary), 0.2)",
      "0 0 0 0px rgba(var(--primary), 0.2)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

export default function AchievementsList({
  achievements,
  unlockedAchievements
}: AchievementsListProps) {
  const unlockedIds = new Set(unlockedAchievements.map(ua => ua.achievementId));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="grid grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {achievements.map((achievement) => {
            const Icon = achievementIcons[achievement.icon as keyof typeof achievementIcons] || Trophy;
            const isUnlocked = unlockedIds.has(achievement.id);

            return (
              <TooltipProvider key={achievement.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={achievementVariants}
                      animate={isUnlocked ? "unlocked" : "visible"}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        isUnlocked
                          ? "bg-primary/10 hover:bg-primary/20"
                          : "bg-muted/50 opacity-50 grayscale hover:opacity-60"
                      }`}
                    >
                      {isUnlocked && (
                        <motion.div
                          className="absolute inset-0 rounded-lg"
                          initial="initial"
                          animate="animate"
                          variants={glowAnimation}
                        />
                      )}
                      <Icon className={`h-8 w-8 mb-2 ${
                        isUnlocked ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <p className="text-xs font-medium text-center">
                        {achievement.name}
                      </p>
                      {achievement.level > 1 && (
                        <span className="absolute top-1 right-1 bg-primary/20 text-primary text-xs px-1.5 rounded-full">
                          Lvl {achievement.level}
                        </span>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="font-medium">{achievement.description}</p>
                    {!isUnlocked && (
                      <p className="text-sm text-muted-foreground mt-1 font-normal">
                        🎯 {achievement.requirement}
                      </p>
                    )}
                    {isUnlocked && (
                      <p className="text-sm text-primary mt-1">
                        ✨ Achievement unlocked!
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}
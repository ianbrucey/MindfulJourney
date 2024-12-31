import { Award, Medal, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
        <div className="grid grid-cols-4 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievementIcons[achievement.icon as keyof typeof achievementIcons] || Trophy;
            const isUnlocked = unlockedIds.has(achievement.id);

            return (
              <TooltipProvider key={achievement.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                        isUnlocked
                          ? "bg-primary/10"
                          : "bg-muted/50 opacity-50 grayscale"
                      }`}
                    >
                      <Icon className={`h-8 w-8 ${
                        isUnlocked ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <p className="text-xs mt-2 text-center font-medium">
                        {achievement.name}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{achievement.description}</p>
                    {!isUnlocked && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.requirement}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

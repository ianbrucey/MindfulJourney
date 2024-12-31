import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  const nextMilestone = Math.ceil(currentStreak / 5) * 5;
  const progress = (currentStreak % 5) * 20;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary animate-pulse" />
          Mindfulness Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-3xl font-bold">{currentStreak}</p>
            <p className="text-sm text-muted-foreground">days in a row</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Best Streak</p>
            <p className="text-xl font-semibold">{longestStreak} days</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to next milestone</span>
            <span>{nextMilestone} days</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

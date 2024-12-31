import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trophy, Award, Brain, Heart, Zap } from "lucide-react";
import { useDailyChallenges } from "@/hooks/use-daily-challenges";
import { Progress } from "@/components/ui/progress";

const categoryIcons = {
  meditation: Brain,
  exercise: Zap,
  mindfulness: Heart,
  gratitude: Trophy,
  creativity: Award,
  social: Trophy,
} as const;

export default function DailyChallenge() {
  const [isOpen, setIsOpen] = useState(false);
  const [reflection, setReflection] = useState("");
  const { todayChallenge, isLoadingToday, completeChallenge } = useDailyChallenges();

  if (isLoadingToday) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!todayChallenge) {
    return null;
  }

  const Icon = categoryIcons[todayChallenge.category as keyof typeof categoryIcons] || Trophy;

  const handleComplete = async () => {
    await completeChallenge({
      id: todayChallenge.id,
      reflectionNote: reflection.trim() || undefined,
    });
    setReflection("");
    setIsOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          Daily Wellness Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/5 rounded-lg p-4">
          <p className="text-lg font-medium">{todayChallenge.challenge}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              {todayChallenge.category}
            </span>
            <span className="px-2 py-1 bg-primary/10 rounded-full">
              {todayChallenge.difficulty}
            </span>
          </div>
        </div>

        {todayChallenge.completed ? (
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Trophy className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-lg font-medium">Challenge Completed!</p>
            {todayChallenge.reflectionNote && (
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <p className="text-sm italic">"{todayChallenge.reflectionNote}"</p>
              </div>
            )}
          </div>
        ) : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Complete Challenge</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Complete Today's Challenge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts about completing this challenge... (optional)"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleComplete} className="w-full">
                  Mark as Complete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

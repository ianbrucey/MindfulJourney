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
import { Loader2, Trophy, Award, Brain, Heart, Zap, Star } from "lucide-react";
import { useDailyChallenges } from "@/hooks/use-daily-challenges";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

const categoryIcons = {
  meditation: Brain,
  exercise: Zap,
  mindfulness: Heart,
  gratitude: Trophy,
  creativity: Award,
  social: Trophy,
} as const;

const difficultyColors = {
  easy: "text-green-500",
  medium: "text-yellow-500",
  hard: "text-red-500",
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
  const difficultyColor = difficultyColors[todayChallenge.difficulty as keyof typeof difficultyColors] || "text-primary";

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
        <motion.div 
          className="bg-primary/5 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-lg font-medium">{todayChallenge.challenge}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Icon className="h-4 w-4" />
              {todayChallenge.category}
            </span>
            <span className={`px-2 py-1 bg-primary/10 rounded-full ${difficultyColor}`}>
              {todayChallenge.difficulty}
              {Array.from({ length: todayChallenge.difficulty === "easy" ? 1 : todayChallenge.difficulty === "medium" ? 2 : 3 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 inline ml-0.5" />
              ))}
            </span>
          </div>
        </motion.div>

        {todayChallenge.completed ? (
          <motion.div 
            className="text-center space-y-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
          >
            <motion.div 
              className="flex justify-center"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360, 360]
              }}
              transition={{ 
                duration: 1.5,
                ease: "easeOut",
                times: [0, 0.5, 1]
              }}
            >
              <Trophy className="h-12 w-12 text-primary" />
            </motion.div>
            <motion.p 
              className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              animate={{ 
                opacity: [0, 1],
                y: [20, 0]
              }}
              transition={{ delay: 0.5 }}
            >
              Challenge Completed!
            </motion.p>
            {todayChallenge.reflectionNote && (
              <motion.div 
                className="bg-muted/50 rounded-lg p-4 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-sm italic">"{todayChallenge.reflectionNote}"</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full">Complete Challenge</Button>
              </motion.div>
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
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={handleComplete} className="w-full">
                    Mark as Complete
                  </Button>
                </motion.div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {!todayChallenge.completed && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">0/1</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
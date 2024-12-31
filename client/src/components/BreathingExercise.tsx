import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wind, PauseCircle, PlayCircle } from "lucide-react";

interface BreathingExerciseProps {
  onComplete: () => void;
}

export default function BreathingExercise({ onComplete }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [progress, setProgress] = useState(0);
  const [cycles, setCycles] = useState(0);

  const TOTAL_CYCLES = 3;
  const DURATIONS = {
    inhale: 4000,
    hold: 4000,
    exhale: 4000,
    rest: 2000,
  };

  useEffect(() => {
    if (!isActive) return;

    let timer: NodeJS.Timeout;
    const duration = DURATIONS[phase];
    let startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / duration) * 100;

      if (newProgress >= 100) {
        let nextPhase: typeof phase = "inhale"; // Corrected initialization
        switch (phase) {
          case "inhale":
            nextPhase = "hold";
            break;
          case "hold":
            nextPhase = "exhale";
            break;
          case "exhale":
            nextPhase = "rest";
            break;
          case "rest":
            nextPhase = "inhale";
            if (cycles + 1 >= TOTAL_CYCLES) {
              setIsActive(false);
              onComplete();
              return;
            }
            setCycles(c => c + 1);
            break;
        }
        setPhase(nextPhase);
        startTime = Date.now();
        setProgress(0);
      } else {
        setProgress(newProgress);
        timer = setTimeout(updateProgress, 16);
      }
    };

    timer = setTimeout(updateProgress, 16);
    return () => clearTimeout(timer);
  }, [isActive, phase, cycles, onComplete]);

  const getInstructions = () => {
    switch (phase) {
      case "inhale":
        return "Breathe in...";
      case "hold":
        return "Hold...";
      case "exhale":
        return "Breathe out...";
      case "rest":
        return "Rest...";
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5" />
          Breathing Exercise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-2xl font-medium mb-2">
            {isActive ? getInstructions() : "Ready to begin?"}
          </p>
          <p className="text-sm text-muted-foreground">
            Cycle {cycles + 1} of {TOTAL_CYCLES}
          </p>
        </div>

        <div className="relative h-40 flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: phase === "inhale" ? 1.2 : 
                     phase === "exhale" ? 0.8 : 
                     1
            }}
            transition={{ duration: DURATIONS[phase] / 1000 }}
            className="w-32 h-32 bg-primary/20 rounded-full"
          />
        </div>

        <Progress value={progress} className="h-2" />

        <Button
          onClick={() => setIsActive(!isActive)}
          className="w-full"
          variant={isActive ? "destructive" : "default"}
        >
          {isActive ? (
            <>
              <PauseCircle className="h-4 w-4 mr-2" />
              Stop Exercise
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Exercise
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
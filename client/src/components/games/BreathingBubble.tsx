import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Wind } from "lucide-react";

export default function BreathingBubble() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const cycleTime = 8000; // 8 seconds per complete breath cycle

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPhase((current) => {
        switch (current) {
          case "inhale":
            return "hold";
          case "hold":
            return "exhale";
          case "exhale":
            return "inhale";
          default:
            return "inhale";
        }
      });
    }, cycleTime / 3);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const getMessage = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-primary" />
          Breathing Exercise
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center min-h-[400px] relative">
        <AnimatePresence mode="wait">
          {isPlaying && (
            <motion.div
              key={phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-xl font-medium text-center mb-8"
            >
              {getMessage()}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <motion.div
            animate={{
              scale: isPlaying
                ? phase === "inhale"
                  ? 1.5
                  : phase === "hold"
                  ? 1.5
                  : 1
                : 1,
            }}
            transition={{
              duration: cycleTime / 3000,
              ease: "easeInOut",
            }}
            className="w-32 h-32 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: isPlaying
                  ? phase === "inhale"
                    ? 1.5
                    : phase === "hold"
                    ? 1.5
                    : 1
                  : 1,
              }}
              transition={{
                duration: cycleTime / 3000,
                ease: "easeInOut",
              }}
              className="w-24 h-24 rounded-full bg-primary/30 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                animate={{
                  scale: isPlaying
                    ? phase === "inhale"
                      ? 1.5
                      : phase === "hold"
                      ? 1.5
                      : 1
                    : 1,
                }}
                transition={{
                  duration: cycleTime / 3000,
                  ease: "easeInOut",
                }}
                className="w-16 h-16 rounded-full bg-primary/40 backdrop-blur-sm"
              />
            </motion.div>
          </motion.div>
        </div>

        <Button
          variant="outline"
          size="lg"
          className="mt-8"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Start
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

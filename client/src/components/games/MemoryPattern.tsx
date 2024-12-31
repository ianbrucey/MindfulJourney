import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PATTERN_SIZE = 9;
const DISPLAY_TIME = 1000;
const PAUSE_TIME = 300;

export default function MemoryPattern() {
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerPattern, setPlayerPattern] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const generatePattern = () => {
    setIsPlaying(true);
    setIsDisplaying(true);
    const newPattern = Array.from(
      { length: Math.min(3 + Math.floor(score / 2), 7) },
      () => Math.floor(Math.random() * PATTERN_SIZE)
    );
    setPattern(newPattern);
    setPlayerPattern([]);

    // Display pattern
    setTimeout(() => {
      setIsDisplaying(false);
    }, DISPLAY_TIME * (newPattern.length + 1));
  };

  const handleTileClick = (index: number) => {
    if (isDisplaying || !isPlaying) return;

    const newPlayerPattern = [...playerPattern, index];
    setPlayerPattern(newPlayerPattern);

    // Check if the move is correct
    if (pattern[playerPattern.length] !== index) {
      setIsPlaying(false);
      setBestScore(Math.max(score, bestScore));
      setScore(0);
      return;
    }

    // Check if pattern is complete
    if (newPlayerPattern.length === pattern.length) {
      setScore(score + 1);
      setTimeout(() => {
        generatePattern();
      }, PAUSE_TIME);
    }
  };

  const startGame = () => {
    setScore(0);
    generatePattern();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Memory Pattern
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Watch the pattern and repeat it. The pattern gets longer as you progress.
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm">
            Score: <span className="font-bold">{score}</span>
          </div>
          <div className="text-sm">
            Best: <span className="font-bold">{bestScore}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 aspect-square">
          {Array.from({ length: PATTERN_SIZE }).map((_, index) => {
            const isActive =
              isDisplaying && pattern.includes(index) && !playerPattern.includes(index);
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`rounded-lg transition-colors duration-300 ${
                  isActive
                    ? "bg-primary"
                    : "bg-accent hover:bg-accent/80"
                }`}
                onClick={() => handleTileClick(index)}
                disabled={isDisplaying || !isPlaying}
              />
            );
          })}
        </div>

        <Button
          className="w-full"
          onClick={startGame}
          disabled={isDisplaying}
        >
          {isPlaying ? (
            <>
              <Pause className="mr-2 h-4 w-4" /> Reset Game
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Start Game
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

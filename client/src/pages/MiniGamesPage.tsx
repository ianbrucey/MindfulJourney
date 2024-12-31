import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Gamepad2, Wind, Palette, Brain } from "lucide-react";
import BreathingBubble from "@/components/games/BreathingBubble";
import ColorTherapy from "@/components/games/ColorTherapy";
import MemoryPattern from "@/components/games/MemoryPattern";

type Game = "breathing" | "color" | "memory" | null;

export default function MiniGamesPage() {
  const [activeGame, setActiveGame] = useState<Game>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedContainer>
        <h1 className="text-4xl font-bold text-foreground/90 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-8">
          Relaxation Games
        </h1>
      </AnimatedContainer>

      {!activeGame ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedContainer delay={0.1}>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => setActiveGame("breathing")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-primary" />
                  Breathing Bubble
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Follow the expanding and contracting bubble to practice deep breathing exercises.
                </p>
              </CardContent>
            </Card>
          </AnimatedContainer>

          <AnimatedContainer delay={0.2}>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => setActiveGame("color")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Color Therapy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create calming color patterns and explore chromotherapy.
                </p>
              </CardContent>
            </Card>
          </AnimatedContainer>

          <AnimatedContainer delay={0.3}>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => setActiveGame("memory")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Memory Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Improve focus and memory with this relaxing pattern matching game.
                </p>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatedContainer>
            <Button
              variant="outline"
              onClick={() => setActiveGame(null)}
              className="mb-6"
            >
              ← Back to Games
            </Button>
          </AnimatedContainer>

          <AnimatedContainer delay={0.1}>
            {activeGame === "breathing" && <BreathingBubble />}
            {activeGame === "color" && <ColorTherapy />}
            {activeGame === "memory" && <MemoryPattern />}
          </AnimatedContainer>
        </div>
      )}
    </div>
  );
}

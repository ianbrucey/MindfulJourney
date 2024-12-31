import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AmbientSoundLibrary from "@/components/AmbientSoundLibrary";
import GuidedMeditation from "@/components/GuidedMeditation";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Brain } from "lucide-react";

export default function MeditationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedContainer>
        <h1 className="text-4xl font-bold text-foreground/90 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-8">
          Meditation & Sound
        </h1>
      </AnimatedContainer>

      <div className="space-y-6">
        <AnimatedContainer delay={0.1}>
          <GuidedMeditation />
        </AnimatedContainer>

        <AnimatedContainer delay={0.2}>
          <AmbientSoundLibrary />
        </AnimatedContainer>

        <AnimatedContainer delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                More meditation and mindfulness features are on the way. Stay tuned!
              </p>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}

import DeepWorkGuide from "@/components/DeepWorkGuide";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Zap } from "lucide-react";

export default function ProductivityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedContainer>
        <h1 className="text-4xl font-bold text-foreground/90 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-8">
          Focus & Productivity
        </h1>
      </AnimatedContainer>

      <div className="space-y-6">
        <AnimatedContainer delay={0.1}>
          <DeepWorkGuide />
        </AnimatedContainer>
      </div>
    </div>
  );
}

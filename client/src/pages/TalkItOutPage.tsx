import { AnimatedContainer } from "@/components/ui/animated-container";
import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiAssistantButton } from "@sista/ai-assistant-react";

export default function TalkItOutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedContainer>
        <h1 className="text-4xl font-bold text-foreground/90 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-8">
          Talk It Out
        </h1>
      </AnimatedContainer>

      <AnimatedContainer delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Interactive Conversation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Welcome to Talk It Out - your safe space for meaningful conversations. This interactive tool is designed to help you express your thoughts and feelings freely while receiving thoughtful, supportive feedback. Share what's on your mind, and let's work through it together.
            </p>
            <div className="flex justify-center">
              <AiAssistantButton />
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
}
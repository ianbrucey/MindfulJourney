import { AnimatedContainer } from "@/components/ui/animated-container";
import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAiAssistant } from "@/lib/ai-context";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function TalkItOutPage() {
  const { sendMessage, isLoading } = useAiAssistant();
  const [userMessage, setUserMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    try {
      const response = await sendMessage(userMessage);
      setAiResponse(response);
      setUserMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

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

            {aiResponse && (
              <Card className="bg-secondary/10">
                <CardContent className="pt-6">
                  <p className="text-sm">{aiResponse}</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <Textarea
                placeholder="Type your message here..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="min-h-[100px]"
              />
              <Button 
                onClick={handleSendMessage} 
                className="w-full"
                disabled={isLoading || !userMessage.trim()}
              >
                {isLoading ? "Thinking..." : "Send Message"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
}
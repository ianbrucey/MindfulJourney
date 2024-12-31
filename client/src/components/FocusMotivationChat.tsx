import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FocusMotivationChatProps {
  currentTask: string;
  sessionDuration: number;
  elapsedTime: number;
  isRunning: boolean;
}

export default function FocusMotivationChat({
  currentTask,
  sessionDuration,
  elapsedTime,
  isRunning,
}: FocusMotivationChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: async ({ message, context }: { message: string, context: any }) => {
      const response = await fetch("/api/focus-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      return data.message;
    },
    onSuccess: (response) => {
      const newMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !isRunning) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const context = {
      currentTask,
      sessionDuration,
      elapsedTime,
      previousMessages: messages.map(({ role, content }) => ({ role, content })),
    };

    chatMutation.mutate({ message: input, context });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Focus Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-[300px] pr-4 rounded-lg border bg-muted/10"
        >
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Ask for motivation or guidance during your focus session.
              </p>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-2 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Bot className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    )}
                    <div
                      className={`rounded-lg p-3 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <MessageSquare className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder={isRunning ? "Ask for motivation or guidance..." : "Start a session to chat"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={!isRunning || chatMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isRunning || !input.trim() || chatMutation.isPending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

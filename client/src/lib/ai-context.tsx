import { createContext, useContext, ReactNode, useState } from 'react';
import OpenAI from 'openai';
import { useToast } from '@/hooks/use-toast';

interface AiAssistantContextType {
  sendMessage: (message: string) => Promise<string>;
  isLoading: boolean;
}

const AiAssistantContext = createContext<AiAssistantContextType | null>(null);

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const OPENAI_MODEL = "gpt-4o";

export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const sendMessage = async (message: string): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a supportive and empathetic AI assistant focused on mental wellness. Your responses should be compassionate, constructive, and aimed at promoting emotional well-being."
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error: any) {
      console.error('AI Assistant Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    sendMessage,
    isLoading
  };

  return (
    <AiAssistantContext.Provider value={value}>
      {children}
    </AiAssistantContext.Provider>
  );
}

export function useAiAssistant() {
  const context = useContext(AiAssistantContext);
  if (!context) {
    throw new Error('useAiAssistant must be used within an AiAssistantProvider');
  }
  return context;
}
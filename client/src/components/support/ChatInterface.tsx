import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { SelectSupportMessage, SelectSupportGroup } from "@db/schema";
import { MessageCircle } from "lucide-react";

interface ChatInterfaceProps {
  group: SelectSupportGroup;
}

export default function ChatInterface({ group }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery<SelectSupportMessage[]>({
    queryKey: [`/api/support-groups/${group.id}/messages`],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/support-groups/${group.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isAnonymous }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: [`/api/support-groups/${group.id}/messages`],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await sendMessageMutation.mutate(message);
  };

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="mb-4 p-3 rounded-lg bg-accent/50"
          >
            <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{msg.isAnonymous ? "Anonymous" : "Member"}</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(msg.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="text-foreground">{msg.content}</p>
          </div>
        ))}
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={setIsAnonymous}
          />
          <Label htmlFor="anonymous">Send anonymously</Label>
        </div>

        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[80px]"
          />
          <Button
            type="submit"
            className="px-8"
            disabled={sendMessageMutation.isPending}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

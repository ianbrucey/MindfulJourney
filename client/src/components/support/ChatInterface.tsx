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
import type { SelectSupportMessage, SelectSupportGroup, SelectGroupMembership } from "@db/schema";
import { MessageCircle, UserPlus, Link as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ChatInterfaceProps {
  group: SelectSupportGroup;
}

export default function ChatInterface({ group }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [inviteLink, setInviteLink] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update polling interval to 3 seconds for better real-time feel
  const { data: messages = [], isLoading: messagesLoading } = useQuery<SelectSupportMessage[]>({
    queryKey: [`/api/support-groups/${group.id}/messages`],
    refetchInterval: 3000,
  });

  const { data: memberships = [], isLoading: membershipsLoading } = useQuery<SelectGroupMembership[]>({
    queryKey: ["/api/support-groups/memberships"],
  });

  const currentMembership = memberships.find(m => m.groupId === group.id);
  const isMember = !!currentMembership;
  const isAdmin = currentMembership?.isAdmin;

  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/support-groups/${group.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/support-groups/memberships"] 
      });
      toast({
        title: "Success",
        description: "You have joined the group!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateInviteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/support-groups/${group.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data) => {
      const baseUrl = window.location.origin;
      setInviteLink(`${baseUrl}/join/${data.inviteCode}`);
      toast({
        title: "Success",
        description: "Invite link generated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/support-groups/${group.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
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
    onError: (error: Error) => {
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
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await sendMessageMutation.mutate(message);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Success",
      description: "Invite link copied to clipboard!",
    });
  };

  // Show loading state
  if (membershipsLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show join interface if not a member
  if (!isMember) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <p className="text-muted-foreground">
          You need to join this group to participate in the discussion.
        </p>
        <Button
          onClick={() => joinGroupMutation.mutate()}
          disabled={joinGroupMutation.isPending}
        >
          {joinGroupMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Joining...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Join Group
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      {isAdmin && (
        <div className="p-4 border-b">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                onClick={() => generateInviteMutation.mutate()}
                disabled={generateInviteMutation.isPending}
              >
                {generateInviteMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Generate Invite Link
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Group Invite Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input value={inviteLink} readOnly />
                <Button onClick={copyInviteLink} className="w-full">
                  Copy Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="h-8 w-8 mb-2" />
            <p>No messages yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
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
              <p className="text-foreground whitespace-pre-wrap break-words">
                {msg.content}
              </p>
            </div>
          ))
        )}
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
            {sendMessageMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
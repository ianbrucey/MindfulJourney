import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Plus, Crown, User } from "lucide-react";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  SelectSupportGroup,
  SelectGroupMembership,
  SelectSupportTopic,
} from "@db/schema";
import { useToast } from "@/hooks/use-toast";
import ChatInterface from "@/components/support/ChatInterface";
import { Badge } from "@/components/ui/badge";

const createGroupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  topicId: z.coerce.number().min(1, "Please select a topic"),
  isPrivate: z.boolean().default(false),
  maxMembers: z.number().min(2).max(100).default(50),
});

export default function SupportNetworkPage() {
  const [activeGroup, setActiveGroup] = useState<SelectSupportGroup | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: groups = [] } = useQuery<SelectSupportGroup[]>({
    queryKey: ["/api/support-groups"],
  });

  const { data: topics = [] } = useQuery<SelectSupportTopic[]>({
    queryKey: ["/api/support-topics"],
  });

  const { data: memberships = [] } = useQuery<SelectGroupMembership[]>({
    queryKey: ["/api/support-groups/memberships"],
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createGroupSchema>) => {
      const response = await fetch("/api/support-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-groups"] });
      toast({
        title: "Success",
        description: "Support group created successfully!",
      });
      setIsCreatingGroup(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      topicId: 0,
      isPrivate: false,
      maxMembers: 50,
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createGroupMutation.mutate(data);
  });

  // Filter groups based on search query
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get user's role for each group
  const getGroupMembership = (groupId: number) => 
    memberships.find(m => m.groupId === groupId);

  // Separate joined and available groups
  const joinedGroups = filteredGroups.filter(group =>
    memberships?.some(m => m.groupId === group.id)
  );

  const availableGroups = filteredGroups.filter(group =>
    !memberships?.some(m => m.groupId === group.id)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedContainer>
        <h1 className="text-4xl font-bold text-foreground/90 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-8">
          Support Network
        </h1>
      </AnimatedContainer>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Support Groups List */}
        <AnimatedContainer delay={0.1} className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Support Groups
                </div>
                <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Support Group</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Group Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter group name"
                          {...form.register("name")}
                        />
                        {form.formState.errors.name && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your group's purpose"
                          {...form.register("description")}
                        />
                        {form.formState.errors.description && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.description.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="topic">Topic</Label>
                        <Select
                          onValueChange={(value) =>
                            form.setValue("topicId", parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                          <SelectContent>
                            {topics?.map((topic) => (
                              <SelectItem
                                key={topic.id}
                                value={topic.id.toString()}
                              >
                                {topic.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.topicId && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.topicId.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={createGroupMutation.isPending}
                      >
                        {createGroupMutation.isPending
                          ? "Creating..."
                          : "Create Group"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search support groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />

              {/* My Groups */}
              {joinedGroups.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">My Groups</h3>
                  {joinedGroups.map((group) => {
                    const membership = getGroupMembership(group.id);
                    return (
                      <Button
                        key={group.id}
                        variant={activeGroup?.id === group.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveGroup(group)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        <span className="flex-1 text-left">{group.name}</span>
                        {membership?.isAdmin ? (
                          <Badge variant="secondary" className="ml-2 gap-1">
                            <Crown className="h-3 w-3" />
                            Founder
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="ml-2 gap-1">
                            <User className="h-3 w-3" />
                            Member
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Available Groups */}
              {availableGroups.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Available Groups</h3>
                  {availableGroups.map((group) => (
                    <Button
                      key={group.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveGroup(group)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {group.name}
                    </Button>
                  ))}
                </div>
              )}

              {filteredGroups.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No groups found matching your search
                </p>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>

        {/* Chat Area */}
        <AnimatedContainer delay={0.2} className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                {activeGroup ? activeGroup.name : "Select a Group"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!activeGroup ? (
                <div className="text-center text-muted-foreground">
                  Join a support group to start chatting
                </div>
              ) : (
                <ChatInterface group={activeGroup} />
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}
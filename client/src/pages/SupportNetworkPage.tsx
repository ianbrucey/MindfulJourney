import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Search, UserCircle } from "lucide-react";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { useQuery } from "@tanstack/react-query";
import type { SelectSupportGroup, SelectGroupMembership } from "@db/schema";

export default function SupportNetworkPage() {
  const [activeGroup, setActiveGroup] = useState<SelectSupportGroup | null>(null);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);

  const { data: groups } = useQuery<SelectSupportGroup[]>({
    queryKey: ["/api/support-groups"],
  });

  const { data: memberships } = useQuery<SelectGroupMembership[]>({
    queryKey: ["/api/support-groups/memberships"],
  });

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
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Support Groups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setIsJoiningGroup(true)}
                className="w-full"
                variant="outline"
              >
                <Search className="h-4 w-4 mr-2" />
                Find Support Groups
              </Button>

              {/* My Groups */}
              <div className="space-y-2">
                {memberships?.map((membership) => (
                  <Button
                    key={membership.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      const group = groups?.find((g) => g.id === membership.groupId);
                      if (group) setActiveGroup(group);
                    }}
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    {membership.anonymousName}
                  </Button>
                ))}
              </div>
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
                <div>Chat interface will be implemented here</div>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}

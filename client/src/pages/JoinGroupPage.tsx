import { useEffect } from "react";
import { useLocation, useRoute, useRouter } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

export default function JoinGroupPage() {
  const [, params] = useRoute("/join/:inviteCode");
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const { toast } = useToast();

  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/support-groups/join/${params?.inviteCode}`, {
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
      toast({
        title: "Success",
        description: "You have joined the group successfully!",
      });
      setLocation("/support");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLocation("/support");
    },
  });

  useEffect(() => {
    // If user is logged in, automatically try to join the group
    if (user && !userLoading && params?.inviteCode) {
      joinGroupMutation.mutate();
    }
  }, [user, userLoading, params?.inviteCode]);

  if (userLoading || joinGroupMutation.isPending) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {userLoading ? "Loading..." : "Joining group..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-center mb-4">Join Support Group</h1>
            <p className="text-center text-muted-foreground mb-6">
              Please log in or register to join this support group
            </p>
            <div className="flex flex-col gap-4">
              <Button onClick={() => setLocation("/login")}>
                Login
              </Button>
              <Button variant="outline" onClick={() => setLocation("/register")}>
                Register
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

import { useLocation } from "wouter";
import ThemeSelector from "@/components/ThemeSelector";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, LogOut, CreditCard, Crown } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { logout, user } = useUser();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (!result.ok) {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedContainer>
        <h1 className="text-4xl font-bold text-foreground/90 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-8">
          Settings
        </h1>
      </AnimatedContainer>

      <div className="space-y-6">
        <AnimatedContainer delay={0.1}>
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Subscription Status
              </CardTitle>
              <CardDescription>
                Current Plan: {user?.subscriptionTier ? (
                  <span className="font-medium text-primary">
                    {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Basic</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full sm:w-auto"
                onClick={() => navigate("/subscription")}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Theme Settings
              </CardTitle>
              <CardDescription>
                Customize the appearance of your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <LogOut className="h-5 w-5" />
                Account Actions
              </CardTitle>
              <CardDescription>
                Sign out of your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}
import { Switch, Route } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import Home from "@/pages/Home";
import JournalEntry from "@/pages/JournalEntry";
import WellnessGoals from "@/pages/WellnessGoals";
import AuthPage from "@/pages/AuthPage";
import MeditationPage from "@/pages/MeditationPage";
import ProductivityPage from "@/pages/ProductivityPage";
import SettingsPage from "@/pages/SettingsPage";
import TalkItOutPage from "@/pages/TalkItOutPage";
import MiniGamesPage from "@/pages/MiniGamesPage";
import SupportNetworkPage from "@/pages/SupportNetworkPage";
import JoinGroupPage from "@/pages/JoinGroupPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import Navigation from "@/components/Navigation";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const { user, isLoading } = useUser();
  const path = window.location.pathname;
  const isJoinPage = path.startsWith('/join/');

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Special handling for join pages
  if (isJoinPage) {
    if (!user) {
      return <AuthPage returnTo={path} />;
    }
    return <JoinGroupPage />;
  }

  // If not authenticated, show login page
  if (!user) {
    return <AuthPage />;
  }

  // Authenticated routes
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 pb-16 md:pb-0 container mx-auto px-4">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/entry/:id?" component={JournalEntry} />
          <Route path="/goals" component={WellnessGoals} />
          <Route path="/meditation" component={MeditationPage} />
          <Route path="/productivity" component={ProductivityPage} />
          <Route path="/talk" component={TalkItOutPage} />
          <Route path="/games" component={MiniGamesPage} />
          <Route path="/support" component={SupportNetworkPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/subscription" component={SubscriptionPage} />
          <Route path="/join/:inviteCode" component={JoinGroupPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Toaster />
    </div>
  );
}

// 404 Page
function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            The page you're looking for doesn't exist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
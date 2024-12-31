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
import Navigation from "@/components/Navigation";
import { Toaster } from "@/components/ui/toaster";
import { AiAssistantProvider } from "@sista/ai-assistant-react";

function App() {
  const { user, isLoading } = useUser();
  const apiKey = import.meta.env.VITE_SISTA_AI_SECRET;
  const path = window.location.pathname;
  const isJoinPage = path.startsWith('/join/');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Handle join page auth flow
  if (isJoinPage) {
    if (!user) {
      return <AuthPage returnTo={path} />;
    }
    return <JoinGroupPage />;
  }

  if (!user) {
    return <AuthPage />;
  }

  if (!apiKey) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Configuration Error</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Sista AI API key is not configured. Please ensure VITE_SISTA_AI_SECRET is set in your environment variables.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AiAssistantProvider apiKey={apiKey}>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16 pb-16 md:pb-0">
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
            <Route path="/join/:inviteCode" component={JoinGroupPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Toaster />
      </div>
    </AiAssistantProvider>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
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
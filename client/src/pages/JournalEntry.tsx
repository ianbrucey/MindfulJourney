import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import JournalForm from "@/components/JournalForm";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import SelfCareRecommendations from "@/components/SelfCareRecommendations";
import { useJournal } from "@/hooks/use-journal";

export default function JournalEntry() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { getEntry } = useJournal();
  const entry = id ? getEntry(parseInt(id)) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Journal
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {id ? "Edit Journal Entry" : "New Journal Entry"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <JournalForm entry={entry} />
            </CardContent>
          </Card>

          {entry && entry.analysis && (
            <SentimentAnalysis entry={entry} />
          )}
        </div>

        {entry && entry.analysis && (
          <SelfCareRecommendations entry={entry} />
        )}
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SelectEntry } from "@db/schema";

interface SentimentAnalysisProps {
  entry: SelectEntry;
}

export default function SentimentAnalysis({ entry }: SentimentAnalysisProps) {
  if (!entry.analysis) {
    return null;
  }

  const { sentiment, themes, insights } = entry.analysis;
  const sentimentPercentage = (sentiment.score / 5) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Entry Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">
            Sentiment: {sentiment.label}
          </p>
          <Progress value={sentimentPercentage} className="h-2" />
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Emotional Themes</p>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => (
              <span
                key={theme}
                className="px-2 py-1 bg-primary/10 rounded-full text-xs"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">AI Insights</p>
          <p className="text-sm text-muted-foreground">{insights}</p>
        </div>
      </CardContent>
    </Card>
  );
}

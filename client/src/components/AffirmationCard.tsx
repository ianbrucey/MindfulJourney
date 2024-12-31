import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { SelectAffirmation } from "@db/schema";

interface AffirmationCardProps {
  affirmation?: SelectAffirmation;
}

export default function AffirmationCard({ affirmation }: AffirmationCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Today's Affirmation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-medium text-center italic">
          {affirmation?.content || "Loading your daily affirmation..."}
        </p>
      </CardContent>
    </Card>
  );
}

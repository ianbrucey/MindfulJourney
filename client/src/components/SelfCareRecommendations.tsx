import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Target } from "lucide-react";
import type { SelectEntry } from "@db/schema";

interface SelfCareRecommendationsProps {
  entry: SelectEntry;
}

export default function SelfCareRecommendations({ entry }: SelfCareRecommendationsProps) {
  if (!entry.analysis?.recommendations?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Self-Care Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entry.analysis.recommendations.map((rec, index) => (
          <Card key={index} className="bg-primary/5">
            <CardContent className="p-4">
              <h3 className="font-medium text-lg mb-2">{rec.activity}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {rec.duration}
                </p>
                <p className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {rec.benefit}
                </p>
                <p className="mt-2">{rec.reason}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

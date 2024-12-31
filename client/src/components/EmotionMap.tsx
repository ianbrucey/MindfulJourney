import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SelectEntry } from "@db/schema";
import { AnimatedContainer } from "@/components/ui/animated-container";

interface EmotionMapProps {
  entries: SelectEntry[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-3 space-y-2">
        <p className="text-sm font-medium">
          {new Date(data.date).toLocaleDateString()}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {data.content}
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">Sentiment:</span>
          <span className="text-primary">
            {data.sentiment.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmotionMap({ entries }: EmotionMapProps) {
  // Transform entries for the scatter plot
  const data = entries.map((entry) => ({
    date: new Date(entry.createdAt).getTime(),
    sentiment: entry.analysis?.sentiment.score || 0,
    content: entry.content,
  }));

  // Calculate average sentiment for the title
  const avgSentiment = data.reduce((acc, curr) => acc + curr.sentiment, 0) / data.length;
  const sentimentLabel = avgSentiment > 3.5 ? "Positive" : avgSentiment < 2.5 ? "Could Use Support" : "Balanced";

  return (
    <AnimatedContainer>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Emotional Journey
            <span className="text-sm font-normal text-muted-foreground ml-2">
              Overall: {sentimentLabel}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <XAxis
                  dataKey="date"
                  domain={['auto', 'auto']}
                  name="Date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  type="number"
                />
                <YAxis
                  dataKey="sentiment"
                  name="Sentiment"
                  domain={[0, 5]}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter
                  data={data}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                  line={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }}
                  lineJointType="monotoneX"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}

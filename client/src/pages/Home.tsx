import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useJournal } from "@/hooks/use-journal";
import { useUser } from "@/hooks/use-user";
import { useAchievements } from "@/hooks/use-achievements";
import { PenSquare, Calendar, TrendingUp, Target } from "lucide-react";
import AffirmationCard from "@/components/AffirmationCard";
import StreakCounter from "@/components/StreakCounter";
import AchievementsList from "@/components/AchievementsList";
import DailyChallenge from "@/components/DailyChallenge";
import AmbientSoundGenerator from "@/components/AmbientSoundGenerator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const { entries, todayAffirmation } = useJournal();
  const { user } = useUser();
  const { achievements, unlockedAchievements } = useAchievements();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-foreground/90 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Mindful Journal
          </h1>

          <AffirmationCard affirmation={todayAffirmation} />

          <DailyChallenge />

          <AmbientSoundGenerator />

          <StreakCounter
            currentStreak={user?.currentStreak || 0}
            longestStreak={user?.longestStreak || 0}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenSquare className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/entry">
                <Button className="w-full">New Journal Entry</Button>
              </Link>
              <Link href="/goals">
                <Button className="w-full" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Wellness Goals
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AchievementsList
            achievements={achievements}
            unlockedAchievements={unlockedAchievements}
          />

          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {entries?.map((entry) => (
                    <Link key={entry.id} href={`/entry/${entry.id}`}>
                      <Card className="cursor-pointer hover:bg-accent transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </p>
                            {entry.analysis && (
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <Progress
                                  value={(entry.analysis.sentiment.score / 5) * 100}
                                  className="h-2 w-16"
                                />
                              </div>
                            )}
                          </div>
                          <p className="line-clamp-2">{entry.content}</p>
                          <div className="flex gap-2 mt-2">
                            {entry.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
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
import AmbientSoundLibrary from "@/components/AmbientSoundLibrary";
import ThemeSelector from "@/components/ThemeSelector";
import EmotionMap from "@/components/EmotionMap";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { motion } from "framer-motion";
import ShareDialog from "@/components/ShareDialog";
import GuidedMeditation from "@/components/GuidedMeditation";
import MusicPlaylistGenerator from "@/components/MusicPlaylistGenerator";

export default function Home() {
  const { entries, todayAffirmation } = useJournal();
  const { user } = useUser();
  const { achievements, unlockedAchievements } = useAchievements();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AnimatedContainer>
            <motion.h1 
              className="text-4xl font-bold text-foreground/90 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Mindful Journal
            </motion.h1>
          </AnimatedContainer>

          <AnimatedContainer delay={0.1}>
            <AffirmationCard affirmation={todayAffirmation} />
          </AnimatedContainer>

          <AnimatedContainer delay={0.2}>
            <DailyChallenge />
          </AnimatedContainer>

          <AnimatedContainer delay={0.3}>
            <GuidedMeditation />
          </AnimatedContainer>

          <AnimatedContainer delay={0.4}>
            <EmotionMap entries={entries || []} />
          </AnimatedContainer>

          <AnimatedContainer delay={0.5}>
            <AmbientSoundLibrary />
          </AnimatedContainer>

          <AnimatedContainer delay={0.6}>
            <MusicPlaylistGenerator />
          </AnimatedContainer>

          <AnimatedContainer delay={0.7}>
            <ThemeSelector />
          </AnimatedContainer>

          <AnimatedContainer delay={0.8}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenSquare className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/entry">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full">New Journal Entry</Button>
                  </motion.div>
                </Link>
                <Link href="/goals">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Wellness Goals
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>

        <div className="space-y-6">
          <AnimatedContainer delay={0.2}>
            <AchievementsList
              achievements={achievements}
              unlockedAchievements={unlockedAchievements}
            />
          </AnimatedContainer>

          <AnimatedContainer delay={0.3}>
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
                    {entries?.map((entry, index) => (
                      <AnimatedContainer key={entry.id} delay={0.1 * index}>
                        <Link href={`/entry/${entry.id}`}>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Card className="cursor-pointer hover:bg-accent transition-all duration-300">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    {entry.analysis && (
                                      <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        <Progress
                                          value={(entry.analysis.sentiment.score / 5) * 100}
                                          className="h-2 w-16"
                                        />
                                      </div>
                                    )}
                                    <ShareDialog
                                      title="Journal Insight"
                                      text={`Check out my mindfulness journey: ${entry.content.slice(0, 100)}...`}
                                    />
                                  </div>
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
                          </motion.div>
                        </Link>
                      </AnimatedContainer>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>
      </div>
    </div>
  );
}
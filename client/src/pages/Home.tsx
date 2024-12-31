import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useJournal } from "@/hooks/use-journal";
import { PenSquare, Calendar } from "lucide-react";
import AffirmationCard from "@/components/AffirmationCard";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const { entries, todayAffirmation } = useJournal();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-foreground/90 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Mindful Journal
          </h1>
          
          <AffirmationCard affirmation={todayAffirmation} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenSquare className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/entry">
                <Button className="w-full">New Journal Entry</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {entries?.map((entry) => (
                  <Link key={entry.id} href={`/entry/${entry.id}`}>
                    <Card className="cursor-pointer hover:bg-accent transition-colors">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
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
  );
}

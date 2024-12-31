import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Brain,
  Lightbulb,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Activity,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface EmotionalPattern {
  emotion: string;
  frequency: number;
  triggers: string[];
}

interface Exercise {
  name: string;
  description: string;
  duration: string;
  benefit: string;
}

interface EmotionalAnalysis {
  emotionalPatterns: EmotionalPattern[];
  insights: {
    strengths: string[];
    growthAreas: string[];
    recommendations: string[];
  };
  coaching: {
    observation: string;
    guidance: string;
    exercises: Exercise[];
  };
}

export default function EmotionalIntelligenceCoach() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { data: analysis, isLoading } = useQuery<EmotionalAnalysis>({
    queryKey: ["/api/emotional-intelligence/analysis"],
  });

  if (isLoading || !analysis) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">
              Analyzing emotional patterns...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { emotionalPatterns, insights, coaching } = analysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Emotional Intelligence Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Emotional State Overview */}
        <div className="rounded-lg bg-accent/10 p-4">
          <h3 className="mb-4 flex items-center gap-2 font-medium">
            <Heart className="h-4 w-4 text-red-500" />
            Current Emotional State
          </h3>
          <div className="space-y-4">
            {emotionalPatterns.map((pattern, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{pattern.emotion}</span>
                  <Progress value={pattern.frequency} className="w-24" />
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {pattern.triggers.map((trigger, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs"
                    >
                      {trigger}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Personal Growth Insights */}
        <div className="rounded-lg bg-accent/10 p-4">
          <h3 className="mb-4 flex items-center gap-2 font-medium">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Personal Growth Insights
          </h3>
          <Accordion type="single" collapsible>
            <AccordionItem value="strengths">
              <AccordionTrigger>Emotional Strengths</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {insights.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="mt-1 rounded-full bg-green-500/20 p-1">
                        <Target className="h-3 w-3 text-green-500" />
                      </div>
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="areas">
              <AccordionTrigger>Growth Areas</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {insights.growthAreas.map((area, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="mt-1 rounded-full bg-blue-500/20 p-1">
                        <ArrowRight className="h-3 w-3 text-blue-500" />
                      </div>
                      <p className="text-sm">{area}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Personalized Recommendations */}
        <div className="rounded-lg bg-accent/10 p-4">
          <h3 className="mb-4 flex items-center gap-2 font-medium">
            <Target className="h-4 w-4 text-purple-500" />
            Self-Care Recommendations
          </h3>
          <div className="space-y-3">
            {coaching.exercises.map((exercise, index) => (
              <motion.div
                key={index}
                className="cursor-pointer rounded-lg bg-background p-4 transition-colors hover:bg-accent/5"
                onClick={() => setSelectedExercise(selectedExercise?.name === exercise.name ? null : exercise)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">{exercise.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({exercise.duration})
                    </span>
                  </div>
                  {selectedExercise?.name === exercise.name ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>

                <AnimatePresence>
                  {selectedExercise?.name === exercise.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-2">
                        <p className="text-sm">{exercise.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Benefit: {exercise.benefit}
                        </p>
                        <Button variant="secondary" className="mt-2 w-full" size="sm">
                          Start Exercise
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Personal Coaching Message */}
        <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Personal Guidance</h3>
          </div>
          <p className="mb-3 text-sm">{coaching.observation}</p>
          <p className="text-sm font-medium text-primary">{coaching.guidance}</p>
        </div>
      </CardContent>
    </Card>
  );
}
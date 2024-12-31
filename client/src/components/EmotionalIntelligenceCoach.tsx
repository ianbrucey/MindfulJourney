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
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

  const { data: analysis, isLoading } = useQuery<EmotionalAnalysis>({
    queryKey: ["/api/emotional-intelligence/analysis"],
  });

  if (isLoading || !analysis) {
    return null;
  }

  const { emotionalPatterns, insights, coaching } = analysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Emotional Intelligence Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emotional Patterns */}
          <Card className="bg-accent/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Emotional Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emotionalPatterns.map((pattern, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg bg-background"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{pattern.emotion}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-primary/20">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pattern.frequency}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {pattern.frequency}%
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Common triggers:
                      {pattern.triggers.map((trigger, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-1 m-1 rounded-full bg-primary/10"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights and Growth */}
          <Card className="bg-accent/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Insights & Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="strengths">
                  <AccordionTrigger>Emotional Strengths</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {insights.strengths.map((strength, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Target className="h-3 w-3 text-green-500" />
                          </div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="growth">
                  <AccordionTrigger>Growth Areas</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {insights.growthAreas.map((area, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ArrowRight className="h-3 w-3 text-blue-500" />
                          </div>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="recommendations">
                  <AccordionTrigger>Recommendations</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {insights.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <div className="h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Lightbulb className="h-3 w-3 text-purple-500" />
                          </div>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Coaching Section */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Personal Coaching</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm mb-4">{coaching.observation}</p>
              <p className="text-sm font-medium">{coaching.guidance}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Recommended Exercises</h4>
              <div className="grid gap-4">
                {coaching.exercises.map((exercise, index) => (
                  <motion.div
                    key={index}
                    className="p-4 rounded-lg bg-accent/10 cursor-pointer"
                    onClick={() =>
                      setSelectedExercise(
                        selectedExercise?.name === exercise.name ? null : exercise
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-sm text-muted-foreground">
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
                          <div className="pt-4 space-y-2">
                            <p className="text-sm">{exercise.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Benefit: {exercise.benefit}
                            </p>
                            <Button
                              variant="secondary"
                              className="w-full mt-2"
                              size="sm"
                            >
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
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

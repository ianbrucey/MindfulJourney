import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MoodPicker from "./MoodPicker";
import VoiceInput from "./VoiceInput";
import BreathingExercise from "./BreathingExercise";
import { useJournal } from "@/hooks/use-journal";
import type { SelectEntry } from "@db/schema";
import { useLocation } from "wouter";

const formSchema = z.object({
  content: z.string().min(1, "Please write something in your journal"),
  mood: z.number().min(1).max(5),
  tags: z.array(z.string()),
});

interface JournalFormProps {
  entry?: SelectEntry | null;
}

const journalPrompts = [
  "What are you grateful for today?",
  "What made you smile today?",
  "What's something you learned about yourself?",
  "What's a challenge you overcame today?",
  "What's something you're looking forward to?",
];

export default function JournalForm({ entry }: JournalFormProps) {
  const [showBreathing, setShowBreathing] = useState(!entry);
  const [, setLocation] = useLocation();
  const { createEntry, updateEntry } = useJournal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: entry?.content || "",
      mood: entry?.mood || 3,
      tags: entry?.tags || [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (entry) {
      await updateEntry(entry.id, values);
    } else {
      await createEntry(values);
    }
    setLocation("/");
  };

  const handleVoiceTranscript = (transcript: string) => {
    form.setValue("content", transcript, { shouldValidate: true });
  };

  const handleBreathingComplete = () => {
    setShowBreathing(false);
    const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
    form.setValue("content", `Today's Prompt: ${randomPrompt}\n\n`, { shouldValidate: false });
  };

  const skipBreathing = () => {
    setShowBreathing(false);
    const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
    form.setValue("content", `Today's Prompt: ${randomPrompt}\n\n`, { shouldValidate: false });
  };

  if (showBreathing) {
    return (
      <div className="space-y-4">
        <BreathingExercise onComplete={handleBreathingComplete} />
        <Button 
          variant="outline" 
          className="w-full"
          onClick={skipBreathing}
        >
          Skip Exercise
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                What's on your mind?
                <VoiceInput onTranscript={handleVoiceTranscript} />
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write or speak your thoughts here..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How are you feeling?</FormLabel>
              <FormControl>
                <MoodPicker
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma separated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="gratitude, reflection, goals"
                  value={field.value.join(", ")}
                  onChange={(e) => {
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {entry ? "Update Entry" : "Save Entry"}
        </Button>
      </form>
    </Form>
  );
}
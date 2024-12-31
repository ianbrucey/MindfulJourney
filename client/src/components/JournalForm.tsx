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

export default function JournalForm({ entry }: JournalFormProps) {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What's on your mind?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your thoughts here..."
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

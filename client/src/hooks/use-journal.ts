import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InsertEntry, SelectEntry, SelectAffirmation } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

export function useJournal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: entries } = useQuery<SelectEntry[]>({
    queryKey: ["/api/entries"],
  });

  const { data: todayAffirmation } = useQuery<SelectAffirmation>({
    queryKey: ["/api/affirmations/today"],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (entry: Omit<InsertEntry, "userId" | "createdAt">) => {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Entry saved",
        description: "Your journal entry has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async (
      id: number,
      entry: Omit<InsertEntry, "userId" | "createdAt">
    ) => {
      const res = await fetch(`/api/entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Entry updated",
        description: "Your journal entry has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    entries,
    todayAffirmation,
    createEntry: createEntryMutation.mutateAsync,
    updateEntry: updateEntryMutation.mutateAsync,
    getEntry: (id: number) => entries?.find((e) => e.id === id),
  };
}

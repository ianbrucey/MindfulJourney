import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SelectDailyChallenge } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

export function useDailyChallenges() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: todayChallenge, isLoading: isLoadingToday } = useQuery<SelectDailyChallenge>({
    queryKey: ["/api/challenges/today"],
  });

  const { data: challengeHistory } = useQuery<SelectDailyChallenge[]>({
    queryKey: ["/api/challenges/history"],
  });

  const completeChallengesMutation = useMutation({
    mutationFn: async ({ 
      id, 
      reflectionNote 
    }: { 
      id: number; 
      reflectionNote?: string;
    }) => {
      const res = await fetch(`/api/challenges/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflectionNote }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/history"] });
      toast({
        title: "Challenge completed",
        description: "Great job on completing your daily challenge!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    todayChallenge,
    isLoadingToday,
    challengeHistory: challengeHistory || [],
    completeChallenge: completeChallengesMutation.mutateAsync,
  };
}

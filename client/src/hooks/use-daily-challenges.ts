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

  // Calculate challenge statistics
  const stats = {
    totalCompleted: challengeHistory?.filter(c => c.completed).length || 0,
    streak: calculateStreak(challengeHistory || []),
    lastCompletedAt: challengeHistory?.[0]?.completedAt,
  };

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
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] }); // Refresh achievements
      queryClient.invalidateQueries({ queryKey: ["/api/achievements/unlocked"] });

      toast({
        title: "Challenge completed! 🎉",
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
    stats,
    completeChallenge: completeChallengesMutation.mutateAsync,
  };
}

// Helper function to calculate current streak
function calculateStreak(history: SelectDailyChallenge[]): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const challenge of history) {
    if (!challenge.completed) continue;

    const completedDate = new Date(challenge.completedAt!);
    completedDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InsertWellnessGoal, SelectWellnessGoal, InsertGoalProgress, SelectGoalProgress } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

export function useWellnessGoals() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: goals } = useQuery<SelectWellnessGoal[]>({
    queryKey: ["/api/goals"],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goal: Omit<InsertWellnessGoal, "userId" | "currentValue" | "isCompleted" | "createdAt" | "updatedAt">) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal created",
        description: "Your wellness goal has been created successfully.",
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

  const updateGoalMutation = useMutation({
    mutationFn: async ({ 
      id, 
      goal 
    }: { 
      id: number; 
      goal: Omit<InsertWellnessGoal, "userId" | "createdAt" | "updatedAt">
    }) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal updated",
        description: "Your wellness goal has been updated successfully.",
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

  const recordProgressMutation = useMutation({
    mutationFn: async ({ 
      goalId, 
      progress 
    }: { 
      goalId: number; 
      progress: Pick<InsertGoalProgress, "value" | "note">
    }) => {
      const res = await fetch(`/api/goals/${goalId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progress),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${variables.goalId}/progress`] });
      toast({
        title: "Progress recorded",
        description: "Your progress has been recorded successfully.",
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

  const useGoalProgress = (goalId: number) => {
    return useQuery<SelectGoalProgress[]>({
      queryKey: [`/api/goals/${goalId}/progress`],
      enabled: !!goalId,
    });
  };

  return {
    goals: goals || [],
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
    recordProgress: recordProgressMutation.mutateAsync,
    useGoalProgress,
  };
}
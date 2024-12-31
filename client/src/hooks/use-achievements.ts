import { useQuery } from "@tanstack/react-query";
import type { SelectAchievement, SelectUserAchievement } from "@db/schema";

export function useAchievements() {
  const { data: achievements } = useQuery<SelectAchievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: unlockedAchievements } = useQuery<SelectUserAchievement[]>({
    queryKey: ["/api/achievements/unlocked"],
  });

  return {
    achievements: achievements || [],
    unlockedAchievements: unlockedAchievements || [],
  };
}

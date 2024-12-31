import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth.js";
import { db } from "@db";
import { entries, affirmations, achievements, userAchievements, users, wellnessGoals, goalProgress, dailyChallenges } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { generateAffirmation, analyzeSentiment, generateDailyChallenge, getFocusMotivation } from "./openai.js";
import type { SelectUser } from "@db/schema";
import fs from "fs/promises";
import path from "path";

// Extend Express.User type
declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const INITIAL_ACHIEVEMENTS = [
  {
    name: "First Step",
    description: "Write your first journal entry",
    icon: "Award",
    requirement: "Write one journal entry",
    level: 1,
  },
  {
    name: "Getting Started",
    description: "Complete a 3-day streak",
    icon: "Award",
    requirement: "Write entries for 3 days in a row",
    level: 1,
  },
  {
    name: "Consistent Journaler",
    description: "Complete a 7-day streak",
    icon: "Medal",
    requirement: "Write entries for 7 days in a row",
    level: 2,
  },
  {
    name: "Mindfulness Master",
    description: "Complete a 30-day streak",
    icon: "Trophy",
    requirement: "Write entries for 30 days in a row",
    level: 3,
  },
];

async function initializeAchievements() {
  const existingAchievements = await db.query.achievements.findMany();
  if (existingAchievements.length === 0) {
    await db.insert(achievements).values(INITIAL_ACHIEVEMENTS);
  }
}

async function updateStreakAndCheckAchievements(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastEntry = user.lastEntryDate ? new Date(user.lastEntryDate) : null;
  let currentStreak = user.currentStreak || 0;

  if (lastEntry) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastEntry < yesterday) {
      currentStreak = 1; // Streak broken, start over
    } else if (lastEntry.getTime() === today.getTime()) {
      return; // Already journaled today
    } else {
      currentStreak += 1; // Continue streak
    }
  } else {
    currentStreak = 1; // First entry ever
  }

  // Update user's streak information
  await db.update(users)
    .set({
      currentStreak,
      longestStreak: Math.max(currentStreak, user.longestStreak || 0),
      lastEntryDate: today,
    })
    .where(eq(users.id, userId));

  // Check for streak-based achievements
  const streakAchievements = await db.query.achievements.findMany();

  for (const achievement of streakAchievements) {
    if (
      (achievement.name === "Getting Started" && currentStreak >= 3) ||
      (achievement.name === "Consistent Journaler" && currentStreak >= 7) ||
      (achievement.name === "Mindfulness Master" && currentStreak >= 30)
    ) {
      const existing = await db.query.userAchievements.findFirst({
        where: and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievement.id),
        ),
      });

      if (!existing) {
        await db.insert(userAchievements).values({
          userId,
          achievementId: achievement.id,
        });
      }
    }
  }
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);
  initializeAchievements();

  // Middleware to check if user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).send("Not authenticated");
  };

  // Get all entries for the current user
  app.get("/api/entries", requireAuth, async (req, res) => {
    const userEntries = await db.query.entries.findMany({
      where: eq(entries.userId, req.user!.id),
      orderBy: [desc(entries.createdAt)],
    });
    res.json(userEntries);
  });

  // Create a new entry
  app.post("/api/entries", requireAuth, async (req, res) => {
    const analysis = await analyzeSentiment(req.body.content);
    const [entry] = await db.insert(entries).values({
      ...req.body,
      userId: req.user!.id,
      analysis,
    }).returning();

    await updateStreakAndCheckAchievements(req.user!.id);

    // Check for "First Step" achievement
    const userEntries = await db.query.entries.findMany({
      where: eq(entries.userId, req.user!.id),
    });

    if (userEntries.length === 1) {  // This is their first entry
      const firstStepAchievement = await db.query.achievements.findFirst({
        where: eq(achievements.name, "First Step"),
      });

      if (firstStepAchievement) {
        const existing = await db.query.userAchievements.findFirst({
          where: and(
            eq(userAchievements.userId, req.user!.id),
            eq(userAchievements.achievementId, firstStepAchievement.id),
          ),
        });

        if (!existing) {
          await db.insert(userAchievements).values({
            userId: req.user!.id,
            achievementId: firstStepAchievement.id,
          });
        }
      }
    }

    res.json(entry);
  });

  // Update an entry
  app.put("/api/entries/:id", requireAuth, async (req, res) => {
    const analysis = await analyzeSentiment(req.body.content);
    const [entry] = await db.update(entries)
      .set({ ...req.body, analysis })
      .where(eq(entries.id, parseInt(req.params.id)))
      .returning();
    res.json(entry);
  });

  // Get today's affirmation
  app.get("/api/affirmations/today", requireAuth, async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let [todayAffirmation] = await db.query.affirmations.findMany({
      where: eq(affirmations.userId, req.user!.id),
      orderBy: [desc(affirmations.createdAt)],
      limit: 1,
    });

    if (!todayAffirmation || new Date(todayAffirmation.createdAt) < today) {
      const content = await generateAffirmation();
      [todayAffirmation] = await db.insert(affirmations).values({
        content,
        userId: req.user!.id,
      }).returning();
    }

    res.json(todayAffirmation);
  });

  // Get all achievements
  app.get("/api/achievements", requireAuth, async (req, res) => {
    const allAchievements = await db.query.achievements.findMany({
      orderBy: [achievements.level, achievements.name],
    });
    res.json(allAchievements);
  });

  // Get user's unlocked achievements
  app.get("/api/achievements/unlocked", requireAuth, async (req, res) => {
    const unlockedAchievements = await db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, req.user!.id),
      orderBy: [desc(userAchievements.unlockedAt)],
    });
    res.json(unlockedAchievements);
  });

  // Get user's wellness goals
  app.get("/api/goals", requireAuth, async (req, res) => {
    const goals = await db.query.wellnessGoals.findMany({
      where: eq(wellnessGoals.userId, req.user!.id),
      orderBy: [desc(wellnessGoals.createdAt)],
    });
    res.json(goals);
  });

  // Create a new wellness goal
  app.post("/api/goals", requireAuth, async (req, res) => {
    const [goal] = await db.insert(wellnessGoals)
      .values({
        ...req.body,
        userId: req.user!.id,
      })
      .returning();
    res.json(goal);
  });

  // Update a wellness goal
  app.put("/api/goals/:id", requireAuth, async (req, res) => {
    const [goal] = await db.update(wellnessGoals)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(wellnessGoals.id, parseInt(req.params.id)),
          eq(wellnessGoals.userId, req.user!.id)
        )
      )
      .returning();
    res.json(goal);
  });

  // Record progress for a goal
  app.post("/api/goals/:id/progress", requireAuth, async (req, res) => {
    const goalId = parseInt(req.params.id);

    // First, verify the goal belongs to the user
    const [goal] = await db.query.wellnessGoals.findMany({
      where: and(
        eq(wellnessGoals.id, goalId),
        eq(wellnessGoals.userId, req.user!.id)
      ),
    });

    if (!goal) {
      return res.status(404).send("Goal not found");
    }

    // Record the progress
    const [progress] = await db.insert(goalProgress)
      .values({
        goalId,
        value: req.body.value,
        note: req.body.note,
      })
      .returning();

    // Update the current value in the goal
    const [updatedGoal] = await db.update(wellnessGoals)
      .set({
        currentValue: goal.currentValue + req.body.value,
        isCompleted: goal.currentValue + req.body.value >= goal.targetValue,
        updatedAt: new Date(),
      })
      .where(eq(wellnessGoals.id, goalId))
      .returning();

    res.json({ progress, goal: updatedGoal });
  });

  // Get progress history for a goal
  app.get("/api/goals/:id/progress", requireAuth, async (req, res) => {
    const goalId = parseInt(req.params.id);

    // First, verify the goal belongs to the user
    const [goal] = await db.query.wellnessGoals.findMany({
      where: and(
        eq(wellnessGoals.id, goalId),
        eq(wellnessGoals.userId, req.user!.id)
      ),
    });

    if (!goal) {
      return res.status(404).send("Goal not found");
    }

    const progress = await db.query.goalProgress.findMany({
      where: eq(goalProgress.goalId, goalId),
      orderBy: [desc(goalProgress.createdAt)],
    });

    res.json(progress);
  });

  // Get today's challenge
  app.get("/api/challenges/today", requireAuth, async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user already has a challenge for today
    let [todayChallenge] = await db.query.dailyChallenges.findMany({
      where: and(
        eq(dailyChallenges.userId, req.user!.id),
        gte(dailyChallenges.createdAt, today)
      ),
      limit: 1,
    });

    if (!todayChallenge) {
      // Get recent entries and active goals to personalize the challenge
      const recentEntries = await db.query.entries.findMany({
        where: eq(entries.userId, req.user!.id),
        orderBy: [desc(entries.createdAt)],
        limit: 5,
      });

      const activeGoals = await db.query.wellnessGoals.findMany({
        where: and(
          eq(wellnessGoals.userId, req.user!.id),
          eq(wellnessGoals.isCompleted, false)
        ),
      });

      const challenge = await generateDailyChallenge(recentEntries, activeGoals);

      [todayChallenge] = await db.insert(dailyChallenges)
        .values({
          userId: req.user!.id,
          ...challenge,
        })
        .returning();
    }

    res.json(todayChallenge);
  });

  // Complete a challenge
  app.post("/api/challenges/:id/complete", requireAuth, async (req, res) => {
    const [challenge] = await db.update(dailyChallenges)
      .set({
        completed: true,
        completedAt: new Date(),
        reflectionNote: req.body.reflectionNote,
      })
      .where(
        and(
          eq(dailyChallenges.id, parseInt(req.params.id)),
          eq(dailyChallenges.userId, req.user!.id)
        )
      )
      .returning();

    res.json(challenge);
  });

  // Get challenge history
  app.get("/api/challenges/history", requireAuth, async (req, res) => {
    const challenges = await db.query.dailyChallenges.findMany({
      where: eq(dailyChallenges.userId, req.user!.id),
      orderBy: [desc(dailyChallenges.createdAt)],
    });

    res.json(challenges);
  });

  // Theme customization endpoint
  app.post("/api/theme", async (req, res) => {
    try {
      const theme = req.body;
      const themeFilePath = path.resolve(process.cwd(), "theme.json");
      await fs.writeFile(themeFilePath, JSON.stringify(theme, null, 2));
      res.json({ message: "Theme updated successfully" });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).send("Failed to update theme");
    }
  });

  // Focus motivation chat endpoint
  app.post("/api/focus-chat", requireAuth, async (req, res) => {
    try {
      const { message, context } = req.body;
      const response = await getFocusMotivation(message, context);
      res.json({ message: response });
    } catch (error) {
      console.error("Error in focus chat:", error);
      res.status(500).send("Failed to get focus motivation");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
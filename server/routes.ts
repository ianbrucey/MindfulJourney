import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { entries, affirmations, achievements, userAchievements, users, wellnessGoals, goalProgress, dailyChallenges, supportTopics, supportGroups, groupMemberships, supportMessages, subscriptionPlans } from "@db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { generateAffirmation, analyzeSentiment, generateDailyChallenge, getFocusMotivation, analyzeEmotionalIntelligence, analyzeChatSentiment } from "./openai";
import type { SelectUser } from "@db/schema";
import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { initializeSubscriptionPlans, checkAIRequestLimit, checkGroupLimit } from "./subscription";
import { createCustomer, createSubscription, cancelSubscription, handleWebhook } from "./stripe";
import type { Buffer } from "node:buffer";
import express from "express";
import Decimal from 'decimal.js';

// Extend Express.User type
declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Middleware to check if user is authenticated
const requireAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Not authenticated");
};

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

// Modify only the initializeSubscriptionPlans function
async function initializeSubscriptionPlans() {
  try {
    // Verify required environment variables
    if (!process.env.STRIPE_PREMIUM_PRICE_ID || !process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
      throw new Error('Missing required Stripe price IDs in environment variables');
    }

    // Delete any existing plans to ensure clean state
    await db.delete(subscriptionPlans);

    // Insert fresh plans with correct price IDs
    await db.insert(subscriptionPlans).values([
      {
        name: 'basic',
        price: '0.00',
        priceId: 'price_free',
        features: [
          'Basic journaling',
          'Join up to 2 support groups',
          'Basic mood tracking',
          'Limited AI features (20 requests/month)'
        ],
        aiRequestsLimit: 20,
        groupLimit: 2
      },
      {
        name: 'premium',
        price: '14.99',
        priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
        features: [
          'Unlimited AI-powered journaling',
          'Advanced sentiment analysis',
          'Unlimited support groups',
          'Focus motivation chat',
          'Advanced analytics',
          'Custom themes',
          'Ad-free experience'
        ],
        aiRequestsLimit: -1,
        groupLimit: -1
      },
      {
        name: 'professional',
        price: '29.99',
        priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
        features: [
          'All Premium features',
          'Priority support',
          'Group founder privileges',
          'Advanced emotional intelligence',
          'Custom guided meditations',
          'Personal wellness coach',
          'Advanced goal tracking',
          'API access'
        ],
        aiRequestsLimit: -1,
        groupLimit: -1
      }
    ]);

    console.log('Successfully initialized subscription plans with the following price IDs:', {
      premium: process.env.STRIPE_PREMIUM_PRICE_ID,
      professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID
    });
  } catch (error) {
    console.error('Error initializing subscription plans:', error);
    throw error;
  }
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);
  initializeAchievements();
  initializeSubscriptionPlans(); // Make sure this is called

  // Subscription routes
  app.get("/api/subscription/plans", async (req, res) => {
    const plans = await db.query.subscriptionPlans.findMany({
      orderBy: [subscriptionPlans.price],
    });
    res.json(plans);
  });

  // Get Stripe publishable key
  app.get("/api/subscription/config", (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
  });

  // Create a subscription
  app.post("/api/subscription", requireAuth, async (req, res) => {
    try {
      if (!req.user!.email) {
        return res.status(400).send("Email required for subscription");
      }

      let customerId = req.user!.stripeCustomerId;
      if (!customerId) {
        const customer = await createCustomer(req.user!);
        customerId = customer.id;

        // Update user with Stripe customer ID
        await db.update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, req.user!.id));
      }

      const { priceId } = req.body;

      // Validate that the price ID exists in our plans
      const plan = await db.query.subscriptionPlans.findFirst({
        where: eq(subscriptionPlans.priceId, priceId),
      });

      if (!plan) {
        return res.status(400).json({ error: `Invalid plan selected. Price ID: ${priceId}` });
      }

      const { subscriptionId, clientSecret } = await createSubscription(
        customerId,
        priceId,
        req.user!.id
      );

      res.json({ subscriptionId, clientSecret });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Cancel a subscription
  app.post("/api/subscription/cancel", requireAuth, async (req, res) => {
    try {
      const { subscriptionId } = req.body;
      const subscription = await cancelSubscription(subscriptionId);
      res.json(subscription);
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Stripe webhook handler
  app.post("/api/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      await handleWebhook(req.body, sig);
      res.json({ received: true });
    } catch (error: any) {
      console.error("Error handling webhook:", error);
      res.status(400).json({ error: error.message });
    }
  });

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
    const canUseAI = await checkAIRequestLimit(req.user!);
    if (!canUseAI) {
      return res.status(402).send("AI request limit reached. Please upgrade to Premium for unlimited AI features.");
    }

    const analysis = await analyzeSentiment(req.body.content);
    const result = await db.insert(entries).values({
      ...req.body,
      userId: req.user!.id,
      analysis,
    });

    // Get the inserted entry
    const [entry] = await db
      .select()
      .from(entries)
      .where(eq(entries.id, Number(result.insertId)))
      .limit(1);

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
    await db.update(entries)
      .set({ ...req.body, analysis })
      .where(eq(entries.id, parseInt(req.params.id)));

    // Get the updated entry
    const [entry] = await db
      .select()
      .from(entries)
      .where(eq(entries.id, parseInt(req.params.id)))
      .limit(1);

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
      await db.insert(affirmations).values({
        content,
        userId: req.user!.id,
      });

      // Get the inserted affirmation
      const [todayAffirmation] = await db
        .select()
        .from(affirmations)
        .where(eq(affirmations.userId, req.user!.id))
        .orderBy(desc(affirmations.createdAt))
        .limit(1);
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
    const result = await db.insert(wellnessGoals)
      .values({
        ...req.body,
        userId: req.user!.id,
      });

    // Get the inserted goal
    const [goal] = await db
      .select()
      .from(wellnessGoals)
      .where(eq(wellnessGoals.id, Number(result.insertId)))
      .limit(1);
    res.json(goal);
  });

  // Update a wellness goal
  app.put("/api/goals/:id", requireAuth, async (req, res) => {
    await db.update(wellnessGoals)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(wellnessGoals.id, parseInt(req.params.id)),
          eq(wellnessGoals.userId, req.user!.id)
        )
      );
    const [goal] = await db
      .select()
      .from(wellnessGoals)
      .where(eq(wellnessGoals.id, parseInt(req.params.id)))
      .limit(1);
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
    const result = await db.insert(goalProgress)
      .values({
        goalId,
        value: req.body.value,
        note: req.body.note,
      });

    const [progress] = await db
      .select()
      .from(goalProgress)
      .where(eq(goalProgress.id, Number(result.insertId)))
      .limit(1);

    // Update the current value in the goal
    await db.update(wellnessGoals)
      .set({
        currentValue: goal.currentValue + req.body.value,
        isCompleted: goal.currentValue + req.body.value >= goal.targetValue,
        updatedAt: new Date(),
      })
      .where(eq(wellnessGoals.id, goalId));

    const [updatedGoal] = await db
      .select()
      .from(wellnessGoals)
      .where(eq(wellnessGoals.id, goalId))
      .limit(1);

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
    try {
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

        const result = await db.insert(dailyChallenges)
          .values({
            userId: req.user!.id,
            ...challenge,
          });

        // Get the inserted challenge
        const [todayChallenge] = await db
          .select()
          .from(dailyChallenges)
          .where(eq(dailyChallenges.id, Number(result.insertId)))
          .limit(1);
      }

      res.json(todayChallenge);
    } catch (error: any) {
      console.error("Error getting today's challenge:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Complete a challenge
  app.post("/api/challenges/:id/complete", requireAuth, async (req, res) => {
    await db.update(dailyChallenges)
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
      );

    // Get the updated challenge
    const [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.id, parseInt(req.params.id)))
      .limit(1);

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

  // Get emotional intelligence analysis
  app.get("/api/emotional-intelligence/analysis", requireAuth, async (req, res) => {
    try {
      // Get recent entries for the user
      const recentEntries = await db.query.entries.findMany({
        where: eq(entries.userId, req.user!.id),
        orderBy: [desc(entries.createdAt)],
        limit: 10,
      });

      if (recentEntries.length === 0) {
        return res.status(400).send("No journal entries found for analysis");
      }

      const analysis = await analyzeEmotionalIntelligence(
        recentEntries[0].content,
        recentEntries.slice(1).map(entry => ({
          content: entry.content,
          createdAt: entry.createdAt.toISOString(),
        }))
      );

      res.json(analysis);
    } catch (error) {
      console.error("Error getting emotional intelligence analysis:", error);
      res.status(500).send("Failed to get emotional intelligence analysis");
    }
  });


  // Support Network API Routes

  // Get all support topics
  app.get("/api/support-topics", requireAuth, async (req, res) => {
    const topics = await db.query.supportTopics.findMany({
      orderBy: [supportTopics.name],
    });
    res.json(topics);
  });

  // Get all support groups
  app.get("/api/support-groups", requireAuth, async (req, res) => {
    const groups = await db.query.supportGroups.findMany({
      orderBy: [desc(supportGroups.createdAt)],
    });
    res.json(groups);
  });

  // Create a new support group
  app.post("/api/support-groups", requireAuth, async (req, res) => {
    try {
      // Create the group
      const result = await db.insert(supportGroups)
        .values({
          name: req.body.name,
          description: req.body.description,
          topicId: req.body.topicId,
          isPrivate: req.body.isPrivate,
          maxMembers: req.body.maxMembers,
        });

      // Get the inserted group
      const [group] = await db
        .select()
        .from(supportGroups)
        .where(eq(supportGroups.id, Number(result.insertId)))
        .limit(1);

      // Create initial membership for the creator
      await db.insert(groupMemberships)
        .values({
          userId: req.user!.id,
          groupId: group.id,
          anonymousName: `Founder-${Math.random().toString(36).substring(2, 8)}`,
          isAdmin: true,
          role: 'admin',
          permissions: ['manage_members', 'send_messages', 'read_messages', 'moderate_messages']
        });

      // Get the created membership
      const [membership] = await db
        .select()
        .from(groupMemberships)
        .where(and(
          eq(groupMemberships.userId, req.user!.id),
          eq(groupMemberships.groupId, group.id)
        ))
        .limit(1);

      res.json({ group, membership });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user's group memberships
  app.get("/api/support-groups/memberships", requireAuth, async (req, res) => {
    const memberships = await db.query.groupMemberships.findMany({
      where: eq(groupMemberships.userId, req.user!.id),
      orderBy: [desc(groupMemberships.joinedAt)],
    });
    res.json(memberships);
  });

  // Join a support group
  app.post("/api/support-groups/:id/join", requireAuth, async (req, res) => {
    try {
      const canJoinGroup = await checkGroupLimit(req.user!);
      if (!canJoinGroup) {
        return res.status(402).send("Group limit reached. Please upgrade to Premium for unlimited groups.");
      }

      const groupId = parseInt(req.params.id);

      // Check if user is already a member
      const existingMembership = await db.query.groupMemberships.findFirst({
        where: and(
          eq(groupMemberships.userId, req.user!.id),
          eq(groupMemberships.groupId, groupId)
        ),
      });

      if (existingMembership) {
        return res.status(400).json({ message: "Already a member of this group" });
      }

      // Check if group exists and has space
      const group = await db.query.supportGroups.findFirst({
        where: eq(supportGroups.id, groupId),
      });

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const memberCount = await db.query.groupMemberships.findMany({
        where: eq(groupMemberships.groupId, groupId),
      });

      if (memberCount.length >= (group.maxMembers ?? 50)) {
        return res.status(400).json({ message: "Group is full" });
      }

      // Create membership
      const result = await db.insert(groupMemberships)
        .values({
          userId: req.user!.id,
          groupId,
          anonymousName: `Member-${Math.random().toString(36).substring(2, 8)}`,
          isAdmin: false,
          role: 'member',
          permissions: ['send_messages', 'read_messages']
        });

      // Get the created membership
      const [membership] = await db
        .select()
        .from(groupMemberships)
        .where(eq(groupMemberships.id, Number(result.insertId)))
        .limit(1);

      res.json(membership);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Generate invite link for a group
  app.post("/api/support-groups/:id/invite", requireAuth, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);

      // Check if user is admin of the group
      const membership = await db.query.groupMemberships.findFirst({
        where: and(
          eq(groupMemberships.userId, req.user!.id),
          eq(groupMemberships.groupId, groupId),
          eq(groupMemberships.isAdmin, true)
        ),
      });

      if (!membership) {
        return res.status(403).json({ message: "Only group admins can generate invite links" });
      }

      // Generate a unique invite code
      const inviteCode = randomBytes(16).toString('hex');

      await db.update(supportGroups)
        .set({ inviteCode })
        .where(eq(supportGroups.id, groupId));

      // Get the updated group
      const [group] = await db
        .select()
        .from(supportGroups)
        .where(eq(supportGroups.id, groupId))
        .limit(1);

      res.json({
        inviteCode: group.inviteCode,
        inviteLink: `/join/${group.inviteCode}`
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update the join group with invite code endpoint
  app.post("/api/support-groups/join/:inviteCode", requireAuth, async (req, res) => {
    try {
      // Find group by invite code
      const [group] = await db.query.supportGroups.findMany({
        where: eq(supportGroups.inviteCode, req.params.inviteCode),
      });

      if (!group) {
        return res.status(404).json({ message: "Invalid invite code" });
      }

      // Check if user is already a member
      const existingMembership = await db.query.groupMemberships.findFirst({
        where: and(
          eq(groupMemberships.userId, req.user!.id),
          eq(groupMemberships.groupId, group.id)
        ),
      });

      if (existingMembership) {
        // If already a member, return success with the existing membership
        return res.json({
          message: "Already a member",
          membership: existingMembership,
          alreadyMember: true
        });
      }

      // Check if group is full
      const memberCount = await db.query.groupMemberships.findMany({
        where: eq(groupMemberships.groupId, group.id),
      });

      if (memberCount.length >= (group.maxMembers ?? 50)) {
        return res.status(400).json({ message: "Group is full" });
      }

      // Create membership
      const result = await db.insert(groupMemberships)
        .values({
          userId: req.user!.id,
          groupId: group.id,
          anonymousName: `Member-${Math.random().toString(36).substring(2, 8)}`,
          role: 'member',
          permissions: ['send_messages', 'read_messages'],
          isAdmin: false,
        });

      // Get the created membership
      const [membership] = await db
        .select()
        .from(groupMemberships)
        .where(eq(groupMemberships.id, Number(result.insertId)))
        .limit(1);

      res.json({
        message: "Successfully joined the group",
        membership,
        alreadyMember: false
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update member role
  app.put("/api/support-groups/:groupId/members/:memberId/role", requireAuth, async (req, res) => {
    try {
      const { groupId, memberId } = req.params;
      const { role } = req.body;

      // Verify requester is admin
      const requesterMembership = await db.query.groupMemberships.findFirst({
        where: and(
          eq(groupMemberships.userId, req.user!.id),
          eq(groupMemberships.groupId, parseInt(groupId)),
          eq(groupMemberships.isAdmin, true)
        ),
      });

      if (!requesterMembership) {
        return res.status(403).json({ message: "Only admins can modify roles" });
      }

      await db.update(groupMemberships)
        .set({
          role,
          isAdmin: role === 'admin',
          permissions: role === 'admin'
            ? ['manage_members', 'send_messages', 'read_messages', 'moderate_messages']
            : role === 'moderator'
              ? ['send_messages', 'read_messages', 'moderate_messages']
              : ['send_messages', 'read_messages']
        })
        .where(eq(groupMemberships.id, parseInt(memberId)));

      //// Get the updated membership
      const [updatedMembership] = await db
        .select()
        .from(groupMemberships)
        .where(eq(groupMemberships.id, parseInt(memberId)))
        .limit(1);

      res.json(updatedMembership);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get group messages
  app.get("/api/support-groups/:id/messages", requireAuth, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);

      // Verify user is a member of the group
      const membership = await db.query.groupMemberships.findFirst({
        where: and(
          eq(groupMemberships.userId, req.user!.id),
          eq(groupMemberships.groupId, groupId)
        ),
      });

      if (!membership) {
        return res.status(403).json({ message: "Not a member of this group" });
      }

      const messages = await db.query.supportMessages.findMany({
        where: eq(supportMessages.groupId, groupId),
        orderBy: [desc(supportMessages.createdAt)],
      });

      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Post a message to a group
  app.post("/api/support-groups/:id/messages", requireAuth, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);

      // Verify user is a member of the group
      const membership = await db.query.groupMemberships.findFirst({
        where: and(
          eq(groupMemberships.userId, req.user!.id),
          eq(groupMemberships.groupId, groupId)
        ),
      });

      if (!membership) {
        return res.status(403).json({ message: "Not a member of this group" });
      }

      // Analyze sentiment of the message
      const sentiment = await analyzeChatSentiment(req.body.content);

      const result = await db.insert(supportMessages)
        .values({
          groupId,
          membershipId: membership.id,
          content: req.body.content,
          isAnonymous: req.body.isAnonymous ?? true,
          sentiment,
        });

      // Get the created message
      const [message] = await db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.id, Number(result.insertId)))
        .limit(1);

      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
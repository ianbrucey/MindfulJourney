import { pgTable, text, serial, integer, timestamp, boolean, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique(),
  emailNotifications: boolean("email_notifications").default(false),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastEntryDate: timestamp("last_entry_date"),
  subscriptionTier: text("subscription_tier").default('basic'),
  aiRequestsCount: integer("ai_requests_count").default(0),
  ai_requests_reset_date: timestamp("ai_requests_reset_date"),
});

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  mood: integer("mood").notNull(),
  tags: text("tags").array(),
  analysis: json("analysis").$type<{
    sentiment: { score: number; label: string };
    themes: string[];
    insights: string;
    recommendations: Array<{
      activity: string;
      reason: string;
      duration: string;
      benefit: string;
    }>;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  challenge: text("challenge").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  reflectionNote: text("reflection_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const affirmations = pgTable("affirmations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requirement: text("requirement").notNull(),
  level: integer("level").default(1),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const wellnessGoals = pgTable("wellness_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").default(0),
  frequency: text("frequency").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goalProgress = pgTable("goal_progress", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull().references(() => wellnessGoals.id),
  value: integer("value").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Add subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: json("features").$type<string[]>(),
  aiRequestsLimit: integer("ai_requests_limit"),
  groupLimit: integer("group_limit"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Add subscriptions table to track user subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: text("status").notNull(), // active, cancelled, expired
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Support Network Tables
export const supportTopics = pgTable("support_topics", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supportGroups = pgTable("support_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  topicId: integer("topic_id").references(() => supportTopics.id),
  isPrivate: boolean("is_private").default(false),
  maxMembers: integer("max_members").default(50),
  inviteCode: text("invite_code").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const groupMemberships = pgTable("group_memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  groupId: integer("group_id").notNull().references(() => supportGroups.id),
  anonymousName: text("anonymous_name").notNull(),
  role: text("role").notNull().default('member'),
  permissions: text("permissions").array(),
  isAdmin: boolean("is_admin").default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastActive: timestamp("last_active"),
});

export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => supportGroups.id),
  membershipId: integer("membership_id").notNull().references(() => groupMemberships.id),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  isAnonymous: boolean("is_anonymous").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at"),
  sentiment: json("sentiment").$type<{
    score: number;
    tone: string;
  }>(),
});

// Schemas and types for all tables
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const insertEntrySchema = createInsertSchema(entries);
export const selectEntrySchema = createSelectSchema(entries);
export type InsertEntry = typeof entries.$inferInsert;
export type SelectEntry = typeof entries.$inferSelect;

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges);
export const selectDailyChallengeSchema = createSelectSchema(dailyChallenges);
export type InsertDailyChallenge = typeof dailyChallenges.$inferInsert;
export type SelectDailyChallenge = typeof dailyChallenges.$inferSelect;

export const insertAffirmationSchema = createInsertSchema(affirmations);
export const selectAffirmationSchema = createSelectSchema(affirmations);
export type InsertAffirmation = typeof affirmations.$inferInsert;
export type SelectAffirmation = typeof affirmations.$inferSelect;

export const insertAchievementSchema = createInsertSchema(achievements);
export const selectAchievementSchema = createSelectSchema(achievements);
export type InsertAchievement = typeof achievements.$inferInsert;
export type SelectAchievement = typeof achievements.$inferSelect;

export const insertUserAchievementSchema = createInsertSchema(userAchievements);
export const selectUserAchievementSchema = createSelectSchema(userAchievements);
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
export type SelectUserAchievement = typeof userAchievements.$inferSelect;

export const insertWellnessGoalSchema = createInsertSchema(wellnessGoals);
export const selectWellnessGoalSchema = createSelectSchema(wellnessGoals);
export type InsertWellnessGoal = typeof wellnessGoals.$inferInsert;
export type SelectWellnessGoal = typeof wellnessGoals.$inferSelect;

export const insertGoalProgressSchema = createInsertSchema(goalProgress);
export const selectGoalProgressSchema = createSelectSchema(goalProgress);
export type InsertGoalProgress = typeof goalProgress.$inferInsert;
export type SelectGoalProgress = typeof goalProgress.$inferSelect;

// Support network schemas
export const insertSupportTopicSchema = createInsertSchema(supportTopics);
export const selectSupportTopicSchema = createSelectSchema(supportTopics);
export type InsertSupportTopic = typeof supportTopics.$inferInsert;
export type SelectSupportTopic = typeof supportTopics.$inferSelect;

export const insertSupportGroupSchema = createInsertSchema(supportGroups);
export const selectSupportGroupSchema = createSelectSchema(supportGroups);
export type InsertSupportGroup = typeof supportGroups.$inferInsert;
export type SelectSupportGroup = typeof supportGroups.$inferSelect;

export const insertGroupMembershipSchema = createInsertSchema(groupMemberships);
export const selectGroupMembershipSchema = createSelectSchema(groupMemberships);
export type InsertGroupMembership = typeof groupMemberships.$inferInsert;
export type SelectGroupMembership = typeof groupMemberships.$inferSelect;

export const insertSupportMessageSchema = createInsertSchema(supportMessages);
export const selectSupportMessageSchema = createSelectSchema(supportMessages);
export type InsertSupportMessage = typeof supportMessages.$inferInsert;
export type SelectSupportMessage = typeof supportMessages.$inferSelect;

// Add new schemas for subscription-related tables
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const selectSubscriptionPlanSchema = createSelectSchema(subscriptionPlans);
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type SelectSubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type SelectSubscription = typeof subscriptions.$inferSelect;
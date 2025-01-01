import { mysqlTable, varchar, int, timestamp, boolean, json, decimal, text } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
  emailNotifications: boolean("email_notifications").default(false),
  currentStreak: int("current_streak").default(0),
  longestStreak: int("longest_streak").default(0),
  lastEntryDate: timestamp("last_entry_date"),
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default('basic'),
  aiRequestsCount: int("ai_requests_count").default(0),
  aiRequestsResetDate: timestamp("ai_requests_reset_date"),
});

export const entries = mysqlTable("entries", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  mood: int("mood").notNull(),
  tags: json("tags").$type<string[]>(),
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

export const dailyChallenges = mysqlTable("daily_challenges", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  challenge: text("challenge").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  reflectionNote: text("reflection_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const affirmations = mysqlTable("affirmations", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  content: varchar("content", { length: 1000 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = mysqlTable("achievements", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: varchar("description", { length: 1000 }).notNull(),
  icon: varchar("icon", { length: 255 }).notNull(),
  requirement: varchar("requirement", { length: 500 }).notNull(),
  level: int("level").default(1),
});

export const userAchievements = mysqlTable("user_achievements", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  achievementId: int("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const wellnessGoals = mysqlTable("wellness_goals", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  category: varchar("category", { length: 100 }).notNull(),
  targetValue: int("target_value").notNull(),
  currentValue: int("current_value").default(0),
  frequency: varchar("frequency", { length: 50 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goalProgress = mysqlTable("goal_progress", {
  id: int("id").primaryKey().autoincrement(),
  goalId: int("goal_id").notNull().references(() => wellnessGoals.id),
  value: int("value").notNull(),
  note: varchar("note", { length: 1000 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceId: varchar("price_id", { length: 255 }).unique(),
  features: json("features").$type<string[]>(),
  aiRequestsLimit: int("ai_requests_limit"),
  groupLimit: int("group_limit"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  planId: int("plan_id").notNull().references(() => subscriptionPlans.id),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),
  status: varchar("status", { length: 50 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supportTopics = mysqlTable("support_topics", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: varchar("description", { length: 1000 }),
  icon: varchar("icon", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supportGroups = mysqlTable("support_groups", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  topicId: int("topic_id").references(() => supportTopics.id),
  isPrivate: boolean("is_private").default(false),
  maxMembers: int("max_members").default(50),
  inviteCode: varchar("invite_code", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const groupMemberships = mysqlTable("group_memberships", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  groupId: int("group_id").notNull().references(() => supportGroups.id),
  anonymousName: varchar("anonymous_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default('member'),
  permissions: json("permissions").$type<string[]>(),
  isAdmin: boolean("is_admin").default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastActive: timestamp("last_active"),
});

export const supportMessages = mysqlTable("support_messages", {
  id: int("id").primaryKey().autoincrement(),
  groupId: int("group_id").notNull().references(() => supportGroups.id),
  membershipId: int("membership_id").notNull().references(() => groupMemberships.id),
  content: text("content").notNull(),
  attachmentUrl: varchar("attachment_url", { length: 1000 }),
  isAnonymous: boolean("is_anonymous").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at"),
  sentiment: json("sentiment").$type<{
    score: number;
    tone: string;
  }>(),
});

// Export schemas and types for all tables
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

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const selectSubscriptionPlanSchema = createSelectSchema(subscriptionPlans);
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type SelectSubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type SelectSubscription = typeof subscriptions.$inferSelect;
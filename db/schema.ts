import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
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
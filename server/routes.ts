import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { entries, affirmations } from "@db/schema";
import { eq } from "drizzle-orm";
import { generateAffirmation } from "./openai";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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
      orderBy: (entries, { desc }) => [desc(entries.createdAt)],
    });
    res.json(userEntries);
  });

  // Create a new entry
  app.post("/api/entries", requireAuth, async (req, res) => {
    const entry = await db.insert(entries).values({
      ...req.body,
      userId: req.user!.id,
    }).returning();
    res.json(entry[0]);
  });

  // Update an entry
  app.put("/api/entries/:id", requireAuth, async (req, res) => {
    const entry = await db.update(entries)
      .set(req.body)
      .where(eq(entries.id, parseInt(req.params.id)))
      .returning();
    res.json(entry[0]);
  });

  // Get today's affirmation
  app.get("/api/affirmations/today", requireAuth, async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let [todayAffirmation] = await db.query.affirmations.findMany({
      where: eq(affirmations.userId, req.user!.id),
      orderBy: (affirmations, { desc }) => [desc(affirmations.createdAt)],
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

  const httpServer = createServer(app);
  return httpServer;
}

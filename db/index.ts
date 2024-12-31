import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure database with proper connection handling
export const db = drizzle(process.env.DATABASE_URL, {
  schema,
  // WebSocket support for Neon serverless driver
  webSocket: {
    client: ws,
    retryConnectAttempts: 3,
    retryConnectInterval: 1000
  }
});

// Export schema types for use in other parts of the application
export type Schema = typeof schema;
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const dbUrl = new URL("mysql://root:uG14RyKlOvKM@208.167.237.53:3306/mindful");

export default defineConfig({
  out: "./migrations",
  schema: "./db/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    port: Number(dbUrl.port),
  },
});
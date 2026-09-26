import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_aGL57xDEhevI@ep-autumn-cake-za78paqv-pooler.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});

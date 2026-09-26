import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

import fs from "fs";
import path from "path";

// Auto-load .env for scripts and test runner if DATABASE_URL is not already set
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf-8").split("\n");
      for (const line of lines) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = (match[2] || "").trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  } catch {
    // Ignore fallback errors
  }
}

const rawConnectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/beninvie";

const connectionString = rawConnectionString.replace(/&channel_binding=require/g, "");
const isNeon = connectionString.includes("neon.tech");

// Pool singleton to avoid connection exhaustion in serverless / dev
const globalForDb = globalThis as unknown as {
  neonPool?: Pool;
};

export const pool =
  globalForDb.neonPool ||
  new Pool({
    connectionString,
    ssl: isNeon ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.neonPool = pool;
}

export const db = drizzle(pool, { schema });
export { schema };

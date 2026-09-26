import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/beninvie";

// Pool singleton to avoid connection exhaustion in serverless / dev
const globalForDb = globalThis as unknown as {
  neonPool?: Pool;
};

export const pool =
  globalForDb.neonPool ||
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.neonPool = pool;
}

export const db = drizzle(pool, { schema });
export { schema };

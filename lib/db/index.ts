import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create Neon serverless SQL connection
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle ORM instance with schema for relational queries
export const db = drizzle(sql, { schema });

import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

let db;

if (process.env.DATABASE_URL.includes("neon.tech")) {
  // ✅ Neon PostgreSQL (serverless)
  console.log("🔌 Using Neon PostgreSQL setup");
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
} else {
  // ✅ Render or standard PostgreSQL
  console.log("🔌 Using standard PostgreSQL setup (Render or local)");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  db = drizzle(pool, { schema });
}

export { db };

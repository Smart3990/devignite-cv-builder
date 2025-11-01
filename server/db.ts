import { drizzle } from "drizzle-orm";
import * as schema from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { Client } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

let db;

// Detect if DATABASE_URL contains 'neon.tech' (or any other indicator)
if (process.env.DATABASE_URL.includes("neon.tech")) {
  // ✅ Connect using Neon
  console.log("🔌 Using Neon PostgreSQL setup");
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
} else {
  // ✅ Connect using Render or standard PostgreSQL
  console.log("🔌 Using standard PostgreSQL setup (Render or local)");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  db = drizzle(client, { schema });
}

export { db };

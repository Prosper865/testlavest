import "server-only";

// Database client. Point DATABASE_URL at any Postgres database (local, Neon, Supabase, RDS, ...).
// Migrations in /migrations are applied automatically the first time the database is used.

import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Add a Postgres connection string to .env.local.");

// One pool per process; hot reloads reuse it instead of leaking connections.
const globalForDb = globalThis as unknown as { pgPool?: Pool; dbReady?: Promise<void>; dbMigrationKey?: string };
const pool = globalForDb.pgPool ??= new Pool({ connectionString: url, max: Number(process.env.DATABASE_POOL_MAX ?? 10) });
const database = drizzle(pool, { schema });

const migrationsFolder = path.join(process.cwd(), "migrations");

/** Resolves the database once migrations have run. */
export async function getDb() {
  // A completed promise survives hot reloads, so it must also identify the migrations
  // it applied. Otherwise new schema code can run against the previous database schema.
  const migrationKey = `${url}:${fs.readFileSync(path.join(migrationsFolder, "meta", "_journal.json"), "utf8")}`;
  if (!globalForDb.dbReady || globalForDb.dbMigrationKey !== migrationKey) {
    const previous = globalForDb.dbReady;
    globalForDb.dbMigrationKey = migrationKey;
    const ready = (async () => {
      // Serialize a newly discovered migration behind any initialization in flight.
      await previous?.catch(() => undefined);
      await migrate(database, { migrationsFolder });
    })();
    globalForDb.dbReady = ready;
    void ready.catch(() => {
      if (globalForDb.dbReady === ready) globalForDb.dbReady = undefined;
    });
  }
  await globalForDb.dbReady;
  return database;
}

export { schema };

// Creates an admin account, or promotes and resets an existing one.
// Usage: pnpm admin:create   (reads DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, and optional ADMIN_NAME from .env / .env.local)

import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Platform Admin";

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL to a Postgres connection string in .env.local.");
  process.exit(1);
}
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("Set ADMIN_EMAIL to a valid email in .env.local.");
  process.exit(1);
}
if (!password || password.length < 12) {
  console.error("Set ADMIN_PASSWORD in .env.local (at least 12 characters).");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  await migrate(drizzle(pool), { migrationsFolder: "migrations" });
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await pool.query("select id from users where email = $1", [email]);
  if (existing.rows.length) {
    await pool.query("update users set role = 'admin', status = 'active', password_hash = $1, name = $2 where email = $3", [passwordHash, name, email]);
    console.log(`Updated ${email}: role set to admin and password reset.`);
  } else {
    await pool.query(
      "insert into users (id, email, name, password_hash, role, status, created_at) values ($1, $2, $3, $4, 'admin', 'active', now())",
      [crypto.randomUUID(), email, name, passwordHash],
    );
    console.log(`Created admin ${email}.`);
  }
} finally {
  await pool.end();
}

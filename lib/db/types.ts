import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schema from "./schema";

/** Any Drizzle Postgres database or transaction for this schema (node-postgres in the app, PGlite in checks). */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

import pg from "pg";
import { env } from "../config/env.js";
import { SCHEMA_SQL } from "./schema.js";

let pool: pg.Pool | undefined;
let ready: Promise<void> | undefined;

function createPool() {
  if (!env.databaseUrl) throw new Error("DATABASE_URL is not set");
  const isLocal = /localhost|127\.0\.0\.1/.test(env.databaseUrl);
  return new pg.Pool({
    // pg treats sslmode=require as verify-full; strip URL TLS params and configure TLS explicitly
    connectionString: env.databaseUrl.replace(/[?&]sslmode=[^&]*/, "").replace(/[?&]channel_binding=[^&]*/, ""),
    ssl: isLocal ? false : { rejectUnauthorized: true },
    max: 5,
  });
}

/** Returns a ready connection pool, creating the schema on first use. */
export async function getDb() {
  pool ??= createPool();
  ready ??= pool
    .query(SCHEMA_SQL)
    .then(() => undefined)
    .catch((e) => {
      ready = undefined;
      throw e;
    });
  await ready;
  return pool;
}

import pg from "pg";

let pool: pg.Pool | undefined;
let ready: Promise<void> | undefined;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");
    const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
    pool = new pg.Pool({
      // pg treats sslmode=require as verify-full; strip it and configure TLS explicitly
      connectionString: connectionString.replace(/[?&]sslmode=[^&]*/, "").replace(/[?&]channel_binding=[^&]*/, ""),
      ssl: isLocal ? false : { rejectUnauthorized: true },
      max: 5,
    });
  }
  return pool;
}

async function init() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS transcriptions (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL DEFAULT 'Untitled',
      content     TEXT NOT NULL,
      language    TEXT NOT NULL DEFAULT 'hi-IN',
      engine      TEXT NOT NULL DEFAULT 'gemini',
      duration_ms INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE transcriptions ADD COLUMN IF NOT EXISTS engine TEXT NOT NULL DEFAULT 'gemini';
    CREATE INDEX IF NOT EXISTS transcriptions_created_at_idx ON transcriptions (created_at DESC);
  `);
}

/** Returns a ready pool; creates the schema on first use. */
export async function db() {
  if (!ready) {
    ready = init().catch((e) => {
      ready = undefined;
      throw e;
    });
  }
  await ready;
  return getPool();
}

export type Transcription = {
  id: number;
  title: string;
  content: string;
  language: string;
  engine: string;
  duration_ms: number;
  created_at: string;
  updated_at: string;
};

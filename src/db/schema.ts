export const SCHEMA_SQL = `
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
`;

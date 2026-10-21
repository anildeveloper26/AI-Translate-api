import { getDb } from "../db/pool.js";
import type {
  CreateTranscriptionInput,
  ListTranscriptionsQuery,
  Transcription,
  UpdateTranscriptionInput,
} from "../types/transcription.js";
import { HttpError } from "../utils/httpError.js";

// Columns that may be updated; keys always come from this list, never from request input
const UPDATABLE = ["title", "content", "language"] as const;

function defaultTitle(content: string) {
  const words = content.split(/\s+/).slice(0, 6).join(" ");
  return words.length < content.length ? `${words}…` : words;
}

export async function listTranscriptions({ q, limit, offset }: ListTranscriptionsQuery) {
  const db = await getDb();
  const where = q ? "WHERE title ILIKE $1 OR content ILIKE $1" : "";
  const params: unknown[] = q ? [`%${q}%`] : [];

  const [items, count] = await Promise.all([
    db.query<Transcription>(
      `SELECT * FROM transcriptions ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    ),
    db.query<{ count: string }>(`SELECT COUNT(*) FROM transcriptions ${where}`, params),
  ]);
  return { items: items.rows, total: Number(count.rows[0].count) };
}

export async function getTranscription(id: number) {
  const { rows } = await (await getDb()).query<Transcription>("SELECT * FROM transcriptions WHERE id = $1", [id]);
  if (!rows[0]) throw HttpError.notFound();
  return rows[0];
}

export async function createTranscription(input: CreateTranscriptionInput) {
  const { rows } = await (await getDb()).query<Transcription>(
    `INSERT INTO transcriptions (title, content, language, engine, duration_ms)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [input.title ?? defaultTitle(input.content), input.content, input.language ?? "hi-IN", input.engine ?? "gemini", input.duration_ms ?? 0],
  );
  return rows[0];
}

export async function updateTranscription(id: number, input: UpdateTranscriptionInput) {
  const fields = UPDATABLE.filter((k) => input[k] !== undefined);
  const sets = fields.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const { rows } = await (await getDb()).query<Transcription>(
    `UPDATE transcriptions SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...fields.map((k) => input[k])],
  );
  if (!rows[0]) throw HttpError.notFound();
  return rows[0];
}

export async function deleteTranscription(id: number) {
  const { rowCount } = await (await getDb()).query("DELETE FROM transcriptions WHERE id = $1", [id]);
  if (!rowCount) throw HttpError.notFound();
}

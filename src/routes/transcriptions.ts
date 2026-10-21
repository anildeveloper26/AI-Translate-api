import { Router } from "express";
import { db, type Transcription } from "../lib/db.js";
import { parseInput } from "../lib/validate.js";

export const transcriptions = Router();

const parseId = (raw: string) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const defaultTitle = (content: string) => {
  const words = content.split(/\s+/).slice(0, 6).join(" ");
  return words.length < content.length ? `${words}…` : words;
};

// GET /api/transcriptions?q=&limit=&offset=
transcriptions.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const pool = await db();

  const where = q ? "WHERE title ILIKE $1 OR content ILIKE $1" : "";
  const params: unknown[] = q ? [`%${q}%`] : [];
  const [{ rows }, { rows: count }] = await Promise.all([
    pool.query<Transcription>(
      `SELECT * FROM transcriptions ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    ),
    pool.query<{ count: string }>(`SELECT COUNT(*) FROM transcriptions ${where}`, params),
  ]);
  res.json({ items: rows, total: Number(count[0].count) });
});

transcriptions.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  const { rows } = await (await db()).query<Transcription>("SELECT * FROM transcriptions WHERE id = $1", [id]);
  if (!rows[0]) return void res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

// POST /api/transcriptions  { content, title?, language?, engine?, duration_ms? }
transcriptions.post("/", async (req, res) => {
  const parsed = parseInput(req.body, false);
  if (!parsed.data) return void res.status(400).json({ error: parsed.error });
  const { title, content, language, engine, duration_ms } = parsed.data;
  const { rows } = await (await db()).query<Transcription>(
    `INSERT INTO transcriptions (title, content, language, engine, duration_ms)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title ?? defaultTitle(content!), content, language ?? "hi-IN", engine ?? "gemini", duration_ms ?? 0],
  );
  res.status(201).json(rows[0]);
});

// PATCH /api/transcriptions/:id  { title?, content?, language? }
transcriptions.patch("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  const parsed = parseInput(req.body, true);
  if (!parsed.data) return void res.status(400).json({ error: parsed.error });

  // keys come from the validated whitelist in parseInput, never from the raw body
  const fields = Object.entries(parsed.data).filter(([, v]) => v !== undefined);
  if (!fields.length) return void res.status(400).json({ error: "Nothing to update" });
  const sets = fields.map(([k], i) => `${k} = $${i + 2}`).join(", ");

  const { rows } = await (await db()).query<Transcription>(
    `UPDATE transcriptions SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...fields.map(([, v]) => v)],
  );
  if (!rows[0]) return void res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

transcriptions.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  const { rowCount } = await (await db()).query("DELETE FROM transcriptions WHERE id = $1", [id]);
  if (!rowCount) return void res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

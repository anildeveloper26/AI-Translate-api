import {
  ENGINES,
  LANGUAGES,
  type CreateTranscriptionInput,
  type Engine,
  type Language,
  type ListTranscriptionsQuery,
  type UpdateTranscriptionInput,
} from "../types/transcription.js";
import { HttpError } from "../utils/httpError.js";

type Body = Record<string, unknown>;

function asBody(body: unknown): Body {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw HttpError.badRequest("Invalid JSON body");
  return body as Body;
}

function title(v: unknown) {
  if (typeof v !== "string" || v.length > 200) throw HttpError.badRequest("title must be a string (max 200 chars)");
  return v.trim() || "Untitled";
}

function content(v: unknown) {
  if (typeof v !== "string" || !v.trim() || v.length > 20000)
    throw HttpError.badRequest("content must be a non-empty string (max 20000 chars)");
  return v.trim();
}

function language(v: unknown): Language {
  if (typeof v !== "string" || !(LANGUAGES as readonly string[]).includes(v)) throw HttpError.badRequest("unsupported language");
  return v as Language;
}

function engine(v: unknown): Engine {
  if (typeof v !== "string" || !(ENGINES as readonly string[]).includes(v)) throw HttpError.badRequest("unsupported engine");
  return v as Engine;
}

function durationMs(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw HttpError.badRequest("duration_ms must be a positive number");
  return Math.round(n);
}

export function parseId(raw: string) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest("Invalid id");
  return id;
}

export function parseCreate(raw: unknown): CreateTranscriptionInput {
  const b = asBody(raw);
  return {
    content: content(b.content),
    ...(b.title !== undefined && { title: title(b.title) }),
    ...(b.language !== undefined && { language: language(b.language) }),
    ...(b.engine !== undefined && { engine: engine(b.engine) }),
    ...(b.duration_ms !== undefined && { duration_ms: durationMs(b.duration_ms) }),
  };
}

export function parseUpdate(raw: unknown): UpdateTranscriptionInput {
  const b = asBody(raw);
  const out: UpdateTranscriptionInput = {
    ...(b.title !== undefined && { title: title(b.title) }),
    ...(b.content !== undefined && { content: content(b.content) }),
    ...(b.language !== undefined && { language: language(b.language) }),
  };
  if (!Object.keys(out).length) throw HttpError.badRequest("Nothing to update");
  return out;
}

export function parseListQuery(query: Record<string, unknown>): ListTranscriptionsQuery {
  return {
    q: String(query.q ?? "").trim(),
    limit: Math.min(Math.max(Number(query.limit) || 50, 1), 200),
    offset: Math.max(Number(query.offset) || 0, 0),
  };
}

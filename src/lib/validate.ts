export const LANGUAGES = ["hi-IN", "en-IN", "en-US", "te-IN", "ta-IN", "kn-IN", "mr-IN", "bn-IN"] as const;
export const ENGINES = ["gemini", "browser"] as const;

export type TranscriptionInput = {
  title?: string;
  content?: string;
  language?: string;
  engine?: string;
  duration_ms?: number;
};

type Result = { data: TranscriptionInput; error?: undefined } | { error: string; data?: undefined };

export function parseInput(body: unknown, partial: boolean): Result {
  if (!body || typeof body !== "object") return { error: "Invalid JSON body" };
  const b = body as Record<string, unknown>;
  const out: TranscriptionInput = {};

  if (b.title !== undefined) {
    if (typeof b.title !== "string" || b.title.length > 200) return { error: "title must be a string (max 200 chars)" };
    out.title = b.title.trim() || "Untitled";
  }
  if (b.content !== undefined) {
    if (typeof b.content !== "string" || !b.content.trim() || b.content.length > 20000)
      return { error: "content must be a non-empty string (max 20000 chars)" };
    out.content = b.content.trim();
  } else if (!partial) {
    return { error: "content is required" };
  }
  if (b.language !== undefined) {
    if (typeof b.language !== "string" || !(LANGUAGES as readonly string[]).includes(b.language))
      return { error: "unsupported language" };
    out.language = b.language;
  }
  if (b.engine !== undefined) {
    if (typeof b.engine !== "string" || !(ENGINES as readonly string[]).includes(b.engine)) return { error: "unsupported engine" };
    out.engine = b.engine;
  }
  if (b.duration_ms !== undefined) {
    const n = Number(b.duration_ms);
    if (!Number.isFinite(n) || n < 0) return { error: "duration_ms must be a positive number" };
    out.duration_ms = Math.round(n);
  }
  return { data: out };
}

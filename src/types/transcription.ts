export const LANGUAGES = ["hi-IN", "en-IN", "en-US", "te-IN", "ta-IN", "kn-IN", "mr-IN", "bn-IN"] as const;
export const ENGINES = ["gemini", "browser"] as const;

export type Language = (typeof LANGUAGES)[number];
export type Engine = (typeof ENGINES)[number];

export type Transcription = {
  id: number;
  title: string;
  content: string;
  language: Language;
  engine: Engine;
  duration_ms: number;
  created_at: string;
  updated_at: string;
};

export type CreateTranscriptionInput = {
  content: string;
  title?: string;
  language?: Language;
  engine?: Engine;
  duration_ms?: number;
};

export type UpdateTranscriptionInput = Partial<Pick<Transcription, "title" | "content" | "language">>;

export type ListTranscriptionsQuery = { q: string; limit: number; offset: number };

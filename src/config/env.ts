function list(value: string | undefined, fallback: string) {
  return (value || fallback)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 4000,
  isServerless: !!process.env.VERCEL,
  databaseUrl: process.env.DATABASE_URL ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiLiveModel: process.env.GEMINI_LIVE_MODEL || "gemini-3.5-transcribe-live",
  corsOrigins: list(process.env.CORS_ORIGIN, "http://localhost:5173"),
} as const;

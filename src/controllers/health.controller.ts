import type { Request, Response } from "express";
import { env } from "../config/env.js";

export function root(_req: Request, res: Response) {
  res.json({ name: "AI Translate API", docs: "/api/health" });
}

export function health(_req: Request, res: Response) {
  res.json({ ok: true, liveModel: env.geminiLiveModel, gemini: !!env.geminiApiKey, database: !!env.databaseUrl });
}

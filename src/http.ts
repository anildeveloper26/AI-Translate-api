import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { transcriptions } from "./routes/transcriptions.js";
import { live, LIVE_MODEL } from "./routes/live.js";

export const app = express();

const origins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(cors({ origin: origins }));
app.use(express.json({ limit: "100kb" }));

app.get("/", (_req, res) => {
  res.json({ name: "AI Translate API", docs: "/api/health" });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, liveModel: LIVE_MODEL, gemini: !!process.env.GEMINI_API_KEY, database: !!process.env.DATABASE_URL });
});

app.use("/api/transcriptions", transcriptions);
app.use("/api/live", live);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err?.type === "entity.parse.failed" ? 400 : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 400 ? "Invalid JSON body" : "Internal server error" });
};
app.use(onError);

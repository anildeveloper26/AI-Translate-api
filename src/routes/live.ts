import { Router } from "express";
import { GoogleGenAI, Modality } from "@google/genai";

export const LIVE_MODEL = process.env.GEMINI_LIVE_MODEL || "gemini-3.5-transcribe-live";

export const live = Router();

// Simple in-memory limiter so the token endpoint can't be used to burn the API quota
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 30;

function allowed(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

/**
 * POST /api/live/token
 * Mints a short-lived, single-use Gemini Live token locked to the transcription model,
 * so the browser can stream microphone audio to Gemini without ever seeing the API key.
 */
live.post("/token", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return void res.status(503).json({ error: "Gemini is not configured on the server" });
  if (!allowed(req.ip ?? "unknown")) return void res.status(429).json({ error: "Too many sessions, try again in a few minutes" });

  const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });
  const now = Date.now();
  const token = await ai.authTokens.create({
    config: {
      uses: 1,
      expireTime: new Date(now + 30 * 60_000).toISOString(), // session may run up to 30 min
      newSessionExpireTime: new Date(now + 60_000).toISOString(), // must connect within 1 min
      liveConnectConstraints: {
        model: LIVE_MODEL,
        config: { responseModalities: [Modality.TEXT], inputAudioTranscription: {} },
      },
      httpOptions: { apiVersion: "v1alpha" },
    },
  });

  res.json({ token: token.name, model: LIVE_MODEL, expiresAt: new Date(now + 30 * 60_000).toISOString() });
});

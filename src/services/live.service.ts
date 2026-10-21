import { GoogleGenAI, Modality } from "@google/genai";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const SESSION_TTL_MS = 30 * 60_000; // a session may run up to 30 minutes
const CONNECT_WINDOW_MS = 60_000; // the client must open the session within 1 minute

/**
 * Mints a short-lived, single-use Gemini Live token locked to the transcription model,
 * so the browser can stream microphone audio to Gemini without ever seeing the API key.
 */
export async function createLiveToken() {
  if (!env.geminiApiKey) throw HttpError.unavailable("Gemini is not configured on the server");

  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey, httpOptions: { apiVersion: "v1alpha" } });
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_TTL_MS).toISOString();

  const token = await ai.authTokens.create({
    config: {
      uses: 1,
      expireTime: expiresAt,
      newSessionExpireTime: new Date(now + CONNECT_WINDOW_MS).toISOString(),
      liveConnectConstraints: {
        model: env.geminiLiveModel,
        config: { responseModalities: [Modality.TEXT], inputAudioTranscription: {} },
      },
      httpOptions: { apiVersion: "v1alpha" },
    },
  });

  return { token: token.name, model: env.geminiLiveModel, expiresAt };
}

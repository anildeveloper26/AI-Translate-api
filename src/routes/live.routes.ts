import { Router } from "express";
import * as controller from "../controllers/live.controller.js";
import { rateLimit } from "../middlewares/rateLimit.js";

export const liveRoutes = Router();

// Limit token minting so the endpoint can't be used to burn the Gemini quota
liveRoutes.post("/token", rateLimit({ windowMs: 10 * 60_000, max: 30 }), controller.token);

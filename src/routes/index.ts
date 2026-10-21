import { Router } from "express";
import * as health from "../controllers/health.controller.js";
import { liveRoutes } from "./live.routes.js";
import { transcriptionRoutes } from "./transcription.routes.js";

export const routes = Router();

routes.get("/", health.root);
routes.get("/api/health", health.health);
routes.use("/api/transcriptions", transcriptionRoutes);
routes.use("/api/live", liveRoutes);

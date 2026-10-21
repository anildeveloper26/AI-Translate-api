import { Router } from "express";
import * as controller from "../controllers/transcription.controller.js";

export const transcriptionRoutes = Router();

transcriptionRoutes.get("/", controller.list);
transcriptionRoutes.post("/", controller.create);
transcriptionRoutes.get("/:id", controller.getById);
transcriptionRoutes.patch("/:id", controller.update);
transcriptionRoutes.delete("/:id", controller.remove);

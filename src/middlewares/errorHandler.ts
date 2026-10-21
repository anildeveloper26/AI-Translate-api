import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../utils/httpError.js";

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Not found" });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) return void res.status(err.status).json({ error: err.message });
  if (err?.type === "entity.parse.failed") return void res.status(400).json({ error: "Invalid JSON body" });
  if (err?.type === "entity.too.large") return void res.status(413).json({ error: "Request body too large" });

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};

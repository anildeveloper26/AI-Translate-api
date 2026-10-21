import type { RequestHandler } from "express";
import { HttpError } from "../utils/httpError.js";

/** Minimal in-memory fixed-window limiter, keyed by client IP. */
export function rateLimit({ windowMs, max }: { windowMs: number; max: number }): RequestHandler {
  const hits = new Map<string, number[]>();

  return (req, _res, next) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) return next(HttpError.tooManyRequests("Too many sessions, try again in a few minutes"));
    recent.push(now);
    hits.set(key, recent);
    next();
  };
}

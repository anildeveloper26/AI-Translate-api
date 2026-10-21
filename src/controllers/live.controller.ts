import type { Request, Response } from "express";
import { createLiveToken } from "../services/live.service.js";

export async function token(_req: Request, res: Response) {
  res.json(await createLiveToken());
}

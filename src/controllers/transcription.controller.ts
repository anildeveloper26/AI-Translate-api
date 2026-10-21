import type { Request, Response } from "express";
import * as service from "../services/transcription.service.js";
import { parseCreate, parseId, parseListQuery, parseUpdate } from "../validators/transcription.validator.js";

export async function list(req: Request, res: Response) {
  res.json(await service.listTranscriptions(parseListQuery(req.query)));
}

export async function getById(req: Request<{ id: string }>, res: Response) {
  res.json(await service.getTranscription(parseId(req.params.id)));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await service.createTranscription(parseCreate(req.body)));
}

export async function update(req: Request<{ id: string }>, res: Response) {
  res.json(await service.updateTranscription(parseId(req.params.id), parseUpdate(req.body)));
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  await service.deleteTranscription(parseId(req.params.id));
  res.status(204).end();
}

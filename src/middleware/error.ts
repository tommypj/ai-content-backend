// src/middleware/error.ts
// src/middleware/error.ts
import type { NextFunction, Request, Response } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  res.status(500).json({ error: message });
}

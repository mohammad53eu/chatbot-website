import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err); // basic logging
  const status = err?.status || 500;
  let message = 'Internal Server Error';
  if (err?.message === 'UNIQUE_CONSTRAINT') message = 'Identifier already in use';
  else if (typeof err?.message === 'string' && status !== 500) message = err.message;
  res.status(status).json({ error: message });
}

import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

function limitHandler(_req: Request, res: Response): void {
  res.status(429).json({
    error: {
      message: 'Too many requests. Please slow down and try again shortly.',
      code: 'RATE_LIMITED',
    },
  });
}

const shared = {
  standardHeaders: 'draft-7' as const,
  legacyHeaders: false,
  handler: limitHandler,
};

/** Broad safety net for all API traffic. */
export const apiLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 300,
});

/** Tighter limit on sign-in / registration attempts. */
export const authLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 25,
});

/** Limits case mutations and notification writes. */
export const writeLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 120,
});

/** Limits costly model, transcription and speech generation requests. */
export const assistantLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 30,
});

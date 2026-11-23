import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { isProduction } from '../config';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      message: `No route matches ${req.method} ${req.path}`,
      code: 'NOT_FOUND',
    },
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code,
        ...(error.details ? { details: error.details } : {}),
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Please check the highlighted fields and try again.',
        code: 'VALIDATION_ERROR',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      error: { message: 'Invalid identifier format', code: 'INVALID_ID' },
    });
    return;
  }

  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    res.status(409).json({
      error: { message: 'That record already exists', code: 'DUPLICATE' },
    });
    return;
  }

  if (typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.too.large') {
    res.status(413).json({
      error: { message: 'Request body is too large', code: 'PAYLOAD_TOO_LARGE' },
    });
    return;
  }

  // Log the message only — never request bodies, tokens, or query strings.
  console.error('Unhandled API error:', error instanceof Error ? error.message : 'unknown error');
  res.status(500).json({
    error: {
      message: 'Something went wrong on our side. Please try again.',
      code: 'INTERNAL_ERROR',
      ...(isProduction ? {} : { debug: error instanceof Error ? error.message : undefined }),
    },
  });
}

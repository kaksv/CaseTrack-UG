import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config';
import { User } from '../models/User';
import { AppError, unauthorized } from '../lib/errors';
import type { UserRole } from '../types';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw unauthorized();
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) throw unauthorized();

    let payload: JwtPayload;
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      if (typeof decoded === 'string') throw new Error('invalid payload');
      payload = decoded;
    } catch {
      throw unauthorized('Your session has expired. Please sign in again.');
    }

    if (!payload.sub) throw unauthorized();

    const user = await User.findById(payload.sub).select('name email role').lean();
    if (!user) throw unauthorized('Account no longer exists');

    req.authUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    };
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      next(unauthorized());
      return;
    }
    if (!roles.includes(req.authUser.role)) {
      next(new AppError(403, 'This action is restricted to court officers', 'FORBIDDEN'));
      return;
    }
    next();
  };
}

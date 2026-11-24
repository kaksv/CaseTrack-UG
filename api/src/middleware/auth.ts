
import type {
  NextFunction,
  Request,
  Response,
} from 'express';

import jwt, {
  type JwtPayload,
} from 'jsonwebtoken';

import { env } from '../config';
import { User } from '../models/User';
import {
  AppError,
  unauthorized,
} from '../lib/errors';

import {
  USER_ROLES,
  type UserRole,
} from '../types';

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw unauthorized();
    }

    const token = header
      .slice('Bearer '.length)
      .trim();

    if (!token) {
      throw unauthorized();
    }

    let payload: JwtPayload;

    try {
      const decoded = jwt.verify(
        token,
        env.JWT_SECRET,
      );

      if (typeof decoded === 'string') {
        throw new Error('Invalid payload');
      }

      payload = decoded;
    } catch {
      throw unauthorized(
        'Your session has expired. Please sign in again.',
      );
    }

    if (
      typeof payload.sub !== 'string' ||
      !/^[a-fA-F0-9]{24}$/.test(payload.sub)
    ) {
      throw unauthorized();
    }

    const user = await User.findById(payload.sub)
      .select(
        'name email role institution isDemo accountStatus',
      )
      .lean();

    if (!user) {
      throw unauthorized(
        'Account no longer exists',
      );
    }

    if (
      (user.accountStatus ?? 'ACTIVE') !== 'ACTIVE'
    ) {
      throw unauthorized(
        'Your account is not active. Contact your administrator.',
      );
    }

    if (!USER_ROLES.includes(user.role)) {
      throw unauthorized(
        'Invalid account role',
      );
    }

    req.authUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: user.institution
        ? String(user.institution)
        : null,
      isDemo: user.isDemo ?? false,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(
  ...roles: UserRole[]
) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    if (!req.authUser) {
      next(unauthorized());
      return;
    }

    if (!roles.includes(req.authUser.role)) {
      next(
        new AppError(
          403,
          'You do not have permission to perform this action',
          'FORBIDDEN',
        ),
      );

      return;
    }

    next();
  };
}

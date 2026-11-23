import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config';
import type { UserRole } from '../types';

export interface TokenPayload {
  sub: string;
  role: UserRole;
}

export function signToken(user: { id: string; role: UserRole }): string {
  const payload: TokenPayload = { sub: user.id, role: user.role };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

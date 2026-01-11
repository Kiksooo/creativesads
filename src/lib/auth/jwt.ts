// JWT utilities

import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { getJWT_SECRET } from '../env';

export interface TokenPayload {
  userId: string;
  email: string;
}

const expiresInSeconds = Number(process.env.JWT_EXPIRES_IN ?? "604800"); // 7 days default

const signOptions: SignOptions = {
  expiresIn: Number.isFinite(expiresInSeconds) ? expiresInSeconds : 604800,
};

export function generateToken(userId: string, email: string): string {
  const secret = getJWT_SECRET(); // Guaranteed to be string, throws if not set
  return jwt.sign(
    { userId, email },
    secret,
    signOptions
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = getJWT_SECRET(); // Guaranteed to be string, throws if not set
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}


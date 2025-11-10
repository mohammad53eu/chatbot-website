import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../types/auth';
import { getEnv } from '../utils/env';

const JWT_SECRET = getEnv('JWT_SECRET', 'dev_secret');
const EXPIRY = '1h';

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRY });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

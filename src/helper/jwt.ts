import jwt, { SignOptions } from 'jsonwebtoken';
import { IJwtPayload } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const signToken = (
  payload: IJwtPayload,
): string => {
  const options: SignOptions = { expiresIn: '1d' };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
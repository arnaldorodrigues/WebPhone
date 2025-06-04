import jwt from 'jsonwebtoken';
import { User } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (user: Omit<User, 'password'>): string => {
  return jwt.sign(
    { _id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}; 
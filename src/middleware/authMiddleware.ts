import { verifyToken } from '@/utils/auth';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export const withAuth = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
      const decoded = verifyToken(token);
      (req as any).user = decoded;
      return handler(req, res);
    } catch (err: any) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  }
}

export const withRole = (role: string, handler: NextApiHandler) => {
  return withAuth(async (req, res) => {
    const user = (req as any).user;
    if (user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return handler(req, res);
  })
}
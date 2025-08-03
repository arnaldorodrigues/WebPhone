import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export function withAuth(
  handler: (req: NextRequest, context: { params: any }, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: any) => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    try {
      const user = verifyToken(token);
      return handler(req, context, user);
    } catch (err: any) {
      console.error(err);
      return NextResponse.json(
        { message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }
  };
}

export function withRole(
  role: string,
  handler: (req: NextRequest, context: { params: any }, user: any) => Promise<NextResponse>
) {
  return withAuth(async (req, context, user) => {
    if (user.role !== role) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      )
    }

    return handler(req, context, user);
  });
}

// export const withAuth = (handler: NextApiHandler) => {
//   return async (req: NextApiRequest, res: NextApiResponse) => {
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ message: 'Unauthorized: No token provided' });
//     }

//     try {
//       const decoded = verifyToken(token);
//       (req as any).user = decoded;
//       return handler(req, res);
//     } catch (err: any) {
//       return res.status(401).json({ message: 'Unauthorized: Invalid token' });
//     }
//   }
// }

// export const withRole = (role: string, handler: NextApiHandler) => {
//   return withAuth(async (req, res) => {
//     const user = (req as any).user;
//     if (user.role !== role) {
//       return res.status(403).json({ message: 'Forbidden' });
//     }

//     return handler(req, res);
//   })
// }
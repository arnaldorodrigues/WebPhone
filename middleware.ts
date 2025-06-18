import { NextRequest, NextResponse } from 'next/server';
import { _parse_token } from '@/utils/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/admin/')) {
    try {
      const authToken = request.cookies.get('authToken')?.value;
      
      if (!authToken) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - No token provided' },
          { status: 401 }
        );
      }

      const tokenData = _parse_token(authToken);
      
      if (!tokenData) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      }

      if (tokenData.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Middleware auth verification error:", error);
      return NextResponse.json(
        { success: false, error: "Unauthorized - Token verification failed" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/admin/:path*",
  ],
};
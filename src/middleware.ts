import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './utils/jwt';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/signin' || path === '/signup';

  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') || '';

  // Verify the token
  const verifiedToken = token && verifyToken(token);

  console.log(isPublicPath, verifiedToken);

  // Redirect logic
  if (isPublicPath && verifiedToken) {
    console.log('dashbaord')
    // If user is authenticated and tries to access public paths, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isPublicPath && !verifiedToken) {
    // If user is not authenticated and tries to access protected paths, redirect to signin
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/signin',
    '/signup',
  ],
}; 
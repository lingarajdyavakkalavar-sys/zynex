import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthEnabled } from '@/lib/auth-config';

export default async function middleware(req: NextRequest) {
  // Skip auth check if not enabled
  if (!isAuthEnabled()) {
    return NextResponse.next();
  }

  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    const pathname = req.nextUrl.pathname;
    
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/sign-up');
    const isProtectedRoute = pathname.startsWith('/dashboard') || 
                             pathname.startsWith('/workspace') ||
                             pathname.startsWith('/practice') ||
                             pathname.startsWith('/planner') ||
                             pathname.startsWith('/notebook') ||
                             pathname.startsWith('/admin') ||
                             pathname.startsWith('/analytics') ||
                             pathname.startsWith('/profile');

    if (isProtectedRoute && !userId) {
      const signInUrl = new URL('/login', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (isAuthRoute && userId) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
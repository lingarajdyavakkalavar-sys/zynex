import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  try {
    const { userId } = await auth();
    const pathname = req.nextUrl.pathname;
    
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/sign-up');
    const isProtectedRoute = pathname.startsWith('/dashboard') || 
                             pathname.startsWith('/workspace') ||
                             pathname.startsWith('/practice') ||
                             pathname.startsWith('/planner') ||
                             pathname.startsWith('/notebook') ||
                             pathname.startsWith('/admin');

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
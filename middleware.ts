import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register-student',
    '/api/schools',
    '/api/students',
    '/api/auth',
  ];

  // Check if current path is public or an API route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || 
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  );

  // Admin routes (if you have them)
  const isAdminRoute = pathname.startsWith('/admin');

  // Dashboard route
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Register school route (now protected)
  const isRegisterSchoolRoute = pathname.startsWith('/register-school');

  // If accessing dashboard without login, redirect to login
  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing register-school without login, redirect to login
  if (isRegisterSchoolRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (pathname === '/login' && isLoggedIn) {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow access to public routes and authenticated routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

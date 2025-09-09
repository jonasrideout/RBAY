// middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export default auth(async (req) => {
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
    '/admin/login', // Add admin login as public route
  ];

  // Check if current path is public or an API route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || 
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  );

  // Admin routes protection
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/admin/login';

  // Handle admin routes
  if (isAdminRoute && !isAdminLoginRoute) {
    const adminSession = await getAdminSessionFromRequest(req);
    
    if (!adminSession) {
      // Not authenticated as admin, redirect to admin login
      const adminLoginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(adminLoginUrl);
    }
    
    // Admin is authenticated, allow access
    return NextResponse.next();
  }

  // If admin is logged in and trying to access admin login page, redirect to dashboard
  if (isAdminLoginRoute) {
    const adminSession = await getAdminSessionFromRequest(req);
    if (adminSession) {
      const adminDashboardUrl = new URL('/admin/matching', req.url);
      return NextResponse.redirect(adminDashboardUrl);
    }
  }

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

// /middleware.ts - Custom Session Authentication
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/lib/magicLink';

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

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

  // Admin routes protection - UNCHANGED (uses separate cookie system)
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/admin/login';

  // Handle admin routes - Use cookie check (unchanged from original)
  if (isAdminRoute && !isAdminLoginRoute) {
    const adminToken = req.cookies.get('admin-session');
    
    if (!adminToken) {
      // Not authenticated as admin, redirect to admin login
      const adminLoginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(adminLoginUrl);
    }
    
    // Admin token exists, allow access (full validation happens in the page)
    return NextResponse.next();
  }

  // If admin login page, check if already has admin token
  if (isAdminLoginRoute) {
    const adminToken = req.cookies.get('admin-session');
    if (adminToken) {
      const adminDashboardUrl = new URL('/admin/matching', req.url);
      return NextResponse.redirect(adminDashboardUrl);
    }
  }

  // Get teacher session using custom magic link system
  const sessionCheck = getSessionFromRequest(req);
  const isTeacherLoggedIn = sessionCheck.valid;

  // Dashboard route with admin access support
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  // Register school route with special admin mode handling
  const isRegisterSchoolRoute = pathname.startsWith('/register-school');

  // Dashboard route protection - allow teacher OR admin access
  if (isDashboardRoute && !isTeacherLoggedIn) {
    // Check if admin is trying to access dashboard
    const adminToken = req.cookies.get('admin-session');
    if (!adminToken) {
      // Neither teacher nor admin authenticated, redirect to teacher login
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    // Admin authenticated, allow access to dashboard
  }

  // Special handling for register-school route
  if (isRegisterSchoolRoute) {
    // Check if this is admin mode
    const isAdminMode = searchParams.get('admin') === 'true';
    
    if (isAdminMode) {
      // Admin mode - check for admin session
      const adminToken = req.cookies.get('admin-session');
      if (!adminToken) {
        // No admin session, redirect to admin login
        const adminLoginUrl = new URL('/admin/login', req.url);
        return NextResponse.redirect(adminLoginUrl);
      }
      // Admin authenticated, allow access
    } else {
      // Regular teacher mode - check for teacher session
      if (!isTeacherLoggedIn) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
      }
      // Teacher authenticated, allow access
    }
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (pathname === '/login' && isTeacherLoggedIn) {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Add session warning header for pages that need it
  if (isTeacherLoggedIn && sessionCheck.needsWarning) {
    const response = NextResponse.next();
    response.headers.set('x-session-warning', 'true');
    return response;
  }

  // Allow access to public routes and authenticated routes
  return NextResponse.next();
}

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

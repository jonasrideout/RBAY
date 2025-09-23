// middleware.ts - NextAuth v4 Compatible
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  async function middleware(req) {
    const { pathname, searchParams } = req.nextUrl;
    const isLoggedIn = !!req.nextauth.token;

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

    // Admin routes protection - SIMPLIFIED FOR EDGE RUNTIME
    const isAdminRoute = pathname.startsWith('/admin');
    const isAdminLoginRoute = pathname === '/admin/login';

    // Handle admin routes - Use cookie check instead of Prisma
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

    // Dashboard route with admin access support
    const isDashboardRoute = pathname.startsWith('/dashboard');
    
    // Register school route with special admin mode handling
    const isRegisterSchoolRoute = pathname.startsWith('/register-school');

    // Dashboard route protection - allow teacher OR admin access
    if (isDashboardRoute && !isLoggedIn) {
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
        // Regular teacher mode - check for OAuth session
        if (!isLoggedIn) {
          const loginUrl = new URL('/login', req.url);
          return NextResponse.redirect(loginUrl);
        }
        // Teacher authenticated, allow access
      }
    }

    // If logged in and trying to access login page, redirect to dashboard
    if (pathname === '/login' && isLoggedIn) {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Allow access to public routes and authenticated routes
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public routes that don't require authentication
        const publicRoutes = [
          '/',
          '/login',
          '/register-student',
          '/api/schools',
          '/api/students',
          '/api/auth',
          '/admin/login',
        ];

        // Check if current path is public or an API route
        const isPublicRoute = publicRoutes.some(route => 
          pathname.startsWith(route) || 
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/_next') ||
          pathname.includes('.')
        );

        // Admin routes don't need NextAuth token (they have their own auth)
        if (pathname.startsWith('/admin')) {
          return true;
        }

        // Public routes are always allowed
        if (isPublicRoute) {
          return true;
        }

        // Protected routes require a token
        return !!token;
      },
    },
  }
);

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

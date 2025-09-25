// /app/api/auth/signout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/magicLink';

export async function GET(request: NextRequest) {
  return handleSignout(request);
}

export async function POST(request: NextRequest) {
  return handleSignout(request);
}

async function handleSignout(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get('callbackUrl');
    let redirectUrl = '/';

    if (callbackUrl) {
      // Validate callback URL is from same origin for security
      try {
        const url = new URL(callbackUrl);
        const baseUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app');
        
        if (url.origin === baseUrl.origin) {
          redirectUrl = callbackUrl;
        }
      } catch (error) {
        // Invalid URL, use default redirect
        console.warn('Invalid callback URL provided:', callbackUrl);
      }
    }

    // Create redirect response and clear session cookie
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
    const response = NextResponse.redirect(new URL(redirectUrl, baseUrl));
    
    // Clear session cookie
    clearSessionCookie(response);

    console.log('Teacher signed out, redirecting to:', redirectUrl);

    return response;

  } catch (error) {
    console.error('Signout error:', error);
    
    // Even if there's an error, clear the cookie and redirect home
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
    const response = NextResponse.redirect(new URL('/', baseUrl));
    
    // Force clear the cookie with immediate expiration
    response.cookies.set('teacher-session', '', {
      path: '/',
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;
  }
}

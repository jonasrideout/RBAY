// /pages/api/auth/signout.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { clearSessionCookie } from '@/lib/magicLink';
import { NextResponse } from 'next/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get callback URL from query params (similar to NextAuth)
    const { callbackUrl } = req.query;
    let redirectUrl = '/';

    if (callbackUrl && typeof callbackUrl === 'string') {
      // Validate callback URL is from same origin for security
      try {
        const url = new URL(callbackUrl);
        const baseUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
        
        if (url.origin === baseUrl.origin) {
          redirectUrl = callbackUrl;
        }
      } catch (error) {
        // Invalid URL, use default redirect
        console.warn('Invalid callback URL provided:', callbackUrl);
      }
    }

    // Create a NextResponse to clear cookies
    const response = NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
    
    // Clear session cookie
    clearSessionCookie(response);

    // Convert NextResponse cookies to res.setHeader format for Next.js API routes
    const cookieHeader = response.headers.get('set-cookie');
    if (cookieHeader) {
      res.setHeader('Set-Cookie', cookieHeader);
    }

    console.log('Teacher signed out, redirecting to:', redirectUrl);

    // Redirect to specified URL or home
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('Signout error:', error);
    
    // Even if there's an error, clear the cookie and redirect home
    res.setHeader('Set-Cookie', 'teacher-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
    return res.redirect('/');
  }
}

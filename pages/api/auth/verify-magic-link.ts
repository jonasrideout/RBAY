// /pages/api/auth/verify-magic-link.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyMagicLinkToken, createTeacherSession, setSessionCookie } from '@/lib/magicLink';
import { NextResponse } from 'next/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token: tokenData, verify: verifyToken } = req.query;

    if (!tokenData || !verifyToken || Array.isArray(tokenData) || Array.isArray(verifyToken)) {
      return res.redirect('/login?error=invalid_link');
    }

    // Verify the magic link token
    const verification = verifyMagicLinkToken(tokenData, verifyToken);

    if (!verification.valid || !verification.email) {
      return res.redirect('/login?error=invalid_or_expired');
    }

    // Double-check that teacher still exists in database
    const teacherCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/schools?teacherEmail=${encodeURIComponent(verification.email)}`, {
      method: 'GET',
    });

    if (!teacherCheckResponse.ok) {
      console.error('Teacher verification failed for:', verification.email);
      return res.redirect('/login?error=teacher_not_found');
    }

    // Create teacher session
    const session = createTeacherSession(verification.email);

    // Create a NextResponse to set cookies
    const response = NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
    
    // Set session cookie
    setSessionCookie(response, session);

    // Convert NextResponse cookies to res.setHeader format for Next.js API routes
    const cookieHeader = response.headers.get('set-cookie');
    if (cookieHeader) {
      res.setHeader('Set-Cookie', cookieHeader);
    }

    console.log('Magic link login successful for:', verification.email);

    // Redirect to dashboard
    return res.redirect('/dashboard');

  } catch (error) {
    console.error('Magic link verification error:', error);
    return res.redirect('/login?error=verification_failed');
  }
}

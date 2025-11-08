// /app/api/auth/verify-magic-link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLinkToken, createTeacherSession, setSessionCookie } from '@/lib/magicLink';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenData = searchParams.get('token');
    const verifyToken = searchParams.get('verify');

    if (!tokenData || !verifyToken) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_link`);
    }

    // Verify the magic link token
    const verification = verifyMagicLinkToken(tokenData, verifyToken);

    if (!verification.valid || !verification.email) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_or_expired`);
    }

    // Double-check that teacher still exists in database
    try {
      const school = await prisma.school.findUnique({
        where: {
          teacherEmail: verification.email
        }
      });

      // For new users (no school), create a temporary registration token
      if (!school) {
        // Generate a short-lived registration token (15 minutes)
        const registrationToken = crypto.randomBytes(32).toString('hex');
        const registrationData = {
          email: verification.email,
          expires: Date.now() + (15 * 60 * 1000), // 15 minutes
          token: registrationToken
        };
        
        console.log('New teacher verification - creating registration token for:', verification.email);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
        
        // Create response with registration token cookie
        const response = NextResponse.redirect(`${baseUrl}/register-school?verified=true`);
        
        // Set secure registration token cookie (15 minute expiry)
        const tokenData = Buffer.from(JSON.stringify(registrationData)).toString('base64');
        response.cookies.set('registration-token', tokenData, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60, // 15 minutes in seconds
          path: '/'
        });
        
        return response;
      }

      // Create teacher session for existing teachers
      const session = createTeacherSession(verification.email);

      // Create redirect response and set session cookie
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
      const response = NextResponse.redirect(`${baseUrl}/dashboard`);
      
      // Set session cookie
      setSessionCookie(response, session);

      console.log('Magic link login successful for:', verification.email);

      return response;

    } catch (dbError) {
      console.error('Database error during magic link verification:', dbError);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
      return NextResponse.redirect(`${baseUrl}/login?error=verification_failed`);
    }

  } catch (error) {
    console.error('Magic link verification error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
    return NextResponse.redirect(`${baseUrl}/login?error=verification_failed`);
  }
}

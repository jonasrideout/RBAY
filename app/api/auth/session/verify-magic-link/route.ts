// /app/api/auth/verify-magic-link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLinkToken, createTeacherSession, setSessionCookie } from '@/lib/magicLink';
import { PrismaClient } from '@prisma/client';

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
    const prisma = new PrismaClient();

    try {
      const school = await prisma.school.findUnique({
        where: {
          teacherEmail: verification.email
        }
      });

      await prisma.$disconnect();

      if (!school) {
        console.error('Teacher verification failed for:', verification.email);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
        return NextResponse.redirect(`${baseUrl}/login?error=teacher_not_found`);
      }

      // Create teacher session
      const session = createTeacherSession(verification.email);

      // Create redirect response and set session cookie
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
      const response = NextResponse.redirect(`${baseUrl}/dashboard`);
      
      // Set session cookie
      setSessionCookie(response, session);

      console.log('Magic link login successful for:', verification.email);

      return response;
    } catch (dbError) {
      await prisma.$disconnect();
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

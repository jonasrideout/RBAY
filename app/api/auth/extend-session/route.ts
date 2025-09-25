// /app/api/auth/extend-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyTeacherSession, createTeacherSession, setSessionCookie } from '@/lib/magicLink';
import { PrismaClient } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // Get current session cookie
    const sessionCookie = request.cookies.get('teacher-session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // Verify current session
    const sessionCheck = verifyTeacherSession(sessionCookie.value);

    if (!sessionCheck.valid || !sessionCheck.session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check if session is within extension window (can extend if more than 30 minutes left)
    const now = Date.now();
    const timeUntilExpiry = sessionCheck.session.expires - now;
    const thirtyMinutes = 30 * 60 * 1000;

    if (timeUntilExpiry < thirtyMinutes) {
      return NextResponse.json({ 
        error: 'Session too close to expiry for extension',
        minutesLeft: Math.floor(timeUntilExpiry / (60 * 1000))
      }, { status: 400 });
    }

    // Verify teacher still exists in database
    const prisma = new PrismaClient();

    try {
      const school = await prisma.school.findUnique({
        where: {
          teacherEmail: sessionCheck.session.email
        }
      });

      await prisma.$disconnect();

      if (!school) {
        return NextResponse.json(
          { error: 'Teacher account not found' },
          { status: 401 }
        );
      }

      // Create new session with extended expiry (24 hours from now)
      const newSession = createTeacherSession(sessionCheck.session.email);

      // Create response and set new session cookie
      const response = NextResponse.json({ 
        success: true, 
        message: 'Session extended successfully',
        newExpiry: newSession.expires,
        hoursExtended: 24
      });
      
      // Set new session cookie
      setSessionCookie(response, newSession);

      console.log('Session extended successfully for:', sessionCheck.session.email);

      return response;
    } catch (dbError) {
      await prisma.$disconnect();
      console.error('Database error during session extension:', dbError);
      return NextResponse.json(
        { error: 'Failed to verify teacher account' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Session extension error:', error);
    return NextResponse.json({ 
      error: 'Failed to extend session' 
    }, { status: 500 });
  }
}

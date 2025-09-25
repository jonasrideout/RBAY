// /app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyTeacherSession } from '@/lib/magicLink';
import { PrismaClient } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('teacher-session');
    
    if (!sessionCookie) {
      return NextResponse.json({
        valid: false,
        session: null,
        needsWarning: false
      });
    }

    // Verify session using our utility function
    const sessionCheck = verifyTeacherSession(sessionCookie.value);

    if (!sessionCheck.valid || !sessionCheck.session) {
      return NextResponse.json({
        valid: false,
        session: null,
        needsWarning: false
      });
    }

    // Double-check that teacher still exists in database
    const prisma = new PrismaClient();
    
    try {
      const school = await prisma.school.findUnique({
        where: {
          teacherEmail: sessionCheck.session.email
        }
      });

      await prisma.$disconnect();

      if (!school) {
        console.log('Teacher no longer exists in database:', sessionCheck.session.email);
        return NextResponse.json({
          valid: false,
          session: null,
          needsWarning: false
        });
      }

      // Session is valid and teacher exists
      return NextResponse.json({
        valid: true,
        session: sessionCheck.session,
        needsWarning: sessionCheck.needsWarning || false
      });
    } catch (dbError) {
      await prisma.$disconnect();
      console.error('Database error during session check:', dbError);
      return NextResponse.json({
        valid: false,
        session: null,
        needsWarning: false
      });
    }

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({
      valid: false,
      session: null,
      needsWarning: false
    });
  }
}

// /app/api/schools/history/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/magicLink';

// Returns every School row (active and archived) that belongs to the
// currently logged-in teacher, ordered most recent first. Used to power the
// "Past Classes" switcher on the teacher dashboard, so a teacher can see
// every year they've run and open any of them in read-only mode.
//
// This is scoped entirely by the teacher's session cookie rather than a
// query param, so one teacher can never list another teacher's schools.
export async function GET(request: NextRequest) {
  try {
    const sessionCheck = getSessionFromRequest(request);

    if (!sessionCheck.valid || !sessionCheck.session?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to view your class history' },
        { status: 401 }
      );
    }

    const teacherEmail = sessionCheck.session.email;

    const schools = await prisma.school.findMany({
      where: { teacherEmail },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        schoolName: true,
        teacherName: true,
        gradeLevel: true,
        expectedClassSize: true,
        startMonth: true,
        status: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      schools
    });

  } catch (error: any) {
    console.error('Get school history error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve class history' },
      { status: 500 }
    );
  }
}

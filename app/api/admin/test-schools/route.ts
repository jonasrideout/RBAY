import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all schools with basic info
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        teacherEmail: true,
        schoolName: true,
        status: true,
        teacherName: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Check specifically for the jennifer.rodriguez school
    const jenniferSchool = await prisma.school.findUnique({
      where: {
        teacherEmail: 'jennifer.rodriguez@midwest-elem.edu'
      },
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileCompleted: true
          }
        }
      }
    });

    return NextResponse.json({
      totalSchools: schools.length,
      allSchools: schools,
      jenniferSchoolExists: !!jenniferSchool,
      jenniferSchoolData: jenniferSchool,
      testEmails: schools.map(s => s.teacherEmail)
    });
  } catch (error) {
    console.error('Test schools error:', error);
    return NextResponse.json({
      error: 'Failed to test schools',
      details: error
    }, { status: 500 });
  }
}

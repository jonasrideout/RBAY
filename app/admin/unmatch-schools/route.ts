import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { schoolId } = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Get the school and its match
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        studentStats: true
      }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Check if pen pals have been assigned
    if (school.studentStats?.hasPenpalAssignments) {
      return NextResponse.json(
        { error: 'Cannot unmatch schools after pen pals have been assigned' },
        { status: 400 }
      );
    }

    if (!school.matchedWithSchoolId) {
      return NextResponse.json(
        { error: 'School is not currently matched' },
        { status: 400 }
      );
    }

    const matchedSchoolId = school.matchedWithSchoolId;

    // Clear the match for both schools (status stays the same)
    await prisma.$transaction([
      prisma.school.update({
        where: { id: schoolId },
        data: { matchedWithSchoolId: null }
      }),
      prisma.school.update({
        where: { id: matchedSchoolId },
        data: { matchedWithSchoolId: null }
      })
    ]);

    const response = NextResponse.json({ 
      success: true,
      message: 'Schools unmatched successfully'
    });
    
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return response;

  } catch (error) {
    console.error('Error unmatching schools:', error);
    return NextResponse.json(
      { error: 'Failed to unmatch schools' },
      { status: 500 }
    );
  }
}

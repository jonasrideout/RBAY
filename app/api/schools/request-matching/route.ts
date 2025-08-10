import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherEmail } = body;

    if (!teacherEmail) {
      return NextResponse.json(
        { error: 'Teacher email is required' },
        { status: 400 }
      );
    }

    // Find the school
    const school = await prisma.school.findUnique({
      where: { teacherEmail },
      include: {
        students: true
      }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Check if already requested matching
    if (school.readyForMatching) {
      return NextResponse.json(
        { error: 'Matching has already been requested for this school' },
        { status: 400 }
      );
    }

    // Verify all students have interests
    const studentsWithoutInterests = school.students.filter(
      student => !student.interests || student.interests.length === 0
    );

    if (studentsWithoutInterests.length > 0) {
      return NextResponse.json(
        { error: `${studentsWithoutInterests.length} students still need to complete their interest information` },
        { status: 400 }
      );
    }

    // Update school status
    const updatedSchool = await prisma.school.update({
      where: { teacherEmail },
      data: {
        readyForMatching: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Matching request submitted successfully',
      school: {
        id: updatedSchool.id,
        schoolName: updatedSchool.schoolName,
        readyForMatching: updatedSchool.readyForMatching
      }
    });

  } catch (error) {
    console.error('Request matching error:', error);
    return NextResponse.json(
      { error: 'Failed to request matching. Please try again.' },
      { status: 500 }
    );
  }
}

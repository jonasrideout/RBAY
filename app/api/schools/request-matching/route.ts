import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherEmail } = body;

    // Validate required fields
    if (!teacherEmail) {
      return NextResponse.json(
        { error: 'Teacher email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacherEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find the school by teacher email
    const school = await prisma.school.findUnique({
      where: { teacherEmail },
      include: {
        students: {
          where: {
            isActive: true  // Only check active students
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true,
            interests: true,
            parentConsent: true,
            profileCompleted: true
          }
        }
      }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Check if school is already ready for matching
    if (school.status === 'READY' || school.readyForMatching) {
      return NextResponse.json(
        { error: 'School has already requested matching' },
        { status: 409 }
      );
    }

    // Require at least one active student
    if (school.students.length === 0) {
      return NextResponse.json(
        { 
          error: 'Cannot request matching. No active students registered.' 
        },
        { status: 400 }
      );
    }

    // Optional: Warn about students without interests, but don't block
    const studentsWithoutInterests = school.students.filter(
      student => !student.interests || student.interests.length === 0
    );

    // Note: We're allowing matching even if students don't have interests yet

    // Validate that all active students have parent consent
    const studentsWithoutConsent = school.students.filter(
      student => !student.parentConsent
    );

    if (studentsWithoutConsent.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot request matching. ${studentsWithoutConsent.length} students do not have parent consent.`,
          studentsNeedingConsent: studentsWithoutConsent.map(s => `${s.firstName} ${s.lastName}`)
        },
        { status: 400 }
      );
    }

    // Update the school to mark it as ready for matching
    const updatedSchool = await prisma.school.update({
      where: { teacherEmail },
      data: { 
        status: 'READY',
        readyForMatching: true,
        updatedAt: new Date()
      },
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true,
            interests: true,
            profileCompleted: true
          }
        }
      }
    });

    // Log the matching request for potential notification/admin purposes
    console.log(`School matching requested: ${school.schoolName} (${teacherEmail}) with ${school.students.length} students`);

    return NextResponse.json({
      success: true,
      message: 'Matching request submitted successfully',
      school: {
        id: updatedSchool.id,
        schoolName: updatedSchool.schoolName,
        teacherEmail: updatedSchool.teacherEmail,
        status: updatedSchool.status,
        readyForMatching: updatedSchool.readyForMatching,
        studentCount: updatedSchool.students.length,
        gradeLevel: updatedSchool.gradeLevel,
        startMonth: updatedSchool.startMonth,
        letterFrequency: updatedSchool.letterFrequency,
        studentCounts: {
          expected: updatedSchool.expectedClassSize,
          registered: updatedSchool.students.length,
          ready: updatedSchool.students.filter(s => s.profileCompleted).length
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Request matching error:', error);
    return NextResponse.json(
      { error: 'Failed to request matching. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');

    if (!teacherEmail) {
      return NextResponse.json(
        { error: 'Teacher email is required' },
        { status: 400 }
      );
    }

    // Get the school's matching status
    const school = await prisma.school.findUnique({
      where: { teacherEmail },
      select: {
        id: true,
        schoolName: true,
        status: true,
        readyForMatching: true,
        updatedAt: true
      }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      school: {
        id: school.id,
        schoolName: school.schoolName,
        status: school.status,
        readyForMatching: school.readyForMatching,
        lastUpdated: school.updatedAt
      }
    });

  } catch (error) {
    console.error('Get matching status error:', error);
    return NextResponse.json(
      { error: 'Failed to get matching status' },
      { status: 500 }
    );
  }
}

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
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true,
            interests: true,
            parentConsent: true
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
    if (school.readyForMatching) {
      return NextResponse.json(
        { error: 'School has already requested matching' },
        { status: 409 }
      );
    }

    // Validate that all students have completed their information
    const studentsWithoutInterests = school.students.filter(
      student => !student.interests || student.interests.length === 0
    );

    if (studentsWithoutInterests.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot request matching. ${studentsWithoutInterests.length} students still need to complete their interest information.`,
          studentsNeedingInfo: studentsWithoutInterests.map(s => `${s.firstName} ${s.lastName}`)
        },
        { status: 400 }
      );
    }

    // Validate that we have the expected number of students
    if (school.students.length !== school.classSize) {
      return NextResponse.json(
        { 
          error: `Cannot request matching. Expected ${school.classSize} students but only ${school.students.length} are registered.` 
        },
        { status: 400 }
      );
    }

    // Validate that all students have parent consent
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
            interests: true
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
        readyForMatching: updatedSchool.readyForMatching,
        studentCount: updatedSchool.students.length,
        gradeLevels: updatedSchool.gradeLevels,
        programStartMonth: updatedSchool.programStartMonth,
        letterFrequency: updatedSchool.letterFrequency
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

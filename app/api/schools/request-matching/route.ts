import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdminNotification } from '@/lib/email';

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
            lastInitial: true,
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

    // Check if school is already ready for pen pal pairing
    if (school.status === 'READY') {
      return NextResponse.json(
        { error: 'School has already requested pen pal pairing' },
        { status: 409 }
      );
    }

    // Require at least one active student
    if (school.students.length === 0) {
      return NextResponse.json(
        { 
          error: 'Cannot request pen pal pairing. No active students registered.' 
        },
        { status: 400 }
      );
    }

    // Optional: Warn about students without interests, but don't block
    const studentsWithoutInterests = school.students.filter(
      student => !student.interests || student.interests.length === 0
    );

    // Note: We're allowing pairing even if students don't have interests yet

    // Validate that all active students have parent consent
    const studentsWithoutConsent = school.students.filter(
      student => !student.parentConsent
    );

    if (studentsWithoutConsent.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot request pen pal pairing. ${studentsWithoutConsent.length} students do not have parent consent.`,
          studentsNeedingConsent: studentsWithoutConsent.map(s => `${s.firstName} ${s.lastInitial}.`)
        },
        { status: 400 }
      );
    }

    // Update the school to mark it as ready for pen pal pairing
    const updatedSchool = await prisma.school.update({
      where: { teacherEmail },
      data: { 
        status: 'READY',
        updatedAt: new Date()
      },
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastInitial: true,
            grade: true,
            interests: true,
            profileCompleted: true
          }
        }
      }
    });

   // Log the pen pal pairing request for potential notification/admin purposes
    console.log(`School pen pal pairing requested: ${school.schoolName} (${teacherEmail}) with ${school.students.length} students`);

    // Send admin notification (don't block on failure)
    try {
      await sendAdminNotification({
        schoolName: updatedSchool.schoolName,
        teacherName: updatedSchool.teacherName,
        teacherEmail: updatedSchool.teacherEmail,
        action: 'ready_for_penpals'
      });
    } catch (error: any) {
      console.warn('Admin notification failed:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Pen pal pairing request submitted successfully',
      school: {
        id: updatedSchool.id,
        schoolName: updatedSchool.schoolName,
        teacherEmail: updatedSchool.teacherEmail,
        status: updatedSchool.status,
        studentCount: updatedSchool.students.length,
        gradeLevel: updatedSchool.gradeLevel,
        startMonth: updatedSchool.startMonth,
        studentCounts: {
          expected: updatedSchool.expectedClassSize,
          registered: updatedSchool.students.length,
          ready: updatedSchool.students.filter(s => s.profileCompleted).length
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Request pen pal pairing error:', error);
    return NextResponse.json(
      { error: 'Failed to request pen pal pairing. Please try again.' },
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

    // Get the school's pen pal pairing status
    const school = await prisma.school.findUnique({
      where: { teacherEmail },
      select: {
        id: true,
        schoolName: true,
        status: true,
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
        readyForPairing: school.status === 'READY',
        lastUpdated: school.updatedAt
      }
    });

  } catch (error) {
    console.error('Get pen pal pairing status error:', error);
    return NextResponse.json(
      { error: 'Failed to get pen pal pairing status' },
      { status: 500 }
    );
  }
}

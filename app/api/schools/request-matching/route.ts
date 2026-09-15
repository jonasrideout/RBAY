// /app/api/schools/request-matching/route.ts
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

    // Find the school by teacher email. findFirst + isActive: true rather
    // than findUnique: teacherEmail is no longer unique (one School row per
    // year), so this targets the teacher's current active class.
    const school = await prisma.school.findFirst({
      where: { teacherEmail, isActive: true },
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

    // Update the school to mark it as ready for pen pal pairing. Update by
    // id (from the school we already fetched above) rather than
    // teacherEmail, since that's no longer a unique field an update's where
    // clause can target.
    const updatedSchool = await prisma.school.update({
      where: { id: school.id },
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

// Reverses "Ready to Pair" back to COLLECTING - the toggle on the dashboard
// is meant to be freely switched off again if a teacher realizes they need
// to add or remove students after all, then switched back on once they're
// done. Blocked once pen pals have actually been assigned, since that's the
// real, final freeze point - un-readying at that stage would be misleading
// since the matching itself has already happened.
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherEmail } = body;

    if (!teacherEmail) {
      return NextResponse.json(
        { error: 'Teacher email is required' },
        { status: 400 }
      );
    }

    const school = await prisma.school.findFirst({
      where: { teacherEmail, isActive: true },
      include: {
        students: {
          where: { isActive: true },
          include: { penpalConnections: true, penpalOf: true }
        }
      }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    const hasPenpalAssignments = school.students.some(
      s => s.penpalConnections.length > 0 || s.penpalOf.length > 0
    );

    if (hasPenpalAssignments) {
      return NextResponse.json(
        { error: 'Cannot un-ready after pen pals have been assigned' },
        { status: 400 }
      );
    }

    if (school.status !== 'READY') {
      return NextResponse.json(
        { error: 'School is not currently marked ready' },
        { status: 400 }
      );
    }

    const updatedSchool = await prisma.school.update({
      where: { id: school.id },
      data: { status: 'COLLECTING', updatedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      message: 'Class is no longer marked ready',
      school: {
        id: updatedSchool.id,
        status: updatedSchool.status
      }
    });

  } catch (error) {
    console.error('Un-ready pen pal pairing error:', error);
    return NextResponse.json(
      { error: 'Failed to update readiness. Please try again.' },
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

    // Get the school's pen pal pairing status. findFirst + isActive: true,
    // same reasoning as the POST handler above.
    const school = await prisma.school.findFirst({
      where: { teacherEmail, isActive: true },
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

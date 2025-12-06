import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastInitial,  // Changed from lastName
      grade,
      teacherName,
      interests,
      parentConsent,  // Removed parentName, parentEmail, parentPhone
      teacherEmail,
      penpalPreference,
      otherInterests
    } = body;

    // Updated validation - removed parent contact fields
    if (!firstName || !lastInitial || !grade || !teacherEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate lastInitial length
    if (lastInitial.length > 2) {
      return NextResponse.json(
        { error: 'Last initial must be 1-2 characters only' },
        { status: 400 }
      );
    }

    // Find the school by teacher email
    const school = await prisma.school.findUnique({
      where: { teacherEmail }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found for this teacher email' },
        { status: 404 }
      );
    }

    // Check if student interests are completed (has at least one interest)
    const profileCompleted = interests && interests.length > 0;

    // Start a transaction to create student and potentially update school status
    const result = await prisma.$transaction(async (tx) => {
      // Create the student with updated schema
      const student = await tx.student.create({
        data: {
          firstName,
          lastInitial,  // Changed from lastName
          grade,
          teacherName: teacherName || null,
          interests: interests || [],
          otherInterests: otherInterests || null,
          // Removed parentName, parentEmail, parentPhone
          parentConsent: parentConsent || false,
          penpalPreference: penpalPreference || 'ONE',
          isActive: true,
          profileCompleted,
          schoolId: school.id
        }
      });

      // If school was previously READY, reset to COLLECTING when new student added
      let updatedSchool = school;
      if (school.status === 'READY') {
        updatedSchool = await tx.school.update({
          where: { id: school.id },
          data: { status: 'COLLECTING' }
        });
      }

      return { student, updatedSchool };
    });

    return NextResponse.json({
      message: 'Student registered successfully',
      student: {
        id: result.student.id,
        firstName: result.student.firstName,
        lastInitial: result.student.lastInitial,  // Changed from lastName
        grade: result.student.grade,
        interests: result.student.interests,
        otherInterests: result.student.otherInterests,
        penpalPreference: result.student.penpalPreference,
        profileCompleted: result.student.profileCompleted,
        schoolName: school.schoolName
      },
      schoolStatusReset: school.status === 'READY' // Inform frontend if status was reset
    });

  } catch (error) {
    console.error('Student registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register student' },
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

    // Find the school by teacher email
    const school = await prisma.school.findUnique({
      where: { teacherEmail },
      include: {
        students: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found for this teacher email' },
        { status: 404 }
      );
    }

    // Calculate student statistics
    const totalStudents = school.students.length;
    const studentsWithInterests = school.students.filter(s => s.profileCompleted).length;

    return NextResponse.json({
      students: school.students,
      statistics: {
        total: totalStudents,
        withInterests: studentsWithInterests,
        expected: school.expectedClassSize
      }
    });

  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve students' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, firstName, lastInitial, grade, teacherName, interests, penpalPreference, otherInterests } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Validate lastInitial if provided
    if (lastInitial !== undefined && lastInitial.length > 2) {
      return NextResponse.json(
        { error: 'Last initial must be 1-2 characters only' },
        { status: 400 }
      );
    }

    // Check if interests are being updated and mark profile as completed
    const profileCompleted = interests && interests.length > 0;

    // Prepare update data
    const updateData: any = {
      profileCompleted
    };

    if (firstName !== undefined) {
      updateData.firstName = firstName;
    }

    if (lastInitial !== undefined) {
      updateData.lastInitial = lastInitial;
    }

    if (grade !== undefined) {
      updateData.grade = grade;
    }

    if (teacherName !== undefined) {
      updateData.teacherName = teacherName;
    }

    if (interests !== undefined) {
      updateData.interests = interests;
    }

    if (otherInterests !== undefined) {
      updateData.otherInterests = otherInterests;
    }

    if (penpalPreference !== undefined) {
      updateData.penpalPreference = penpalPreference;
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData
    });

    return NextResponse.json({
      message: 'Student updated successfully',
      student: {
        id: updatedStudent.id,
        firstName: updatedStudent.firstName,
        lastInitial: updatedStudent.lastInitial,
        grade: updatedStudent.grade,
        interests: updatedStudent.interests,
        otherInterests: updatedStudent.otherInterests,
        penpalPreference: updatedStudent.penpalPreference,
        profileCompleted: updatedStudent.profileCompleted
      }
    });

  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Check if student exists first
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        school: true
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if school is still in collecting or ready status (before matching)
    if (student.school.status !== 'COLLECTING' && student.school.status !== 'READY') {
      return NextResponse.json(
        { error: 'Cannot remove student after matching has been completed' },
        { status: 400 }
      );
    }

    // Delete the student (cascade delete will handle StudentPenpal records)
    await prisma.student.delete({
      where: { id: studentId }
    });

    return NextResponse.json({
      message: 'Student removed successfully',
      removedStudent: {
        id: student.id,
        firstName: student.firstName,
        lastInitial: student.lastInitial
      }
    });

  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { error: 'Failed to remove student' },
      { status: 500 }
    );
  }
}

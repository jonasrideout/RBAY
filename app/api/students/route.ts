import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      grade,
      interests,
      parentName,
      parentEmail,
      parentPhone,
      parentConsent,
      teacherEmail,
      penpalPreference,
      otherInterests
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !grade || !parentName || !parentEmail || !teacherEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Create the student
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        grade,
        interests: interests || [],
        otherInterests: otherInterests || null,
        parentName,
        parentEmail,
        parentPhone,
        parentConsent: parentConsent || false,
        penpalPreference: penpalPreference || 'ONE',
        isActive: true,
        profileCompleted,
        schoolId: school.id
      }
    });

    return NextResponse.json({
      message: 'Student registered successfully',
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
        interests: student.interests,
        otherInterests: student.otherInterests,
        penpalPreference: student.penpalPreference,
        profileCompleted: student.profileCompleted
      }
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
    const { studentId, interests, penpalPreference, otherInterests } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Check if interests are being updated and mark profile as completed
    const profileCompleted = interests && interests.length > 0;

    // Prepare update data
    const updateData: any = {
      profileCompleted
    };

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
        lastName: updatedStudent.lastName,
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

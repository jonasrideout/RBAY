import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      teacherEmail,
      firstName,
      lastName,
      grade,
      interests,
      otherInterests,
      parentName,
      parentEmail,
      parentConsent
    } = body;

    // Validate required fields
    if (!teacherEmail || !firstName || !lastName || !grade || 
        !parentName || !parentEmail || !parentConsent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacherEmail) || !emailRegex.test(parentEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find the school by teacher email
    const school = await prisma.school.findUnique({
      where: { teacherEmail }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found. Please check the teacher email address.' },
        { status: 404 }
      );
    }

    // Check if student with same name already exists in this school
    const existingStudent = await prisma.student.findFirst({
      where: {
        AND: [
          { schoolId: school.id },
          { firstName },
          { lastName }
        ]
      }
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'A student with this name is already registered in this school' },
        { status: 409 }
      );
    }

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
        parentConsent,
        schoolId: school.id
      }
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        schoolName: school.schoolName
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Student registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register student. Please try again.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      studentId,
      interests,
      otherInterests
    } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Update student interests
    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        interests: interests || [],
        otherInterests: otherInterests || null
      }
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        interests: student.interests,
        otherInterests: student.otherInterests
      }
    });

  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { error: 'Failed to update student information' },
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

    // Find school and its students
    const school = await prisma.school.findUnique({
      where: { teacherEmail },
      include: {
        students: {
          orderBy: {
            createdAt: 'desc'
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

    return NextResponse.json({
      success: true,
      students: school.students,
      school: {
        id: school.id,
        schoolName: school.schoolName,
        teacherFirstName: school.teacherFirstName,
        teacherLastName: school.teacherLastName
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

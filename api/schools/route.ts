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

    // Check if student with same name already exists in this school (including inactive)
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

    // Create the student (always active by default)
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
        isActive: true,
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

  } catch (error: any) {
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
    const { studentId, action, ...updateData } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    let updateFields: any = {};

    if (action === 'deactivate') {
      updateFields.isActive = false;
    } else if (action === 'activate') {
      updateFields.isActive = true;
    } else {
      // Regular update (interests, etc.)
      updateFields = {
        interests: updateData.interests || [],
        otherInterests: updateData.otherInterests || null
      };
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data: updateFields
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        interests: student.interests,
        otherInterests: student.otherInterests,
        isActive: student.isActive
      }
    });

  } catch (error: any) {
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
    const includeInactive = searchParams.get('includeInactive') === 'true';

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
          where: includeInactive ? {} : { isActive: true },
          orderBy: [
            { isActive: 'desc' }, // Active students first
            { createdAt: 'desc' }
          ]
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
      },
      counts: {
        total: school.students.length,
        active: school.students.filter(s => s.isActive).length,
        inactive: school.students.filter(s => !s.isActive).length
      }
    });

  } catch (error: any) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve students' },
      { status: 500 }
    );
  }
}
